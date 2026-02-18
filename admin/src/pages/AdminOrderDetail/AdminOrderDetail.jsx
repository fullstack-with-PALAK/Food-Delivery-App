import React, { useContext, useEffect, useState } from 'react';
import './AdminOrderDetail.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminOrderDetail = () => {
  const { url, token } = useContext(StoreContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id, token]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/admin/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    Pending: '#FFC107',
    Confirmed: '#2196F3',
    Preparing: '#FF9800',
    'Out for Delivery': '#9C27B0',
    Delivered: '#4CAF50',
    Cancelled: '#F44336'
  };

  if (loading) {
    return <div className="admin-order-detail loading">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="admin-order-detail empty-state">
        <p>Order not found.</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="admin-order-detail">
      <div className="detail-header">
        <div>
          <h1>Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p>Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          Back to Orders
        </button>
      </div>

      <div className="detail-grid">
        <div className="panel">
          <h2>Customer</h2>
          <div className="panel-content">
            <p><strong>Name:</strong> {order.userId?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> {order.userId?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {order.userId?.phone || 'N/A'}</p>
          </div>
        </div>

        <div className="panel">
          <h2>Delivery Address</h2>
          <div className="panel-content">
            <p>{order.address?.street || 'N/A'}</p>
            <p>
              {order.address?.city || 'N/A'}, {order.address?.state || ''}
            </p>
            <p>{order.address?.pincode || ''}</p>
          </div>
        </div>

        <div className="panel">
          <h2>Payment</h2>
          <div className="panel-content">
            <p><strong>Method:</strong> {order.paymentMethod}</p>
            <p><strong>Status:</strong> {order.paymentStatus || 'Pending'}</p>
            <p><strong>Total:</strong> Rs {order.totalAmount?.toFixed(2)}</p>
          </div>
        </div>

        <div className="panel">
          <h2>Status</h2>
          <div className="panel-content">
            <span
              className="status-pill"
              style={{ backgroundColor: statusColors[order.status] }}
            >
              {order.status}
            </span>
            {order.cancelReason && (
              <p className="cancel-reason"><strong>Reason:</strong> {order.cancelReason}</p>
            )}
          </div>
        </div>
      </div>

      <div className="panel items-panel">
        <h2>Items</h2>
        <div className="items-list">
          {order.items?.map((item, index) => (
            <div key={index} className="item-row">
              <div>
                <p className="item-name">{item.name}</p>
                <p className="item-qty">Qty: {item.quantity}</p>
              </div>
              <div className="item-price">Rs {(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="totals">
          <p><span>Subtotal</span><span>Rs {(order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}</span></p>
          <p><span>Delivery Fee</span><span>Rs {(order.deliveryFee || 0).toFixed(2)}</span></p>
          {order.discount > 0 && (
            <p><span>Discount</span><span>-Rs {order.discount.toFixed(2)}</span></p>
          )}
          <p className="total-amount"><span>Total</span><span>Rs {order.totalAmount.toFixed(2)}</span></p>
        </div>
      </div>

      <div className="panel timeline-panel">
        <h2>Order Timeline</h2>
        <div className="timeline">
          {(order.statusHistory || []).map((entry, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>{entry.status}</h4>
                <p>{new Date(entry.date).toLocaleString()}</p>
                {entry.note && <p className="timeline-note">{entry.note}</p>}
              </div>
            </div>
          ))}
          {(!order.statusHistory || order.statusHistory.length === 0) && (
            <p className="no-timeline">No timeline events recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
