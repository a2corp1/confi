import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Fish, 
  Anchor, 
  TrendingUp, 
  PieChart,
  DollarSign,
  AlertCircle
} from 'lucide-react';

// Category Icons
const getCategoryIcon = (category) => {
  const iconMap = {
    'Whale': Fish,
    'Shark': Fish,
    'Dolphin': Fish,
    'Octopus': Fish,
    'Fish': Fish,
    'Small Fish': Fish,
    'Shrimp': Fish
  };
  return iconMap[category] || Fish;
};

// Category Colors
const getCategoryColor = (category) => {
  const colorMap = {
    'Whale': 'bg-purple-600',
    'Shark': 'bg-blue-600',
    'Dolphin': 'bg-teal-600',
    'Octopus': 'bg-green-600',
    'Fish': 'bg-yellow-600',
    'Small Fish': 'bg-orange-600',
    'Shrimp': 'bg-red-600'
  };
  return colorMap[category] || 'bg-gray-600';
};

// Format dollar value with appropriate units
const formatDollarValue = (amount) => {
  if (!amount && amount !== 0) return '$0';
  if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
};

// Extract token address from URL with pattern /token/{address}/holders
const extractTokenAddressFromUrl = () => {
  const pathname = window.location.pathname;
  const match = pathname.match(/\/token\/([\w\d]+)\/holders/);
  return match ? match[1] : null;
};

const HolderBreakdownCard = ({ 
  data, 
  isLoading, 
  isError, 
  refetch,
  tokenAddress: propTokenAddress // Get token address from props directly
}) => {
  // Try multiple ways to get the token address
  const urlTokenAddress = extractTokenAddressFromUrl();
  const tokenAddress = propTokenAddress || (data && data.tokenAddress) || urlTokenAddress;
  
  const [marketCap, setMarketCap] = useState(0);
  const [isMarketCapLoading, setIsMarketCapLoading] = useState(false);
  const [marketCapError, setMarketCapError] = useState(null);

  // Define holder categories with percentage thresholds
  const holderCategories = [
    { name: 'Whale', percent: 5.0 },
    { name: 'Shark', percent: 1 },
    { name: 'Dolphin', percent: 0.1 },
    { name: 'Octopus', percent: 0.01 },
    { name: 'Fish', percent: 0.001 },
    { name: 'Small Fish', percent: 0.0001 },
    { name: 'Shrimp', percent: 0.00001 }
  ];

  // Fetch market cap directly from GeckoTerminal API
  useEffect(() => {
    const fetchMarketCap = async () => {
      if (!tokenAddress) return;

      setIsMarketCapLoading(true);
      setMarketCapError(null);

      try {
        const response = await axios.get(
          `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${tokenAddress}`,
          {
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            timeout: 15000
          }
        );
        
        const attributes = response.data?.data?.attributes;
        
        if (!attributes) {
          throw new Error('Invalid response structure from GeckoTerminal API');
        }
        
        // Try to get market cap - first try fdv_usd, then mcap_usd
        let marketCapValue = 0;
        
        if (attributes.fdv_usd) {
          marketCapValue = parseFloat(attributes.fdv_usd);
        } else if (attributes.market_cap_usd) {
          marketCapValue = parseFloat(attributes.market_cap_usd);
        } else if (attributes.price_usd && attributes.total_supply) {
          // Calculate market cap if not directly provided
          marketCapValue = parseFloat(attributes.price_usd) * parseFloat(attributes.total_supply);
        }
        
        setMarketCap(marketCapValue);
      } catch (error) {
        setMarketCapError(error.message);
        setMarketCap(0);
      } finally {
        setIsMarketCapLoading(false);
      }
    };

    fetchMarketCap();
  }, [tokenAddress]);

  // Loading state
  if (isLoading || isMarketCapLoading) {
    return (
      <div className="bg-dark-900 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-dark-700 rounded w-2/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-dark-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-dark-700 rounded w-3/4"></div>
                <div className="h-2 bg-dark-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-dark-900 rounded-lg p-6 text-center">
        <h3 className="text-red-500 text-lg mb-4">Failed to Load Holder Analytics</h3>
        <button 
          onClick={refetch} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const { 
    totalHolders = 0, 
    concentration = 0, 
    concentrationLevel = 'Unknown',
    giniCoefficient = 0,
    breakdown = []
  } = data || {};

  // Check if we have valid market cap data
  const hasValidMarketCap = marketCap > 0;

  return (
    <div className="bg-dark-900 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center">
          <PieChart className="mr-2 text-blue-500" size={24} />
          Holder Distribution
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-green-500" size={18} />
            <span className="text-sm text-dark-200">
              {totalHolders.toLocaleString()} Holders
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="text-green-500" size={18} />
            <span className="text-sm text-dark-200">
              Market Cap: {formatDollarValue(marketCap)}
            </span>
          </div>
        </div>
      </div>

      {!hasValidMarketCap && (
        <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3 text-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-yellow-500 flex-shrink-0" size={16} />
            <span className="text-yellow-400">
              Market cap data is unavailable. Dollar values may not be accurate.
            </span>
          </div>
        </div>
      )}

      <div className="bg-dark-800 rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-dark-300">Concentration Level</span>
          <span className={`text-sm font-bold ${
            concentrationLevel === 'Low' ? 'text-green-500' : 
            concentrationLevel === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}
          >
            {concentrationLevel}
          </span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-2">
          <div 
            className="h-2 bg-blue-600 rounded-full" 
            style={{ width: `${concentration * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-dark-400">
          Gini Coefficient: {giniCoefficient.toFixed(4)}
        </p>
      </div>

      {/* Display holder categories with dollar values */}
      <div className="space-y-4">
        {holderCategories.map((category) => {
          const CategoryIcon = getCategoryIcon(category.name);
          const categoryColor = getCategoryColor(category.name);
          
          // Calculate dollar value from percentage of market cap
          const dollarValue = marketCap * (category.percent / 100);
          
          // Find matching category from the breakdown data
          const matchingCategory = breakdown.find(item => 
            item.category === category.name
          ) || { count: 0, percentage: 0 };
          
          return (
            <div key={category.name} className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${categoryColor} bg-opacity-20`}>
                <CategoryIcon className={`${categoryColor.replace('bg-', 'text-')} opacity-80`} size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-sm font-medium text-dark-300">
                      {category.name}
                    </span>
                    <div className="text-xs text-dark-400 mt-0.5">
                      {formatDollarValue(dollarValue)}+ ({category.percent}% of market cap)
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-dark-200">
                      {matchingCategory.count.toLocaleString()} holders
                    </span>
                    <div className="text-xs text-dark-400 mt-0.5">
                      {matchingCategory.percentage.toFixed(2)}% of total supply
                    </div>
                  </div>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${categoryColor}`} 
                    style={{ width: `${Math.min(100, matchingCategory.percentage)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HolderBreakdownCard;