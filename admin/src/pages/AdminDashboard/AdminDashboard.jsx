import React, { useContext, useEffect, useState } from 'react';
import './AdminDashboard.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { url, token } = useContext(StoreContext);
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topFoods, setTopFoods] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, [token, selectedPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes, topFoodsRes, statusRes] = await Promise.all([
        axios.get(`${url}/api/admin/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${url}/api/admin/analytics/revenue?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${url}/api/admin/analytics/top-foods?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${url}/api/admin/analytics/order-status`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (overviewRes.data.success) setOverview(overviewRes.data.overview);
      if (revenueRes.data.success) setRevenueData(revenueRes.data.analytics);
      if (topFoodsRes.data.success) setTopFoods(topFoodsRes.data.topFoods);
      if (statusRes.data.success) setStatusStats(statusRes.data.statusAnalytics);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, label, value, subtext, bgColor }) => (
    <div className={`stat-card ${bgColor}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {subtext && <p className="stat-subtext">{subtext}</p>}
      </div>
    </div>
  );

  if (!token) {
    return (
      <div className="admin-dashboard-container">
        <div className="unauthorized">
          <h2>Admin Access Required</h2>
          <p>Please login as an admin to access this dashboard</p>
          <button onClick={() => navigate('/')} className="btn-back">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome! Here's your business overview</p>
      </div>

      {/* Navigation */}
      <div className="admin-nav">
        <button className="nav-btn active" onClick={() => navigate('/admin/foods')}>
          📦 Manage Foods
        </button>
        <button className="nav-btn" onClick={() => navigate('/admin/orders')}>
          📋 Orders
        </button>
        <button className="nav-btn" onClick={() => navigate('/admin/users')}>
          👥 Users
        </button>
        <button className="nav-btn" onClick={() => navigate('/admin/analytics')}>
          📊 Analytics
        </button>
      </div>

      {/* Overview Cards */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : overview ? (
        <>
          <div className="stats-grid">
            <StatCard
              icon="📊"
              label="Total Orders"
              value={overview.totalOrders}
              subtext={`Today: ${overview.todayOrders}`}
              bgColor="blue"
            />
            <StatCard
              icon="💰"
              label="Total Revenue"
              value={`₹${parseFloat(overview.totalRevenue).toFixed(2)}`}
              subtext={`Today: ₹${parseFloat(overview.todayRevenue).toFixed(2)}`}
              bgColor="green"
            />
            <StatCard
              icon="👥"
              label="Total Users"
              value={overview.totalUsers}
              subtext="Active customers"
              bgColor="purple"
            />
            <StatCard
              icon="🍕"
              label="Total Foods"
              value={overview.totalFoods}
              subtext="Menu items"
              bgColor="orange"
            />
            <StatCard
              icon="📈"
              label="Avg Order Value"
              value={`₹${parseFloat(overview.avgOrderValue).toFixed(2)}`}
              subtext="Per transaction"
              bgColor="pink"
            />
            <StatCard
              icon="📅"
              label="Monthly Orders"
              value={overview.monthOrders}
              subtext="This month"
              bgColor="teal"
            />
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            {/* Revenue Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h2>Revenue Trend</h2>
                <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div className="chart-content">
                {revenueData.length > 0 ? (
                  <div className="revenue-list">
                    {revenueData.map((item, idx) => (
                      <div key={idx} className="revenue-item">
                        <span className="revenue-date">{item._id}</span>
                        <div className="revenue-bar">
                          <div
                            className="revenue-fill"
                            style={{
                              width: `${(item.revenue / Math.max(...revenueData.map(r => r.revenue))) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="revenue-value">₹{item.revenue.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No revenue data available</p>
                )}
              </div>
            </div>

            {/* Top Foods */}
            <div className="chart-card">
              <h2>Top Selling Items</h2>
              <div className="top-foods-list">
                {topFoods.length > 0 ? (
                  topFoods.map((food, idx) => (
                    <div key={idx} className="food-item">
                      <div className="food-rank">#{idx + 1}</div>
                      <div className="food-info">
                        <p className="food-name">{food.foodName}</p>
                        <p className="food-sold">Sold: {food.totalSold}</p>
                      </div>
                      <p className="food-revenue">₹{food.totalRevenue}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No sales data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Analytics */}
          <div className="status-section">
            <h2>Order Status Distribution</h2>
            <div className="status-grid">
              {statusStats.map((stat, idx) => (
                <div key={idx} className="status-block">
                  <div className="status-header">
                    <h3>{stat.status}</h3>
                    <span className="status-count">{stat.count}</span>
                  </div>
                  <div className="status-bar">
                    <div
                      className="status-fill"
                      style={{
                        width: `${stat.percentage}%`,
                        backgroundColor: getStatusColor(stat.status)
                      }}
                    ></div>
                  </div>
                  <div className="status-footer">
                    <span>{stat.percentage}%</span>
                    <span>₹{stat.totalRevenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    Pending: '#FFC107',
    Confirmed: '#2196F3',
    Preparing: '#FF9800',
    'Out for Delivery': '#9C27B0',
    Delivered: '#4CAF50',
    Cancelled: '#F44336'
  };
  return colors[status] || '#666';
};

export default AdminDashboard;
