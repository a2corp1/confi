import { useParams } from 'react-router-dom';
import TokenInfo from '../components/token/TokenInfo';
import TokenStats from '../components/token/TokenStats';
import TokenHoldersList from '../components/token/TokenHoldersList'; // Your existing holder list component
import TokenHolderProcessingButton from '../components/token/TokenHolderProcessingButton'; // New component
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { processTopHolderTransactions } from '../services/transactionService';

const TokenDetailPage = () => {
  const { tokenAddress } = useParams();
  const queryClient = useQueryClient();
  
  // Auto-trigger holder processing when visiting the page for the first time
  useEffect(() => {
    // Check if we've already processed this token
    const autoProcessData = async () => {
      try {
        // Get the status
        const statusData = await queryClient.fetchQuery(
          ['processingStatus', tokenAddress], 
          () => checkHolderProcessingStatus(tokenAddress)
        );
        
        // If it's never been processed, or hasn't been processed in the last 24 hours, process it
        if (!statusData.lastProcessed || 
            new Date(statusData.lastProcessed) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          console.log('Auto-triggering holder transaction processing');
          // Silently process in background
          processTopHolderTransactions(tokenAddress).catch(err => {
            console.warn('Failed to auto-process holder transactions:', err);
          });
        }
      } catch (error) {
        console.warn('Error checking processing status, skipping auto-processing:', error);
      }
    };
    
    if (tokenAddress) {
      autoProcessData();
    }
  }, [tokenAddress, queryClient]);

  if (!tokenAddress) {
    return <div>Token address is required</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Token Information */}
      <section className="mb-8">
        <TokenInfo tokenAddress={tokenAddress} />
      </section>
      
      {/* Token Stats */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Token Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TokenStats tokenAddress={tokenAddress} />
        </div>
      </section>
      
      {/* Transaction Processing Button */}
      <section className="mb-8">
        <div className="grid grid-cols-1 gap-4">
          <TokenHolderProcessingButton tokenAddress={tokenAddress} />
        </div>
      </section>
      
      {/* Top Holders */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Top Token Holders</h2>
        <TokenHoldersList tokenAddress={tokenAddress} />
      </section>
      
      {/* Additional sections for transaction data, charts, etc. */}
    </div>
  );
};

export default TokenDetailPage;