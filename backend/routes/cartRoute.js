import express from "express";
import {
  addToCart,
  removeFromCart,
  updateCartItem,
  getCart,
  clearCart,
  getCartSummary,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/auth.js";

const cartRoute = express.Router();

// Protected routes - all cart operations require authentication
cartRoute.post("/add", authMiddleware, addToCart);
cartRoute.post("/remove", authMiddleware, removeFromCart);
cartRoute.put("/:foodId", authMiddleware, updateCartItem);
cartRoute.get("/", authMiddleware, getCart);
cartRoute.get("/summary", authMiddleware, getCartSummary);
cartRoute.delete("/", authMiddleware, clearCart);

export default cartRoute;
