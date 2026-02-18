import React, { useContext, useState } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({ 
  id, 
  name, 
  price, 
  description, 
  image, 
  rating = 0,
  reviewCount = 0,
  isVegetarian = false,
  preparationTime = 30,
  discountPercent = 0
}) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const [showDetails, setShowDetails] = useState(false);

  const discountedPrice = discountPercent > 0 
    ? (price * (1 - discountPercent / 100)).toFixed(2) 
    : price;

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img src={url + "/images/" + image} alt={name} className="food-item-image" />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="discount-badge">{discountPercent}% OFF</div>
        )}
        
        {/* Vegetarian Badge */}
        {isVegetarian && (
          <div className="veg-badge">🌱</div>
        )}
        
        {!cartItems[id] ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt="Add to cart"
            title="Add to cart"
          />
        ) : (
          <div className="food-item-counter">
            <img 
              onClick={() => removeFromCart(id)} 
              src={assets.remove_icon_red} 
              alt="Remove"
              title="Remove from cart"
            />
            <p>{cartItems[id]}</p>
            <img 
              onClick={() => addToCart(id)} 
              src={assets.add_icon_green} 
              alt="Add"
              title="Add to cart"
            />
          </div>
        )}
      </div>
      
      <div className="food-item-info">
        <div className="food-item-header">
          <h3 className="food-item-name">{name}</h3>
          {preparationTime && (
            <span className="prep-time">⏱️ {preparationTime}min</span>
          )}
        </div>
        
        <div className="food-item-rating">
          {rating > 0 ? (
            <>
              <span className="stars">
                {'⭐'.repeat(Math.round(rating))}
                {Math.round(rating) < 5 && '☆'.repeat(5 - Math.round(rating))}
              </span>
              <span className="rating-value">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </>
          ) : (
            <span className="no-rating">No ratings yet</span>
          )}
        </div>
        
        <p className="food-item-desc">{description}</p>
        
        <div className="food-item-footer">
          <div className="price-section">
            {discountPercent > 0 ? (
              <>
                <span className="original-price">Rs. {price}</span>
                <span className="food-item-price">Rs. {discountedPrice}</span>
              </>
            ) : (
              <span className="food-item-price">Rs. {price}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
