import React, { useState, useContext, useEffect } from 'react';
import './Navbar.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ setShowLogin, setShowNotifications }) => {
  const navigate = useNavigate();
  const { food_list, cartItems, url, token, user, setToken, setUser } = useContext(StoreContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Calculate total items in cart
    const totalItems = Object.values(cartItems).reduce((total, count) => total + count, 0);
    setCartCount(totalItems);
  }, [cartItems]);

  useEffect(() => {
    // Fetch unread notification count if logged in
    if (token && user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await axios.get(`${url}/api/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            setUnreadNotifications(response.data.count);
          }
        } catch (error) {
          console.error('Failed to fetch unread notifications:', error);
        }
      };
      fetchUnreadCount();
    }
  }, [token, user]);

  const handleLogout = async () => {
    try {
      await axios.get(`${url}/api/user/logout`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken('');
      setUser(null);
      setShowProfileMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowMenu(false);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileMenu(false);
    setShowMenu(false);
  };

  const handleMyOrders = () => {
    navigate('/orders');
    setShowProfileMenu(false);
    setShowMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <span className="logo-icon">🍕</span>
          <span className="logo-text">CraveCart</span>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </form>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Notifications */}
          {token && (
            <div className="navbar-icon" onClick={() => setShowNotifications(true)}>
              <span className="notification-icon">🔔</span>
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </div>
          )}

          {/* Cart Icon */}
          <div className="navbar-icon cart-icon" onClick={() => navigate('/cart')}>
            <span className="cart-icon-symbol">🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>

          {/* User Menu */}
          {token && user ? (
            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <span className="user-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
                <span className={`dropdown-arrow ${showProfileMenu ? 'open' : ''}`}>▼</span>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                      <div>
                        <p className="dropdown-name">{user.name}</p>
                        <p className="dropdown-email">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-menu">
                    <button onClick={handleProfileClick} className="dropdown-item">
                      <span>👤</span> My Profile
                    </button>
                    <button onClick={handleMyOrders} className="dropdown-item">
                      <span>📦</span> My Orders
                    </button>
                    <button
                      onClick={() => {
                        navigate('/wishlist');
                        setShowProfileMenu(false);
                      }}
                      className="dropdown-item"
                    >
                      <span>❤️</span> Wishlist
                    </button>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="login-button" onClick={() => setShowLogin(true)}>
              Login
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`mobile-menu-toggle ${showMenu ? 'open' : ''}`}
            onClick={() => setShowMenu(!showMenu)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input"
            />
            <button type="submit">🔍</button>
          </form>
          <div className="mobile-menu-links">
            <button
              onClick={() => {
                navigate('/');
                setShowMenu(false);
              }}
              className="mobile-menu-item"
            >
              Home
            </button>
            <button
              onClick={() => {
                navigate('/cart');
                setShowMenu(false);
              }}
              className="mobile-menu-item"
            >
              Cart ({cartCount})
            </button>
            {token && user && (
              <>
                <button onClick={handleMyOrders} className="mobile-menu-item">
                  My Orders
                </button>
                <button onClick={handleProfileClick} className="mobile-menu-item">
                  Profile
                </button>
                <button onClick={handleLogout} className="mobile-menu-item logout">
                  Logout
                </button>
              </>
            )}
            {!token && (
              <button
                onClick={() => {
                  setShowLogin(true);
                  setShowMenu(false);
                }}
                className="mobile-menu-item login"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
