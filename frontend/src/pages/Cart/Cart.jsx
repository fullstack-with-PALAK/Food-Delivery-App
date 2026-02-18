import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const {
    food_list,
    cartItems,
    setCartItems,
    removeFromCart,
    getTotalCartAmount,
    url,
    token
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const cartTotal = getTotalCartAmount();
  const deliveryFee = cartTotal === 0 ? 0 : 50;
  const tax = Math.round((cartTotal * 5) / 100);
  const finalTotal = cartTotal + deliveryFee + tax - promoDiscount;

  // Validate and apply promo code
  const handlePromoCodeSubmit = async () => {
    if (!promoCode.trim()) {
      setPromoMessage("Please enter a promo code");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${url}/api/promo/validate`,
        { code: promoCode, orderAmount: cartTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPromoDiscount(response.data.data.discountAmount);
        setPromoMessage(response.data.data.message);
        setPromoApplied(true);
      } else {
        setPromoMessage(response.data.message);
        setPromoApplied(false);
        setPromoDiscount(0);
      }
    } catch (error) {
      setPromoMessage(error.response?.data?.message || "Invalid promo code");
      setPromoApplied(false);
      setPromoDiscount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoDiscount(0);
    setPromoMessage("");
    setPromoApplied(false);
  };

  if (cartTotal === 0) {
    return (
      <div className="cart">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some delicious food to your cart to get started</p>
          <button onClick={() => navigate("/")} className="continue-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                  <img src={url + "/images/" + item.image} alt={item.name} />
                  <p>{item.name}</p>
                  <p>Rs. {item.price}</p>
                  <p>{cartItems[item._id]}</p>
                  <p>Rs. {item.price * cartItems[item._id]}</p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">
                    ✕
                  </p>
                </div>
                <hr />
              </div>
            );
          }
        })}
      </div>
      
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Summary</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>Rs. {cartTotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Taxes (5%)</p>
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
                <div className="cart-total-details promo-discount">
                  <p>Promo Discount</p>
                  <p>-Rs. {promoDiscount}</p>
                </div>
              </>
            )}
            <hr />
            <div className="cart-total-details total">
              <b>Total</b>
              <b>Rs. {finalTotal}</b>
            </div>
          </div>
          <button 
            onClick={() => navigate("/order")}
            className="checkout-btn"
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
        
        <div className="cart-promocode">
          <div>
            <p>Have a promo code?</p>
            {promoApplied ? (
              <div className="promo-applied">
                <div className="applied-code">
                  <span className="code-badge">{promoCode}</span>
                  <span className="success-msg">✓ Applied</span>
                </div>
                <button onClick={handleRemovePromo} className="remove-promo">
                  Remove
                </button>
              </div>
            ) : (
              <div className="cart-promocode-input">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={loading}
                />
                <button 
                  onClick={handlePromoCodeSubmit}
                  disabled={loading || !promoCode.trim()}
                >
                  {loading ? "Validating..." : "Apply"}
                </button>
              </div>
            )}
            {promoMessage && (
              <p className={`promo-message ${promoApplied ? "success" : "error"}`}>
                {promoMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
