import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import { sendError } from "../utils/response.js";

const normalizeWishlist = async (user) => {
  if (!user.favoriteItems || user.favoriteItems.length === 0) {
    return user;
  }

  const hasObjects = user.favoriteItems.some((item) => item?.food);
  if (!hasObjects) {
    const fallbackDate = user.updatedAt || user.createdAt || new Date();
    user.favoriteItems = user.favoriteItems.map((id) => ({
      food: id,
      addedAt: fallbackDate,
    }));
    await user.save();
  }

  return user;
};

const mapWishlistItems = (favoriteItems) => {
  return favoriteItems
    .map((entry) => {
      if (!entry || !entry.food) return null;
      const food = entry.food.toObject ? entry.food.toObject() : entry.food;
      return {
        ...food,
        addedAt: entry.addedAt,
      };
    })
    .filter(Boolean);
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    await normalizeWishlist(user);

    await user.populate("favoriteItems.food");

    const wishlist = mapWishlistItems(user.favoriteItems);
    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return sendError(res, "Failed to fetch wishlist", 500, { error: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { foodId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const foodExists = await foodModel.findById(foodId);
    if (!foodExists) {
      return sendError(res, "Food item not found", 404);
    }

    await normalizeWishlist(user);

    const alreadyAdded = user.favoriteItems.some((entry) =>
      entry.food?.toString() === foodId
    );

    if (!alreadyAdded) {
      user.favoriteItems.unshift({ food: foodId, addedAt: new Date() });
      await user.save();
    }

    await user.populate("favoriteItems.food");
    const wishlist = mapWishlistItems(user.favoriteItems);

    return res.status(200).json({
      success: true,
      message: alreadyAdded ? "Already in wishlist" : "Added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return sendError(res, "Failed to add to wishlist", 500, { error: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { foodId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    await normalizeWishlist(user);

    user.favoriteItems = user.favoriteItems.filter(
      (entry) => entry.food?.toString() !== foodId
    );

    await user.save();
    await user.populate("favoriteItems.food");

    const wishlist = mapWishlistItems(user.favoriteItems);

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return sendError(res, "Failed to remove from wishlist", 500, { error: error.message });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    user.favoriteItems = [];
    await user.save();

    return res.status(200).json({ success: true, message: "Wishlist cleared", wishlist: [] });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    return sendError(res, "Failed to clear wishlist", 500, { error: error.message });
  }
};
