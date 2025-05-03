// client/src/services/transactionService.js
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'https://scamr-ai-production.up.railway.app/api';


export const fetchTokenTransactions = async (tokenAddress, limit = 100) => {
  try {
    const response = await axios.get(`${API_URL}/transactions/token/${tokenAddress}`, {
      params: { limit }
    });
    
    // Return transactions
    return response.data?.transactions || response.data || [];
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    throw error;
  }
};

export const fetchHistoricalPriceData = async (tokenAddress, options = {}) => {
  try {
    const { 
      intervalMinutes = 5,
      limit = 1000 
    } = options;

    const response = await axios.get(`${API_URL}/tokens/${tokenAddress}/historical-price`, {
      params: { intervalMinutes, limit }
    });
    
    return response.data.priceData;
  } catch (error) {
    console.error('Error fetching historical price data:', error);
    throw error;
  }
};

export const fetchTransactionFlow = async (tokenAddress) => {
  try {
    const response = await axios.get(`${API_URL}/transactions/token/${tokenAddress}/flow`);
    return response.data?.flowData || response.data || { nodes: [], links: [] };
  } catch (error) {
    console.error('Error fetching transaction flow:', error);
    throw error;
  }
};

export const fetchP2PTransfers = async (tokenAddress, excludeDexes = true) => {
  try {
    const response = await axios.get(`${API_URL}/transactions/token/${tokenAddress}/p2p`, {
      params: { excludeDexes }
    });
    
    return response.data?.p2pTransfers || response.data || [];
  } catch (error) {
    console.error('Error fetching P2P transfers:', error);
    throw error;
  }
};

export const fetchTopTransactingWallets = async (tokenAddress, type = 'all') => {
  try {
    const response = await axios.get(`${API_URL}/transactions/token/${tokenAddress}/top-wallets`, {
      params: { type }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top transacting wallets:', error);
    throw error;
  }
};


export const fetchVolumeOverTime = async (tokenAddress, timeframe = '7d') => {
  try {
    const response = await axios.get(`${API_URL}/transactions/token/${tokenAddress}/volume`, {
      params: { timeframe }
    });
    
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching volume data:', error);
    throw error;
  }
};

/**
 * Process top holder transactions for a token (trigger background job)
 * @param {string} tokenAddress - The token address
 * @returns {Promise<Object>} - Status of the processing job
 */
export const processTopHolderTransactions = async (tokenAddress) => {
  try {
    const response = await axios.get(`${API_URL}/transactions/token/${tokenAddress}/process-holders`);
    return response.data;
  } catch (error) {
    console.error('Error processing top holder transactions:', error);
    throw error;
  }
};

/**
 * Check processing status of top holder transactions
 * @param {string} tokenAddress - The token address
 * @returns {Promise<Object>} - Status information
 */
export const checkHolderProcessingStatus = async (tokenAddress) => {
  try {
    // This endpoint might need to be created on the backend
    const response = await axios.get(`${API_URL}/tokens/${tokenAddress}/holder-transactions`, {
      params: { statusOnly: true }
    });
    
    return {
      isProcessing: response.data?.isProcessing || false,
      holdersProcessed: response.data?.holdersProcessed || 0,
      transactionsSaved: response.data?.transactionsSaved || 0,
      lastProcessed: response.data?.lastProcessed || null
    };
  } catch (error) {
    console.error('Error checking holder processing status:', error);
    // Return a default status on error
    return {
      isProcessing: false,
      holdersProcessed: 0,
      transactionsSaved: 0,
      lastProcessed: null
    };
  }
};