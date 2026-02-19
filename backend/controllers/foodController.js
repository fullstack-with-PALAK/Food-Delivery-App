import { foodQuery } from "../config/supabaseHelpers.js";
import { sendSuccess, sendError, sendPaginatedResponse } from "../utils/response.js";
import { validateRequired, validatePagination } from "../utils/validation.js";

// ============== FOOD CRUD OPERATIONS ==============

// Get All Foods with Pagination, Search & Filter
export const getAllFoods = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query;

    // Validate pagination
    const { valid, page: p, limit: l } = validatePagination(page, limit);
    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    // Build filters object
    const filters = {};
    if (category && category.trim()) filters.category = category.trim();
    if (search && search.trim()) filters.search = search.trim();

    // Fetch foods with pagination
    const { foods, count, error } = await foodQuery.paginated(p, l, filters);

    if (error) {
      return sendError(res, "Failed to fetch foods", 500, { error: error.message });
    }

    return sendPaginatedResponse(res, "Foods fetched successfully", foods || [], p, l, count || 0);
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

    const { data: food, error } = await foodQuery.findById(id);

    if (error || !food) {
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
    const { name, description, price, category, image } = req.body;

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

    // Create new food
    const { data: newFood, error } = await foodQuery.create({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category.trim(),
      image,
      available: true,
      rating: 0,
      discount_percent: 0,
      created_at: new Date(),
    });

    if (error) {
      return sendError(res, "Failed to create food item", 500, { error: error.message });
    }

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
    const { name, description, price, category, image, available, discount_percent } = req.body;

    // First check if food exists
    const { data: existingFood, error: findError } = await foodQuery.findById(id);
    if (findError || !existingFood) {
      return sendError(res, "Food not found", 404);
    }

    // Prepare updates
    const updates = { updated_at: new Date() };
    if (name) updates.name = name.trim();
    if (description) updates.description = description.trim();
    if (price) updates.price = parseFloat(price);
    if (category) updates.category = category.trim();
    if (image) updates.image = image;
    if (available !== undefined) updates.available = available;
    if (discount_percent !== undefined) updates.discount_percent = parseInt(discount_percent);

    // Update food
    const { data: updatedFood, error } = await foodQuery.update(id, updates);

    if (error) {
      return sendError(res, "Failed to update food item", 500, { error: error.message });
    }

    return sendSuccess(res, "Food item updated successfully", updatedFood);
  } catch (error) {
    console.error("Update food error:", error);
    return sendError(res, "Failed to update food item", 500, { error: error.message });
  }
};

// Delete Food (Admin Only)
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await foodQuery.delete(id);

    if (error) {
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
    const { category, page = 1, limit = 10 } = req.query;

    if (!category) {
      return sendError(res, "Category is required", 400);
    }

    // Validate pagination
    const { valid, page: p, limit: l } = validatePagination(page, limit);
    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const { foods, count, error } = await foodQuery.paginated(p, l, {
      category: category.trim(),
    });

    if (error) {
      return sendError(res, "Failed to fetch foods", 500, { error: error.message });
    }

    return sendPaginatedResponse(res, `Foods in ${category} category`, foods || [], p, l, count || 0);
  } catch (error) {
    console.error("Get foods by category error:", error);
    return sendError(res, "Failed to fetch foods", 500, { error: error.message });
  }
};

// Get Top Rated Foods
export const getTopRatedFoods = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data: foods, error } = await foodQuery.findAll({ available: true });

    if (error) {
      return sendError(res, "Failed to fetch top rated foods", 500, { error: error.message });
    }

    // Sort by rating and limit
    const topFoods = (foods || [])
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, parseInt(limit));

    return sendSuccess(res, "Top rated foods retrieved", topFoods);
  } catch (error) {
    console.error("Get top rated foods error:", error);
    return sendError(res, "Failed to fetch top rated foods", 500, { error: error.message });
  }
};

// Get Discount Foods
export const getDiscountFoods = async (req, res) => {
  try {
    const { data: allFoods, error } = await foodQuery.findAll({ available: true });

    if (error) {
      return sendError(res, "Failed to fetch discount foods", 500, { error: error.message });
    }

    // Filter foods with discount and sort by discount percent
    const discountFoods = (allFoods || [])
      .filter((food) => food.discount_percent > 0)
      .sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));

    return sendSuccess(res, "Discount foods retrieved", discountFoods);
  } catch (error) {
    console.error("Get discount foods error:", error);
    return sendError(res, "Failed to fetch discount foods", 500, { error: error.message });
  }
};

// Search Foods
export const searchFoods = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query || query.trim().length === 0) {
      return sendError(res, "Search query is required", 400);
    }

    // Validate pagination
    const { valid, page: p, limit: l } = validatePagination(page, limit);
    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const { foods, count, error } = await foodQuery.paginated(p, l, {
      search: query.trim(),
    });

    if (error) {
      return sendError(res, "Failed to search foods", 500, { error: error.message });
    }

    return sendPaginatedResponse(res, `Search results for "${query}"`, foods || [], p, l, count || 0);
  } catch (error) {
    console.error("Search foods error:", error);
    return sendError(res, "Failed to search foods", 500, { error: error.message });
  }
};

// Get All Categories
export const getCategories = async (req, res) => {
  try {
    const { data: foods, error } = await foodQuery.findAll();

    if (error) {
      return sendError(res, "Failed to fetch categories", 500, { error: error.message });
    }

    // Extract unique categories from foods
    const categories = [
      ...new Set((foods || []).map((f) => f.category).filter((c) => c)),
    ].sort();

    return sendSuccess(res, "Categories retrieved successfully", {
      total: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return sendError(res, "Failed to fetch categories", 500, { error: error.message });
  }
};

// Legacy exports for backward compatibility
export const addFood = createFood;
export const listFood = getAllFoods;
export const removeFood = deleteFood;
