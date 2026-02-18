import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });

  const statusColors = {
    Pending: "#ff7a00",
    Confirmed: "#3498db",
    Preparing: "#9b59b6",
    "Out for Delivery": "#e74c3c",
    Delivered: "#27ae60",
    Cancelled: "#95a5a6",
  };

  const statusIcons = {
    Pending: "📋",
    Confirmed: "✓",
    Preparing: "👨‍🍳",
    "Out for Delivery": "🚴",
    Delivered: "✓✓",
    Cancelled: "✕",
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${url}/api/order/user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setOrders(response.data.data || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (orderId, foodId) => {
    try {
      const response = await axios.post(
        `${url}/api/review`,
        {
          foodId,
          orderId,
          rating: reviewData.rating,
          title: `Review from order ${orderId}`,
          comment: reviewData.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Review submitted successfully!");
        setReviewingOrderId(null);
        setReviewData({ rating: 5, comment: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  const getFilteredOrders = () => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  useEffect(() => {
    if (!token || !autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [token, autoRefresh]);

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    return lastUpdated.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="my-orders">
        <h2>My Orders</h2>
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="my-orders">
      <h2>My Orders</h2>

      <div className="orders-toolbar">
        <div className="toolbar-left">
          <button className="refresh-btn" onClick={fetchOrders}>
            Refresh
          </button>
          <div className="auto-refresh">
            <span>Auto-refresh</span>
            <button
              className={`toggle ${autoRefresh ? "on" : ""}`}
              onClick={() => setAutoRefresh((prev) => !prev)}
            >
              <span></span>
            </button>
          </div>
        </div>
        <div className="toolbar-right">
          Last updated: {formatLastUpdated()}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>No orders yet. Start ordering now!</p>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="status-filter">
            <button
              className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({orders.length})
            </button>
            {Object.keys(statusColors).map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              if (count === 0) return null;
              return (
                <button
                  key={status}
                  className={`filter-btn ${statusFilter === status ? "active" : ""}`}
                  onClick={() => setStatusFilter(status)}
                  style={{ "--status-color": statusColors[status] }}
                >
                  {status} ({count})
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          <div className="orders-container">
            {filteredOrders.length === 0 ? (
              <div className="no-results">
                No orders with status "{statusFilter}".
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="order-card"
                  style={{ borderLeftColor: statusColors[order.status] }}
                >
                  {/* Order Header */}
                  <div
                    className="order-header"
                    onClick={() =>
                      setExpandedOrderId(
                        expandedOrderId === order._id ? null : order._id
                      )
                    }
                  >
                    <div className="order-info">
                      <div className="order-id">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </div>
                      <div className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </div>

                    <div className="order-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: statusColors[order.status] }}
                      >
                        {statusIcons[order.status]} {order.status}
                      </span>
                    </div>

                    <div className="order-amount">
                      Rs. {order.amount}
                    </div>

                    <button className="expand-btn">
                      {expandedOrderId === order._id ? "▼" : "▶"}
                    </button>
                  </div>

                  {/* Order Details (Expandable) */}
                  {expandedOrderId === order._id && (
                    <div className="order-details">
                      {/* Items List */}
                      <div className="order-items-section">
                        <h4>Items Ordered</h4>
                        <div className="items-list">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="ordered-item">
                              <div className="item-info">
                                <span className="item-name">{item.name}</span>
                                <span className="item-qty">x{item.quantity}</span>
                              </div>
                              <span className="item-price">
                                Rs. {item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="delivery-section">
                        <h4>Delivery Address</h4>
                        <p className="address">
                          {order.address?.street}, {order.address?.city},{" "}
                          {order.address?.state} {order.address?.zipcode}
                        </p>
                      </div>

                      {/* Order Timeline */}
                      {order.trackingUpdates && order.trackingUpdates.length > 0 && (
                        <div className="timeline-section">
                          <h4>Order Timeline</h4>
                          <div className="timeline">
                            {order.trackingUpdates.map((update, idx) => (
                              <div key={idx} className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                  <p className="timeline-status">{update.status}</p>
                                  <p className="timeline-time">
                                    {new Date(update.timestamp).toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                  {update.message && (
                                    <p className="timeline-message">
                                      {update.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Review Section for Delivered Orders */}
                      {order.status === "Delivered" && (
                        <div className="review-section">
                          <h4>Rate Your Order</h4>
                          {reviewingOrderId === order._id ? (
                            <div className="review-form">
                              <div className="rating-input">
                                <label>Rating:</label>
                                <div className="star-rating">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`star ${
                                        star <= reviewData.rating ? "active" : ""
                                      }`}
                                      onClick={() =>
                                        setReviewData({
                                          ...reviewData,
                                          rating: star,
                                        })
                                      }
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="comment-input">
                                <label>Comment:</label>
                                <textarea
                                  value={reviewData.comment}
                                  onChange={(e) =>
                                    setReviewData({
                                      ...reviewData,
                                      comment: e.target.value,
                                    })
                                  }
                                  placeholder="Share your experience..."
                                  rows="3"
                                />
                              </div>

                              <div className="review-actions">
                                <button
                                  className="submit-review-btn"
                                  onClick={() =>
                                    handleSubmitReview(order._id, order.items[0].foodId)
                                  }
                                >
                                  Submit Review
                                </button>
                                <button
                                  className="cancel-review-btn"
                                  onClick={() => setReviewingOrderId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              className="review-btn"
                              onClick={() => setReviewingOrderId(order._id)}
                            >
                              ⭐ Write a Review
                            </button>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="order-actions">
                        <button
                          className="reorder-btn"
                          onClick={() => {
                            // Usually would navigate to cart with items
                            toast.info("Reorder feature coming soon!");
                          }}
                        >
                          🔄 Reorder
                        </button>
                        {order.status !== "Delivered" &&
                          order.status !== "Cancelled" && (
                            <button
                              className="track-btn"
                              onClick={fetchOrders}
                            >
                              🗺️ Refresh Status
                            </button>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyOrders;
