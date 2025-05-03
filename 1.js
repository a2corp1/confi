// client/src/services/searchService.js
import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch recent token searches
 */
const fetchRecentSearchesAPI = async () => {
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
const trackSearchAPI = async (tokenAddress) => {
  try {
    const response = await axios.post(`${API_URL}/search/track`, { tokenAddress });
    return response.data;
  } catch (error) {
    console.error('Error tracking search:', error);
    // Don't throw error for tracking as it's not critical
    return null;
  }
};

// Mock recent searches
const mockRecentSearches = () => {
  return [
    {
      token_address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      name: "USD Coin",
      symbol: "USDC",
      last_searched_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
      search_count: 43
    },
    {
      token_address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      name: "USDT",
      symbol: "USDT",
      last_searched_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      search_count: 38
    },
    {
      token_address: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
      name: "Bonk",
      symbol: "BONK",
      last_searched_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      search_count: 76
    },
    {
      token_address: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
      name: "Marinade staked SOL",
      symbol: "mSOL",
      last_searched_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      search_count: 29
    },
    {
      token_address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
      name: "Raydium",
      symbol: "RAY",
      last_searched_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      search_count: 18
    },
    {
      token_address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
      name: "Jupiter",
      symbol: "JUP",
      last_searched_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      search_count: 57
    }
  ];
};

// Mock function implementations
const mockFetchRecentSearchesFn = () => Promise.resolve(mockRecentSearches());
const mockTrackSearchFn = (tokenAddress) => Promise.resolve({ success: true });

// Flag to toggle between mock and real implementations
const USE_MOCK_DATA = true;

// Export consistent function names
export const fetchRecentSearches = USE_MOCK_DATA 
  ? mockFetchRecentSearchesFn 
  : fetchRecentSearchesAPI;

export const trackSearch = USE_MOCK_DATA 
  ? mockTrackSearchFn 
  : trackSearchAPI;