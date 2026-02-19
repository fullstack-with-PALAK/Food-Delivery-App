// Analytics utility for tracking user interactions
// Can be integrated with Google Analytics, Mixpanel, etc.

class Analytics {
  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    this.events = [];
  }

  // Track page views
  trackPageView(pageName, additionalData = {}) {
    if (!this.isEnabled) return;
    
    const event = {
      type: 'page_view',
      page: pageName,
      timestamp: new Date().toISOString(),
      ...additionalData
    };
    
    this.logEvent(event);
    
    // Send to analytics service (e.g., Google Analytics)
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href
      });
    }
  }

  // Track user actions
  trackEvent(eventName, eventData = {}) {
    if (!this.isEnabled) return;
    
    const event = {
      type: 'user_action',
      name: eventName,
      timestamp: new Date().toISOString(),
      ...eventData
    };
    
    this.logEvent(event);
    
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', eventName, eventData);
    }
  }

  // Track e-commerce events
  trackPurchase(orderId, items, totalAmount) {
    if (!this.isEnabled) return;
    
    const event = {
      type: 'purchase',
      orderId,
      items,
      totalAmount,
      timestamp: new Date().toISOString()
    };
    
    this.logEvent(event);
    
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        value: totalAmount,
        currency: 'INR',
        items: items
      });
    }
  }

  // Track cart actions
  trackAddToCart(foodId, foodName, price) {
    this.trackEvent('add_to_cart', {
      food_id: foodId,
      food_name: foodName,
      price: price
    });
  }

  // Track search queries
  trackSearch(query, resultsCount) {
    this.trackEvent('search', {
      search_term: query,
      results_count: resultsCount
    });
  }

  // Track user engagement
  trackEngagement(action, details = {}) {
    this.trackEvent('engagement', {
      action,
      ...details
    });
  }

  // Log event locally (for development)
  logEvent(event) {
    this.events.push(event);
    if (import.meta.env.VITE_ENV === 'development') {
      console.log('📊 Analytics:', event);
    }
  }

  // Get all tracked events (for debugging)
  getEvents() {
    return this.events;
  }

  // Clear events
  clearEvents() {
    this.events = [];
  }
}

// Export singleton instance
export default new Analytics();
