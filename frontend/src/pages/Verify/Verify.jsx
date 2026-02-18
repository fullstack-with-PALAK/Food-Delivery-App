import React, { useContext, useEffect, useState } from "react";
import "./Verify.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const success = searchParams.get("success");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);

        if (!sessionId && !orderId && success === null) {
          setStatus("error");
          toast.error("Missing payment information");
          return;
        }

        const response = await axios.post(
          `${url}/api/order/verify-payment`,
          { sessionId, orderId, success },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setStatus("success");
          setOrderDetails(response.data.data);
          toast.success("Payment verified successfully!");

          // Redirect to orders page after 3 seconds
          setTimeout(() => {
            navigate("/my-orders");
          }, 3000);
        } else {
          setStatus("failed");
          toast.error(response.data.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        toast.error(error.response?.data?.message || "Verification error");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId, success, url, token, navigate]);

  if (loading) {
    return (
      <div className="verify-page">
        <div className="verify-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Verifying your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-page">
      <div className="verify-container">
        {status === "success" ? (
          <div className="verify-card success">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p className="order-number">
              Order ID: {orderDetails?._id?.slice(-8).toUpperCase()}
            </p>
            <div className="order-summary">
              <div className="summary-item">
                <span>Total Amount</span>
                <strong>Rs. {orderDetails?.amount}</strong>
              </div>
              <div className="summary-item">
                <span>Payment Method</span>
                <strong>
                  {orderDetails?.paymentMethod === "stripe"
                    ? "Card (Stripe)"
                    : "Cash on Delivery"}
                </strong>
              </div>
              <div className="summary-item">
                <span>Order Status</span>
                <strong className="status-badge">{orderDetails?.status}</strong>
              </div>
              <div className="summary-item">
                <span>Items Count</span>
                <strong>{orderDetails?.items?.length || 0}</strong>
              </div>
            </div>
            <p className="redirect-message">
              Redirecting to your orders in a moment...
            </p>
            <button
              className="continue-btn"
              onClick={() => navigate("/my-orders")}
            >
              View Order Details
            </button>
          </div>
        ) : status === "failed" ? (
          <div className="verify-card failed">
            <div className="failed-icon">✕</div>
            <h2>Payment Failed</h2>
            <p>
              Your payment could not be processed. Please try again or contact
              support if the issue persists.
            </p>
            <div className="error-actions">
              <button className="retry-btn" onClick={() => navigate("/cart")}>
                Back to Cart
              </button>
              <button className="home-btn" onClick={() => navigate("/")}>
                Go Home
              </button>
            </div>
          </div>
        ) : (
          <div className="verify-card error">
            <div className="error-icon">!</div>
            <h2>Verification Error</h2>
            <p>
              An error occurred while verifying your payment. Please contact
              support if the problem persists.
            </p>
            <div className="error-actions">
              <button className="retry-btn" onClick={() => navigate("/")}>
                Go Home
              </button>
              <button className="support-btn" onClick={() => navigate("/my-orders")}>
                View Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
