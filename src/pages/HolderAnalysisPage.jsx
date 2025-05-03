import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import TokenDistributionChart from '../components/token/TokenDistributionChart';
import TopHoldersTable from '../components/token/TopHoldersTable';
import TopHoldersPieChart from '../components/token/TopHoldersPieChart';
import HolderBreakdownCard from '../components/token/HolderBreakdownCard'; // Import the new component
import DashboardLayout from '../layouts/DashboardLayout';
import { fetchHolderAnalytics } from '../services/tokenService';
import Card from '../components/common/Card';
import LoadingState from '../components/common/LoadingState';
import ErrorDisplay from '../components/common/ErrorDisplay';
import Navbar from '../components/navigation/Navbar';
const HolderAnalysisPage = () => {
  const { tokenAddress } = useParams();
  
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['holderAnalytics', tokenAddress],
    () => fetchHolderAnalytics(tokenAddress),
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return (

      <>
        <Navbar />
    
        <DashboardLayout tokenAddress={tokenAddress}>
          <div className="space-y-6">
            {/* Distribution Chart */}
            <TokenDistributionChart tokenAddress={tokenAddress} />
    
            {/* Distribution Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isLoading ? (
                [...Array(3)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="p-4">
                      <div className="h-4 bg-dark-800 rounded w-24 mb-2"></div>
                      <div className="h-6 bg-dark-800 rounded w-16 mb-4"></div>
                      <div className="h-3 bg-dark-800 rounded w-full mb-1"></div>
                      <div className="h-3 bg-dark-800 rounded w-2/3"></div>
                    </div>
                  </Card>
                ))
              ) : isError ? (
                <div className="col-span-3">
                  <ErrorDisplay
                    title="Failed to load holder analytics"
                    message={error?.message || 'An error occurred while fetching holder data'}
                    onRetry={refetch}
                  />
                </div>
              ) : (
                <>
                  <Card>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-dark-400">Concentration</h3>
                      <p className="text-2xl font-semibold text-white mt-1">
                        {data?.concentration?.top10Percentage?.toFixed(2)}%
                      </p>
                      <p className="text-xs text-dark-400 mt-2">
                        {data?.concentrationLevel === 'high' 
                          ? 'High concentration among top holders'
                          : data?.concentrationLevel === 'medium'
                          ? 'Moderate concentration of tokens'
                          : 'Well distributed token supply'}
                      </p>
                    </div>
                  </Card>
    
                  <Card>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-dark-400">Distribution Trend</h3>
                      <p className="text-2xl font-semibold text-white mt-1">
                        {data?.distributionTrend === 'accumulating' 
                          ? 'Accumulating ↑'
                          : data?.distributionTrend === 'distributing'
                          ? 'Distributing ↓'
                          : 'Neutral →'}
                      </p>
                      <p className="text-xs text-dark-400 mt-2">
                        {data?.distributionTrend === 'accumulating' 
                          ? 'Top holders are increasing their positions'
                          : data?.distributionTrend === 'distributing'
                          ? 'Top holders are reducing their positions'
                          : 'No significant change in holder distribution'}
                      </p>
                    </div>
                  </Card>
    
                  <Card>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-dark-400">Total Holders</h3>
                      <p className="text-2xl font-semibold text-white mt-1">
                        {data?.totalHolders?.toLocaleString() || 'Unknown'}
                      </p>
                      <p className="text-xs text-dark-400 mt-2">
                        {data?.holderChange > 0
                          ? `+${data.holderChange.toFixed(2)}% in last 7 days`
                          : data?.holderChange < 0
                          ? `${data.holderChange.toFixed(2)}% in last 7 days`
                          : 'No change in holder count'}
                      </p>
                    </div>
                  </Card>
                </>
              )}
            </div>
    
            {/* Distribution Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopHoldersPieChart tokenAddress={tokenAddress} />
              <HolderBreakdownCard 
                data={data} 
                isLoading={isLoading} 
                isError={isError} 
                refetch={refetch} 
              />
            </div>
    
            {/* Top Holders Table */}
            <TopHoldersTable tokenAddress={tokenAddress} limit={20} />
          </div>
        </DashboardLayout>
      </>
    );
  }
export default HolderAnalysisPage;