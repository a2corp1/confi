// client/src/components/token/TokenInfo.jsx
import React, { useState, useEffect } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { fetchDexScreenerData } from '../../services/dexScreenerService';
import CopyToClipboard from '../common/CopyToClipboard';
import Badge from '../common/Badge';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';

const TokenInfo = ({ tokenAddress }) => {
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch and refresh data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchDexScreenerData(tokenAddress);
      setMarketData(data);
      setError(null);
    } catch (err) {
      setError(err);
      setMarketData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (tokenAddress) {
      fetchData();
      
      // Refresh every 2 minutes
      const intervalId = setInterval(fetchData, 2 * 60 * 1000);
      
      // Cleanup interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [tokenAddress]);

  // Loading state
  if (isLoading) {
    return <LoadingState height="h-24" message="Loading token information..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load token information"
        message={error.message || 'An error occurred while fetching token data'}
        onRetry={fetchData}
      />
    );
  }

  // Price formatting utility
  const formatPrice = (value) => {
    if (value == null) return 'Unknown';
    if (value < 0.00001) return value.toFixed(8);
    if (value < 0.001) return value.toFixed(6);
    if (value < 1) return value.toFixed(4);
    return value.toFixed(2);
  };

  return (

    
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
      {/* Token Icon Placeholder */}
      <div className="flex-shrink-0">
        <div className="h-16 w-16 rounded-lg overflow-hidden">
          <img 
            src={marketData?.image} 
            alt={`${marketData?.symbol || 'Token'} logo`} 
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback to generated image if load fails
              e.target.src = generateFallbackImage(marketData?.symbol);
            }}
          />
        </div>
      </div>

      
      

      {/* Token Details */}
      <div className="flex-grow">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <h1 className="text-3xl font-bold text-white">
            {marketData?.name || 'Unknown Token'}
          </h1>
          <div className="flex items-center space-x-2">
            <Badge variant="primary" large>
              {marketData?.symbol || '???'}
            </Badge>
            <Badge variant="secondary">Live Price</Badge>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-dark-400">
          <div>
            Token Address: <CopyToClipboard text={tokenAddress} className="ml-1" />
          </div>
        </div>
      </div>

      {/* Token Price & Links */}
      <div className="flex flex-col items-end gap-2">
        <div className="text-right">
          <div className="text-2xl font-bold text-white transition-all duration-1000">
            ${formatPrice(marketData?.price)}
          </div>
          <div className="text-sm text-dark-400 transition-all duration-1000">
            Market Cap: ${marketData?.market_cap?.toLocaleString() || 'Unknown'}
          </div>
        
          <div className={`text-sm transition-all duration-1000 ${
            (marketData?.priceChange || 0) >= 0 
              ? 'text-green-500' 
              : 'text-red-500'
          }`}>
            24h Change: {(marketData?.priceChange || 0) >= 0 ? '+' : ''}
            {(marketData?.priceChange || 0).toFixed(2)}%
          </div>
        </div>

        <div className="flex gap-2">
          
         <a   href={`https://explorer.solana.com/address/${tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs px-3 py-1.5 flex items-center"
          >
            Explorer <ArrowTopRightOnSquareIcon className="ml-1 h-3 w-3" />
          </a>
          
           <a href={marketData?.url || `https://dexscreener.com/solana/${tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs px-3 py-1.5 flex items-center"
          >
            DexScreener <ArrowTopRightOnSquareIcon className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TokenInfo;