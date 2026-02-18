import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Get all orders with filters and pagination
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    const sortBy = req.query.sortBy || "-createdAt";

    let filter = {};
    if (status) filter.status = status;

    const orders = await orderModel
      .find(filter)
      .populate("userId", "name email phone")
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await orderModel.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.json({
      success: false,
      message: "Error fetching orders"
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel
      .findById(id)
      .populate("userId", "name email phone address");

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.json({
      success: false,
      message: "Error fetching order"
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled"
    ];

    if (!validStatuses.includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status"
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      id,
      {
        status,
        statusHistory: {
          status,
          timestamp: new Date()
        }
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Notification creation would be here
    // await createNotification(...)

    res.json({
      success: true,
      message: "Order status updated",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.json({
      success: false,
      message: "Error updating order status"
    });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments();
    const totalRevenue = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const statusBreakdown = await orderModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue by date
    const revenueByDate = await orderModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    // Top customers
    const topCustomers = await orderModel.aggregate([
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown,
        revenueByDate,
        topCustomers
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

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await orderModel.findById(id);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res.json({
        success: false,
        message: "Cannot cancel this order"
      });
    }

    order.status = "Cancelled";
    order.cancellationReason = reason || "Cancelled by admin";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.json({
      success: false,
      message: "Error cancelling order"
    });
  }
};

// Assign delivery partner
const assignDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPartnerId, estimatedTime } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      id,
      {
        deliveryPartnerId,
        estimatedDeliveryTime: estimatedTime,
        status: "Out for Delivery"
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Delivery partner assigned",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Assign delivery error:", error);
    res.json({
      success: false,
      message: "Error assigning delivery partner"
    });
  }
};

// Get delivery analytics
const getDeliveryAnalytics = async (req, res) => {
  try {
    const deliveredOrders = await orderModel.countDocuments({
      status: "Delivered"
    });
    const totalOrders = await orderModel.countDocuments();

    const avgDeliveryTime = await orderModel.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: null,
          avgTime: {
            $avg: {
              $subtract: ["$deliveredAt", "$createdAt"]
            }
          }
        }
      }
    ]);

    const onTimeDeliveries = await orderModel.countDocuments({
      status: "Delivered",
      deliveredAt: { $lte: "$estimatedDeliveryTime" }
    });

    res.json({
      success: true,
      analytics: {
        deliveryRate: ((deliveredOrders / totalOrders) * 100).toFixed(2),
        avgDeliveryTimeMs: avgDeliveryTime[0]?.avgTime || 0,
        onTimeDeliveryPercentage: (
          (onTimeDeliveries / deliveredOrders) *
          100
        ).toFixed(2)
      }
    });
  } catch (error) {
    console.error("Get delivery analytics error:", error);
    res.json({
      success: false,
      message: "Error fetching analytics"
    });
  }
};

export {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
  assignDeliveryPartner,
  getDeliveryAnalytics
};
