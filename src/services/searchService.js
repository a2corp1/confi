// client/src/services/searchService.js
import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'https://scamr-ai-production.up.railway.app/api';

/**
 * Fetch recent token searches
 */
export const fetchRecentSearches = async () => {
  try {
    const response = await axios.get(`${API_URL}/search/recent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch recent searches');
  }
};

/**
 * Track a token search
 */
export const trackSearch = async (tokenAddress) => {
  try {
    const response = await axios.post(`${API_URL}/search/track`, { tokenAddress });
    return response.data;
  } catch (error) {
    console.error('Error tracking search:', error);
    // Don't throw error for tracking as it's not critical
    return null;
  }
};