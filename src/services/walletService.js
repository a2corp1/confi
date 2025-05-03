// client/src/services/walletService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://scamr-ai-production.up.railway.app/api';

/**
 * Fetch wallet information
 * @param {string} walletAddress - The wallet address
 * @returns {Promise<Object>} - Wallet information
 */
export const fetchWalletInfo = async (walletAddress) => {
  try {
    const response = await axios.get(`${API_URL}/wallets/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    throw error;
  }
};

/**
 * Fetch wallet balances
 * @param {string} walletAddress - The wallet address
 * @returns {Promise<Object>} - Wallet balances
 */
export const fetchWalletBalances = async (walletAddress) => {
  try {
    const response = await axios.get(`${API_URL}/wallets/${walletAddress}/balances`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    throw error;
  }
};

/**
 * Fetch wallet transactions
 * @param {string} walletAddress - The wallet address
 * @param {string} tokenAddress - Optional token address to filter transactions
 * @returns {Promise<Array>} - Array of transactions
 */
export const fetchWalletTransactions = async (walletAddress, tokenAddress = null) => {
  try {
    let endpoint = `${API_URL}/wallets/${walletAddress}/transactions`;
    
    if (tokenAddress) {
      endpoint = `${API_URL}/wallets/${walletAddress}/tokens/${tokenAddress}/transactions`;
    }
    
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    throw error;
  }
};

/**
 * Fetch wallet relationships
 * @param {string} walletAddress - The wallet address
 * @param {string} tokenAddress - The token address for relationship analysis
 * @returns {Promise<Object>} - Wallet relationships data
 */
export const fetchWalletRelationships = async (walletAddress, tokenAddress) => {
  try {
    const response = await axios.get(`${API_URL}/wallets/${walletAddress}/relationships`, {
      params: { tokenAddress }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet relationships:', error);
    throw error;
  }
};

/**
 * Fetch wallet activity heatmap
 * @param {string} walletAddress - The wallet address
 * @param {string} tokenAddress - Optional token address to filter activity
 * @param {string} timeframe - Timeframe for the heatmap (24h, 7d, 30d)
 * @returns {Promise<Object>} - Activity heatmap data
 */
export const fetchWalletActivityHeatmap = async (walletAddress, tokenAddress = null, timeframe = '30d') => {
  try {
    const response = await axios.get(`${API_URL}/wallets/${walletAddress}/activity`, {
      params: { tokenAddress, timeframe }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching activity heatmap:', error);
    throw error;
  }
};

/**
 * Fetch wallet holding history
 * @param {string} walletAddress - The wallet address
 * @param {string} tokenAddress - The token address
 * @param {string} timeframe - Timeframe for the history (24h, 7d, 30d)
 * @returns {Promise<Object>} - Holding history data
 */
export const fetchWalletHoldingHistory = async (walletAddress, tokenAddress, timeframe = '30d') => {
  try {
    const response = await axios.get(`${API_URL}/wallets/${walletAddress}/holding-history`, {
      params: { tokenAddress, timeframe }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching holding history:', error);
    throw error;
  }
};

/**
 * Fetch categorized wallet transactions
 * @param {string} walletAddress - The wallet address
 * @param {string} tokenAddress - Optional token address to filter transactions
 * @returns {Promise<Object>} - Categorized transactions data
 */
export const fetchCategorizedTransactions = async (walletAddress, tokenAddress = null) => {
  try {
    const response = await axios.get(`${API_URL}/wallets/${walletAddress}/categorized`, {
      params: { tokenAddress }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching categorized transactions:', error);
    throw error;
  }
};

/**
 * Fetch wallet token activity
 * @param {string} walletAddress - The wallet address
 * @param {string} tokenAddress - The token address
 * @returns {Promise<Object>} - Token activity data
 */
export const fetchWalletTokenActivity = async (walletAddress, tokenAddress) => {
  try {
    const response = await axios.get(`${API_URL}/wallets/${walletAddress}/tokens/${tokenAddress}/activity`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet token activity:', error);
    throw error;
  }
};

/**
 * Refresh wallet transaction data
 * @param {string} walletAddress - The wallet address
 * @param {string} tokenAddress - Optional token address to filter transactions
 * @returns {Promise<Object>} - Refresh status
 */
export const refreshWalletTransactions = async (walletAddress, tokenAddress = null) => {
  try {
    const response = await axios.post(`${API_URL}/wallets/${walletAddress}/refresh`, null, {
      params: { tokenAddress }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error refreshing wallet transactions:', error);
    throw error;
  }
};