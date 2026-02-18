import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
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

    // Validate food exists
    const food = await foodModel.findById(foodId);
    if (!food) {
      return sendError(res, "Food item not found", 404);
    }

    // Validate food is available
    if (!food.available) {
      return sendError(res, "This food item is not available", 400);
    }

    // Validate quantity
    if (isNaN(quantity) || quantity <= 0) {
      return sendError(res, "Quantity must be a positive number", 400);
    }

    // Get user
    const user = await userModel.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Initialize cartData if not exists
    if (!user.cartData) {
      user.cartData = {};
    }

    // Add or update item in cart
    if (user.cartData[foodId]) {
      user.cartData[foodId] += parseInt(quantity);
    } else {
      user.cartData[foodId] = parseInt(quantity);
    }

    user.updatedAt = new Date();
    await user.save();

    // Fetch and return updated cart with enriched data
    const cartWithDetails = await getCartDetails(user.cartData);

    return sendSuccess(res, "Item added to cart successfully", {
      cartId: foodId,
      quantity: user.cartData[foodId],
      cartTotal: cartWithDetails.total,
      itemCount: Object.keys(user.cartData).length,
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

    const user = await userModel.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (!user.cartData || !user.cartData[foodId]) {
      return sendError(res, "Item not found in cart", 404);
    }

    // Delete item from cart
    delete user.cartData[foodId];

    user.updatedAt = new Date();
    await user.save();

    const cartWithDetails = await getCartDetails(user.cartData);

    return sendSuccess(res, "Item removed from cart successfully", {
      cartTotal: cartWithDetails.total,
      itemCount: Object.keys(user.cartData).length,
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

    const user = await userModel.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (!user.cartData || !user.cartData[foodId]) {
      return sendError(res, "Item not found in cart", 404);
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      delete user.cartData[foodId];
    } else {
      user.cartData[foodId] = parseInt(quantity);
    }

    user.updatedAt = new Date();
    await user.save();

    const cartWithDetails = await getCartDetails(user.cartData);

    return sendSuccess(res, "Cart updated successfully", {
      foodId,
      newQuantity: quantity > 0 ? user.cartData[foodId] : 0,
      cartTotal: cartWithDetails.total,
      itemCount: Object.keys(user.cartData).length,
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

    const user = await userModel.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (!user.cartData || Object.keys(user.cartData).length === 0) {
      return sendSuccess(res, "Cart is empty", {
        cartData: {},
        items: [],
        total: 0,
        itemCount: 0,
      });
    }

    // Fetch and enrich cart data
    const cartWithDetails = await getCartDetails(user.cartData);

    return sendSuccess(res, "Cart retrieved successfully", {
      cartData: user.cartData,
      items: cartWithDetails.items,
      total: cartWithDetails.total,
      itemCount: Object.keys(user.cartData).length,
      itemsCount: cartWithDetails.items.length,
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

    const user = await userModel.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    user.cartData = {};
    user.updatedAt = new Date();
    await user.save();

    return sendSuccess(res, "Cart cleared successfully", {
      cartData: {},
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

    const user = await userModel.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (!user.cartData || Object.keys(user.cartData).length === 0) {
      return sendSuccess(res, "Cart summary retrieved", {
        itemCount: 0,
        subtotal: 0,
        tax: 0,
        deliveryFee: 0,
        total: 0,
      });
    }

    const cartWithDetails = await getCartDetails(user.cartData);
    const subtotal = cartWithDetails.total;
    const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% tax
    const deliveryFee = subtotal > 0 ? 50 : 0; // Fixed delivery fee
    const total = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

    return sendSuccess(res, "Cart summary retrieved", {
      itemCount: Object.keys(user.cartData).length,
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

// ============== HELPER FUNCTIONS ==============

// Helper function to get cart details with food information
async function getCartDetails(cartData) {
  const items = [];
  let total = 0;

  for (const [foodId, quantity] of Object.entries(cartData)) {
    const food = await foodModel.findById(foodId).lean();

    if (food) {
      const itemTotal = food.price * quantity;
      items.push({
        foodId: food._id,
        name: food.name,
        price: food.price,
        quantity,
        image: food.image,
        category: food.category,
        itemTotal: parseFloat(itemTotal.toFixed(2)),
      });

      total += itemTotal;
    }
  }

  return {
    items,
    total: parseFloat(total.toFixed(2)),
  };
}

// Legacy exports for backward compatibility
export const addToCart_legacy = addToCart;
export const removeFromCart_legacy = removeFromCart;
export const getCart_legacy = getCart;

export { addToCart, removeFromCart, getCart };
