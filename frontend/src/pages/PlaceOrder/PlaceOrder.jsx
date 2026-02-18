import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotalCartAmount, token, food_list, cartItems, url, clearCart } =
    useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const cartTotal = getTotalCartAmount();
  const deliveryFee = cartTotal === 0 ? 0 : 50;
  const tax = Math.round((cartTotal * 5) / 100);
  const finalTotal = cartTotal + deliveryFee + tax - promoDiscount;

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!data.firstName || !data.lastName || !data.street || !data.city || 
        !data.state || !data.zipcode || !data.country || !data.phone) {
      toast.error("Please fill all delivery details");
      return;
    }

    try {
      setLoading(true);
      let orderItems = [];
      food_list.forEach((item) => {
        if (cartItems[item._id] > 0) {
          orderItems.push({
            foodId: item._id,
            name: item.name,
            price: item.price,
            quantity: cartItems[item._id],
            image: item.image,
          });
        }
      });

      const orderData = {
        address: data,
        items: orderItems,
        amount: finalTotal,
        paymentMethod,
        promoCode: promoCode || null,
      };

      const response = await axios.post(
        `${url}/api/order/place`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (paymentMethod === "stripe" && response.data.data.sessionUrl) {
          window.location.replace(response.data.data.sessionUrl);
        } else {
          toast.success("Order placed successfully!");
          clearCart();
          setTimeout(() => {
            navigate(`/my-orders`);
          }, 1500);
        }
      } else {
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login first");
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      toast.error("Please add items to cart");
      navigate("/cart");
    }
  }, [token, navigate]);

  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-left">
        <p className="title">Delivery Address</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            value={data.firstName}
            onChange={onChangeHandler}
            type="text"
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            value={data.lastName}
            onChange={onChangeHandler}
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          type="email"
          placeholder="Email address"
        />
        <input
          required
          name="street"
          value={data.street}
          onChange={onChangeHandler}
          type="text"
          placeholder="Street address"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            value={data.city}
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            value={data.state}
            onChange={onChangeHandler}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            value={data.zipcode}
            onChange={onChangeHandler}
            type="text"
            placeholder="Zip code"
          />
          <input
            required
            name="country"
            value={data.country}
            onChange={onChangeHandler}
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          value={data.phone}
          onChange={onChangeHandler}
          type="tel"
          placeholder="Phone number"
        />

        {/* Payment Method Section */}
        <div className="payment-section">
          <p className="title">Payment Method</p>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-label">
                💳 Debit/Credit Card (Stripe)
              </span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-label">💵 Cash on Delivery</span>
            </label>
          </div>
        </div>
      </div>

      <div className="place-order-right">
        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-items">
            {food_list.map((item) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id} className="order-item">
                    <span className="item-name">
                      {item.name} x {cartItems[item._id]}
                    </span>
                    <span className="item-price">
                      Rs. {item.price * cartItems[item._id]}
                    </span>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* Cart Totals */}
        <div className="cart-total">
          <h2>Order Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>Rs. {cartTotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Tax (5%)</p>
              <p>Rs. {tax}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>Rs. {deliveryFee}</p>
            </div>
            {promoDiscount > 0 && (
              <>
                <hr />
                <div className="cart-total-details discount">
                  <p>Promo Discount</p>
                  <p>-Rs. {promoDiscount}</p>
                </div>
              </>
            )}
            <hr />
            <div className="cart-total-details total">
              <b>Total Amount</b>
              <b>Rs. {finalTotal}</b>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="place-order-btn"
          >
            {loading
              ? "Processing..."
              : paymentMethod === "stripe"
              ? "PROCEED TO PAYMENT"
              : "PLACE ORDER"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
