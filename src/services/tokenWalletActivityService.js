import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5009/api';

/**
 * Fetch top token holders and their recent activity
 * @param {string} tokenAddress - The token address
 * @param {number} limit - Number of top holders to fetch
 * @param {string} timeframe - Timeframe for transaction analysis ('1h', '6h', '12h', '24h', '3d', '7d')
 */
export const fetchTopHolderActivity = async (tokenAddress, limit = 20, timeframe = '24h') => {
  try {
    // First fetch the top holders
    const holdersResponse = await axios.get(`${API_URL}/tokens/${tokenAddress}/holders`, {
      params: { limit }
    });
    
    const holders = holdersResponse.data;
    if (!holders || !Array.isArray(holders)) {
      throw new Error('Invalid response format for holders');
    }
    
    // Extract wallet addresses
    const walletAddresses = holders.map(holder => holder.wallet_address || holder.address);
    
    // Now fetch transaction activity for these wallets
    const activityResponse = await axios.get(`${API_URL}/tokens/${tokenAddress}/wallet-activity`, {
      params: { 
        wallets: walletAddresses.join(','),
        timeframe 
      }
    });
    
    // Process and return the combined data
    const activityData = activityResponse.data;
    
    // Map holder data with their activity
    const holderActivityMap = new Map();
    if (activityData && Array.isArray(activityData)) {
      activityData.forEach(activity => {
        holderActivityMap.set(activity.wallet_address, activity);
      });
    }
    
    // Combine holder data with activity data
    const holdersWithActivity = holders.map(holder => {
      const walletAddress = holder.wallet_address || holder.address;
      const activity = holderActivityMap.get(walletAddress) || {
        net_amount: 0,
        buy_amount: 0,
        sell_amount: 0,
        transaction_count: 0
      };
      
      return {
        ...holder,
        activity: {
          netChange: activity.net_amount || 0,
          buyAmount: activity.buy_amount || 0,
          sellAmount: activity.sell_amount || 0,
          transactionCount: activity.transaction_count || 0,
          isAccumulating: (activity.net_amount || 0) > 0
        }
      };
    });
    
    // Calculate accumulation metrics
    const accumulatingHolders = holdersWithActivity.filter(h => h.activity.isAccumulating);
    const sellingHolders = holdersWithActivity.filter(h => !h.activity.isAccumulating);
    
    const totalBuyVolume = holdersWithActivity.reduce((sum, h) => sum + h.activity.buyAmount, 0);
    const totalSellVolume = holdersWithActivity.reduce((sum, h) => sum + h.activity.sellAmount, 0);
    const netVolume = totalBuyVolume - totalSellVolume;
    
    return {
      holders: holdersWithActivity,
      accumulationMetrics: {
        accumulatingCount: accumulatingHolders.length,
        sellingCount: sellingHolders.length,
        totalHolders: holdersWithActivity.length,
        totalBuyVolume,
        totalSellVolume,
        netVolume,
        isNetAccumulation: netVolume > 0
      }
    };
  } catch (error) {
    console.error('Error fetching top holder activity:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch top holder activity');
  }
};

/**
 * Fetch historical accumulation trend for top holders
 * @param {string} tokenAddress - The token address
 * @param {string} timeframe - Timeframe for analysis ('1h', '6h', '12h', '24h', '3d', '7d')
 * @param {string} interval - Interval for data points ('minute', 'hour', 'day')
 */
export const fetchAccumulationTrend = async (tokenAddress, timeframe = '24h', interval = 'hour') => {
  try {
    const response = await axios.get(`${API_URL}/tokens/${tokenAddress}/accumulation-trend`, {
      params: { timeframe, interval }
    });
    
    const trendData = response.data;
    if (!trendData || !Array.isArray(trendData)) {
      return { trend: [] };
    }
    
    // Format the data for the chart
    const trend = trendData.map(item => ({
      timestamp: item.timestamp,
      netVolume: item.net_volume || 0,
      buyVolume: item.buy_volume || 0,
      sellVolume: item.sell_volume || 0,
      accumulatingWallets: item.accumulating_wallets || 0,
      sellingWallets: item.selling_wallets || 0
    }));
    
    return { trend };
  } catch (error) {
    console.error('Error fetching accumulation trend:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch accumulation trend');
  }
};