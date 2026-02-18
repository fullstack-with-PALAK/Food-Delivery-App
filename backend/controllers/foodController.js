import foodModel from "../models/foodModel.js";
import { sendSuccess, sendError, sendPaginatedResponse } from "../utils/response.js";
import { validateRequired, validatePagination } from "../utils/validation.js";

// ============== FOOD CRUD OPERATIONS ==============

// Get All Foods with Pagination, Search & Filter
export const getAllFoods = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category = "", sortBy = "-createdAt" } = req.query;

    // Build filter object
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Validate pagination
    const { valid, page: p, limit: l, skip } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    // Get total count for pagination
    const total = await foodModel.countDocuments(filter);

    // Fetch foods with sorting and pagination
    const foods = await foodModel
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(l)
      .lean();

    return sendPaginatedResponse(
      res,
      "Foods fetched successfully",
      foods,
      p,
      l,
      total
    );
  } catch (error) {
    console.error("Get foods error:", error);
    return sendError(res, "Failed to fetch foods", 500, { error: error.message });
  }
};

// Get Food by ID
export const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, "Food ID is required", 400);
    }

    const food = await foodModel.findById(id);

    if (!food) {
      return sendError(res, "Food not found", 404);
    }

    return sendSuccess(res, "Food retrieved successfully", food);
  } catch (error) {
    console.error("Get food error:", error);
    return sendError(res, "Failed to fetch food", 500, { error: error.message });
  }
};

// Create New Food (Admin Only)
export const createFood = async (req, res) => {
  try {
    const { name, description, price, category, image, isVegetarian, calories, preparationTime } = req.body;

    // Validate required fields
    const validation = validateRequired({
      name,
      description,
      price,
      category,
      image,
    });

    if (!validation.valid) {
      return sendError(res, "Missing required fields", 400, {
        missing: validation.missing,
      });
    }

    // Validate price
    if (isNaN(price) || parseFloat(price) <= 0) {
      return sendError(res, "Price must be a positive number", 400);
    }

    // Check for duplicate food item
    const existingFood = await foodModel.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      category,
    });

    if (existingFood) {
      return sendError(res, "Food item already exists in this category", 409);
    }

    // Create new food
    const newFood = new foodModel({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim(),
      image,
      isVegetarian: isVegetarian || false,
      calories: calories ? parseInt(calories) : null,
      preparationTime: preparationTime ? parseInt(preparationTime) : 30,
      available: true,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
    });

    await newFood.save();

    return sendSuccess(res, "Food item created successfully", newFood, 201);
  } catch (error) {
    console.error("Create food error:", error);
    return sendError(res, "Failed to create food item", 500, { error: error.message });
  }
};

// Update Food (Admin Only)
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, isVegetarian, calories, available, preparationTime, discountPercent } = req.body;

    const food = await foodModel.findById(id);

    if (!food) {
      return sendError(res, "Food not found", 404);
    }

    // Update allowed fields
    if (name) food.name = name.trim();
    if (description) food.description = description.trim();
    if (price) food.price = parseFloat(price);
    if (category) food.category = category.trim();
    if (image) food.image = image;
    if (isVegetarian !== undefined) food.isVegetarian = isVegetarian;
    if (calories) food.calories = parseInt(calories);
    if (available !== undefined) food.available = available;
    if (preparationTime) food.preparationTime = parseInt(preparationTime);
    if (discountPercent !== undefined) food.discountPercent = parseInt(discountPercent);

    food.updatedAt = new Date();
    await food.save();

    return sendSuccess(res, "Food item updated successfully", food);
  } catch (error) {
    console.error("Update food error:", error);
    return sendError(res, "Failed to update food item", 500, { error: error.message });
  }
};

// Delete Food (Admin Only)
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const food = await foodModel.findByIdAndDelete(id);

    if (!food) {
      return sendError(res, "Food not found", 404);
    }

    return sendSuccess(res, "Food item deleted successfully", { deletedId: id });
  } catch (error) {
    console.error("Delete food error:", error);
    return sendError(res, "Failed to delete food item", 500, { error: error.message });
  }
};

// ============== ADVANCED FOOD QUERIES ==============

// Get Foods by Category
export const getFoodsByCategory = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, sortBy = "-rating" } = req.query;

    if (!category) {
      return sendError(res, "Category is required", 400);
    }

    const { valid, page: p, limit: l, skip } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const total = await foodModel.countDocuments({
      category: { $regex: `^${category}$`, $options: "i" },
      available: true,
    });

    const foods = await foodModel
      .find({
        category: { $regex: `^${category}$`, $options: "i" },
        available: true,
      })
      .sort(sortBy)
      .skip(skip)
      .limit(l)
      .lean();

    return sendPaginatedResponse(res, `Foods in ${category} category`, foods, p, l, total);
  } catch (error) {
    console.error("Get foods by category error:", error);
    return sendError(res, "Failed to fetch foods", 500, { error: error.message });
  }
};

// Get Top Rated Foods
export const getTopRatedFoods = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const foods = await foodModel
      .find({ available: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(parseInt(limit))
      .lean();

    return sendSuccess(res, "Top rated foods retrieved", foods);
  } catch (error) {
    console.error("Get top rated foods error:", error);
    return sendError(res, "Failed to fetch top rated foods", 500, { error: error.message });
  }
};

// Get Discount Foods
export const getDiscountFoods = async (req, res) => {
  try {
    const foods = await foodModel
      .find({
        available: true,
        discountPercent: { $gt: 0 },
      })
      .sort({ discountPercent: -1 })
      .lean();

    return sendSuccess(res, "Discount foods retrieved", foods);
  } catch (error) {
    console.error("Get discount foods error:", error);
    return sendError(res, "Failed to fetch discount foods", 500, { error: error.message });
  }
};

// Get Vegetarian Foods
export const getVegetarianFoods = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const { valid, page: p, limit: l, skip } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const total = await foodModel.countDocuments({
      isVegetarian: true,
      available: true,
    });

    const foods = await foodModel
      .find({ isVegetarian: true, available: true })
      .sort({ rating: -1 })
      .skip(skip)
      .limit(l)
      .lean();

    return sendPaginatedResponse(res, "Vegetarian foods retrieved", foods, p, l, total);
  } catch (error) {
    console.error("Get vegetarian foods error:", error);
    return sendError(res, "Failed to fetch vegetarian foods", 500, { error: error.message });
  }
};

// Search Foods
export const searchFoods = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query || query.trim().length === 0) {
      return sendError(res, "Search query is required", 400);
    }

    const { valid, page: p, limit: l, skip } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const total = await foodModel.countDocuments({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });

    const foods = await foodModel
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
        ],
      })
      .sort({ rating: -1 })
      .skip(skip)
      .limit(l)
      .lean();

    return sendPaginatedResponse(res, `Search results for "${query}"`, foods, p, l, total);
  } catch (error) {
    console.error("Search foods error:", error);
    return sendError(res, "Failed to search foods", 500, { error: error.message });
  }
};

// Get All Categories
export const getCategories = async (req, res) => {
  try {
    const categories = await foodModel.distinct("category");

    return sendSuccess(
      res,
      "Categories retrieved successfully",
      {
        total: categories.length,
        categories: categories.sort(),
      }
    );
  } catch (error) {
    console.error("Get categories error:", error);
    return sendError(res, "Failed to fetch categories", 500, { error: error.message });
  }
};

// Update Food Ratings
export const updateFoodRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, "Rating must be between 1 and 5", 400);
    }

    const food = await foodModel.findById(id);

    if (!food) {
      return sendError(res, "Food not found", 404);
    }

    // Calculate new average rating
    const newAverageRating =
      (food.rating * (food.reviewCount || 0) + rating) / (food.reviewCount + 1);

    food.rating = Math.round(newAverageRating * 10) / 10; // Round to 1 decimal
    food.reviewCount = (food.reviewCount || 0) + 1;
    food.updatedAt = new Date();

    await food.save();

    return sendSuccess(res, "Food rating updated successfully", {
      foodId: id,
      rating: food.rating,
      reviewCount: food.reviewCount,
    });
  } catch (error) {
    console.error("Update rating error:", error);
    return sendError(res, "Failed to update rating", 500, { error: error.message });
  }
};

// Legacy exports for backward compatibility
export const addFood = createFood;
export const listFood = getAllFoods;
export const removeFood = deleteFood;
