// src/layouts/DashboardLayout.js - Updated with loading state handling

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChartPieIcon, 
  ArrowsRightLeftIcon, 
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import TokenInfo from '../components/token/TokenInfo';
import TokenStats from '../components/token/TokenStats';
import TokenScannerTerminal from '../components/token/TokenScannerTerminal';
import { processTopHolderTransactions } from '../services/transactionService';
import { startTokenDataRefresh, stopTokenDataRefresh } from '../services/tokenStore';
import { fetchTokenInfo } from '../services/tokenService';
import LoadingState from '../components/common/LoadingState';

const DashboardLayout = ({ children, tokenAddress }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessingTriggered, setIsProcessingTriggered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch token data on initial load
  useEffect(() => {
    if (tokenAddress) {
      setIsLoading(true);
      setError(null);
      
      fetchTokenInfo(tokenAddress, true) // Explicitly request waiting for data
        .then(data => {
          setTokenData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error loading token data:', err);
          setError(err.message || 'Failed to load token data');
          setIsLoading(false);
        });
    }
  }, [tokenAddress]);

  // Auto-trigger transaction processing once when dashboard is first loaded
  useEffect(() => {
    const triggerProcessingOnce = async () => {
      if (tokenAddress && !isProcessingTriggered && !isLoading) {
        try {
          console.log('Auto-triggering holder transaction processing');
          await processTopHolderTransactions(tokenAddress);
          setIsProcessingTriggered(true);
        } catch (error) {
          console.warn('Failed to auto-process holder transactions:', error);
        }
      }
    };
    
    if (!isLoading && tokenData) {
      triggerProcessingOnce();
    }
  }, [tokenAddress, isProcessingTriggered, isLoading, tokenData]);

  // Start token data refresh - this now handles both token info and market data
  useEffect(() => {
    if (tokenAddress && !isLoading) {
      console.log('Starting token data refresh for', tokenAddress);
      // Start data refresh on component mount (refresh every 5 minutes)
      const cleanupRefresh = startTokenDataRefresh(tokenAddress, 5);
      
      // Clean up when component unmounts
      return () => {
        console.log('Stopping token data refresh');
        cleanupRefresh();
      };
    }
  }, [tokenAddress, isLoading]);

  // Navigation tabs
  const tabs = [
    {
      name: 'Overview',
      href: `/token/${tokenAddress}`,
      icon: <ChartPieIcon className="w-5 h-5" />,
      current: location.pathname === `/token/${tokenAddress}`
    },
    {
      name: 'Holders',
      href: `/token/${tokenAddress}/holders`,
      icon: <UsersIcon className="w-5 h-5" />,
      current: location.pathname === `/token/${tokenAddress}/holders`
    },
    {
      name: 'Transactions',
      href: `/token/${tokenAddress}/transactions`,
      icon: <ArrowsRightLeftIcon className="w-5 h-5" />,
      current: location.pathname === `/token/${tokenAddress}/transactions`
    },
  ];

  if (!tokenAddress) {
    return <div>Token address is required</div>;
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-dark-900 rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-dark-800 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-dark-800 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-dark-800 rounded w-1/2"></div>
        </div>
        <LoadingState height="h-96" message="Loading token data..." />
      </div>
    );
  }

  // Show error state if there was an error
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-900/20 border border-red-800/30 text-red-300 px-4 py-6 rounded-md">
          <h3 className="text-xl font-medium mb-2">Error Loading Token Data</h3>
          <p className="mb-4">{error}</p>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-800/30 hover:bg-red-800/50 rounded-md text-sm font-medium"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-2 bg-dark-800/50 hover:bg-dark-800 rounded-md text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Token Info Section */}
      <div className="mb-6">
        <TokenInfo tokenAddress={tokenAddress} tokenData={tokenData} />
      </div>
      
      {/* Token Stats Section */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TokenStats tokenAddress={tokenAddress} tokenData={tokenData} />
        </div>
      </div>
      
      {/* Holder Transaction Processing Button */}
      <div className="mb-6">
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-dark-700 mb-6">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.href}
              className={`
                flex items-center pb-4 text-sm font-medium whitespace-nowrap
                ${tab.current 
                  ? 'border-b-2 border-primary-500 text-primary-400' 
                  : 'text-dark-400 hover:text-dark-300 hover:border-b-2 hover:border-dark-700'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="pb-12">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;