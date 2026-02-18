import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// Get dashboard overview
const getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total metrics
    const totalUsers = await userModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();
    const totalFoods = await foodModel.countDocuments();

    // Revenue
    const totalRevenue = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Today's metrics
    const todayOrders = await orderModel.countDocuments({
      createdAt: { $gte: today }
    });
    const todayRevenue = await orderModel.aggregate([
      {
        $match: { createdAt: { $gte: today } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    // This month's orders
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthOrders = await orderModel.countDocuments({
      createdAt: { $gte: monthStart }
    });

    res.json({
      success: true,
      overview: {
        totalUsers,
        totalOrders,
        totalFoods,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        monthOrders,
        avgOrderValue: (
          (totalRevenue[0]?.total || 0) / totalOrders
        ).toFixed(2)
      }
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.json({
      success: false,
      message: "Error fetching overview"
    });
  }
};

// Get revenue analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const period = req.query.period || "month"; // week, month, year
    const endDate = new Date();
    let startDate = new Date();

    if (period === "week") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(endDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }

    const format =
      period === "week"
        ? "%Y-%m-%d"
        : period === "month"
        ? "%Y-%m-%d"
        : "%Y-%m";

    const data = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format,
              date: "$createdAt"
            }
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: data
    });
  } catch (error) {
    console.error("Revenue analytics error:", error);
    res.json({
      success: false,
      message: "Error fetching analytics"
    });
  }
};

// Get top selling foods
const getTopSellingFoods = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topFoods = await orderModel.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.foodId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orders: { $sum: 1 }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "foods",
          localField: "_id",
          foreignField: "_id",
          as: "foodDetails"
        }
      }
    ]);

    res.json({
      success: true,
      topFoods: topFoods.map((item) => ({
        foodId: item._id,
        foodName: item.foodDetails[0]?.name || "Unknown",
        totalSold: item.totalSold,
        totalRevenue: item.totalRevenue.toFixed(2),
        orders: item.orders
      }))
    });
  } catch (error) {
    console.error("Top foods error:", error);
    res.json({
      success: false,
      message: "Error fetching top foods"
    });
  }
};

// Get category performance
const getCategoryPerformance = async (req, res) => {
  try {
    const categoryPerf = await orderModel.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "foods",
          localField: "items.foodId",
          foreignField: "_id",
          as: "food"
        }
      },
      { $unwind: "$food" },
      {
        $group: {
          _id: "$food.category",
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
          itemsSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      success: true,
      categoryPerformance: categoryPerf
    });
  } catch (error) {
    console.error("Category performance error:", error);
    res.json({
      success: false,
      message: "Error fetching category performance"
    });
  }
};

// Get customer analytics
const getCustomerAnalytics = async (req, res) => {
  try {
    const totalCustomers = await userModel.countDocuments();
    const newCustomersThisMonth = await userModel.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const topCustomers = await orderModel.aggregate([
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          lastOrder: { $max: "$createdAt" }
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

    // Customer retention
    const repeatedCustomers = await orderModel.aggregate([
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 }
        }
      },
      {
        $match: { orderCount: { $gt: 1 } }
      },
      {
        $count: "totalRepeated"
      }
    ]);

    res.json({
      success: true,
      customerAnalytics: {
        totalCustomers,
        newCustomersThisMonth,
        repeatedCustomers: repeatedCustomers[0]?.totalRepeated || 0,
        retentionRate: (
          ((repeatedCustomers[0]?.totalRepeated || 0) / totalCustomers) *
          100
        ).toFixed(2),
        topCustomers: topCustomers.map((c) => ({
          userId: c._id,
          name: c.userDetails[0]?.name,
          totalSpent: c.totalSpent.toFixed(2),
          orders: c.orderCount
        }))
      }
    });
  } catch (error) {
    console.error("Customer analytics error:", error);
    res.json({
      success: false,
      message: "Error fetching customer analytics"
    });
  }
};

// Get order status analytics
const getOrderStatusAnalytics = async (req, res) => {
  try {
    const statusBreakdown = await orderModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          avgValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    const totalOrders = statusBreakdown.reduce((sum, item) => sum + item.count, 0);

    res.json({
      success: true,
      statusAnalytics: statusBreakdown.map((item) => ({
        status: item._id,
        count: item.count,
        percentage: ((item.count / totalOrders) * 100).toFixed(2),
        totalRevenue: item.totalRevenue.toFixed(2),
        avgOrderValue: item.avgValue.toFixed(2)
      }))
    });
  } catch (error) {
    console.error("Status analytics error:", error);
    res.json({
      success: false,
      message: "Error fetching status analytics"
    });
  }
};

export {
  getDashboardOverview,
  getRevenueAnalytics,
  getTopSellingFoods,
  getCategoryPerformance,
  getCustomerAnalytics,
  getOrderStatusAnalytics
};
