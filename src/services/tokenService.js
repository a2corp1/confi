// client/src/services/tokenService.js
import axios from 'axios';
const API_URL = 'https://scamr-ai-production.up.railway.app/api';

// In your tokenService.js client side
export const fetchTokenInfo = async (tokenAddress, options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/tokens/${tokenAddress}`, {
      params: {
        wait: options.wait === true ? 'true' : 'false'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw error;
  }
};

// Add this to your tokenService.js client-side file
export const loadAllTokenData = async (tokenAddress) => {
  try {
    const response = await axios.get(`${API_URL}/tokens/${tokenAddress}/load-all-data?wait=true`);
    return response.data;
  } catch (error) {
    console.error('Error loading all token data:', error);
    throw error;
  }
};

export const fetchTopHolders = async (tokenAddress, options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.limit) {
      params.append('limit', options.limit);
    }
    
    if (options.wait !== undefined) {
      params.append('wait', options.wait.toString());
    }
    
    const url = `${API_URL}/tokens/${tokenAddress}/holders?${params.toString()}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching top holders:', error);
    throw error;
  }
};

// Debugging function to log and understand the response
export const debugTopHolders = async (tokenAddress) => {
  try {
    const response = await axios.get(`${API_URL}/tokens/${tokenAddress}/holders`);
    console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Debug error:', error);
    return null;
  }
};

export const fetchDistributionMetrics = async (tokenAddress, timeframe = '7d') => {
  try {
    const response = await fetch(`/api/tokens/${tokenAddress}/distribution?timeframe=${timeframe}`);
    
    if (!response.ok) {
      if (response.status === 202) {
        // Data is still loading, return basic structure
        return {
          tokenAddress,
          status: 'loading',
          metrics: [],
          holderDistribution: null
        };
      }
      throw new Error(`Failed to fetch distribution metrics: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching distribution metrics:', error);
    throw error;
  }
};


export const fetchHolderAnalytics = async (tokenAddress) => {
  try {
    const response = await axios.get(`${API_URL}/tokens/${tokenAddress}/holder-analytics`);
    return response.data?.analytics || response.data || {};
  } catch (error) {
    console.error('Error fetching holder analytics:', error);
    throw error;
  }
};


export const fetchHolderChanges = async (tokenAddress, days = 7) => {
  try {
    const response = await axios.get(`${API_URL}/tokens/${tokenAddress}/holder-changes`, {
      params: { days }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching holder changes:', error);
    throw error;
  }
};


export const fetchTopHolderAccumulationTrend = async (tokenAddress, timeframe = '1h', limit = 20) => {
  try {
    const response = await axios.get(`${API_URL}/tokens/${tokenAddress}/accumulation-trend`, {
      params: { 
        timeframe, 
        limit // Changed from holderLimit to match backend parameter name
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching accumulation trend:', error);
    // Return a default structure on error to prevent UI crashes
    return {
      summary: {
        totalBuyVolume: 0,
        totalSellVolume: 0,
        netVolume: 0,
        isNetAccumulation: false,
        accumulatingWallets: 0,
        sellingWallets: 0,
        timeframe: timeframe,
        periodStart: new Date(Date.now() - getTimeframeInMs(timeframe)).toISOString(),
        periodEnd: new Date().toISOString()
      },
      trend: [
        {
          timestamp: new Date(Date.now() - getTimeframeInMs(timeframe)).toISOString(),
          buyVolume: 0, 
          sellVolume: 0,
          netVolume: 0
        },
        {
          timestamp: new Date().toISOString(),
          buyVolume: 0,
          sellVolume: 0, 
          netVolume: 0
        }
      ],
      wallets: []
    };
  }
};

// Helper function to convert timeframe to milliseconds
function getTimeframeInMs(timeframe) {
  switch(timeframe) {
    case '15m': return 15 * 60 * 1000;
    case '30m': return 30 * 60 * 1000;
    case '1h': return 60 * 60 * 1000;
    case '6h': return 6 * 60 * 60 * 1000;
    case '12h': return 12 * 60 * 60 * 1000;
    case '24h': return 24 * 60 * 60 * 1000;
    case '3d': return 3 * 24 * 60 * 60 * 1000;
    case '7d': return 7 * 24 * 60 * 60 * 1000;
    default: return 60 * 60 * 1000; // Default to 1 hour
  }
}

export const refreshTokenData = async (tokenAddress) => {
  try {
    const response = await axios.post(`${API_URL}/tokens/${tokenAddress}/refresh`);
    return response.data;
  } catch (error) {
    console.error('Error refreshing token data:', error);
    throw error;
  }
};


export const updateTokenInfo = async (tokenAddress) => {
  try {
    const response = await axios.post(`${API_URL}/tokens/${tokenAddress}/update`);
    return response.data;
  } catch (error) {
    console.error('Error updating token info:', error);
    throw error;
  }
};

// client/src/services/tokenService.js

// Add this function or update it if it already exists
export const fetchTopTokensByMarketCap = async (limit = 6) => {
  console.log('Fetching top tokens by market cap...');
  console.log('API URL:', API_URL); // Check if API_URL is defined correctly
  
  try {
    console.log('Sending request to:', `${API_URL}/tokens/BQQzEvYT4knThhkSPBvSKBLg1LEczisWLhx5ydJipump/top`, { params: { limit } });
    const response = await axios.get(`${API_URL}/tokens/BQQzEvYT4knThhkSPBvSKBLg1LEczisWLhx5ydJipump/top`, {
      params: { limit }
    });
    
    console.log('Raw API response:', response);
    console.log('API response data:', response.data);
    
    // Check if the response has the expected structure
    if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
      console.log('Successfully received token data:', response.data.data.length, 'tokens');
      return response.data;
    }
    
    console.warn('Unexpected API response format:', response.data);
    // If the response structure is different, try to handle it gracefully
    return Array.isArray(response.data) ? { success: true, data: response.data } : 
           response.data && response.data.data ? response.data : { success: false, data: [] };
  } catch (error) {
    console.error('Error fetching top tokens by market cap:', error);
    console.error('Error details:', error.response || error.message);
    // Return an empty array instead of throwing to avoid breaking the UI
    return { success: false, data: [] };
  }
};
// Existing methods...



