import express from "express";
import {
  addFood,
  updateFood,
  deleteFood,
  getAllFoods,
  getFoodById,
  getFoodStats,
  bulkUploadFoods
} from "../controllers/adminFoodController.js";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
  assignDeliveryPartner,
  getDeliveryAnalytics
} from "../controllers/adminOrderController.js";
import {
  getDashboardOverview,
  getRevenueAnalytics,
  getTopSellingFoods,
  getCategoryPerformance,
  getCustomerAnalytics,
  getOrderStatusAnalytics
} from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Middleware to check admin status (simplified - can be expanded)
const adminMiddleware = (req, res, next) => {
  // In production, check role from user document
  if (req.body.role === "admin" || req.query.adminKey === process.env.ADMIN_KEY) {
    next();
  } else {
    res.json({
      success: false,
      message: "Admin access required"
    });
  }
};

// Food Management Routes
router.post("/food/add", authMiddleware, upload.single("image"), addFood);
router.put("/food/update/:id", authMiddleware, upload.single("image"), updateFood);
router.delete("/food/delete/:id", authMiddleware, deleteFood);
router.get("/foods", authMiddleware, getAllFoods);
router.get("/food/:id", authMiddleware, getFoodById);
router.get("/food/stats", authMiddleware, getFoodStats);
router.post("/food/bulk-upload", authMiddleware, bulkUploadFoods);

// Order Management Routes
router.get("/orders", authMiddleware, getAllOrders);
router.get("/order/:id", authMiddleware, getOrderById);
router.put("/order/:id/status", authMiddleware, updateOrderStatus);
router.delete("/order/:id/cancel", authMiddleware, cancelOrder);
router.post("/order/:id/assign-delivery", authMiddleware, assignDeliveryPartner);
router.get("/order-stats", authMiddleware, getOrderStats);
router.get("/delivery-analytics", authMiddleware, getDeliveryAnalytics);

// Analytics Routes
router.get("/analytics/dashboard", authMiddleware, getDashboardOverview);
router.get("/analytics/revenue", authMiddleware, getRevenueAnalytics);
router.get("/analytics/top-foods", authMiddleware, getTopSellingFoods);
router.get("/analytics/category-performance", authMiddleware, getCategoryPerformance);
router.get("/analytics/customers", authMiddleware, getCustomerAnalytics);
router.get("/analytics/order-status", authMiddleware, getOrderStatusAnalytics);

export default router;
