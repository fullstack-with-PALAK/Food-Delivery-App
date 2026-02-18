import React, { useContext, useEffect, useState } from 'react';
import './AdminAnalytics.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminAnalytics = () => {
  const { url, token } = useContext(StoreContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [analyticsType, setAnalyticsType] = useState('revenue');

  useEffect(() => {
    fetchAnalytics();
  }, [token, selectedPeriod, analyticsType]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let endpoints = [];
      
      if (analyticsType === 'revenue' || analyticsType === 'overview') {
        endpoints.push(axios.get(`${url}/api/admin/analytics/revenue?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        }));
      }
      
      if (analyticsType === 'category' || analyticsType === 'overview') {
        endpoints.push(axios.get(`${url}/api/admin/analytics/category-performance`, {
          headers: { Authorization: `Bearer ${token}` }
        }));
      }
      
      if (analyticsType === 'topfoods' || analyticsType === 'overview') {
        endpoints.push(axios.get(`${url}/api/admin/analytics/top-foods?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        }));
      }

      const responses = await Promise.all(endpoints);
      const data = {};
      
      if (analyticsType === 'revenue' || analyticsType === 'overview') {
        data.revenue = responses[0].data.data || [];
      }
      if (analyticsType === 'category' || analyticsType === 'overview') {
        const categoryIdx = analyticsType === 'overview' ? 1 : 0;
        data.categories = responses[categoryIdx].data.data || [];
      }
      if (analyticsType === 'topfoods' || analyticsType === 'overview') {
        const topFoodsIdx = analyticsType === 'overview' ? 2 : (analyticsType === 'category' ? 1 : 0);
        data.topFoods = responses[topFoodsIdx].data.data || [];
      }
      
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getMaxRevenue = () => {
    if (!analytics?.revenue) return 0;
    return Math.max(...analytics.revenue.map((d) => d.totalRevenue || 0));
  };

  return (
    <div className="admin-analytics-container">
      {/* Header */}
      <div className="page-header">
        <h1>Advanced Analytics & Reports</h1>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="control-group">
          <label>Analytics Type:</label>
          <select value={analyticsType} onChange={(e) => setAnalyticsType(e.target.value)}>
            <option value="overview">Overview</option>
            <option value="revenue">Revenue Trends</option>
            <option value="category">Category Performance</option>
            <option value="topfoods">Top Foods</option>
          </select>
        </div>

        {analyticsType !== 'topfoods' && (
          <div className="control-group">
            <label>Time Period:</label>
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
        )}

        <button className="btn-refresh" onClick={() => fetchAnalytics()} title="Refresh">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          {/* Revenue Analytics */}
          {(analyticsType === 'revenue' || analyticsType === 'overview') && analytics?.revenue && (
            <div className="analytics-section">
              <h2>Revenue Trends ({selectedPeriod.toUpperCase()})</h2>
              <div className="revenue-chart">
                {analytics.revenue.length === 0 ? (
                  <p className="no-data">No revenue data available</p>
                ) : (
                  <div className="chart-bars">
                    {analytics.revenue.map((item, idx) => {
                      const maxRev = getMaxRevenue();
                      const height = (item.totalRevenue / (maxRev || 1)) * 100;
                      return (
                        <div key={idx} className="bar-item">
                          <div className="bar-wrapper">
                            <div
                              className="bar"
                              style={{
                                height: `${Math.max(height, 5)}%`,
                                backgroundColor: `hsl(${(idx * 30) % 360}, 70%, 50%)`
                              }}
                            >
                              <span className="bar-value">
                                ₹{(item.totalRevenue / 1000).toFixed(1)}K
                              </span>
                            </div>
                          </div>
                          <span className="bar-label">{item._id || `Day ${idx + 1}`}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Performance */}
          {(analyticsType === 'category' || analyticsType === 'overview') && analytics?.categories && (
            <div className="analytics-section">
              <h2>Category Performance</h2>
              <div className="category-grid">
                {analytics.categories.length === 0 ? (
                  <p className="no-data">No category data available</p>
                ) : (
                  analytics.categories.map((cat, idx) => {
                    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#FFC107'];
                    return (
                      <div key={idx} className="category-card">
                        <div className="category-header">
                          <h3>{cat._id || 'Unknown'}</h3>
                          <span
                            className="category-dot"
                            style={{ backgroundColor: colors[idx % colors.length] }}
                          ></span>
                        </div>
                        <div className="category-stats">
                          <div className="stat">
                            <span className="stat-label">Orders</span>
                            <span className="stat-value">{cat.totalOrders || 0}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Revenue</span>
                            <span className="stat-value">₹{(cat.totalRevenue || 0).toFixed(0)}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Items Sold</span>
                            <span className="stat-value">{cat.totalItems || 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Top Foods */}
          {(analyticsType === 'topfoods' || analyticsType === 'overview') && analytics?.topFoods && (
            <div className="analytics-section">
              <h2>Top Selling Foods</h2>
              <div className="top-foods-list">
                {analytics.topFoods.length === 0 ? (
                  <p className="no-data">No data available</p>
                ) : (
                  <div className="foods-table">
                    {analytics.topFoods.map((food, idx) => (
                      <div key={idx} className="food-row">
                        <div className="rank">#{idx + 1}</div>
                        <div className="food-details">
                          <h4>{food.foodName || food.name || 'Unknown'}</h4>
                          <p>{food.category}</p>
                        </div>
                        <div className="food-stats">
                          <div className="stat-box">
                            <span className="stat-icon">📦</span>
                            <span>{food.totalQuantity || 0}</span>
                            <span className="stat-label">Sold</span>
                          </div>
                          <div className="stat-box">
                            <span className="stat-icon">💰</span>
                            <span>₹{(food.totalRevenue || 0).toFixed(0)}</span>
                            <span className="stat-label">Revenue</span>
                          </div>
                          <div className="stat-box">
                            <span className="stat-icon">⭐</span>
                            <span>{(food.avgRating || 0).toFixed(1)}</span>
                            <span className="stat-label">Rating</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
