import { orderQuery, cartQuery, foodQuery } from "../config/supabaseHelpers.js";
import Stripe from "stripe";
import { sendSuccess, sendError, sendPaginatedResponse, sendValidationError } from "../utils/response.js";
import { validateRequired, validatePagination, validatePaymentAmount } from "../utils/validation.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============== ORDER OPERATIONS ==============

// Place New Order
export const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address, paymentMethod = "cod", specialInstructions = "" } = req.body;

    // Validate required fields
    const validation = validateRequired({ items, address });
    if (!validation.valid) {
      return sendValidationError(res, validation.missing);
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return sendError(res, "Order must contain at least one item", 400);
    }

    // Calculate order total and validate items
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { data: food, error: foodError } = await foodQuery.findById(item.foodId);
      if (foodError || !food) {
        return sendError(res, `Food item ${item.foodId} not found`, 404);
      }

      if (!food.available) {
        return sendError(res, `Food item ${food.name} is not available`, 400);
      }

      const itemTotal = food.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        food_id: food.id,
        name: food.name,
        price: food.price,
        quantity: item.quantity,
        image: food.image,
        category: food.category,
      });
    }

    // Validate amount
    if (!validatePaymentAmount(totalAmount)) {
      return sendError(res, "Invalid order amount", 400);
    }

    // Add delivery fee and tax
    const tax = parseFloat((totalAmount * 0.05).toFixed(2));
    const deliveryFee = totalAmount > 0 ? 50 : 0;
    const finalAmount = parseFloat((totalAmount + tax + deliveryFee).toFixed(2));

    // Create new order
    const { data: newOrder, error: createError } = await orderQuery.create({
      user_id: userId,
      items: validatedItems,
      amount: finalAmount,
      address,
      status: paymentMethod === "stripe" ? "Pending" : "Confirmed",
      payment: paymentMethod === "cod" ? false : false,
      created_at: new Date(),
    });

    if (createError) {
      return sendError(res, "Failed to place order", 500, { error: createError.message });
    }

    // Clear user cart
    await cartQuery.clearCart(userId);

    // Handle payment based on method
    if (paymentMethod === "stripe") {
      const line_items = validatedItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.category,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      // Add tax and delivery fee
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax (5%)",
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });

      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: deliveryFee * 100,
        },
        quantity: 1,
      });

      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${process.env.CORS_ORIGIN}/verify?success=true&orderId=${newOrder.id}`,
        cancel_url: `${process.env.CORS_ORIGIN}/verify?success=false&orderId=${newOrder.id}`,
        metadata: {
          orderId: newOrder.id,
          userId: userId,
        },
      });

      return sendSuccess(res, "Order created. Proceeding to payment", {
        orderId: newOrder.id,
        paymentUrl: session.url,
        amount: finalAmount,
      }, 201);
    }

    // COD order
    return sendSuccess(res, "Order placed successfully", {
      orderId: newOrder.id,
      amount: finalAmount,
      status: newOrder.status,
      paymentMethod: "Cash on Delivery",
    }, 201);
  } catch (error) {
    console.error("Place order error:", error);
    return sendError(res, "Failed to place order", 500, { error: error.message });
  }
};

// Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status = "" } = req.query;

    const { valid, page: p, limit: l } = validatePagination(page, limit);
    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const filters = { status };
    const { data: allOrders, error } = await orderQuery.findByUser(userId);

    if (error) {
      return sendError(res, "Failed to fetch orders", 500, { error: error.message });
    }

    // Filter by status if provided
    let orders = allOrders || [];
    if (status) {
      orders = orders.filter((order) => order.status === status);
    }

    // Paginate
    const total = orders.length;
    const offset = (p - 1) * l;
    orders = orders.slice(offset, offset + l);

    return sendPaginatedResponse(res, "Orders retrieved", orders, p, l, total);
  } catch (error) {
    console.error("Get user orders error:", error);
    return sendError(res, "Failed to fetch orders", 500, { error: error.message });
  }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const { data: order, error } = await orderQuery.findById(id);

    if (error || !order) {
      return sendError(res, "Order not found", 404);
    }

    // Verify order belongs to user
    if (order.user_id !== userId) {
      return sendError(res, "Unauthorized access to this order", 403);
    }

    return sendSuccess(res, "Order retrieved", order);
  } catch (error) {
    console.error("Get order error:", error);
    return sendError(res, "Failed to fetch order", 500, { error: error.message });
  }
};

// Update Order Status (Admin Only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const validStatuses = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
    }

    const { data: order, error: findError } = await orderQuery.findById(id);

    if (findError || !order) {
      return sendError(res, "Order not found", 404);
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await orderQuery.update(id, {
      status,
      updated_at: new Date(),
    });

    if (updateError) {
      return sendError(res, "Failed to update order status", 500, { error: updateError.message });
    }

    return sendSuccess(res, "Order status updated", {
      orderId: id,
      newStatus: status,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return sendError(res, "Failed to update order status", 500, { error: error.message });
  }
};

// Get Order Tracking
export const trackOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const { data: order, error } = await orderQuery.findById(id);

    if (error || !order) {
      return sendError(res, "Order not found", 404);
    }

    // Verify order belongs to user
    if (order.user_id !== userId) {
      return sendError(res, "Unauthorized access", 403);
    }

    return sendSuccess(res, "Order tracking retrieved", {
      orderId: order.id,
      currentStatus: order.status,
      createdAt: order.created_at,
      estimatedDelivery: order.delivery_time,
    });
  } catch (error) {
    console.error("Track order error:", error);
    return sendError(res, "Failed to track order", 500, { error: error.message });
  }
};

// Cancel Order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const { data: order, error: findError } = await orderQuery.findById(id);

    if (findError || !order) {
      return sendError(res, "Order not found", 404);
    }

    if (order.user_id !== userId) {
      return sendError(res, "Unauthorized access", 403);
    }

    // Can only cancel pending or confirmed orders
    if (["Preparing", "Out for Delivery", "Delivered", "Cancelled"].includes(order.status)) {
      return sendError(res, `Cannot cancel order with status: ${order.status}`, 400);
    }

    // Update order to cancelled
    const { error: updateError } = await orderQuery.update(id, {
      status: "Cancelled",
      updated_at: new Date(),
    });

    if (updateError) {
      return sendError(res, "Failed to cancel order", 500, { error: updateError.message });
    }

    return sendSuccess(res, "Order cancelled successfully", {
      orderId: id,
      status: "Cancelled",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return sendError(res, "Failed to cancel order", 500, { error: error.message });
  }
};

// Get All Orders (Admin Only)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "", userId = "" } = req.query;

    const { valid, page: p, limit: l } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    let { data: allOrders, error } = await orderQuery.findAll();

    if (error) {
      return sendError(res, "Failed to fetch orders", 500, { error: error.message });
    }

    let orders = allOrders || [];

    // Filter by status if provided
    if (status) {
      orders = orders.filter((order) => order.status === status);
    }

    // Filter by userId if provided
    if (userId) {
      orders = orders.filter((order) => order.user_id === userId);
    }

    // Paginate
    const total = orders.length;
    const offset = (p - 1) * l;
    orders = orders.slice(offset, offset + l);

    return sendPaginatedResponse(res, "All orders retrieved", orders, p, l, total);
  } catch (error) {
    console.error("Get all orders error:", error);
    return sendError(res, "Failed to fetch orders", 500, { error: error.message });
  }
};

// Verify Payment (Stripe webhook)
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, success } = req.body;

    if (!orderId || success === undefined) {
      return sendError(res, "Missing orderId or success parameter", 400);
    }

    const { data: order, error: findError } = await orderQuery.findById(orderId);

    if (findError || !order) {
      return sendError(res, "Order not found", 404);
    }

    if (success === "true" || success === true) {
      const { error: updateError } = await orderQuery.update(orderId, {
        payment: true,
        status: "Confirmed",
        updated_at: new Date(),
      });

      if (updateError) {
        return sendError(res, "Failed to verify payment", 500, { error: updateError.message });
      }

      return sendSuccess(res, "Payment verified successfully");
    } else {
      return sendError(res, "Payment verification failed", 400);
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    return sendError(res, "Failed to verify payment", 500, { error: error.message });
  }
};

// Legacy exports for backward compatibility
export const placeOrder_legacy = placeOrder;
