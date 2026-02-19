import { cartQuery, foodQuery } from "../config/supabaseHelpers.js";
import { sendSuccess, sendError, sendValidationError } from "../utils/response.js";
import { validateRequired } from "../utils/validation.js";

// ============== CART OPERATIONS ==============

// Add Item to Cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { foodId, quantity = 1 } = req.body;

    // Validate required fields
    const validation = validateRequired({ foodId });
    if (!validation.valid) {
      return sendValidationError(res, validation.missing);
    }

    // Validate food exists and is available
    const { data: food, error: foodError } = await foodQuery.findById(foodId);
    if (foodError || !food) {
      return sendError(res, "Food item not found", 404);
    }

    if (!food.available) {
      return sendError(res, "This food item is not available", 400);
    }

    // Validate quantity
    if (isNaN(quantity) || quantity <= 0) {
      return sendError(res, "Quantity must be a positive number", 400);
    }

    // Check if item already in cart
    const { data: existingItem } = await cartQuery.getItem(userId, foodId);

    let cartItem;
    if (existingItem) {
      // Update existing item quantity
      const { data: updated, error: updateError } = await cartQuery.updateQuantity(
        userId,
        foodId,
        existingItem.quantity + parseInt(quantity)
      );
      if (updateError) {
        return sendError(res, "Failed to update cart", 500, { error: updateError.message });
      }
      cartItem = updated;
    } else {
      // Add new item to cart
      const { data: added, error: addError } = await cartQuery.addItem(
        userId,
        foodId,
        parseInt(quantity)
      );
      if (addError) {
        return sendError(res, "Failed to add item to cart", 500, { error: addError.message });
      }
      cartItem = added;
    }

    return sendSuccess(res, "Item added to cart successfully", {
      cartId: cartItem.id,
      foodId: foodId,
      quantity: cartItem.quantity,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return sendError(res, "Failed to add item to cart", 500, { error: error.message });
  }
};

// Remove Item from Cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { foodId } = req.body;

    // Validate required fields
    const validation = validateRequired({ foodId });
    if (!validation.valid) {
      return sendValidationError(res, validation.missing);
    }

    const { error } = await cartQuery.removeItem(userId, foodId);

    if (error) {
      return sendError(res, "Item not found in cart", 404);
    }

    // Get updated cart
    const { data: cartItems } = await cartQuery.getCart(userId);
    const itemCount = cartItems ? cartItems.length : 0;

    return sendSuccess(res, "Item removed from cart successfully", {
      itemCount,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return sendError(res, "Failed to remove item from cart", 500, { error: error.message });
  }
};

// Update Cart Item Quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { foodId, quantity } = req.body;

    // Validate required fields
    const validation = validateRequired({ foodId, quantity });
    if (!validation.valid) {
      return sendValidationError(res, validation.missing);
    }

    // Validate quantity
    if (isNaN(quantity) || quantity < 0) {
      return sendError(res, "Quantity must be a non-negative number", 400);
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await cartQuery.removeItem(userId, foodId);
    } else {
      const { error } = await cartQuery.updateQuantity(userId, foodId, parseInt(quantity));
      if (error) {
        return sendError(res, "Failed to update cart", 500, { error: error.message });
      }
    }

    // Get updated cart
    const { data: cartItems } = await cartQuery.getCart(userId);
    const itemCount = cartItems ? cartItems.length : 0;

    return sendSuccess(res, "Cart updated successfully", {
      foodId,
      newQuantity: quantity > 0 ? quantity : 0,
      itemCount,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return sendError(res, "Failed to update cart", 500, { error: error.message });
  }
};

// Get Cart
export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const { data: cartItems, error } = await cartQuery.getCart(userId);

    if (error) {
      return sendError(res, "Failed to fetch cart", 500, { error: error.message });
    }

    if (!cartItems || cartItems.length === 0) {
      return sendSuccess(res, "Cart is empty", {
        items: [],
        total: 0,
        itemCount: 0,
      });
    }

    // Calculate total
    let total = 0;
    const items = cartItems.map((item) => {
      const itemTotal = (item.foods?.price || 0) * item.quantity;
      total += itemTotal;
      return {
        id: item.id,
        foodId: item.food_id,
        name: item.foods?.name || "Unknown",
        price: item.foods?.price || 0,
        quantity: item.quantity,
        image: item.foods?.image,
        category: item.foods?.category,
        itemTotal: itemTotal,
      };
    });

    return sendSuccess(res, "Cart retrieved successfully", {
      items,
      total: parseFloat(total.toFixed(2)),
      itemCount: items.length,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return sendError(res, "Failed to fetch cart", 500, { error: error.message });
  }
};

// Clear Cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    const { error } = await cartQuery.clearCart(userId);

    if (error) {
      return sendError(res, "Failed to clear cart", 500, { error: error.message });
    }

    return sendSuccess(res, "Cart cleared successfully", {
      items: [],
      total: 0,
      itemCount: 0,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return sendError(res, "Failed to clear cart", 500, { error: error.message });
  }
};

// Get Cart Summary
export const getCartSummary = async (req, res) => {
  try {
    const userId = req.userId;

    const { data: cartItems, error } = await cartQuery.getCart(userId);

    if (error) {
      return sendError(res, "Failed to get cart summary", 500, { error: error.message });
    }

    if (!cartItems || cartItems.length === 0) {
      return sendSuccess(res, "Cart summary retrieved", {
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0,
      });
    }

    // Calculate subtotal
    let subtotal = 0;
    cartItems.forEach((item) => {
      subtotal += (item.foods?.price || 0) * item.quantity;
    });

    const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% tax
    const deliveryFee = subtotal > 0 ? 50 : 0; // Fixed delivery fee
    const total = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

    return sendSuccess(res, "Cart summary retrieved", {
      itemCount: cartItems.length,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax,
      deliveryFee,
      total,
    });
  } catch (error) {
    console.error("Get cart summary error:", error);
    return sendError(res, "Failed to get cart summary", 500, { error: error.message });
  }
};

// Legacy exports for backward compatibility
export const addToCart_legacy = addToCart;
export const removeFromCart_legacy = removeFromCart;
export const getCart_legacy = getCart;

export { addToCart, removeFromCart, getCart };
