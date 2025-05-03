import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  WaveIcon 
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchTopHolders } from '../../services/tokenService';

const TokenWhaleTides = ({ tokenAddress }) => {
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['topHolders', tokenAddress],
    () => fetchTopHolders(tokenAddress),
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <Card title="Whale Tides">
        <LoadingState height="h-60" message="Tracking whale movements..." />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card title="Whale Tides">
        <ErrorDisplay
          title="Failed to load whale data"
          message={error?.message || 'An error occurred while fetching whale movements'}
          onRetry={refetch}
        />
      </Card>
    );
  }

  // Analyze whale movements
  const whaleAnalysis = {
    top10Percentage: data?.count > 0 
      ? data.holders.slice(0, 10).reduce((sum, holder) => sum + holder.percentage, 0).toFixed(2)
      : 'N/A',
    largestHolderPercentage: data?.count > 0 
      ? data.holders[0]?.percentage.toFixed(2)
      : 'N/A',
    trend: data?.count > 0 
      ? (data.holders[0]?.percentage > data.holders[data.holders.length - 1]?.percentage 
        ? 'increasing' 
        : 'decreasing')
      : 'neutral'
  };

  return (
    <Card title="Whale Tides" subtitle="Top holder distribution and movements">
      <div className="p-4 space-y-4">
        {/* Top Holders Distribution */}
        <div className="bg-dark-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-dark-400">Top 10 Holders</span>
            <span className="text-sm font-semibold text-white">
              {whaleAnalysis.top10Percentage}%
            </span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full" 
              style={{ width: `${whaleAnalysis.top10Percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-dark-400 mt-1">
            Percentage of total supply held by top 10 wallets
          </p>
        </div>

        {/* Largest Holder Card */}
        <div className="bg-dark-800/50 rounded-lg p-3 flex items-center">
          <div className="mr-4">
            {whaleAnalysis.trend === 'increasing' ? (
              <ArrowUpIcon className="h-6 w-6 text-green-500" />
            ) : whaleAnalysis.trend === 'decreasing' ? (
              <ArrowDownIcon className="h-6 w-6 text-red-500" />
            ) : (
              <WaveIcon className="h-6 w-6 text-dark-400" />
            )}
          </div>
          <div>
            <h4 className="text-sm text-dark-400">Largest Holder</h4>
            <p className="text-lg font-semibold text-white">
              {whaleAnalysis.largestHolderPercentage}%
            </p>
            <p className="text-xs text-dark-400">
              {whaleAnalysis.trend === 'increasing' 
                ? 'Accumulating tokens' 
                : whaleAnalysis.trend === 'decreasing'
                ? 'Distributing tokens'
                : 'Holding steady'}
            </p>
          </div>
        </div>

        {/* Quick Whale Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-800/50 rounded-lg p-2 text-center">
            <p className="text-xs text-dark-400">Total Holders</p>
            <p className="text-sm font-semibold text-white">
              {data?.count?.toLocaleString() || 'N/A'}
            </p>
          </div>
          <div className="bg-dark-800/50 rounded-lg p-2 text-center">
            <p className="text-xs text-dark-400">Whale Dominance</p>
            <p className="text-sm font-semibold text-white">
              {(data?.count > 0 
                ? data.holders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0).toFixed(2)
                : 'N/A')}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TokenWhaleTides;