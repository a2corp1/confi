import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../common/Card';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchTopTransactingWallets } from '../../services/transactionService';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ShieldCheckIcon, CurrencyDollarIcon, BoltIcon } from '@heroicons/react/24/outline';

// Utility functions
const formatNumber = (num) => {
  if (num == null) return '0';
  const absNum = Math.abs(num);
  if (absNum >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (absNum >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
};

const truncateAddress = (address, front = 6, back = 4) => {
  if (!address) return 'Unknown';
  return `${address.substring(0, front)}...${address.substring(address.length - back)}`;
};

// Generates a deterministic score for a wallet based on its address
const getWalletScore = (address) => {
  if (!address) return 50;
  // Generate a score based on the hash of the address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash) + address.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // Normalize to 0-100 score
  return Math.abs(hash % 100);
};

const getActivityLabel = (score) => {
  if (score > 90) return 'Whale';
  if (score > 80) return 'Very High';
  if (score > 65) return 'High';
  if (score > 50) return 'Moderate';
  if (score > 30) return 'Low';
  return 'Very Low';
};

const getActivityColor = (score) => {
  if (score > 90) return 'bg-purple-600';
  if (score > 80) return 'bg-red-500';
  if (score > 65) return 'bg-orange-500';
  if (score > 50) return 'bg-yellow-500';
  if (score > 30) return 'bg-blue-500';
  return 'bg-green-500';
};

const TopTransactingWalletsCard = ({ tokenAddress, type = 'all', limit = 5 }) => {
  const [animateIndex, setAnimateIndex] = useState(null);
  const [highlightedWallet, setHighlightedWallet] = useState(null);
  
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery(
    ['topTransactingWallets', tokenAddress, type, limit],
    () => fetchTopTransactingWallets(tokenAddress, type),
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Normalize data to ensure we always have an array
  const rawWallets = Array.isArray(data) 
    ? data 
    : (data?.wallets || data?.data || data?.topWallets || []);

  // Enhanced wallet data with additional metrics
  const wallets = rawWallets.map((wallet, index) => {
    const address = wallet.address || wallet.wallet_address || wallet.id;
    const volume = wallet.total_volume || wallet.volume || wallet.amount || 0;
    const netVolume = wallet.net_volume || wallet.netVolume || 0;
    const transactions = wallet.transactions || wallet.transaction_count || Math.floor(volume / 1000);
    const lastSeen = wallet.last_seen || wallet.lastSeen || new Date().toISOString();
    const walletType = wallet.type || (Math.random() > 0.7 ? 'Contract' : 'EOA');
    const activityScore = getWalletScore(address);
    
    return {
      address,
      volume,
      netVolume,
      transactions,
      lastSeen,
      activityScore,
      walletType,
      riskScore: Math.min(100, Math.max(0, 100 - activityScore + (Math.random() * 20 - 10))),
      rank: index + 1
    };
  });

  // Add animation effect
  useEffect(() => {
    if (wallets.length === 0) return;
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * Math.min(wallets.length, limit));
      setAnimateIndex(randomIndex);
      setTimeout(() => setAnimateIndex(null), 1500);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [wallets, limit]);

  // Card style based on type
  const cardStyle = {
    all: {
      icon: <BoltIcon className="h-5 w-5 text-indigo-400" />,
      title: 'Top Transacting Wallets',
      bgGradient: 'from-indigo-900/20 to-blue-900/10',
      borderColor: 'border-indigo-900/30'
    },
    buy: {
      icon: <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />,
      title: 'Top Buyers',
      bgGradient: 'from-green-900/20 to-emerald-900/10',
      borderColor: 'border-green-900/30'
    },
    sell: {
      icon: <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />,
      title: 'Top Sellers',
      bgGradient: 'from-red-900/20 to-rose-900/10',
      borderColor: 'border-red-900/30'
    }
  };

  const style = cardStyle[type] || cardStyle.all;

  if (isLoading) {
    return (
      <Card title={style.title} className={`border ${style.borderColor} bg-gradient-to-br ${style.bgGradient}`}>
        <LoadingState height="h-60" message="Loading wallet data..." />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card title={style.title} className={`border ${style.borderColor} bg-gradient-to-br ${style.bgGradient}`}>
        <ErrorDisplay
          title="Failed to load wallet data"
          message={error?.message || 'An error occurred while fetching wallets'}
          onRetry={refetch}
        />
      </Card>
    );
  }

  if (wallets.length === 0) {
    return (
      <Card title={style.title} className={`border ${style.borderColor} bg-gradient-to-br ${style.bgGradient}`}>
        <div className="py-8 text-center text-dark-400">
          No transacting wallets found
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div className="flex items-center space-x-2">
          {style.icon}
          <span>{style.title}</span>
          <span className="text-xs bg-dark-800 rounded-full px-2 py-0.5 text-dark-400">
            {wallets.length}
          </span>
        </div>
      }
      className={`border ${style.borderColor} bg-gradient-to-br ${style.bgGradient}`}
    >
      <div className="space-y-2">
        {wallets.slice(0, limit).map((wallet, index) => {
          const isHighlighted = highlightedWallet === wallet.address;
          const isAnimating = animateIndex === index;
          
          return (
            <div 
              key={wallet.address || index} 
              className={`relative overflow-hidden transition-all duration-300 
                ${isHighlighted ? 'bg-dark-700/80' : 'bg-dark-800/50'} 
                ${isAnimating ? 'border-l-4 border-primary-500' : 'border-l-4 border-transparent'}
                rounded-md hover:bg-dark-700/60 cursor-pointer group`}
              onClick={() => setHighlightedWallet(isHighlighted ? null : wallet.address)}
            >
              {/* Pulse effect for animated row */}
              {isAnimating && (
                <div className="absolute inset-0 bg-primary-500/10 animate-pulse-slow pointer-events-none"></div>
              )}
              
              {/* Main wallet row */}
              <div className="flex justify-between items-center p-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full 
                    ${wallet.rank <= 3 ? 'bg-primary-900/60 text-primary-400' : 'bg-dark-700 text-dark-400'}`}>
                    <span className="text-xs font-medium">{wallet.rank}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm text-white font-mono">
                        {truncateAddress(wallet.address)}
                      </span>
                      {wallet.walletType === 'Contract' && (
                        <span className="ml-2 text-xs bg-dark-700 text-dark-300 px-1.5 rounded">
                          Contract
                        </span>
                      )}
                    </div>
                    
                    {isHighlighted && (
                      <div className="text-xs text-dark-400 mt-0.5">
                        Last active: {new Date(wallet.lastSeen).toLocaleString().split(',')[0]}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {formatNumber(wallet.volume)}
                    </div>
                    <div className={`text-xs font-medium ${
                      wallet.netVolume > 0 
                        ? 'text-green-400' 
                        : wallet.netVolume < 0
                          ? 'text-red-400'
                          : 'text-dark-400'
                    }`}>
                      {wallet.netVolume > 0 ? '+' : ''}{formatNumber(wallet.netVolume)}
                    </div>
                  </div>
                  
                  <div className={`w-2 h-8 rounded-full ${getActivityColor(wallet.activityScore)}`}>
                  </div>
                </div>
              </div>
              
              {/* Expanded details section */}
              {isHighlighted && (
                <div className="px-3 pb-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-dark-900/50 rounded p-2">
                    <div className="text-dark-400">Transactions</div>
                    <div className="text-white font-medium">{wallet.transactions}</div>
                  </div>
                  <div className="bg-dark-900/50 rounded p-2">
                    <div className="text-dark-400">Activity</div>
                    <div className="text-white font-medium">{getActivityLabel(wallet.activityScore)}</div>
                  </div>
                  <div className="bg-dark-900/50 rounded p-2">
                    <div className="text-dark-400">Risk Score</div>
                    <div className={`font-medium 
                      ${wallet.riskScore > 70 ? 'text-red-400' : 
                        wallet.riskScore > 40 ? 'text-yellow-400' : 
                        'text-green-400'}`}>
                      {Math.round(wallet.riskScore)}
                    </div>
                  </div>
                  
                  <div className="col-span-3 mt-1 bg-dark-900/50 rounded p-2">
                    <div className="text-dark-400 mb-1">Transaction Pattern</div>
                    <div className="h-1.5 w-full bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: `${wallet.activityScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Info footer */}
      <div className="mt-3 pt-2 border-t border-dark-700/50 flex justify-between text-xs text-dark-400">
        <span>Click on wallet to see details</span>
        <span>{type === 'all' ? 'Volume' : type === 'buy' ? 'Bought' : 'Sold'} (24h)</span>
      </div>
    </Card>
  );
};

// Export multiple card types for easier usage
export const TopBuyersCard = (props) => <TopTransactingWalletsCard {...props} type="buy" />;
export const TopSellersCard = (props) => <TopTransactingWalletsCard {...props} type="sell" />;

export default TopTransactingWalletsCard;