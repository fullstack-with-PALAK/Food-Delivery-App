import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationPreferences,
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/auth.js";

const notificationRoute = express.Router();

// All notification routes require authentication
notificationRoute.get("/", authMiddleware, getNotifications);
notificationRoute.get("/unread-count", authMiddleware, getUnreadCount);
notificationRoute.post("/:id/read", authMiddleware, markAsRead);
notificationRoute.post("/read-all", authMiddleware, markAllAsRead);
notificationRoute.delete("/:id", authMiddleware, deleteNotification);
notificationRoute.delete("/", authMiddleware, deleteAllNotifications);
notificationRoute.get("/preferences", authMiddleware, getNotificationPreferences);

export default notificationRoute;
