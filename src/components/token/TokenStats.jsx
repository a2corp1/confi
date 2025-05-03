import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  ArrowTrendingUpIcon, 
  ArrowsRightLeftIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { fetchTokenInfo } from '../../services/tokenService';
import { fetchDexScreenerData } from '../../services/dexScreenerService';
import Card from '../common/Card';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';

const TokenStats = ({ tokenAddress }) => {
  const [tokenData, setTokenData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveIndicator, setLiveIndicator] = useState(false);

  const formatPrice = (value) => {
    if (value == null) return 'Unknown';
    if (value < 0.00001) return value.toFixed(8);
    if (value < 0.001) return value.toFixed(6);
    if (value < 1) return value.toFixed(4);
    return value.toFixed(2);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [tokenInfoResponse, marketResponse] = await Promise.all([
        fetchTokenInfo(tokenAddress),
        fetchDexScreenerData(tokenAddress)
      ]);

      setTokenData(tokenInfoResponse);
      setMarketData(marketResponse);
      setError(null);
    } catch (err) {
      setError(err);
      setTokenData(null);
      setMarketData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenAddress) {
      fetchData();

      const dataInterval = setInterval(fetchData, 2 * 60 * 1000);
      const liveInterval = setInterval(() => {
        setLiveIndicator(prev => !prev);
      }, 1000);

      return () => {
        clearInterval(dataInterval);
        clearInterval(liveInterval);
      };
    }
  }, [tokenAddress]);

  if (isLoading) {
    return <LoadingState height="h-48" message="Loading token statistics..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load token statistics"
        message={error.message || 'An error occurred'}
        onRetry={fetchData}
      />
    );
  }

  const stats = [
    {
      name: 'Holders',
      value: (tokenData?.total_holders || 0).toLocaleString(),
      icon: <UsersIcon className="h-6 w-6 text-primary-400" />,
      change: 0,
      id: 'holders',
      progressPercent: 30
    },
    {
      name: 'Price',
      value: `$${formatPrice(marketData?.price)}`,
      icon: <CurrencyDollarIcon className="h-6 w-6 text-secondary-400" />,
      change: marketData?.priceChange || 0,
      id: 'price',
      progressPercent: 80
    },
    {
      name: 'Volume (24h)',
      value: `$${(marketData?.volume_24h || 0).toLocaleString()}`,
      icon: <ArrowsRightLeftIcon className="h-6 w-6 text-accent-400" />,
      change: 0,
      id: 'volume',
      progressPercent: 65
    },
    {
      name: 'Market Cap',
      value: `$${(marketData?.market_cap || 0).toLocaleString()}`,
      icon: <ArrowTrendingUpIcon className="h-6 w-6 text-success-400" />,
      change: 0,
      id: 'marketCap',
      progressPercent: 45
    }
  ];

  return (
    <>
      <div className="col-span-full flex justify-between items-center mb-2">
        <div className="flex items-center text-xs">
          <div className={`h-2 w-2 rounded-full mr-1 ${liveIndicator ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-gray-400">Live data</span>
          {tokenData?.last_updated_at && (
            <span className="ml-2 text-gray-500">
              Updated: {new Date(tokenData.last_updated_at).toLocaleTimeString()}
            </span>
          )}
        </div>

        <button 
          onClick={fetchData}
          className="text-xs px-2 py-1 bg-primary-700 hover:bg-primary-600 rounded text-white"
        >
          Refresh
        </button>
      </div>

      {stats.map((stat) => (
        <Card key={stat.id} className="overflow-hidden transition-all duration-300 relative sm:mb-0 mb-3">
          <div className="flex items-center space-x-3 relative">
            <div className="rounded-full bg-dark-800 p-1.5 sm:p-2">{stat.icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-dark-400 mr-2 truncate">{stat.name}</p>
              <p className="text-xl sm:text-2xl font-semibold text-white">{stat.value}</p>

              {stat.change !== undefined && (
                <span
                  className={`text-xs font-medium ${
                    stat.change > 0
                      ? 'text-success-400'
                      : stat.change < 0
                      ? 'text-danger-400'
                      : 'text-dark-400'
                  }`}
                >
                  {stat.change > 0 ? '+' : ''}{stat.change.toFixed(2)}%
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 sm:mt-3 h-1 w-full bg-dark-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000"
              style={{ 
                width: `${stat.progressPercent}%`,
                transformOrigin: 'left',
              }}
            />
          </div>
        </Card>
      ))}
    </>
  );
};

export default TokenStats;