import notificationModel from "../models/notificationModel.js";
import { sendSuccess, sendError, sendPaginatedResponse, sendValidationError } from "../utils/response.js";
import { validateRequired, validatePagination } from "../utils/validation.js";

// ============== NOTIFICATION OPERATIONS ==============

// Get User Notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 15, read = null } = req.query;

    const { valid, page: p, limit: l, skip } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const filter = { userId };
    if (read !== null) {
      filter.read = read === "true";
    }

    const total = await notificationModel.countDocuments(filter);

    const notifications = await notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean();

    return sendPaginatedResponse(
      res,
      "Notifications retrieved",
      notifications,
      p,
      l,
      total
    );
  } catch (error) {
    console.error("Get notifications error:", error);
    return sendError(res, "Failed to fetch notifications", 500, { error: error.message });
  }
};

// Get Unread Notification Count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const count = await notificationModel.countDocuments({
      userId,
      read: false,
    });

    return sendSuccess(res, "Unread count retrieved", { unreadCount: count });
  } catch (error) {
    console.error("Get unread count error:", error);
    return sendError(res, "Failed to get unread count", 500, { error: error.message });
  }
};

// Mark Notification as Read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await notificationModel.findById(id);

    if (!notification) {
      return sendError(res, "Notification not found", 404);
    }

    if (notification.userId.toString() !== userId.toString()) {
      return sendError(res, "Unauthorized access", 403);
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return sendSuccess(res, "Notification marked as read");
  } catch (error) {
    console.error("Mark as read error:", error);
    return sendError(res, "Failed to mark notification", 500, { error: error.message });
  }
};

// Mark All Notifications as Read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await notificationModel.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    return sendSuccess(res, "All notifications marked as read");
  } catch (error) {
    console.error("Mark all as read error:", error);
    return sendError(res, "Failed to mark notifications", 500, { error: error.message });
  }
};

// Delete Notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await notificationModel.findById(id);

    if (!notification) {
      return sendError(res, "Notification not found", 404);
    }

    if (notification.userId.toString() !== userId.toString()) {
      return sendError(res, "Unauthorized access", 403);
    }

    await notificationModel.findByIdAndDelete(id);

    return sendSuccess(res, "Notification deleted", { deletedId: id });
  } catch (error) {
    console.error("Delete notification error:", error);
    return sendError(res, "Failed to delete notification", 500, { error: error.message });
  }
};

// Delete All Notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    await notificationModel.deleteMany({ userId });

    return sendSuccess(res, "All notifications deleted");
  } catch (error) {
    console.error("Delete all notifications error:", error);
    return sendError(res, "Failed to delete notifications", 500, { error: error.message });
  }
};

// Get Notification Preferences (placeholder for future)
export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.userId;

    // In production, this would fetch actual preferences from database
    const preferences = {
      email: true,
      push: true,
      sms: false,
      orderUpdates: true,
      promotions: true,
      reviews: true,
    };

    return sendSuccess(res, "Notification preferences", preferences);
  } catch (error) {
    console.error("Get preferences error:", error);
    return sendError(res, "Failed to fetch preferences", 500, { error: error.message });
  }
};
