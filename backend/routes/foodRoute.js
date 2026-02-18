import express from "express";
import {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getFoodsByCategory,
  getTopRatedFoods,
  getDiscountFoods,
  getVegetarianFoods,
  searchFoods,
  getCategories,
  updateFoodRating,
} from "../controllers/foodController.js";
import { authMiddleware, adminAuthMiddleware, optionalAuth } from "../middleware/auth.js";
import multer from "multer";

const foodRoute = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Public routes - Read operations
foodRoute.get("/list", getAllFoods);
foodRoute.get("/categories", getCategories);
foodRoute.get("/search", searchFoods);
foodRoute.get("/top-rated", getTopRatedFoods);
foodRoute.get("/discount", getDiscountFoods);
foodRoute.get("/vegetarian", getVegetarianFoods);
foodRoute.get("/category/:category", getFoodsByCategory);
foodRoute.get("/:id", getFoodById);

// Admin routes - Write operations
foodRoute.post("/add", adminAuthMiddleware, upload.single("image"), createFood);
foodRoute.put("/:id", adminAuthMiddleware, upload.single("image"), updateFood);
foodRoute.delete("/:id", adminAuthMiddleware, deleteFood);

// Protected route - Update rating after review
foodRoute.post("/:id/update-rating", authMiddleware, updateFoodRating);

export default foodRoute;
