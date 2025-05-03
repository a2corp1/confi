import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  ArrowTopRightOnSquareIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CircleStackIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Badge from '../common/Badge';
import CopyToClipboard from '../common/CopyToClipboard';
import Pagination from '../common/Pagination';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchTokenTransactions } from '../../services/transactionService';

const TokenTransactionAnalytics = ({ tokenAddress, limit = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(limit);
  const [activeTab, setActiveTab] = useState('trends');
  
  const { data: responseData, isLoading, isError, error, refetch } = useQuery(
    ['tokenTransactions', tokenAddress],
    () => fetchTokenTransactions(tokenAddress, 100), // Fetch 100 transactions
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  );
  
  // Safely extract transactions with error handling
  const transactions = useMemo(() => {
    try {
      if (responseData) {
        if (Array.isArray(responseData)) {
          return responseData;
        } else if (responseData.transactions && Array.isArray(responseData.transactions)) {
          return responseData.transactions;
        } else if (typeof responseData === 'object') {
          // Try to find an array property
          const arrayProps = Object.keys(responseData).filter(key => 
            Array.isArray(responseData[key])
          );
          if (arrayProps.length > 0) {
            return responseData[arrayProps[0]];
          }
        }
      }
      return []; // Return empty array if nothing found
    } catch (err) {
      console.error('Error extracting transactions:', err);
      return [];
    }
  }, [responseData]);
  
  // Calculate pagination for table view
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // AI ANALYTICS SECTION
  
  // 1. Transaction Type Distribution
  const txTypeDistribution = useMemo(() => {
    const distribution = transactions.reduce((acc, tx) => {
      const type = (tx?.txType || tx?.tx_type || 'Unknown').toUpperCase();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate percentages and prepare for display
    const total = transactions.length;
    return Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
      percentage: total ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [transactions]);
  
  // 2. Temporal Patterns (hourly distribution)
  const timePatterns = useMemo(() => {
    const hourlyDistribution = Array(24).fill(0);
    
    transactions.forEach(tx => {
      const blockTime = tx?.blockTime || tx?.block_time;
      if (blockTime) {
        const date = new Date(typeof blockTime === 'number' && blockTime > 1000000000 ? blockTime * 1000 : blockTime);
        const hour = date.getHours();
        hourlyDistribution[hour]++;
      }
    });
    
    // Find peak hours (top 3)
    const peakHours = hourlyDistribution
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .filter(item => item.count > 0)
      .map(item => ({
        ...item,
        hourFormatted: `${item.hour}:00 - ${item.hour + 1}:00`
      }));
      
    return {
      hourlyDistribution,
      peakHours
    };
  }, [transactions]);
  
  // 3. Whale Activity (large transactions)
  const whaleActivity = useMemo(() => {
    if (!transactions.length) return { largeTransactions: [], averageAmount: 0 };
    
    // Convert amounts to numbers where possible
    const txWithAmounts = transactions.map(tx => ({
      ...tx,
      numericAmount: parseFloat(tx.amount) || 0
    })).filter(tx => tx.numericAmount > 0);
    
    // Calculate average transaction size
    const total = txWithAmounts.reduce((sum, tx) => sum + tx.numericAmount, 0);
    const averageAmount = txWithAmounts.length ? total / txWithAmounts.length : 0;
    
    // Find transactions significantly larger than average (3x or more)
    const threshold = averageAmount * 3;
    const largeTransactions = txWithAmounts
      .filter(tx => tx.numericAmount > threshold)
      .sort((a, b) => b.numericAmount - a.numericAmount)
      .slice(0, 3);
      
    return {
      largeTransactions,
      averageAmount,
      threshold
    };
  }, [transactions]);
  
  // 4. Transaction Velocity (transactions per hour)
  const velocityMetrics = useMemo(() => {
    if (!transactions.length) return { txPerHour: 0, trend: 'neutral' };
    
    // Get timestamps and sort them
    const timestamps = transactions
      .map(tx => tx?.blockTime || tx?.block_time)
      .filter(Boolean)
      .map(time => typeof time === 'number' && time > 1000000000 ? time * 1000 : time)
      .sort((a, b) => b - a); // Sort descending (newest first)
    
    if (timestamps.length < 2) return { txPerHour: 0, trend: 'neutral' };
    
    // Calculate time span in hours
    const newest = new Date(timestamps[0]);
    const oldest = new Date(timestamps[timestamps.length - 1]);
    const hoursDiff = Math.max(1, (newest - oldest) / (1000 * 60 * 60));
    
    // Calculate transactions per hour
    const txPerHour = transactions.length / hoursDiff;
    
    // Determine if velocity is increasing or decreasing
    // by comparing first half to second half of the time period
    const midPoint = new Date((newest.getTime() + oldest.getTime()) / 2);
    const recentTxCount = timestamps.filter(t => new Date(t) >= midPoint).length;
    const olderTxCount = timestamps.filter(t => new Date(t) < midPoint).length;
    
    let trend = 'neutral';
    if (recentTxCount > olderTxCount * 1.2) trend = 'increasing';
    else if (recentTxCount * 1.2 < olderTxCount) trend = 'decreasing';
    
    return {
      txPerHour: Math.round(txPerHour * 10) / 10, // Round to 1 decimal
      trend,
      recentTxCount,
      olderTxCount
    };
  }, [transactions]);
  
  // 5. Network Effect (unique addresses)
  const networkMetrics = useMemo(() => {
    if (!transactions.length) return { uniqueAddresses: 0, topAddress: null };
    
    // Collect all addresses
    const addresses = new Set();
    const addressCounts = {};
    
    transactions.forEach(tx => {
      const from = tx?.fromAddress || tx?.from_address;
      const to = tx?.toAddress || tx?.to_address;
      
      if (from) {
        addresses.add(from);
        addressCounts[from] = (addressCounts[from] || 0) + 1;
      }
      
      if (to) {
        addresses.add(to);
        addressCounts[to] = (addressCounts[to] || 0) + 1;
      }
    });
    
    // Find most active address
    let maxCount = 0;
    let topAddress = null;
    
    Object.entries(addressCounts).forEach(([address, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topAddress = address;
      }
    });
    
    return {
      uniqueAddresses: addresses.size,
      topAddress,
      topAddressCount: maxCount
    };
  }, [transactions]);
  
  // Helper function for transaction type styling
  const getTransactionTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'TRANSFER':
        return 'primary';
      case 'SWAP':
        return 'secondary';
      case 'MINT':
        return 'success';
      case 'BURN':
        return 'danger';
      default:
        return 'info';
    }
  };
  
  // Generate AI insights based on the analytics
  const aiInsights = useMemo(() => {
    if (!transactions.length) return [];
    
    const insights = [];
    
    // Transaction type insight
    if (txTypeDistribution.length) {
      const mainType = txTypeDistribution[0];
      insights.push({
        title: 'Primary Activity',
        description: `${mainType.type} transactions dominate at ${mainType.percentage}% of activity`,
        icon: <CircleStackIcon className="h-4 w-4" />,
        color: mainType.percentage > 70 ? 'text-yellow-400' : 'text-blue-400'
      });
    }
    
    // Velocity insight
    insights.push({
      title: 'Transaction Velocity',
      description: `${velocityMetrics.txPerHour} tx/hour, ${
        velocityMetrics.trend === 'increasing' ? 'accelerating' : 
        velocityMetrics.trend === 'decreasing' ? 'slowing down' : 
        'steady pace'
      }`,
      icon: <BoltIcon className="h-4 w-4" />,
      color: velocityMetrics.trend === 'increasing' ? 'text-green-400' : 
             velocityMetrics.trend === 'decreasing' ? 'text-red-400' : 'text-blue-400'
    });
    
    // Network insight
    insights.push({
      title: 'Network Activity',
      description: `${networkMetrics.uniqueAddresses} unique addresses interacting`,
      icon: <ChartBarIcon className="h-4 w-4" />,
      color: networkMetrics.uniqueAddresses > 20 ? 'text-green-400' : 'text-blue-400'
    });
    
    // Whale insight
    if (whaleActivity.largeTransactions.length) {
      insights.push({
        title: 'Whale Movements',
        description: `${whaleActivity.largeTransactions.length} large transactions detected`,
        icon: <FireIcon className="h-4 w-4" />,
        color: 'text-orange-400'
      });
    }
    
    return insights;
  }, [transactions, txTypeDistribution, velocityMetrics, networkMetrics, whaleActivity]);
  
  // Loading state
  if (isLoading) {
    return (
      <Card title="Transaction Analytics">
        <LoadingState height="h-64" message="Analyzing transactions..." />
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card title="Transaction Analytics">
        <ErrorDisplay
          title="Failed to load transactions"
          message={error?.message || 'An error occurred while fetching transaction data'}
          onRetry={refetch}
        />
      </Card>
    );
  }

  // Empty state
  if (!transactions.length) {
    return (
      <Card title="Transaction Analytics">
        <div className="py-8 text-center text-dark-400">
          No transaction data available to analyze
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Transaction Analytics" 
      subtitle="AI-powered transaction pattern analysis"
    >
      {/* AI Insights Section */}
      <div className="mb-3">
        <div className="grid grid-cols-2 gap-2">
          {aiInsights.map((insight, index) => (
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
                  {insight.title === 'Transaction Velocity' && velocityMetrics.trend === 'increasing' ? (
                    <ArrowTrendingUpIcon className="h-3 w-3 inline" />
                  ) : insight.title === 'Transaction Velocity' && velocityMetrics.trend === 'decreasing' ? (
                    <ArrowTrendingDownIcon className="h-3 w-3 inline" />
                  ) : null}
                </span>
              </div>
              <p className="mt-0.5 text-2xs text-dark-400">{insight.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="flex border-b border-dark-700 mb-3">
        <button
          className={`px-3 py-1.5 text-xs font-medium border-b-2 ${
            activeTab === 'trends' 
              ? 'border-primary-500 text-primary-400' 
              : 'border-transparent text-dark-400 hover:text-dark-300'
          }`}
          onClick={() => setActiveTab('trends')}
        >
          Activity Trends
        </button>
        <button
          className={`px-3 py-1.5 text-xs font-medium border-b-2 ${
            activeTab === 'whales' 
              ? 'border-primary-500 text-primary-400' 
              : 'border-transparent text-dark-400 hover:text-dark-300'
          }`}
          onClick={() => setActiveTab('whales')}
        >
          Whale Activity
        </button>
        <button
          className={`px-3 py-1.5 text-xs font-medium border-b-2 ${
            activeTab === 'transactions' 
              ? 'border-primary-500 text-primary-400' 
              : 'border-transparent text-dark-400 hover:text-dark-300'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          Recent Transactions
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="h-64 overflow-y-auto">
        {/* Activity Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-4">
            {/* Transaction Type Distribution */}
            <div>
              <h3 className="text-xs font-semibold text-dark-300 mb-2">Transaction Types</h3>
              <div className="space-y-1.5">
                {txTypeDistribution.map((item) => (
                  <div key={item.type} className="flex items-center">
                    <Badge variant={getTransactionTypeColor(item.type)} size="xs" className="w-20">
                      {item.type}
                    </Badge>
                    <div className="ml-2 flex-grow">
                      <div className="h-1.5 w-full bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            item.type === 'TRANSFER' ? 'bg-blue-500' :
                            item.type === 'SWAP' ? 'bg-purple-500' :
                            item.type === 'MINT' ? 'bg-green-500' :
                            item.type === 'BURN' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-2 text-xs text-dark-300 w-8 text-right">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Peak Transaction Hours */}
            <div>
              <h3 className="text-xs font-semibold text-dark-300 mb-2">Peak Activity Hours</h3>
              <div className="space-y-2">
                {timePatterns.peakHours.length > 0 ? (
                  timePatterns.peakHours.map((peak, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-xs text-dark-400">{peak.hourFormatted}</span>
                      <span className="text-xs font-medium text-blue-400">{peak.count} transactions</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-dark-400">No clear peak hours detected</div>
                )}
              </div>
            </div>
            
            {/* Network Effect */}
            <div>
              <h3 className="text-xs font-semibold text-dark-300 mb-2">Network Activity</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-dark-800/50 rounded p-2">
                  <span className="text-xs text-dark-400">Unique Addresses</span>
                  <p className="text-lg font-semibold text-primary-400">{networkMetrics.uniqueAddresses}</p>
                </div>
                <div className="bg-dark-800/50 rounded p-2">
                  <span className="text-xs text-dark-400">Most Active Address</span>
                  {networkMetrics.topAddress ? (
                    <div className="flex items-center mt-1">
                      <CopyToClipboard 
                        text={networkMetrics.topAddress}
                        displayText={`${networkMetrics.topAddress.slice(0, 4)}...${networkMetrics.topAddress.slice(-4)}`}
                        className="text-xs"
                      />
                      <span className="text-xs text-dark-400 ml-1">
                        ({networkMetrics.topAddressCount} tx)
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-dark-400">None detected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Whale Activity Tab */}
        {activeTab === 'whales' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-dark-300">Large Transaction Detection</h3>
              <div className="flex items-center">
                <span className="text-2xs text-dark-400 mr-1">Avg Tx Size:</span>
                <span className="text-xs font-medium text-dark-300">
                  {whaleActivity.averageAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            {whaleActivity.largeTransactions.length > 0 ? (
              <div className="space-y-2">
                {whaleActivity.largeTransactions.map((tx, index) => {
                  const blockTime = tx?.blockTime || tx?.block_time;
                  const timestamp = blockTime 
                    ? format(new Date(typeof blockTime === 'number' && blockTime > 1000000000 ? blockTime * 1000 : blockTime), 'MMM dd, HH:mm')
                    : 'Unknown';
                  const txType = tx?.txType || tx?.tx_type || 'Unknown';
                  const signature = tx?.signature || '';
                  
                  return (
                    <div key={index} className="bg-dark-800/30 border border-dark-700 rounded p-2">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <FireIcon className="h-4 w-4 text-orange-500 mr-1" />
                          <span className="text-sm font-medium text-white">
                            {tx.numericAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <Badge variant={getTransactionTypeColor(txType)}>
                          {txType}
                        </Badge>
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span className="text-dark-400">{timestamp}</span>
                        <div className="flex items-center">
                          <CopyToClipboard 
                            text={signature} 
                            displayText={signature 
                              ? `${signature.slice(0, 4)}...${signature.slice(-4)}` 
                              : 'Unknown'
                            }
                            className="text-xs"
                          />
                          {signature && (
                            <a
                              href={`https://explorer.solana.com/tx/${signature}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300 ml-1"
                            >
                              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-dark-400">
                No large transactions detected
              </div>
            )}
            
            <div>
              <h3 className="text-xs font-semibold text-dark-300 mb-2">Velocity Trend</h3>
              <div className="bg-dark-800/50 rounded p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-dark-400">
                    {velocityMetrics.txPerHour} tx/hour
                  </span>
                  <span className={`text-xs font-medium ${
                    velocityMetrics.trend === 'increasing' ? 'text-green-400' :
                    velocityMetrics.trend === 'decreasing' ? 'text-red-400' :
                    'text-blue-400'
                  }`}>
                    {velocityMetrics.trend === 'increasing' ? (
                      <span className="flex items-center">
                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        Increasing
                      </span>
                    ) : velocityMetrics.trend === 'decreasing' ? (
                      <span className="flex items-center">
                        <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                        Decreasing
                      </span>
                    ) : (
                      'Stable'
                    )}
                  </span>
                </div>
                <div className="mt-1 text-2xs text-dark-400">
                  Recent: {velocityMetrics.recentTxCount} tx | Earlier: {velocityMetrics.olderTxCount} tx
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            <div className="overflow-x-auto rounded-md border border-dark-700 bg-dark-900/30">
              <table className="min-w-full divide-y divide-dark-800">
                <thead className="bg-dark-800/50">
                  <tr>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-dark-400 tracking-wider">
                      Time
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-dark-400 tracking-wider">
                      Tx ID
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-dark-400 tracking-wider">
                      Type
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-dark-400 tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {currentItems.map((tx, index) => {
                    // Extract fields safely
                    const signature = tx?.signature || '';
                    const blockTime = tx?.blockTime || tx?.block_time || null;
                    const txType = tx?.txType || tx?.tx_type || 'Unknown';
                    const amount = tx?.amount;
                    
                    return (
                      <tr key={signature || index} className="hover:bg-dark-800/50">
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-dark-300">
                          {blockTime 
                            ? format(new Date(typeof blockTime === 'number' && blockTime > 1000000000 ? blockTime * 1000 : blockTime), 'HH:mm')
                            : 'Unknown'}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                          <div className="flex items-center space-x-1">
                            <CopyToClipboard 
                              text={signature} 
                              displayText={signature 
                                ? `${signature.slice(0, 4)}...${signature.slice(-2)}` 
                                : 'Unknown'
                              }
                              className="text-xs"
                            />
                            {signature && (
                              <a
                                href={`https://explorer.solana.com/tx/${signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:text-primary-300"
                              >
                                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                          <Badge variant={getTransactionTypeColor(txType)} size="xs">
                            {txType}
                          </Badge>
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs text-dark-200">
                          {amount !== undefined 
                            ? Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : 'Unknown'
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination for transactions table */}
            {totalPages > 1 && (
              <div className="mt-2 flex justify-between items-center">
                <div className="text-xs text-dark-400">
                  {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, transactions.length)} of {transactions.length}
                </div>
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  size="small"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Last updated timestamp */}
      <div className="mt-2 text-right text-xs text-dark-500">
        Updated: {new Date().toLocaleTimeString()}
      </div>
    </Card>
  );
};

export default TokenTransactionAnalytics;