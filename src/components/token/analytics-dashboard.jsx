import React, { useState, useEffect } from 'react';
import { getPageViewsForDashboard, getVisitorStats } from './page-view-tracker';
import { 
  ChartBarIcon, 
  GlobeAltIcon,
  ClockIcon,
  UserGroupIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

// Simple hash function for basic password protection
// This is not highly secure but provides basic protection
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

// This should match the hashed password: "admin123"
// Change this to your preferred password
const ADMIN_PASSWORD_HASH = -969161597;

const AnalyticsDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [stats, setStats] = useState(null);
  const [pageViews, setPageViews] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const currentStats = getVisitorStats();
      setStats(currentStats);
      setPageViews(getPageViewsForDashboard());
      
      // Update stats every 30 seconds while dashboard is open
      const interval = setInterval(() => {
        setStats(getVisitorStats());
        setPageViews(getPageViewsForDashboard());
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, isAuthenticated]);
  
  const verifyPassword = () => {
    const hashedInput = simpleHash(passwordInput);
    if (hashedInput === ADMIN_PASSWORD_HASH) {
      setIsAuthenticated(true);
      setPasswordError(false);
      localStorage.setItem('analyticsAuthTime', Date.now().toString());
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };
  
  // Try to restore authentication from localStorage (expires after 1 hour)
  useEffect(() => {
    const authTime = parseInt(localStorage.getItem('analyticsAuthTime') || '0', 10);
    const now = Date.now();
    // If authenticated within the last hour
    if (authTime && (now - authTime < 3600000)) {
      setIsAuthenticated(true);
    }
  }, []);
  
  // Prepare data for visualizations
  const prepareChartData = () => {
    if (!pageViews.length) return { byHour: [], byBrowser: [], byOS: [] };
    
    // Group by hour for today
    const today = new Date().toISOString().split('T')[0];
    const todayViews = pageViews.filter(view => view.timestamp.startsWith(today));
    
    const byHour = Array(24).fill(0);
    todayViews.forEach(view => {
      const hour = new Date(view.timestamp).getHours();
      byHour[hour]++;
    });
    
    // Group by browser
    const browserGroups = {};
    pageViews.forEach(view => {
      browserGroups[view.browser] = (browserGroups[view.browser] || 0) + 1;
    });
    
    const byBrowser = Object.keys(browserGroups).map(browser => ({
      name: browser,
      count: browserGroups[browser]
    }));
    
    // Group by OS
    const osGroups = {};
    pageViews.forEach(view => {
      osGroups[view.os] = (osGroups[view.os] || 0) + 1;
    });
    
    const byOS = Object.keys(osGroups).map(os => ({
      name: os,
      count: osGroups[os]
    }));
    
    return { byHour, byBrowser, byOS };
  };
  
  const { byHour, byBrowser, byOS } = prepareChartData();
  
  // Location data processing for map view
  const getLocationData = () => {
    const locations = pageViews
      .filter(view => view.location && (view.location.city !== 'Unknown' || view.location.country !== 'Unknown'))
      .map(view => view.location);
    
    // Group by country or city
    const byCountry = {};
    locations.forEach(loc => {
      const key = loc.country || 'Unknown';
      byCountry[key] = (byCountry[key] || 0) + 1;
    });
    
    return { byCountry, locations };
  };
  
  const toggleDashboard = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Refresh data when opening
      if (isAuthenticated) {
        setStats(getVisitorStats());
        setPageViews(getPageViewsForDashboard());
      }
    }
  };
  
  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Get recent visitors for display
  const getRecentVisitors = () => {
    return pageViews
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  };
  
  // Handle enter key on password input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      verifyPassword();
    }
  };
  
  return (
    <div className="analytics-dashboard-container">
      {/* Toggle button */}
      <button 
        onClick={toggleDashboard}
        className="dashboard-toggle-btn fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
        title="View Analytics"
      >
        <ChartBarIcon className="h-6 w-6" />
      </button>
      
      {/* Dashboard panel */}
      {isOpen && (
        <div className="dashboard-panel fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="dashboard-content w-full max-w-6xl h-5/6 bg-white dark:bg-dark-900 rounded-xl shadow-2xl overflow-hidden">
            {/* Dashboard header */}
            <div className="dashboard-header p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
                Analytics Dashboard
              </h2>
              
              <button 
                onClick={toggleDashboard}
                className="text-gray-500 hover:text-gray-700 dark:text-dark-400 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Login form or dashboard content */}
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center p-8 h-full">
                <div className="w-full max-w-md p-6 bg-white dark:bg-dark-800 rounded-lg shadow-md border border-gray-200 dark:border-dark-700">
                  <div className="mb-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                      <LockClosedIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Admin Authentication</h3>
                    <p className="text-sm text-gray-500 dark:text-dark-400 text-center mt-2">
                      Enter the admin password to access analytics
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={`w-full px-3 py-2 border ${passwordError ? 'border-red-500' : 'border-gray-300 dark:border-dark-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-700 dark:text-white`}
                      placeholder="Enter admin password"
                    />
                    {passwordError && (
                      <p className="mt-1 text-xs text-red-500">Incorrect password. Please try again.</p>
                    )}
                  </div>
                  
                  <button
                    onClick={verifyPassword}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Login
                  </button>
                </div>
              </div>
            ) : (
              // Dashboard content (only shown when authenticated)
              <div className="dashboard-content-area h-full overflow-auto p-4">
                {/* Stats summary */}
                <div className="stats-summary grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="stat-card bg-white dark:bg-dark-800 p-4 rounded-lg shadow border border-gray-100 dark:border-dark-700">
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 mr-3">
                        <ChartBarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-dark-400">Total Views</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.totalTrackedPageViews || 0}
                    </p>
                  </div>
                  
                  <div className="stat-card bg-white dark:bg-dark-800 p-4 rounded-lg shadow border border-gray-100 dark:border-dark-700">
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30 mr-3">
                        <ClockIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-dark-400">Views Today</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.pageViewsToday || 0}
                    </p>
                  </div>
                  
                  <div className="stat-card bg-white dark:bg-dark-800 p-4 rounded-lg shadow border border-gray-100 dark:border-dark-700">
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30 mr-3">
                        <UserGroupIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-dark-400">Unique Visitors</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.uniqueVisitorsToday || 0}
                    </p>
                  </div>
                  
                  <div className="stat-card bg-white dark:bg-dark-800 p-4 rounded-lg shadow border border-gray-100 dark:border-dark-700">
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900/30 mr-3">
                        <GlobeAltIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-dark-400">Active Users</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.activeUsers || 0}
                    </p>
                  </div>
                </div>
                
                {/* Tab navigation */}
                <div className="tab-navigation mb-6">
                  <div className="flex space-x-2 border-b border-gray-200 dark:border-dark-700">
                    <button
                      className={`py-2 px-4 ${
                        activeTab === 'overview' 
                          ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-dark-400'
                      }`}
                      onClick={() => handleTabChange('overview')}
                    >
                      Overview
                    </button>
                    <button
                      className={`py-2 px-4 ${
                        activeTab === 'visitors' 
                          ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-dark-400'
                      }`}
                      onClick={() => handleTabChange('visitors')}
                    >
                      Visitors
                    </button>
                    <button
                      className={`py-2 px-4 ${
                        activeTab === 'locations' 
                          ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-dark-400'
                      }`}
                      onClick={() => handleTabChange('locations')}
                    >
                      Locations
                    </button>
                  </div>
                </div>
                
                {/* Tab content */}
                <div className="tab-content">
                  {activeTab === 'overview' && (
                    <div className="overview-tab">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Hourly traffic chart */}
                        <div className="bg-white dark:bg-dark-800 p-4 rounded-lg shadow border border-gray-100 dark:border-dark-700">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today's Traffic by Hour</h3>
                          <div className="h-64">
                            <div className="flex items-end h-48 space-x-2">
                              {byHour.map((count, hour) => {
                                const height = count > 0 ? (count / Math.max(...byHour) * 100) : 0;
                                return (
                                  <div key={hour} className="flex-1 flex flex-col items-center">
                                    <div 
                                      className="w-full bg-blue-500 rounded-t"
                                      style={{ height: `${height}%` }}
                                    ></div>
                                    <div className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                                      {hour.toString().padStart(2, '0')}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Browser & OS distribution */}
                        <div className="bg-white dark:bg-dark-800 p-4 rounded-lg shadow border border-gray-100 dark:border-dark-700">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Browser & OS Distribution</h3>
                          
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-dark-300 mb-2">Browsers</h4>
                            <div className="space-y-2">
                              {byBrowser.map(browser => {
                                const percentage = Math.round((browser.count / pageViews.length) * 100) || 0;
                                return (
                                  <div key={browser.name} className="flex items-center">
                                    <span className="text-xs text-gray-500 dark:text-dark-400 w-16">{browser.name}</span>
                                    <div className="flex-1 mx-2">
                                      <div className="bg-gray-200 dark:bg-dark-700 h-2 rounded-full overflow-hidden">
                                        <div 
                                          className="bg-blue-500 h-full rounded-full"
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-dark-400 w-8">{percentage}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-600 dark:text-dark-300 mb-2">Operating Systems</h4>
                            <div className="space-y-2">
                              {byOS.map(os => {
                                const percentage = Math.round((os.count / pageViews.length) * 100) || 0;
                                return (
                                  <div key={os.name} className="flex items-center">
                                    <span className="text-xs text-gray-500 dark:text-dark-400 w-16">{os.name}</span>
                                    <div className="flex-1 mx-2">
                                      <div className="bg-gray-200 dark:bg-dark-700 h-2 rounded-full overflow-hidden">
                                        <div 
                                          className="bg-green-500 h-full rounded-full"
                                          style={{ width: `${percentage}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-dark-400 w-8">{percentage}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'visitors' && (
                    <div className="visitors-tab">
                      <div className="bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-100 dark:border-dark-700 overflow-hidden">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-dark-700">
                          Recent Visitors
                        </h3>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-dark-700">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">Time</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">Page</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">Browser</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">OS</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">Referrer</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                              {getRecentVisitors().map((visitor, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-dark-800' : 'bg-gray-50 dark:bg-dark-900/50'}>
                                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-dark-400">
                                    {new Date(visitor.timestamp).toLocaleTimeString()}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-900 dark:text-white">
                                    {visitor.url || '/'}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-dark-400">
                                    {visitor.browser}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-dark-400">
                                    {visitor.os}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-dark-400">
                                    {visitor.referrer === 'direct' ? 'Direct' : visitor.referrer}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'locations' && (
                    <div className="locations-tab">
                      <div className="bg-white dark:bg-dark-800 p-4 rounded-lg shadow border border-gray-100 dark:border-dark-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Visitor Locations</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Simple world map visualization placeholder */}
                          <div className="world-map-container h-64 bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500 dark:text-dark-400 text-center">
                              <GlobeAltIcon className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-dark-500" />
                              Map visualization would appear here
                              <br />
                              <span className="text-xs">
                                (Requires additional mapping library)
                              </span>
                            </p>
                          </div>
                          
                          {/* Location list */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-600 dark:text-dark-300 mb-2">Top Visitor Locations</h4>
                            <div className="space-y-1 max-h-64 overflow-y-auto">
                              {Object.entries(getLocationData().byCountry)
                                .sort((a, b) => b[1] - a[1])
                                .map(([country, count]) => (
                                  <div key={country} className="flex items-center py-1 border-b border-gray-100 dark:border-dark-800">
                                    <span className="text-xs text-gray-800 dark:text-white flex-1">{country}</span>
                                    <span className="text-xs text-gray-500 dark:text-dark-400">
                                      {count} {count === 1 ? 'visit' : 'visits'}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Simplified page views counter for the footer - visible to everyone */}
      <div className="page-views-footer">
        <p className="text-sm text-gray-500 dark:text-dark-400">
          <span className="font-medium">{stats?.activeUsers || 0}</span> users online
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;