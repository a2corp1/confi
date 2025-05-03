import { useParams } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

// 🔀 Lazy load heavy components
const TransactionFlowGraph = lazy(() => import('../components/flow/TransactionFlowGraph'));
const P2PTransfersTable = lazy(() => import('../components/flow/P2PTransfersTable'));
const VolumeTimeChart = lazy(() => import('../components/flow/VolumeTimeChart'));
const TopTransactingWalletsCard = lazy(() => import('../components/flow/TopTransactingWalletsCard'));
const TokenPriceVolumeChart = lazy(() => import('../components/token/TokenPriceVolumeChart'));

const TransactionFlowPage = () => {
  const { tokenAddress } = useParams();
  const [key, setKey] = useState(0);
  
  // Force re-render when tokenAddress changes
  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [tokenAddress]);

  return (
    <DashboardLayout tokenAddress={tokenAddress}>
      <div className="space-y-6" key={key}>
        <Suspense fallback={<div className="p-4 bg-dark-800 rounded-lg min-h-[300px] flex items-center justify-center">Loading Transaction Flow Graph...</div>}>
          <TransactionFlowGraph tokenAddress={tokenAddress} />
        </Suspense>

        <Suspense fallback={<div className="p-4 bg-dark-800 rounded-lg min-h-[200px] flex items-center justify-center">Loading Token Price & Volume...</div>}>
          <TokenPriceVolumeChart tokenAddress={tokenAddress} />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Suspense fallback={<div className="p-4 bg-dark-800 rounded-lg min-h-[200px] flex items-center justify-center">Loading Wallet Cards...</div>}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 col-span-3">
              <TopTransactingWalletsCard tokenAddress={tokenAddress} type="all" limit={5} />
              <TopTransactingWalletsCard tokenAddress={tokenAddress} type="inflow" limit={5} />
              <TopTransactingWalletsCard tokenAddress={tokenAddress} type="outflow" limit={5} />
            </div>
          </Suspense>
        </div>

        <Suspense fallback={<div className="p-4 bg-dark-800 rounded-lg min-h-[300px] flex items-center justify-center">Loading Transfers Table...</div>}>
          <P2PTransfersTable tokenAddress={tokenAddress} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
};

export default TransactionFlowPage;