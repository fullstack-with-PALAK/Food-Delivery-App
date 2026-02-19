import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  addToWishlist,
  clearWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const wishlistRoute = express.Router();

wishlistRoute.get("/", authMiddleware, getWishlist);
wishlistRoute.post("/:foodId", authMiddleware, addToWishlist);
wishlistRoute.delete("/:foodId", authMiddleware, removeFromWishlist);
wishlistRoute.delete("/", authMiddleware, clearWishlist);

export default wishlistRoute;
