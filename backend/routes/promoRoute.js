import express from "express";
import {
  createPromoCode,
  getAllPromoCodes,
  getActivePromoCodes,
  validatePromoCode,
  applyPromoCode,
  updatePromoCode,
  deletePromoCode,
  getPromoCodeStats,
} from "../controllers/promoCodeController.js";
import { authMiddleware, adminAuthMiddleware } from "../middleware/auth.js";

const promoRoute = express.Router();

// Public routes
promoRoute.get("/active", getActivePromoCodes);
promoRoute.post("/validate", validatePromoCode);

// Admin routes
promoRoute.post("/", adminAuthMiddleware, createPromoCode);
promoRoute.get("/", adminAuthMiddleware, getAllPromoCodes);
promoRoute.put("/:id", adminAuthMiddleware, updatePromoCode);
promoRoute.delete("/:id", adminAuthMiddleware, deletePromoCode);
promoRoute.get("/:id/stats", adminAuthMiddleware, getPromoCodeStats);

// Protected user route
promoRoute.post("/apply", authMiddleware, applyPromoCode);

export default promoRoute;
