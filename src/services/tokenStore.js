import { create } from 'zustand';
import axios from 'axios';

// Safe utility functions
const safeString = (value, fallback = '') => {
  if (value == null) return fallback;
  return String(value);
};

const safeNumber = (value, fallback = 0) => {
  if (value == null) return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
};

const safeSplit = (value, separator = ',') => {
  if (value == null) return [];
  if (typeof value === 'string') return value.split(separator);
  return [];
};

// Base URL for your token API
const BASE_API_URL = 'https://scamr-ai-production.up.railway.app/api/tokens/'; 

export const useTokenStore = create((set, get) => ({
  // Core state variables
  tokenData: null,
  marketData: null,
  isLoading: false,
  hasLoaded: false,
  error: null,
  lastUpdated: null,
  
  // Fetch comprehensive token data
  fetchAllTokenData: async (tokenAddress) => {
    // Prevent multiple simultaneous requests
    if (get().isLoading) return get().tokenData;
    
    // Reset loading state
    set({ 
      isLoading: true, 
      error: null 
    });
    
    try {
      // Construct full API endpoint
      const fullUrl = `${BASE_API_URL}${tokenAddress}`;
      
      // Fetch token data with robust configuration
      const response = await axios.get(fullUrl, {
        timeout: 10000, // 10-second timeout
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      const tokenData = response.data || {};
      
      // Update store with fetched data
      set({
        tokenData: tokenData,
        marketData: tokenData.marketData || null,
        isLoading: false,
        hasLoaded: true,
        lastUpdated: new Date(),
        error: null
      });
      
      return tokenData;
    } catch (error) {
      // Comprehensive error handling
      console.error('Error fetching token data:', error);
      
      set({ 
        error: {
          message: error.response?.data?.message || error.message,
          status: error.response?.status
        },
        isLoading: false,
        tokenData: null,
        marketData: null
      });
      
      throw error;
    }
  },
  
  // Refresh token data
  refreshTokenData: async (tokenAddress) => {
    try {
      const fullUrl = `${BASE_API_URL}${tokenAddress}`;
      const response = await axios.get(fullUrl, {
        timeout: 5000, // Shorter timeout for refresh
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      const tokenData = response.data || {};
      
      // Partial update of token data
      set({
        tokenData: tokenData,
        marketData: tokenData.marketData || null,
        lastUpdated: new Date()
      });
      
      return tokenData;
    } catch (error) {
      console.error('Error refreshing token data:', error);
      return null;
    }
  },
  
  // Get merged data combining token and market information
  getMergedData: () => {
    const { tokenData, marketData } = get();
  
    if (!tokenData) {
      console.warn('[TokenStore] No tokenData available');
      return {
        name: '',
        symbol: '',
        price: 0,
        market_cap: 0,
        volume_24h: 0,
        priceChange: 0,
        total_holders: 0,
        decimals: 0,
        total_supply: 0,
        created_at: null,
        attributes: {},
        picture: null
      };
    }
  
    return {
      // Safely convert and merge data
      name: safeString(tokenData.name, 'Unknown Token'),
      symbol: safeString(tokenData.symbol, '???'),
      price: safeNumber(marketData?.price ?? tokenData.price, 0),
      market_cap: safeNumber(marketData?.marketCap ?? tokenData.market_cap, 0),
      volume_24h: safeNumber(marketData?.volume24h ?? tokenData.volume_24h, 0),
      priceChange: safeNumber(marketData?.priceChange ?? tokenData.priceChange, 0),
      total_holders: safeNumber(tokenData.total_holders, 0),
      decimals: safeNumber(tokenData.decimals, 0),
      total_supply: safeNumber(tokenData.total_supply, 0),
      created_at: tokenData.created_at || null,
      attributes: tokenData.attributes || {},
      picture: tokenData.picture || null
    };
  }
}));

// Start periodic token data refresh
export const startTokenDataRefresh = (tokenAddress, intervalMinutes = 2) => {
  const store = useTokenStore.getState();
  
  // Immediate initial fetch
  store.fetchAllTokenData(tokenAddress).catch(console.error);
  
  // Set up periodic refresh
  const refreshTimer = setInterval(() => {
    store.refreshTokenData(tokenAddress).catch(console.error);
  }, intervalMinutes * 60 * 1000);
  
  // Return stop function
  return () => {
    clearInterval(refreshTimer);
  };
};

// Stop all token data refresh operations
export const stopTokenDataRefresh = () => {
  console.log('Token data refresh stopped');
};