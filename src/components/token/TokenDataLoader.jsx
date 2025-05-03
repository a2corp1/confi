// src/components/token/TokenDataLoader.js
import React, { useEffect } from 'react';
import { useDataLoading } from '../../contexts/DataLoadingContext';
import { fetchTokenInfo } from '../../services/tokenService';
import { fetchTopHolders } from '../../services/holderService';
import { fetchTokenTransactions } from '../../services/transactionService';
import { fetchTokenPriceHistory } from '../../services/priceService';
import LoadingState from '../common/LoadingState';

const TokenDataLoader = ({ tokenAddress, children }) => {
  const { 
    registerLoader, 
    completeLoader, 
    setError, 
    isLoading, 
    hasErrors, 
    errors 
  } = useDataLoading();

  useEffect(() => {
    const loadAllData = async () => {
      // Register all loaders
      registerLoader('tokenInfo');
      registerLoader('topHolders');
      registerLoader('transactions');
      registerLoader('priceHistory');
      
      try {
        // Load token info with wait=true
        const tokenInfoPromise = fetchTokenInfo(tokenAddress, true)
          .then(data => completeLoader('tokenInfo', data))
          .catch(err => setError('tokenInfo', err.message));
          
        // Load top holders with wait=true  
        const topHoldersPromise = fetchTopHolders(tokenAddress, { wait: true })
          .then(data => completeLoader('topHolders', data))
          .catch(err => setError('topHolders', err.message));
          
        // Load transactions with wait=true
        const transactionsPromise = fetchTokenTransactions(tokenAddress, { wait: true })
          .then(data => completeLoader('transactions', data))
          .catch(err => setError('transactions', err.message));
          
        // Load price history with wait=true
        const priceHistoryPromise = fetchTokenPriceHistory(tokenAddress, { wait: true })
          .then(data => completeLoader('priceHistory', data))
          .catch(err => setError('priceHistory', err.message));
          
        // Wait for all promises to resolve
        await Promise.all([
          tokenInfoPromise, 
          topHoldersPromise, 
          transactionsPromise, 
          priceHistoryPromise
        ]);
        
      } catch (error) {
        console.error('Error loading token data:', error);
      }
    };
    
    loadAllData();
  }, [tokenAddress]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingState 
          height="h-40" 
          message="Loading complete token data..." 
        />
        <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-blue-600 animate-pulse-loading"></div>
        </div>
      </div>
    );
  }
  
  if (hasErrors) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-900/20 border border-red-800/30 text-red-300 p-6 rounded-lg max-w-2xl">
          <h3 className="text-xl font-medium mb-4">Error Loading Token Data</h3>
          <ul className="space-y-2 mb-6">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key} className="flex items-start">
                <span className="text-red-400 mr-2">•</span>
                <span>{key}: {error}</span>
              </li>
            ))}
          </ul>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-800/30 hover:bg-red-800/50 rounded-md text-sm font-medium"
            >
              Retry All
            </button>
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-dark-800/50 hover:bg-dark-800 rounded-md text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return children;
};

export default TokenDataLoader;