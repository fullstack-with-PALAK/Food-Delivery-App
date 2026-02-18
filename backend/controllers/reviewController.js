import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import { sendSuccess, sendError, sendPaginatedResponse, sendValidationError } from "../utils/response.js";
import { validateRequired, validatePagination, validateRating } from "../utils/validation.js";

// ============== REVIEW OPERATIONS ==============

// Create Review
export const createReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { foodId, orderId, rating, title, comment, images = [] } = req.body;

    // Validate required fields
    const validation = validateRequired({ foodId, rating, title });
    if (!validation.valid) {
      return sendValidationError(res, validation.missing);
    }

    // Validate rating
    if (!validateRating(rating)) {
      return sendError(res, "Rating must be between 0 and 5", 400);
    }

    // Check if food exists
    const food = await foodModel.findById(foodId);
    if (!food) {
      return sendError(res, "Food not found", 404);
    }

    // If orderId provided, verify order exists and matches user
    if (orderId) {
      const order = await orderModel.findById(orderId);
      if (!order) {
        return sendError(res, "Order not found", 404);
      }
      if (order.userId.toString() !== userId.toString()) {
        return sendError(res, "Unauthorized access to this order", 403);
      }
      if (order.status !== "Delivered") {
        return sendError(res, "Can only review delivered orders", 400);
      }
    }

    // Check if user already reviewed this food
    const existingReview = await reviewModel.findOne({
      userId,
      foodId,
    });

    if (existingReview) {
      return sendError(res, "You have already reviewed this food item", 409);
    }

    // Create new review
    const newReview = new reviewModel({
      userId,
      foodId,
      orderId: orderId || null,
      rating: parseInt(rating),
      title: title.trim(),
      comment: comment ? comment.trim() : "",
      images: Array.isArray(images) ? images : [],
      verified: !!orderId,
      createdAt: new Date(),
    });

    await newReview.save();

    // Update food rating
    await updateFoodRating(foodId);

    return sendSuccess(res, "Review created successfully", newReview, 201);
  } catch (error) {
    console.error("Create review error:", error);
    return sendError(res, "Failed to create review", 500, { error: error.message });
  }
};

// Get Food Reviews
export const getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { page = 1, limit = 10, sortBy = "-createdAt" } = req.query;

    // Check if food exists
    const food = await foodModel.findById(foodId);
    if (!food) {
      return sendError(res, "Food not found", 404);
    }

    const { valid, page: p, limit: l, skip } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const total = await reviewModel.countDocuments({ foodId });

    const reviews = await reviewModel
      .find({ foodId })
      .populate("userId", "name profileImage")
      .sort(sortBy)
      .skip(skip)
      .limit(l)
      .lean();

    return sendPaginatedResponse(res, "Food reviews retrieved", reviews, p, l, total);
  } catch (error) {
    console.error("Get food reviews error:", error);
    return sendError(res, "Failed to fetch reviews", 500, { error: error.message });
  }
};

// Get User Reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const { valid, page: p, limit: l, skip } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const total = await reviewModel.countDocuments({ userId });

    const reviews = await reviewModel
      .find({ userId })
      .populate("foodId", "name image category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean();

    return sendPaginatedResponse(res, "User reviews retrieved", reviews, p, l, total);
  } catch (error) {
    console.error("Get user reviews error:", error);
    return sendError(res, "Failed to fetch user reviews", 500, { error: error.message });
  }
};

// Get Single Review
export const getReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await reviewModel
      .findById(id)
      .populate("userId", "name profileImage")
      .populate("foodId", "name image category");

    if (!review) {
      return sendError(res, "Review not found", 404);
    }

    return sendSuccess(res, "Review retrieved", review);
  } catch (error) {
    console.error("Get review error:", error);
    return sendError(res, "Failed to fetch review", 500, { error: error.message });
  }
};

// Update Review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, comment, rating, images } = req.body;

    const review = await reviewModel.findById(id);

    if (!review) {
      return sendError(res, "Review not found", 404);
    }

    // Verify ownership
    if (review.userId.toString() !== userId.toString()) {
      return sendError(res, "Unauthorized access", 403);
    }

    // Update fields
    if (title) review.title = title.trim();
    if (comment !== undefined) review.comment = comment.trim();
    if (rating) {
      if (!validateRating(rating)) {
        return sendError(res, "Rating must be between 0 and 5", 400);
      }
      review.rating = parseInt(rating);
    }
    if (images) review.images = Array.isArray(images) ? images : [];

    review.updatedAt = new Date();
    await review.save();

    // Update food rating if rating changed
    if (rating) {
      await updateFoodRating(review.foodId);
    }

    return sendSuccess(res, "Review updated successfully", review);
  } catch (error) {
    console.error("Update review error:", error);
    return sendError(res, "Failed to update review", 500, { error: error.message });
  }
};

// Delete Review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const review = await reviewModel.findById(id);

    if (!review) {
      return sendError(res, "Review not found", 404);
    }

    // Verify ownership
    if (review.userId.toString() !== userId.toString()) {
      return sendError(res, "Unauthorized access", 403);
    }

    const foodId = review.foodId;
    await reviewModel.findByIdAndDelete(id);

    // Update food rating
    await updateFoodRating(foodId);

    return sendSuccess(res, "Review deleted successfully", { deletedId: id });
  } catch (error) {
    console.error("Delete review error:", error);
    return sendError(res, "Failed to delete review", 500, { error: error.message });
  }
};

// Mark Review as Helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful = true } = req.body;

    const review = await reviewModel.findById(id);

    if (!review) {
      return sendError(res, "Review not found", 404);
    }

    if (helpful) {
      review.helpful = (review.helpful || 0) + 1;
    } else {
      review.unhelpful = (review.unhelpful || 0) + 1;
    }

    await review.save();

    return sendSuccess(res, "Review marked", {
      helpful: review.helpful,
      unhelpful: review.unhelpful,
    });
  } catch (error) {
    console.error("Mark helpful error:", error);
    return sendError(res, "Failed to mark review", 500, { error: error.message });
  }
};

// Get Top Rated Food Items
export const getTopRatedItems = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const foods = await foodModel
      .find({ rating: { $gt: 0 } })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(parseInt(limit))
      .lean();

    return sendSuccess(res, "Top rated foods retrieved", foods);
  } catch (error) {
    console.error("Get top rated error:", error);
    return sendError(res, "Failed to fetch top rated foods", 500, { error: error.message });
  }
};

// ============== HELPER FUNCTIONS ==============

// Update food rating based on reviews
async function updateFoodRating(foodId) {
  try {
    const reviews = await reviewModel.find({ foodId });

    if (reviews.length === 0) {
      await foodModel.findByIdAndUpdate(foodId, {
        rating: 0,
        reviewCount: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    await foodModel.findByIdAndUpdate(foodId, {
      rating: averageRating,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error("Update food rating error:", error);
  }
}
