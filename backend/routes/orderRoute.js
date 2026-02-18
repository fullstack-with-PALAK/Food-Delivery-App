import express from "express";
import {
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
  cancelOrder,
  rateOrder,
  getAllOrders,
  verifyPayment,
} from "../controllers/orderController.js";
import { authMiddleware, adminAuthMiddleware } from "../middleware/auth.js";

const orderRoute = express.Router();

// Public routes
orderRoute.post("/verify-payment", verifyPayment);

// Protected user routes
orderRoute.post("/place", authMiddleware, placeOrder);
orderRoute.get("/user", authMiddleware, getUserOrders);
orderRoute.get("/:id", authMiddleware, getOrderById);
orderRoute.post("/:id/track", authMiddleware, trackOrder);
orderRoute.post("/:id/cancel", authMiddleware, cancelOrder);
orderRoute.post("/:id/rate", authMiddleware, rateOrder);

// Admin routes
orderRoute.get("/", adminAuthMiddleware, getAllOrders);
orderRoute.put("/:id/status", adminAuthMiddleware, updateOrderStatus);

export default orderRoute;