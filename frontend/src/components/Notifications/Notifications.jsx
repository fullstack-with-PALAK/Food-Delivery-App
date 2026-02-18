import React, { useContext, useEffect, useState } from 'react';
import './Notifications.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Notifications = ({ showNotifications, setShowNotifications }) => {
  const { url, token, user } = useContext(StoreContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (showNotifications && token && user) {
      fetchNotifications();
    }
  }, [showNotifications, token, user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(
        `${url}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(
        `${url}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${url}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await axios.delete(`${url}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications([]);
      } catch (error) {
        console.error('Failed to clear notifications:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'payment':
        return '💳';
      case 'delivery':
        return '🚗';
      case 'review':
        return '⭐';
      case 'promo':
        return '🎉';
      case 'offer':
        return '🎁';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    const colors = {
      order: '#2196F3',
      payment: '#4CAF50',
      delivery: '#FF9800',
      review: '#FFC107',
      promo: '#E91E63',
      offer: '#9C27B0',
    };
    return colors[type] || '#666';
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  const filteredNotifications =
    filter === 'all'
      ? notifications
      : filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!showNotifications) return null;

  return (
    <div className="notifications-overlay">
      <div className="notifications-panel">
        {/* Header */}
        <div className="notifications-header">
          <h2>Notifications</h2>
          <button
            className="close-btn"
            onClick={() => setShowNotifications(false)}
          >
            ✕
          </button>
        </div>

        {/* Action Bar */}
        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button className="mark-read-btn" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="clear-btn" onClick={clearAllNotifications}>
              Clear all
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="notifications-filters">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button
            className={`filter-tab ${filter === 'order' ? 'active' : ''}`}
            onClick={() => setFilter('order')}
          >
            Orders
          </button>
          <button
            className={`filter-tab ${filter === 'promo' ? 'active' : ''}`}
            onClick={() => setFilter('promo')}
          >
            Promos
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {loading ? (
            <div className="notifications-empty">
              <div className="spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="empty-icon">🔔</div>
              <p>
                {filter === 'all'
                  ? 'No notifications yet'
                  : `No ${filter} notifications`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${
                  !notification.read ? 'unread' : ''
                }`}
              >
                <div
                  className="notification-icon"
                  style={{
                    backgroundColor: getNotificationColor(notification.type),
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <h3 className="notification-title">{notification.title}</h3>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-metadata">
                    <span className="notification-time">
                      {formatTime(notification.createdAt)}
                    </span>
                    {notification.type && (
                      <span className="notification-type">
                        {notification.type}
                      </span>
                    )}
                  </div>
                </div>

                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="action-btn read-btn"
                      title="Mark as read"
                      onClick={() => markAsRead(notification._id)}
                    >
                      ●
                    </button>
                  )}
                  <button
                    className="action-btn delete-btn"
                    title="Delete"
                    onClick={() => deleteNotification(notification._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="notifications-footer">
            <a href="/notifications" className="view-all-link">
              View all notifications →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
