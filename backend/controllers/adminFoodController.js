import foodModel from "../models/foodModel.js";
import fs from "fs";
import path from "path";

// Add new food
const addFood = async (req, res) => {
  try {
    const { name, description, price, category, vegetarian } = req.body;

    if (!req.file) {
      return res.json({ success: false, message: "No image provided" });
    }

    const imageName = `${Date.now()}_${req.file.filename}`;
    const food = new foodModel({
      name,
      description,
      price: parseFloat(price),
      image: imageName,
      category,
      vegetarian: vegetarian === "true" || vegetarian === true,
      preparationTime: req.body.preparationTime || 30
    });

    await food.save();
    res.json({
      success: true,
      message: "Food added successfully",
      food
    });
  } catch (error) {
    console.error("Add food error:", error);
    res.json({
      success: false,
      message: "Error adding food"
    });
  }
};

// Update food
const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle decimal parsing
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.originalPrice)
      updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.discount) updateData.discount = parseInt(updateData.discount);

    // Handle image update
    if (req.file) {
      const food = await foodModel.findById(id);
      if (food && food.image) {
        const oldImagePath = path.join("uploads", food.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = `${Date.now()}_${req.file.filename}`;
    }

    const updatedFood = await foodModel.findByIdAndUpdate(id, updateData, {
      new: true
    });

    res.json({
      success: true,
      message: "Food updated successfully",
      food: updatedFood
    });
  } catch (error) {
    console.error("Update food error:", error);
    res.json({
      success: false,
      message: "Error updating food"
    });
  }
};

// Delete food
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await foodModel.findById(id);

    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }

    // Delete image
    if (food.image) {
      const imagePath = path.join("uploads", food.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await foodModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Food deleted successfully"
    });
  } catch (error) {
    console.error("Delete food error:", error);
    res.json({
      success: false,
      message: "Error deleting food"
    });
  }
};

// Get all foods with pagination
const getAllFoods = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const foods = await foodModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await foodModel.countDocuments();

    res.json({
      success: true,
      foods,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error("Get foods error:", error);
    res.json({
      success: false,
      message: "Error fetching foods"
    });
  }
};

// Get food by ID
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await foodModel.findById(id);

    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }

    res.json({
      success: true,
      food
    });
  } catch (error) {
    console.error("Get food error:", error);
    res.json({
      success: false,
      message: "Error fetching food"
    });
  }
};

// Get food statistics
const getFoodStats = async (req, res) => {
  try {
    const totalFoods = await foodModel.countDocuments();
    const categories = await foodModel.distinct("category");
    const vegetarianFoods = await foodModel.countDocuments({
      vegetarian: true
    });
    const nonVegetarianFoods = await foodModel.countDocuments({
      vegetarian: false
    });

    // Average price by category
    const priceStats = await foodModel.aggregate([
      {
        $group: {
          _id: "$category",
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalFoods,
        categories: categories.length,
        vegetarianFoods,
        nonVegetarianFoods,
        vegetarianPercentage: (
          (vegetarianFoods / totalFoods) *
          100
        ).toFixed(2),
        priceStats
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.json({
      success: false,
      message: "Error fetching statistics"
    });
  }
};

// Bulk upload foods
const bulkUploadFoods = async (req, res) => {
  try {
    const { foods } = req.body;

    if (!Array.isArray(foods) || foods.length === 0) {
      return res.json({
        success: false,
        message: "Invalid food data"
      });
    }

    const insertedFoods = await foodModel.insertMany(
      foods.map((f) => ({
        ...f,
        price: parseFloat(f.price),
        vegetarian: f.vegetarian || false
      }))
    );

    res.json({
      success: true,
      message: `${insertedFoods.length} foods added successfully`,
      count: insertedFoods.length
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.json({
      success: false,
      message: "Error uploading foods"
    });
  }
};

export {
  addFood,
  updateFood,
  deleteFood,
  getAllFoods,
  getFoodById,
  getFoodStats,
  bulkUploadFoods
};
