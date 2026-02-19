import React, { useContext, useEffect, useState } from 'react';
import './FoodDetail.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    url,
    token,
    user,
    cartItems,
    setCartItems,
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
  } = useContext(StoreContext);
  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedFoods, setRelatedFoods] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const isWishlisted = wishlistItems.some((item) => item._id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFood();
    fetchReviews();
  }, [id]);

  const fetchFood = async () => {
    try {
      const response = await axios.get(`${url}/api/food/detail/${id}`);
      if (response.data.success) {
        setFood(response.data.food);
        fetchRelatedFoods(response.data.food.category);
      }
    } catch (error) {
      console.error('Failed to fetch food:', error);
      toast.error('Food not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${url}/api/reviews/food/${id}`);
      if (response.data.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchRelatedFoods = async (category) => {
    try {
      const response = await axios.get(
        `${url}/api/food/category/${category}?limit=4&exclude=${id}`
      );
      if (response.data.success) {
        setRelatedFoods(response.data.foods || []);
      }
    } catch (error) {
      console.error('Failed to fetch related foods:', error);
    }
  };

  const handleAddToCart = () => {
    setCartItems((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + quantity
    }));
    toast.success(`Added ${quantity} to cart`);
    setQuantity(1);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token || !user) {
      toast.error('Please login to submit a review');
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/reviews`,
        {
          foodId: id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReviews([response.data.review, ...reviews]);
        setReviewForm({ rating: 5, comment: '' });
        setShowReviewForm(false);
        toast.success('Review submitted successfully');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    }
  };

  const filteredReviews =
    reviewFilter === 'all'
      ? reviews
      : reviews.filter((r) => r.rating === parseInt(reviewFilter));

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="food-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading food details...</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="food-detail-container">
        <div className="not-found">
          <h2>Food not found</h2>
          <button onClick={() => navigate('/')} className="btn-back">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="food-detail-container">
      {/* Main Content */}
      <div className="food-detail-main">
        {/* Image Section */}
        <div className="detail-image-section">
          <img
            src={`${url}/images/${food.image}`}
            alt={food.name}
            className="detail-image"
          />
          {food.discount > 0 && (
            <div className="discount-label">-{food.discount}%</div>
          )}
        </div>

        {/* Info Section */}
        <div className="detail-info-section">
          {/* Header */}
          <div className="detail-header">
            <h1 className="detail-title">{food.name}</h1>
            {food.vegetarian && <span className="veg-tag">🥬 Vegetarian</span>}
          </div>

          {/* Rating and Reviews */}
          <div className="detail-rating">
            <div className="rating-info">
              <span className="rating-stars">⭐ {averageRating}</span>
              <span className="rating-count">({reviews.length} reviews)</span>
            </div>
          </div>

          {/* Description */}
          <p className="detail-description">{food.description}</p>

          {/* Category and Other Details */}
          <div className="detail-meta">
            <div className="meta-item">
              <span className="meta-label">Category</span>
              <span className="meta-value">{food.category}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Preparation Time</span>
              <span className="meta-value">{food.preparationTime || '30'} mins</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="detail-price-section">
            <div className="price-info">
              <span className="current-price">₹{food.price?.toFixed(2)}</span>
              {food.originalPrice && (
                <span className="original-price">
                  ₹{food.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="detail-actions">
            <div className="quantity-selector">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="qty-btn"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="qty-input"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="qty-btn"
              >
                +
              </button>
            </div>
            <button onClick={handleAddToCart} className="btn-add-to-cart">
              🛒 Add to Cart
            </button>
            <button
              onClick={() =>
                isWishlisted ? removeFromWishlist(id) : addToWishlist(id)
              }
              className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
            >
              {isWishlisted ? '❤ Saved' : '♡ Save'}
            </button>
          </div>

          {/* Additional Info */}
          <div className="detail-additional">
            <p className="info-text">
              ✓ Fresh & Authentic • ✓ Fast Delivery • ✓ Easy Returns
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <div>
            <h2>Customer Reviews</h2>
            <p>What customers are saying about this item</p>
          </div>
          {token && user && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-write-review"
            >
              ✍️ Write a Review
            </button>
          )}
        </div>

        {/* Write Review Form */}
        {showReviewForm && token && user && (
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${
                      reviewForm.rating >= star ? 'active' : ''
                    }`}
                    onClick={() =>
                      setReviewForm({ ...reviewForm, rating: star })
                    }
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                placeholder="Share your experience with this food..."
                className="review-textarea"
                required
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Filter */}
        {reviews.length > 0 && (
          <div className="review-filters">
            <button
              className={`filter-btn ${reviewFilter === 'all' ? 'active' : ''}`}
              onClick={() => setReviewFilter('all')}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                className={`filter-btn ${
                  reviewFilter === star.toString() ? 'active' : ''
                }`}
                onClick={() => setReviewFilter(star.toString())}
              >
                ⭐ {star}
              </button>
            ))}
          </div>
        )}

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="no-reviews">
            <p>
              {reviews.length === 0
                ? 'No reviews yet. Be the first to review!'
                : 'No reviews with this rating'}
            </p>
          </div>
        ) : (
          <div className="reviews-list">
            {filteredReviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.userId?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="reviewer-name">
                        {review.userId?.name || 'Anonymous'}
                      </h4>
                      <span className="review-rating">
                        {'⭐'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                  </div>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-text">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Foods */}
      {relatedFoods.length > 0 && (
        <div className="related-section">
          <h2>Similar Items</h2>
          <div className="related-grid">
            {relatedFoods.map((item) => (
              <div
                key={item._id}
                className="related-card"
                onClick={() => navigate(`/food/${item._id}`)}
              >
                <img
                  src={`${url}/images/${item.image}`}
                  alt={item.name}
                  className="related-image"
                />
                <div className="related-content">
                  <h4>{item.name}</h4>
                  <div className="related-rating">
                    ⭐ {item.rating || 'N/A'} ({item.reviewCount || 0})
                  </div>
                  <p className="related-price">₹{item.price?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetail;
