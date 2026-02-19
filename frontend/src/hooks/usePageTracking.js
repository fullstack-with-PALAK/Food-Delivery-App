import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../utils/analytics';

// Custom hook to track page views
const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    const pageName = getPageName(location.pathname);
    analytics.trackPageView(pageName, {
      path: location.pathname,
      search: location.search
    });
  }, [location]);

  return null;
};

// Helper to get readable page names
const getPageName = (pathname) => {
  const routes = {
    '/': 'Home',
    '/cart': 'Cart',
    '/order': 'Place Order',
    '/verify': 'Verify Payment',
    '/myorders': 'My Orders',
    '/notifications': 'Notifications',
    '/preferences': 'Preferences',
    '/search': 'Search',
    '/wishlist': 'Wishlist',
    '/profile': 'Profile'
  };

  // Check for dynamic routes
  if (pathname.startsWith('/food/')) {
    return 'Food Detail';
  }

  return routes[pathname] || 'Unknown Page';
};

export default usePageTracking;
