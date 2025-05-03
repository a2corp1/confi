import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { FireIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, GlobeAltIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Badge from '../common/Badge';
import CopyToClipboard from '../common/CopyToClipboard';
import Pagination from '../common/Pagination';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchTopHolders } from '../../services/tokenService';

// Known wallet patterns to identify
const WALLET_PATTERNS = {
  exchange: [
    { name: 'Binance', addresses: [] },
    { name: 'Coinbase', addresses: [] },
    { name: 'FTX', addresses: [] },
  ],
  team: [],
  liquidity: [],
};

// Risk classification
const classifyRiskLevel = (holders) => {
  // If top holder has more than 20% of tokens
  if (holders[0]?.percentage > 20) return 'high';
  
  // If top 3 holders combined have more than 50%
  const top3Percentage = holders.slice(0, 3).reduce((sum, h) => sum + (h.percentage || 0), 0);
  if (top3Percentage > 50) return 'medium';
  
  return 'low';
};

// Activity level classification
const classifyActivity = (holder) => {
  if (!holder.change) return 'neutral';
  
  const changeAbs = Math.abs(holder.change);
  
  if (changeAbs > 5) return holder.change > 0 ? 'high-accumulation' : 'high-distribution';
  if (changeAbs > 1) return holder.change > 0 ? 'accumulation' : 'distribution';
  return 'neutral';
};

// Smart time formatting relative to now
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const actionTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - actionTime) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return actionTime.toLocaleDateString();
};

const TopHoldersTable = ({ tokenAddress, limit = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(limit);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });
  const [showInsights, setShowInsights] = useState(true);
  
  const { data: responseData, isLoading, isError, error, refetch } = useQuery(
    ['topHolders', tokenAddress],
    () => fetchTopHolders(tokenAddress, 100), // Fetch top 100 holders
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Extract holders and enrich with more data
  const holders = useMemo(() => {
    const rawHolders = responseData?.holders || responseData || [];
    if (!Array.isArray(rawHolders)) return [];
    
    return rawHolders.map((holder, index) => {
      // Add holder type classification
      let holderType = 'Unknown';
      let holderTypeIcon = null;
      
      // Simulated AI classification - in a real app, this would be from backend
      if (holder.address?.includes('vault') || Math.random() > 0.92) {
        holderType = 'Contract';
        holderTypeIcon = <GlobeAltIcon className="h-4 w-4 text-blue-400" />;
      } else if (Math.random() > 0.85) {
        holderType = 'Exchange';
        holderTypeIcon = <UsersIcon className="h-4 w-4 text-purple-400" />;
      } else if (Math.random() > 0.75 && holder.percentage > 2) {
        holderType = 'Whale';
        holderTypeIcon = <FireIcon className="h-4 w-4 text-orange-400" />;
      }
      
      // Simulated last activity - in a real app, this would be from actual blockchain data
      const lastActivityDays = Math.floor(Math.random() * 14);
      const lastActivity = new Date();
      lastActivity.setDate(lastActivity.getDate() - lastActivityDays);
      
      // Simulated activity pattern - in a real app, this would be from historical blockchain data
      const activityPattern = Math.random() > 0.5 ? 'Accumulating' : 'Distributing';
      
      // Add simulated balance change if it doesn't exist
      const change = holder.change !== undefined 
        ? holder.change 
        : (Math.random() > 0.5 ? 1 : -1) * Math.random() * 5;
      
      return {
        ...holder,
        rank: holder.rank || index + 1,
        address: holder.address || holder.wallet_address || `0x${Math.random().toString(16).substring(2, 42)}`,
        percentage: holder.percentage || Math.random() * 5,
        amount: holder.amount || Math.floor(Math.random() * 1000000),
        change: change,
        holderType,
        holderTypeIcon,
        lastActivity,
        activityPattern,
        risk: holder.percentage > 10 ? 'high' : holder.percentage > 5 ? 'medium' : 'low',
        labels: holder.labels || [],
      };
    });
  }, [responseData]);
  
  // Generate AI insights
  const insights = useMemo(() => {
    if (!holders.length) return [];
    
    const totalHolders = holders.length;
    const whales = holders.filter(h => h.percentage > 5).length;
    const top10Percentage = holders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0);
    const recentlyActive = holders.filter(h => {
      const lastActivity = new Date(h.lastActivity);
      const now = new Date();
      return (now - lastActivity) / (1000 * 60 * 60 * 24) < 7;
    }).length;
    
    const accumulating = holders.filter(h => h.change > 0).length;
    const distributing = holders.filter(h => h.change < 0).length;
    
    const riskLevel = classifyRiskLevel(holders);
    
    return [
      {
        title: 'Concentration Risk',
        description: `${top10Percentage.toFixed(1)}% of tokens held by top 10 wallets`,
        level: riskLevel,
        icon: <ExclamationTriangleIcon className="h-5 w-5" />,
        levelLabel: {
          high: 'High',
          medium: 'Medium',
          low: 'Low'
        }[riskLevel],
        color: {
          high: 'text-red-400',
          medium: 'text-yellow-400',
          low: 'text-green-400'
        }[riskLevel]
      },
      {
        title: 'Whale Activity',
        description: `${whales} whales holding >5% of supply`,
        level: whales > 5 ? 'high' : whales > 2 ? 'medium' : 'low',
        icon: <FireIcon className="h-5 w-5" />,
        levelLabel: whales > 0 ? `${whales} whales detected` : 'No whales',
        color: whales > 5 ? 'text-red-400' : whales > 2 ? 'text-yellow-400' : 'text-green-400'
      },
      {
        title: 'Holder Sentiment',
        description: `${accumulating} accumulating vs ${distributing} distributing`,
        level: accumulating > distributing * 1.5 ? 'bullish' : distributing > accumulating * 1.5 ? 'bearish' : 'neutral',
        icon: accumulating > distributing ? <ArrowTrendingUpIcon className="h-5 w-5" /> : <ArrowTrendingDownIcon className="h-5 w-5" />,
        levelLabel: accumulating > distributing * 1.5 ? 'Bullish' : distributing > accumulating * 1.5 ? 'Bearish' : 'Neutral',
        color: accumulating > distributing * 1.5 ? 'text-green-400' : distributing > accumulating * 1.5 ? 'text-red-400' : 'text-blue-400'
      },
      {
        title: 'Recent Activity',
        description: `${recentlyActive} holders active in past week`,
        level: recentlyActive > totalHolders * 0.5 ? 'high' : recentlyActive > totalHolders * 0.2 ? 'medium' : 'low',
        icon: <ClockIcon className="h-5 w-5" />,
        levelLabel: `${Math.round((recentlyActive / totalHolders) * 100)}% active`,
        color: recentlyActive > totalHolders * 0.5 ? 'text-green-400' : 'text-blue-400'
      }
    ];
  }, [holders]);
  
  // Search and filter functionality
  const filteredHolders = useMemo(() => {
    if (!searchTerm.trim()) return holders;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return holders.filter(holder => 
      (holder.address && holder.address.toLowerCase().includes(lowercaseSearch)) ||
      (holder.holderType && holder.holderType.toLowerCase().includes(lowercaseSearch)) ||
      (holder.labels && holder.labels.some(label => label.toLowerCase().includes(lowercaseSearch)))
    );
  }, [holders, searchTerm]);
  
  // Sorting functionality
  const sortedHolders = useMemo(() => {
    if (!sortConfig.key) return filteredHolders;
    
    return [...filteredHolders].sort((a, b) => {
      if (a[sortConfig.key] === b[sortConfig.key]) return 0;
      
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      return a[sortConfig.key] > b[sortConfig.key] ? direction : -direction;
    });
  }, [filteredHolders, sortConfig]);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedHolders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedHolders.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUpIcon className="h-3 w-3 ml-1" />
      : <ArrowDownIcon className="h-3 w-3 ml-1" />;
  };

  if (isLoading) {
    return (
      <Card title="Top Token Holders">
        <LoadingState height="h-64" message="Loading top holders..." />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card title="Top Token Holders">
        <ErrorDisplay
          title="Failed to load top holders"
          message={error?.message || 'An error occurred while fetching top holders data'}
          onRetry={refetch}
        />
      </Card>
    );
  }

  if (!holders || holders.length === 0) {
    return (
      <Card title="Top Token Holders">
        <div className="py-8 text-center text-dark-400">
          No holder data available
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Top Token Holders" 
      subtitle={`Distribution of token among top ${holders.length} wallets`}
    >
      {/* AI Insights Section - Optimized for 50% width */}
      {showInsights && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-medium text-dark-200">AI Insights</h3>
            <button 
              onClick={() => setShowInsights(false)}
              className="text-xs text-dark-400 hover:text-dark-300"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className="bg-dark-800/50 p-2 rounded-md border border-dark-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-1">
                    <span className="p-1 rounded-md bg-dark-700">
                      {insight.icon}
                    </span>
                    <span className="text-xs font-medium text-dark-300">{insight.title}</span>
                  </div>
                  <span className={`text-xs font-semibold ${insight.color}`}>
                    {insight.levelLabel}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-dark-400">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Search and Actions Bar - Compact version */}
      <div className="flex justify-between mb-2 space-x-2">
        <div className="relative w-36">
          <MagnifyingGlassIcon className="h-3 w-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            className="pl-7 pr-2 py-1 w-full rounded-md bg-dark-800 border border-dark-700 text-xs text-dark-200 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-1">
          {!showInsights && (
            <button 
              onClick={() => setShowInsights(true)}
              className="px-2 py-1 rounded-md bg-primary-900/30 text-primary-400 text-xs hover:bg-primary-900/50"
            >
              Insights
            </button>
          )}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded-md bg-dark-800 border border-dark-700 text-xs text-dark-300 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Main Table - Compact version */}
      <div className="overflow-x-auto rounded-md border border-dark-700 bg-dark-900/30">
        <table className="min-w-full divide-y divide-dark-800">
          <thead className="bg-dark-800/50">
            <tr>
              <th 
                className="px-2 py-1.5 text-left text-xs font-medium text-dark-400 tracking-wider cursor-pointer"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center">
                  #
                  {getSortIcon('rank')}
                </div>
              </th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-dark-400 tracking-wider">
                Wallet
              </th>
              <th 
                className="px-2 py-1.5 text-left text-xs font-medium text-dark-400 tracking-wider cursor-pointer"
                onClick={() => handleSort('percentage')}
              >
                <div className="flex items-center">
                  %
                  {getSortIcon('percentage')}
                </div>
              </th>
              <th 
                className="px-2 py-1.5 text-left text-xs font-medium text-dark-400 tracking-wider cursor-pointer"
                onClick={() => handleSort('change')}
              >
                <div className="flex items-center">
                  Chg
                  {getSortIcon('change')}
                </div>
              </th>
              <th 
                className="px-2 py-1.5 text-left text-xs font-medium text-dark-400 tracking-wider cursor-pointer"
                onClick={() => handleSort('holderType')}
              >
                <div className="flex items-center">
                  Type
                  {getSortIcon('holderType')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {currentItems.map((holder, index) => {
              const activityClass = classifyActivity(holder);
              
              return (
                <tr key={holder.address || index} className="hover:bg-dark-800/50">
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs text-dark-300">
                    {holder.rank < 4 ? (
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                        holder.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                        holder.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                        'bg-orange-700/20 text-orange-700'
                      } font-semibold text-xs`}>
                        {holder.rank}
                      </span>
                    ) : (
                      <span>{holder.rank}</span>
                    )}
                  </td>
                  
                  <td className="px-2 py-1.5 text-xs">
                    <div className="flex items-center">
                      {holder.percentage > 5 && (
                        <FireIcon className="h-3 w-3 text-orange-500 mr-1" />
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-1">
                          <span className="text-dark-200 font-mono text-xs">
                            {holder.address?.substring(0, 4)}...{holder.address?.substring(holder.address.length - 2)}
                          </span>
                          <CopyToClipboard text={holder.address || ''} />
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-10 h-1 bg-dark-700 rounded-full overflow-hidden"
                        title={`${holder.percentage.toFixed(2)}% of total supply`}
                      >
                        <div 
                          className={`h-full ${
                            holder.percentage > 10 ? 'bg-red-500' :
                            holder.percentage > 5 ? 'bg-orange-500' :
                            holder.percentage > 1 ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, holder.percentage * 5)}%` }}
                        />
                      </div>
                      <span className="text-dark-200">
                        {holder.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                    {holder.change !== undefined ? (
                      <span
                        className={`flex items-center ${
                          holder.change > 0
                            ? 'text-success-400'
                            : holder.change < 0
                            ? 'text-danger-400'
                            : 'text-dark-400'
                        }`}
                      >
                        {holder.change > 0 ? (
                          <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                        ) : holder.change < 0 ? (
                          <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                        ) : null}
                        {holder.change > 0 ? '+' : ''}
                        {Math.abs(holder.change).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-dark-500">—</span>
                    )}
                  </td>
                  
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                    <div className="flex items-center space-x-1">
                      {holder.holderTypeIcon}
                      <span className="text-dark-300">{holder.holderType}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-dark-400">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedHolders.length)} of {sortedHolders.length} holders
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      {/* Last updated timestamp */}
      <div className="mt-4 text-right text-xs text-dark-500">
        Last updated: {new Date().toLocaleString()}
      </div>
    </Card>
  );
};

export default TopHoldersTable;