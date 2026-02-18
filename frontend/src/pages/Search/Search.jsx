import React, { useContext, useEffect, useState } from 'react';
import './Search.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Search = () => {
  const { url, cartItems, setCartItems } = useContext(StoreContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [minRating, setMinRating] = useState(0);
  const [vegetarianOnly, setVegetarianOnly] = useState(false);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    fetchCategories();
  }, [searchParams]);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    }
  }, [searchQuery, selectedCategory, priceRange, minRating, vegetarianOnly, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/food/categories`);
      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(selectedCategory && { category: selectedCategory }),
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        minRating,
        vegetarian: vegetarianOnly,
        sortBy
      });

      const response = await axios.get(`${url}/api/food/search?${params}`);
      if (response.data.success) {
        setResults(response.data.foods || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (foodId) => {
    setCartItems((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1
    }));
    toast.success('Added to cart');
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: 0, max: 5000 });
    setMinRating(0);
    setVegetarianOnly(false);
    setSortBy('relevance');
  };

  const activeFilters =
    [
      selectedCategory,
      priceRange.min > 0 || priceRange.max < 5000,
      minRating > 0,
      vegetarianOnly
    ].filter(Boolean).length;

  return (
    <div className="search-container">
      {/* Header */}
      <div className="search-header">
        <h1>Search Foods</h1>
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for foods, cuisines, or restaurants..."
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      {/* Content */}
      <div className="search-content">
        {/* Sidebar - Filters */}
        <aside className="filters-sidebar">
          <div className="sidebar-header">
            <h2>Filters</h2>
            {activeFilters > 0 && (
              <button onClick={handleResetFilters} className="reset-filters">
                Reset ({activeFilters})
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="filter-group">
            <h3 className="filter-title">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h3 className="filter-title">Category</h3>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCategory === ''}
                  onChange={() => setSelectedCategory('')}
                />
                <span>All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat}
                    onChange={() =>
                      setSelectedCategory(selectedCategory === cat ? '' : cat)
                    }
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="filter-group">
            <h3 className="filter-title">Price Range</h3>
            <div className="price-range">
              <div className="range-input">
                <label>Min: ₹{priceRange.min}</label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({
                      ...priceRange,
                      min: Math.min(parseInt(e.target.value), priceRange.max)
                    })
                  }
                  className="slider"
                />
              </div>
              <div className="range-input">
                <label>Max: ₹{priceRange.max}</label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({
                      ...priceRange,
                      max: Math.max(parseInt(e.target.value), priceRange.min)
                    })
                  }
                  className="slider"
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="filter-group">
            <h3 className="filter-title">Minimum Rating</h3>
            <div className="rating-filter">
              {[0, 3, 3.5, 4, 4.5].map((rating) => (
                <label key={rating} className="rating-option">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                  />
                  <span>
                    {rating === 0 ? 'No filter' : `⭐ ${rating}+`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Dietary Preference */}
          <div className="filter-group">
            <h3 className="filter-title">Dietary</h3>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={vegetarianOnly}
                onChange={(e) => setVegetarianOnly(e.target.checked)}
              />
              <span>🥬 Vegetarian Only</span>
            </label>
          </div>
        </aside>

        {/* Main Content */}
        <main className="search-results">
          {/* Results Header */}
          <div className="results-header">
            {loading ? (
              <p>Searching...</p>
            ) : (
              <p>
                Found <strong>{results.length}</strong> results
                {searchQuery && (
                  <>
                    {' '}
                    for "<strong>{searchQuery}</strong>"
                  </>
                )}
              </p>
            )}
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Searching for foods...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h2>No results found</h2>
              <p>
                Try adjusting your filters or search for different keywords
              </p>
              <div className="empty-actions">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    handleResetFilters();
                  }}
                  className="btn-clear"
                >
                  Clear Search
                </button>
                <button onClick={() => navigate('/')} className="btn-home">
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <div className="results-grid">
              {results.map((food) => (
                <div key={food._id} className="result-card">
                  {/* Image */}
                  <div
                    className="result-image"
                    onClick={() => navigate(`/food/${food._id}`)}
                  >
                    <img
                      src={`${url}/images/${food.image}`}
                      alt={food.name}
                    />
                    {food.discount > 0 && (
                      <div className="discount-badge">-{food.discount}%</div>
                    )}
                    {food.vegetarian && (
                      <div className="veggie-badge">🥬</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="result-content">
                    <h3
                      className="result-name"
                      onClick={() => navigate(`/food/${food._id}`)}
                    >
                      {food.name}
                    </h3>
                    <p className="result-description">{food.description}</p>

                    {/* Rating */}
                    <div className="result-rating">
                      <span className="stars">⭐ {food.rating || 'N/A'}</span>
                      <span className="reviews">
                        ({food.reviewCount || 0})
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="result-footer">
                      <div className="price-section">
                        <span className="price">₹{food.price?.toFixed(2)}</span>
                        {food.originalPrice && (
                          <span className="original-price">
                            ₹{food.originalPrice?.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(food._id)}
                        className="result-btn"
                      >
                        🛒
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;
