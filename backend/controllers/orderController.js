import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import notificationModel from "../models/notificationModel.js";
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

    // Get user and their cart
    const user = await userModel.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Calculate order total and validate items
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const food = await foodModel.findById(item.foodId);
      if (!food) {
        return sendError(res, `Food item ${item.foodId} not found`, 404);
      }

      if (!food.available) {
        return sendError(res, `Food item ${food.name} is not available`, 400);
      }

      const itemTotal = food.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        foodId: food._id,
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
    const newOrder = new orderModel({
      userId,
      items: validatedItems,
      amount: finalAmount,
      address,
      paymentMethod,
      status: paymentMethod === "stripe" ? "Pending" : "Confirmed",
      payment: paymentMethod === "cod" ? false : null,
      specialInstructions,
      createdAt: new Date(),
      trackingUpdates: [
        {
          status: "Pending",
          timestamp: new Date(),
          message: "Order received and is being processed",
        },
      ],
    });

    await newOrder.save();

    // Clear user cart
    user.cartData = {};
    user.updatedAt = new Date();
    await user.save();

    // Create notification for user
    await notificationModel.create({
      userId,
      orderId: newOrder._id,
      type: "order_update",
      title: "Order Placed",
      message: `Your order #${newOrder._id.toString().slice(-6)} has been placed successfully`,
      priority: "high",
    });

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
        success_url: `${process.env.CORS_ORIGIN}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${process.env.CORS_ORIGIN}/verify?success=false&orderId=${newOrder._id}`,
        metadata: {
          orderId: newOrder._id.toString(),
          userId: userId.toString(),
        },
      });

      return sendSuccess(res, "Order created. Proceeding to payment", {
        orderId: newOrder._id,
        paymentUrl: session.url,
        amount: finalAmount,
      }, 201);
    }

    // COD order
    return sendSuccess(res, "Order placed successfully", {
      orderId: newOrder._id,
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

    const { valid, page: p, limit: l, skip } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    const total = await orderModel.countDocuments(filter);

    const orders = await orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean();

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

    const order = await orderModel.findById(id);

    if (!order) {
      return sendError(res, "Order not found", 404);
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId.toString()) {
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

    const order = await orderModel.findById(id);

    if (!order) {
      return sendError(res, "Order not found", 404);
    }

    order.status = status;

    // Add to tracking updates
    order.trackingUpdates.push({
      status,
      timestamp: new Date(),
      message: message || `Order status updated to ${status}`,
    });

    // Send notification to user
    await notificationModel.create({
      userId: order.userId,
      orderId: order._id,
      type: "order_update",
      title: `Order ${status}`,
      message: message || `Your order has been ${status.toLowerCase()}`,
      priority: status === "Delivered" ? "high" : "medium",
    });

    order.updatedAt = new Date();
    await order.save();

    return sendSuccess(res, "Order status updated", {
      orderId: id,
      newStatus: status,
      trackingUpdates: order.trackingUpdates,
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

    const order = await orderModel.findById(id);

    if (!order) {
      return sendError(res, "Order not found", 404);
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId.toString()) {
      return sendError(res, "Unauthorized access", 403);
    }

    return sendSuccess(res, "Order tracking retrieved", {
      orderId: order._id,
      currentStatus: order.status,
      trackingUpdates: order.trackingUpdates.sort((a, b) => b.timestamp - a.timestamp),
      estimatedDelivery: order.estimatedDeliveryTime,
      deliveryPerson: order.deliveryPersonName,
      deliveryPhone: order.deliveryPersonPhone,
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

    const order = await orderModel.findById(id);

    if (!order) {
      return sendError(res, "Order not found", 404);
    }

    if (order.userId.toString() !== userId.toString()) {
      return sendError(res, "Unauthorized access", 403);
    }

    // Can only cancel pending or confirmed orders
    if (["Preparing", "Out for Delivery", "Delivered", "Cancelled"].includes(order.status)) {
      return sendError(res, `Cannot cancel order with status: ${order.status}`, 400);
    }

    order.status = "Cancelled";
    order.trackingUpdates.push({
      status: "Cancelled",
      timestamp: new Date(),
      message: "Order cancelled by user",
    });

    // Send notification
    await notificationModel.create({
      userId: order.userId,
      orderId: order._id,
      type: "order_update",
      title: "Order Cancelled",
      message: "Your order has been cancelled",
      priority: "medium",
    });

    order.updatedAt = new Date();
    await order.save();

    return sendSuccess(res, "Order cancelled successfully", {
      orderId: id,
      status: "Cancelled",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return sendError(res, "Failed to cancel order", 500, { error: error.message });
  }
};

// Add Order Rating and Review
export const rateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, "Rating must be between 1 and 5", 400);
    }

    const order = await orderModel.findById(id);

    if (!order) {
      return sendError(res, "Order not found", 404);
    }

    if (order.userId.toString() !== userId.toString()) {
      return sendError(res, "Unauthorized access", 403);
    }

    if (order.status !== "Delivered") {
      return sendError(res, "Can only rate delivered orders", 400);
    }

    order.rating = parseInt(rating);
    if (review) order.review = review.trim();

    order.updatedAt = new Date();
    await order.save();

    return sendSuccess(res, "Order rated successfully", {
      orderId: id,
      rating: order.rating,
      review: order.review,
    });
  } catch (error) {
    console.error("Rate order error:", error);
    return sendError(res, "Failed to rate order", 500, { error: error.message });
  }
};

// Get All Orders (Admin Only)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "", userId = "" } = req.query;

    const { valid, page: p, limit: l, skip } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const total = await orderModel.countDocuments(filter);

    const orders = await orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean();

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

    const order = await orderModel.findById(orderId);

    if (!order) {
      return sendError(res, "Order not found", 404);
    }

    if (success === "true" || success === true) {
      order.payment = true;
      order.status = "Confirmed";
      order.paymentMethod = "stripe";

      await notificationModel.create({
        userId: order.userId,
        orderId: order._id,
        type: "order_update",
        title: "Payment Confirmed",
        message: "Your payment has been confirmed. Order is being prepared.",
        priority: "high",
      });

      order.updatedAt = new Date();
      await order.save();

      return sendSuccess(res, "Payment verified successfully");
    } else {
      order.payment = false;

      await notificationModel.create({
        userId: order.userId,
        orderId: order._id,
        type: "order_update",
        title: "Payment Failed",
        message: "Payment verification failed. Please try again.",
        priority: "high",
      });

      order.updatedAt = new Date();
      await order.save();

      return sendError(res, "Payment verification failed", 400);
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    return sendError(res, "Failed to verify payment", 500, { error: error.message });
  }
};

// Legacy exports for backward compatibility
export const placeOrder_legacy = placeOrder;
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin pannel
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({});
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating status
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({ success: true, message: "Status Updated Successfully" });
    }else{
      res.json({ success: false, message: "You are not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
