import React, { useContext, useEffect, useState } from 'react';
import './AdminOrders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [token, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await axios.get(`${url}/api/admin/orders${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `${url}/api/admin/order/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Order status updated');
        fetchOrders();
        setSelectedOrder(response.data.order);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update order');
    }
  };

  const statuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const statusColors = {
    Pending: '#FFC107',
    Confirmed: '#2196F3',
    Preparing: '#FF9800',
    'Out for Delivery': '#9C27B0',
    Delivered: '#4CAF50',
    Cancelled: '#F44336'
  };

  return (
    <div className="admin-orders-container">
      {/* Header */}
      <div className="page-header">
        <h1>Manage Orders</h1>
        <button className="btn-refresh" onClick={() => fetchOrders()} title="Refresh">
          🔄
        </button>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All Orders ({orders.length})
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
            style={{
              color: statusFilter === status ? 'white' : statusColors[status],
              backgroundColor:
                statusFilter === status ? statusColors[status] : 'transparent'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">No orders found</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div
              key={order._id}
              className="order-card"
              onClick={() => {
                setSelectedOrder(order);
                setShowModal(true);
              }}
            >
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: statusColors[order.status] }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-info">
                <div className="info-item">
                  <span className="label">Customer</span>
                  <span className="value">{order.userId?.name || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Items</span>
                  <span className="value">{order.items?.length || 0}</span>
                </div>
                <div className="info-item">
                  <span className="label">Total</span>
                  <span className="value">₹{order.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Payment</span>
                  <span className="value">{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            {/* Customer Info */}
            <div className="modal-section">
              <h3>Customer Information</h3>
              <div className="info-grid">
                <p>
                  <strong>Name:</strong> {selectedOrder.userId?.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.userId?.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedOrder.userId?.phone}
                </p>
                <p>
                  <strong>Address:</strong> {selectedOrder.address?.street},{' '}
                  {selectedOrder.address?.city}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="modal-section">
              <h3>Items</h3>
              <div className="items-table">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <span>{item.name}</span>
                    <span className="qty">x{item.quantity}</span>
                    <span className="price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="modal-section">
              <div className="total-info">
                <p>
                  <span>Subtotal:</span>
                  <span>₹{(selectedOrder.totalAmount - (selectedOrder.deliveryFee || 50)).toFixed(2)}</span>
                </p>
                <p>
                  <span>Delivery Fee:</span>
                  <span>₹{(selectedOrder.deliveryFee || 50).toFixed(2)}</span>
                </p>
                {selectedOrder.discount > 0 && (
                  <p>
                    <span>Discount:</span>
                    <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                  </p>
                )}
                <p className="total-amount">
                  <span>Total:</span>
                  <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Status Update */}
            <div className="modal-section">
              <h3>Update Status</h3>
              <div className="status-buttons">
                {statuses.map((status) => (
                  <button
                    key={status}
                    className={`status-btn ${
                      selectedOrder.status === status ? 'active' : ''
                    }`}
                    style={{
                      backgroundColor:
                        selectedOrder.status === status
                          ? statusColors[status]
                          : '#f0f0f0',
                      color:
                        selectedOrder.status === status ? 'white' : '#666'
                    }}
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, status);
                      setShowModal(false);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
