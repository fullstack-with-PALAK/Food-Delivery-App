import React, { useContext, useEffect, useState } from 'react';
import './AdminUsers.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const { url, token } = useContext(StoreContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/admin/analytics/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.customers || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
  );

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive !== false).length;
  const newUsers = users.filter(
    (u) => new Date() - new Date(u.createdAt) < 30 * 24 * 60 * 60 * 1000
  ).length;
  const totalSpent = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

  return (
    <div className="admin-users-container">
      {/* Header */}
      <div className="page-header">
        <h1>Manage Users</h1>
        <button className="btn-refresh" onClick={() => fetchUsers()} title="Refresh">
          🔄
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E3F2FD', color: '#1976D2' }}>
            👥
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{totalUsers}</p>
            <span className="stat-subtext">All registered users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#F3E5F5', color: '#7B1FA2' }}>
            ✓
          </div>
          <div className="stat-content">
            <h3>Active Users</h3>
            <p className="stat-value">{activeUsers}</p>
            <span className="stat-subtext">{((activeUsers / totalUsers) * 100).toFixed(0)}% of total</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FFF3E0', color: '#F57C00' }}>
            🆕
          </div>
          <div className="stat-content">
            <h3>New (30 days)</h3>
            <p className="stat-value">{newUsers}</p>
            <span className="stat-subtext">Last 30 days</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E8F5E9', color: '#388E3C' }}>
            💰
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹{totalSpent.toFixed(0)}</p>
            <span className="stat-subtext">From all users</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">No users found</div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={user._id} className={!user.isActive ? 'inactive-row' : ''}>
                  <td className="text-center">{idx + 1}</td>
                  <td className="bold">{user.name || 'N/A'}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td className="text-center">
                    <span className="badge-pill">{user.totalOrders || 0}</span>
                  </td>
                  <td className="amount">₹{(user.totalSpent || 0).toFixed(2)}</td>
                  <td className="text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedUser.name}</h2>
              <button className="btn-close" onClick={() => setShowUserModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Contact Info */}
              <div className="user-section">
                <h3>Contact Information</h3>
                <div className="info-group">
                  <div className="info-item">
                    <span className="label">Email</span>
                    <span className="value">{selectedUser.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone</span>
                    <span className="value">{selectedUser.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Member Since</span>
                    <span className="value">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="user-section">
                <h3>Activity Stats</h3>
                <div className="info-group">
                  <div className="info-item">
                    <span className="label">Total Orders</span>
                    <span className="value">{selectedUser.totalOrders || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Total Spent</span>
                    <span className="value">₹{(selectedUser.totalSpent || 0).toFixed(2)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Avg Order Value</span>
                    <span className="value">
                      ₹
                      {selectedUser.totalOrders
                        ? ((selectedUser.totalSpent || 0) / selectedUser.totalOrders).toFixed(2)
                        : '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="user-section">
                <h3>Account Status</h3>
                <div className="status-badges">
                  <span className={`status-badge ${selectedUser.isActive !== false ? 'active' : 'inactive'}`}>
                    {selectedUser.isActive !== false ? '✓ Active' : '✗ Inactive'}
                  </span>
                  <span className={`status-badge ${selectedUser.isVerified ? 'verified' : 'unverified'}`}>
                    {selectedUser.isVerified ? '✓ Verified' : '○ Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
