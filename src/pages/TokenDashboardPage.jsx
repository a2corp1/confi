import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TokenDistributionChart from '../components/token/TokenDistributionChart';
import TopHoldersTable from '../components/token/TopHoldersTable';
import TopHoldersPieChart from '../components/token/TopHoldersPieChart';
import TokenTransactionsTable from '../components/token/TokenTransactionsTable';
import TokenPriceVolumeChart from '../components/token/TokenPriceVolumeChart';
import DashboardLayout from '../layouts/DashboardLayout';
import { loadAllTokenData } from '../services/tokenService'; // Using the new function

const TokenDashboardPage = () => {
  const { tokenAddress } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState(null);

  useEffect(() => {
    // Reset on token address change
    setLoading(true);
    setError(null);
    
    const loadData = async () => {
      try {
        // Use the new service function
        const data = await loadAllTokenData(tokenAddress);
        setTokenData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading token data:", err);
        setError(err.message || "Failed to load token data");
        setLoading(false);
      }
    };
    
    loadData();
  }, [tokenAddress]);
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-900 bg-opacity-80 z-50">
        <div className="text-center bg-dark-800 p-8 rounded-lg shadow-xl max-w-md">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-medium mb-2">Loading Token Data</h3>
          <p className="text-gray-400">Please wait while we fetch the latest data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-800/30 text-red-300 p-6 rounded-lg max-w-lg">
          <h3 className="text-xl font-medium mb-3">Error Loading Data</h3>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-800/30 hover:bg-red-800/50 rounded-md text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Only render when we have data
  return (
    <DashboardLayout tokenAddress={tokenAddress} tokenData={tokenData?.tokenInfo}>
      <div className="space-y-6">
        <TokenDistributionChart tokenAddress={tokenAddress} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopHoldersPieChart tokenAddress={tokenAddress} initialData={tokenData?.holders} />
          <TopHoldersTable tokenAddress={tokenAddress} initialData={tokenData?.holders} limit={10} />
        </div>
        <TokenTransactionsTable tokenAddress={tokenAddress} limit={10} />
      </div>
    </DashboardLayout>
  );
};

export default TokenDashboardPage;