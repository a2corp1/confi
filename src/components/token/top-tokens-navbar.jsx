import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowTrendingUpIcon, FireIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { fetchTopTokensByMarketCap } from '../../services/tokenService';

// Token search history local storage helper functions (still keep for tracking clicks)
const addTokenToSearchHistory = (token) => {
  try {
    const history = JSON.parse(localStorage.getItem('tokenSearchHistory') || '[]');
    const existingIndex = history.findIndex(item => item.address === token.address);
    
    if (existingIndex !== -1) {
      history[existingIndex].searchCount = (history[existingIndex].searchCount || 0) + 1;
      history[existingIndex].lastSearched = new Date().toISOString();
    } else {
      history.push({
        ...token,
        searchCount: 1,
        lastSearched: new Date().toISOString()
      });
    }
    
    history.sort((a, b) => b.searchCount - a.searchCount);
    const trimmedHistory = history.slice(0, 50);
    
    localStorage.setItem('tokenSearchHistory', JSON.stringify(trimmedHistory));
    return trimmedHistory;
  } catch (error) {
    console.error('Error adding token to search history:', error);
    return [];
  }
};

const TopTokensNavbar = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use the same API query as the popular tokens section
  const { 
    data: apiResponse, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['topTokensByMarketCap'],
    queryFn: fetchTopTokensByMarketCap,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
  
  // Extract tokens from API response
  const topTokens = apiResponse?.data?.slice(0, 10) || [];
  
  const handleTokenClick = (token) => {
    // Update search history
    addTokenToSearchHistory(token);
    
    // Navigate to token page
    navigate(`/token/${token.address}`);
  };
  
  return (
    <div className="w-full bg-dark-900 border-b border-dark-800 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Trending tokens label */}
        <div className="flex items-center text-sm font-medium text-gray-400 mr-4">
          <FireIcon className="h-4 w-4 text-amber-500 mr-1" />
          <span className="hidden sm:inline">Trending:</span>
        </div>
        
        {/* Desktop tokens list */}
        <div className="hidden md:flex flex-1 overflow-x-auto tokens-scroll-container">
          {isLoading ? (
            <div className="flex items-center text-sm text-gray-500">
              <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
              Loading tokens...
            </div>
          ) : error ? (
            <div className="text-sm text-red-500">Failed to load tokens</div>
          ) : (
            <div className="flex space-x-2">
              {topTokens.map((token, index) => (
                <button
                  key={token.address}
                  onClick={() => handleTokenClick(token)}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-blue-400 transition-colors whitespace-nowrap border border-dark-700 hover:border-dark-600"
                >
                  {token.symbol}
                  {index < 3 && (
                    <span className="ml-1 flex items-center">
                      <ArrowTrendingUpIcon className="h-3 w-3 text-green-500" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Mobile dropdown */}
        <div className="md:hidden flex-1 relative">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-300 bg-dark-800 rounded-md border border-dark-700"
          >
            <span>Top Tokens</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="absolute z-50 mt-1 w-full bg-dark-800 rounded-md shadow-lg border border-dark-700 py-1">
              {isLoading ? (
                <div className="px-4 py-2 text-sm text-gray-400">Loading tokens...</div>
              ) : error ? (
                <div className="px-4 py-2 text-sm text-red-500">Failed to load tokens</div>
              ) : (
                topTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => {
                      handleTokenClick(token);
                      setIsExpanded(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 w-full text-left hover:text-blue-400"
                  >
                    <span className="font-medium">{token.symbol}</span>
                    <span className="ml-2 text-xs text-gray-500">{token.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* View all button */}
        <button 
          onClick={() => navigate('/trending')}
          className="text-xs font-medium text-blue-500 hover:text-blue-400 whitespace-nowrap ml-4"
        >
          View All
        </button>
      </div>
    </div>
  );
};

export { addTokenToSearchHistory };
export default TopTokensNavbar;