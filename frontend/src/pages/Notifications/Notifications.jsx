import React, { useContext, useEffect, useMemo, useState } from 'react';
import './Notifications.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const { url, token, user } = useContext(StoreContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    if (token && user) {
      fetchNotifications();
    }
  }, [token, user]);

  useEffect(() => {
    if (!token || !user || !autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 25000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [token, user, autoRefresh]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
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
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(
        `${url}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${url}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete');
    }
  };

  const clearAllNotifications = async () => {
    if (window.confirm('Clear all notifications?')) {
      try {
        await axios.delete(`${url}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications([]);
      } catch (error) {
        console.error('Failed to clear notifications:', error);
        toast.error('Failed to clear');
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
      offer: '#9C27B0'
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

  const unreadCount = notifications.filter((n) => !n.read).length;
  const lastSyncText = lastSync
    ? lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'Never';

  const filteredNotifications = useMemo(() => {
    const base =
      filter === 'all'
        ? notifications
        : filter === 'unread'
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.type === filter);

    if (!query.trim()) return base;

    const q = query.toLowerCase();
    return base.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q)
    );
  }, [filter, notifications, query]);

  return (
    <div className="notifications-page">
      <div className="page-hero">
        <div>
          <h1>Notifications</h1>
          <p>Stay on top of orders, promos, and account updates.</p>
        </div>
        <div className="hero-actions">
          <div className="sync-status">
            <span className="live-dot"></span>
            <span>Live</span>
            <span className="last-sync">Updated {lastSyncText}</span>
          </div>
          <button
            className={`btn-toggle ${autoRefresh ? 'on' : ''}`}
            onClick={() => setAutoRefresh((prev) => !prev)}
          >
            Auto-refresh {autoRefresh ? 'On' : 'Off'}
          </button>
          {unreadCount > 0 && (
            <button className="btn-outline" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn-danger" onClick={clearAllNotifications}>
              Clear all
            </button>
          )}
          <button className="btn-primary" onClick={fetchNotifications}>
            Refresh
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-tabs">
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
          <button
            className={`filter-tab ${filter === 'delivery' ? 'active' : ''}`}
            onClick={() => setFilter('delivery')}
          >
            Delivery
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search notifications..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="notifications-empty">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="empty-icon">🔔</div>
          <p>No notifications found</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${
                !notification.read ? 'unread' : ''
              }`}
            >
              <div
                className="notification-icon"
                style={{ backgroundColor: getNotificationColor(notification.type) }}
              >
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-header">
                  <h3 className="notification-title">{notification.title}</h3>
                  {!notification.read && <span className="unread-dot"></span>}
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-metadata">
                  <span className="notification-time">
                    {formatTime(notification.createdAt)}
                  </span>
                  {notification.type && (
                    <span className="notification-type">{notification.type}</span>
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
                    Mark
                  </button>
                )}
                <button
                  className="action-btn delete-btn"
                  title="Delete"
                  onClick={() => deleteNotification(notification._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
