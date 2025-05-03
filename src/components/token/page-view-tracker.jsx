// Page View Tracking System
// This system tracks page views locally in localStorage with approximate location data

// Helper function to generate a pseudo-random ID for each visitor
function generateVisitorId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  // Get visitor's browser and OS info
  function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    let os = "Unknown";
    
    // Detect browser
    if (userAgent.indexOf("Firefox") > -1) {
      browser = "Firefox";
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
      browser = "Samsung Browser";
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
      browser = "Opera";
    } else if (userAgent.indexOf("Trident") > -1) {
      browser = "Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
      browser = "Edge";
    } else if (userAgent.indexOf("Chrome") > -1) {
      browser = "Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
      browser = "Safari";
    }
    
    // Detect OS
    if (userAgent.indexOf("Win") > -1) {
      os = "Windows";
    } else if (userAgent.indexOf("Mac") > -1) {
      os = "MacOS";
    } else if (userAgent.indexOf("Linux") > -1) {
      os = "Linux";
    } else if (userAgent.indexOf("Android") > -1) {
      os = "Android";
    } else if (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) {
      os = "iOS";
    }
    
    return { browser, os };
  }
  
  // Get approximate location data
  async function getApproximateLocation() {
    try {
      // Try to get location via browser API (will need user permission)
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude.toFixed(2),
                longitude: position.coords.longitude.toFixed(2),
                accuracy: 'high'
              });
            },
            () => {
              // If user denies permission, fall back to IP-based estimate
              resolve(getLocationFallback());
            }
          );
        });
      } else {
        return getLocationFallback();
      }
    } catch (error) {
      console.error("Error getting location:", error);
      return { city: "Unknown", country: "Unknown", accuracy: 'low' };
    }
  }
  
  // Fallback location based on timezone
  function getLocationFallback() {
    // This is a very rough approximation based on timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let city = "Unknown";
    let country = "Unknown";
    
    if (timezone) {
      const parts = timezone.split('/');
      if (parts.length > 1) {
        city = parts[1].replace(/_/g, ' ');
        country = parts[0];
      }
    }
    
    return { city, country, accuracy: 'low' };
  }
  
  // Initialize or get the visitor ID from localStorage
  function getOrCreateVisitorId() {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
  }
  
  // Track page view and store in localStorage
  async function trackPageView() {
    // Get visitor info
    const visitorId = getOrCreateVisitorId();
    const { browser, os } = getBrowserInfo();
    const location = await getApproximateLocation();
    
    // Create page view data
    const pageView = {
      id: Math.random().toString(36).substring(7),
      visitorId,
      timestamp: new Date().toISOString(),
      url: window.location.pathname,
      referrer: document.referrer || 'direct',
      browser,
      os,
      location,
      sessionId: getOrCreateSessionId()
    };
    
    // Get existing page views from localStorage
    let pageViews = JSON.parse(localStorage.getItem('pageViews') || '[]');
    
    // Add new page view
    pageViews.push(pageView);
    
    // Limit storage (keep last 500 page views)
    if (pageViews.length > 500) {
      pageViews = pageViews.slice(pageViews.length - 500);
    }
    
    // Update localStorage
    localStorage.setItem('pageViews', JSON.stringify(pageViews));
    
    // Update stats counters
    updateVisitorStats();
    
    return pageView;
  }
  
  // Get or create session ID (for grouping page views in a single visit)
  function getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Date.now().toString();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
  
  // Update visitor stats
  function updateVisitorStats() {
    const pageViews = JSON.parse(localStorage.getItem('pageViews') || '[]');
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    // Count unique visitors today
    const uniqueVisitorsToday = new Set(
      pageViews
        .filter(view => view.timestamp >= todayStart)
        .map(view => view.visitorId)
    ).size;
    
    // Count page views today
    const pageViewsToday = pageViews.filter(view => view.timestamp >= todayStart).length;
    
    // Count unique visitors in the last 15 minutes (active users)
    const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000).toISOString();
    const activeUsers = new Set(
      pageViews
        .filter(view => view.timestamp >= fifteenMinutesAgo)
        .map(view => view.visitorId)
    ).size;
    
    // Store stats
    const stats = {
      uniqueVisitorsToday,
      pageViewsToday,
      activeUsers,
      totalTrackedPageViews: pageViews.length,
      lastUpdated: now.toISOString()
    };
    
    localStorage.setItem('visitorStats', JSON.stringify(stats));
    return stats;
  }
  
  // Get current visitor stats
  function getVisitorStats() {
    // Try to get stats from localStorage
    const storedStats = localStorage.getItem('visitorStats');
    if (storedStats) {
      return JSON.parse(storedStats);
    }
    
    // If no stats available, calculate them
    return updateVisitorStats();
  }
  
  // Get page views for dashboard
  function getPageViewsForDashboard() {
    const pageViews = JSON.parse(localStorage.getItem('pageViews') || '[]');
    return pageViews;
  }
  
  // Initialize tracking on page load
  function initPageViewTracking() {
    // Only track if localStorage is available
    if (typeof Storage !== 'undefined') {
      trackPageView();
      
      // Update active users count every minute
      setInterval(() => {
        updateVisitorStats();
      }, 60000);
    }
  }
  
  // Export functions for use in React components
  export {
    trackPageView,
    getVisitorStats,
    getPageViewsForDashboard,
    initPageViewTracking
  };