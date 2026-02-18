import React, { useContext, useEffect, useState } from 'react';
import './Wishlist.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const navigate = useNavigate();
  const { url, token, user, cartItems, setCartItems } = useContext(StoreContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    if (token && user) {
      fetchWishlist();
    }
  }, [token, user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setWishlistItems(response.data.wishlist || []);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (foodId) => {
    try {
      const response = await axios.delete(
        `${url}/api/wishlist/${foodId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setWishlistItems(wishlistItems.filter((item) => item._id !== foodId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const addToCart = (foodId) => {
    setCartItems((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1
    }));
    toast.success('Added to cart');
  };

  const sortedItems = [...wishlistItems].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.addedAt) - new Date(a.addedAt);
    } else if (sortBy === 'price-low') {
      return (a.price || 0) - (b.price || 0);
    } else if (sortBy === 'price-high') {
      return (b.price || 0) - (a.price || 0);
    } else if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  if (!token || !user) {
    return (
      <div className="wishlist-container">
        <div className="unauthorized">
          <h2>Login Required</h2>
          <p>Please login to view your wishlist</p>
          <button onClick={() => navigate('/')} className="btn-home">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      {/* Header */}
      <div className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>
          <p>{wishlistItems.length} items saved</p>
        </div>
        {wishlistItems.length > 0 && (
          <div className="sort-section">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Latest Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="wishlist-loading">
          <div className="spinner"></div>
          <p>Loading wishlist...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="wishlist-empty">
          <div className="empty-icon">❤️</div>
          <h2>Your wishlist is empty</h2>
          <p>Start adding your favorite foods to your wishlist</p>
          <button onClick={() => navigate('/')} className="btn-continue">
            Browse Foods
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {sortedItems.map((item) => (
            <div key={item._id} className="wishlist-card">
              {/* Image Section */}
              <div
                className="card-image"
                onClick={() => navigate(`/food/${item._id}`)}
              >
                <img src={`${url}/images/${item.image}`} alt={item.name} />
                {item.discount > 0 && (
                  <div className="discount-badge">-{item.discount}%</div>
                )}
                {item.vegetarian && (
                  <div className="veggie-badge">🥬 Veg</div>
                )}
              </div>

              {/* Card Content */}
              <div className="card-content">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-description">{item.description}</p>

                {/* Rating */}
                <div className="rating-section">
                  <span className="stars">⭐ {item.rating || 'N/A'}</span>
                  <span className="reviews">({item.reviewCount || 0})</span>
                </div>

                {/* Price */}
                <div className="price-section">
                  <span className="price">₹{item.price?.toFixed(2)}</span>
                  {item.originalPrice && (
                    <span className="original-price">
                      ₹{item.originalPrice?.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Category */}
                <p className="item-category">
                  <span className="category-badge">{item.category}</span>
                </p>

                {/* Actions */}
                <div className="card-actions">
                  <button
                    onClick={() => addToCart(item._id)}
                    className="btn-add-cart"
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="btn-remove-wishlist"
                    title="Remove from wishlist"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Continue Shopping */}
      {wishlistItems.length > 0 && (
        <div className="wishlist-footer">
          <button onClick={() => navigate('/')} className="btn-continue-shop">
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
