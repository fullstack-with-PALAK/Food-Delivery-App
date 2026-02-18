import express from "express";
import {
  createReview,
  getFoodReviews,
  getUserReviews,
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getTopRatedItems,
} from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/auth.js";

const reviewRoute = express.Router();

// Public routes
reviewRoute.get("/food/:foodId", getFoodReviews);
reviewRoute.get("/top-rated", getTopRatedItems);

// Protected routes
reviewRoute.post("/", authMiddleware, createReview);
reviewRoute.get("/user", authMiddleware, getUserReviews);
reviewRoute.get("/:id", authMiddleware, getReview);
reviewRoute.put("/:id", authMiddleware, updateReview);
reviewRoute.delete("/:id", authMiddleware, deleteReview);
reviewRoute.post("/:id/helpful", authMiddleware, markReviewHelpful);

export default reviewRoute;
