import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLoadingWrapper from '../layouts/DashboardLoadingWrapper';
import TokenOverview from '../components/token/TokenOverview';
import HolderDistribution from '../components/token/HolderDistribution';
import PriceChart from '../components/token/PriceChart';
import RecentTransactions from '../components/token/RecentTransactions';
import { fetchTokenInfo, fetchTopHolders, fetchHolderAnalytics } from '../services/tokenService';
import { fetchTopHolderActivity } from '../services/tokenWalletActivityService';
import { fetchTokenTransactions } from '../services/transactionService';

const TokenPage = () => {
  const { tokenAddress } = useParams();

  // Fetch token data in the background
  // These queries will run but the UI will still show loading for 30-45 seconds
  // because of the DashboardLoadingWrapper
  
  useEffect(() => {
    // Start multiple API calls in parallel to simulate background loading
    const loadDataInBackground = async () => {
      try {
        await Promise.allSettled([
          fetchTokenInfo(tokenAddress),
          fetchTopHolders(tokenAddress),
          fetchHolderAnalytics(tokenAddress),
          fetchTopHolderActivity(tokenAddress, 20, '24h'),
          fetchTokenTransactions(tokenAddress)
        ]);
      } catch (error) {
        console.error('Error with background API calls:', error);
      }
    };
    
    if (tokenAddress) {
      loadDataInBackground();
    }
  }, [tokenAddress]);

  // Main token info query (will still run after the loading screen)
  const { data: tokenInfo } = useQuery(
    ['tokenInfo', tokenAddress],
    () => fetchTokenInfo(tokenAddress),
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );

  return (
    <DashboardLoadingWrapper tokenAddress={tokenAddress}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (wider) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Token Overview Card */}
          <TokenOverview tokenAddress={tokenAddress} />
          
          {/* Price Chart */}
          <PriceChart tokenAddress={tokenAddress} />
          
          {/* Recent Transactions */}
          <RecentTransactions tokenAddress={tokenAddress} />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Holder Distribution */}
          <HolderDistribution tokenAddress={tokenAddress} />
          
          {/* Other components */}
          {/* You can add more components here */}
        </div>
      </div>
    </DashboardLoadingWrapper>
  );
};

export default TokenPage;