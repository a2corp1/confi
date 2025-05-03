import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../common/Card';
import Badge from '../common/Badge';
import CopyToClipboard from '../common/CopyToClipboard';
import Pagination from '../common/Pagination';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchP2PTransfers } from '../../services/transactionService';

const P2PTransfersTable = ({ tokenAddress }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [excludeDexes, setExcludeDexes] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const { data: responseData, isLoading, isError, error, refetch } = useQuery(
    ['p2pTransfers', tokenAddress, excludeDexes],
    () => fetchP2PTransfers(tokenAddress, excludeDexes),
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  );
  
  // Debug logging
  useEffect(() => {
    if (responseData) {
      console.log('P2P Transfers API Response:', responseData);
      setDebugInfo({
        type: typeof responseData,
        isArray: Array.isArray(responseData),
        hasP2PTransfersProperty: responseData && 'p2pTransfers' in responseData,
        keys: responseData ? Object.keys(responseData) : [],
        value: JSON.stringify(responseData).substring(0, 500) + '...'
      });
    }
  }, [responseData]);
  
  // Safely extract transfers
  let transfers = [];
  try {
    if (responseData) {
      if (Array.isArray(responseData)) {
        transfers = responseData;
      } else if (responseData.p2pTransfers && Array.isArray(responseData.p2pTransfers)) {
        transfers = responseData.p2pTransfers;
      } else if (typeof responseData === 'object') {
        // Try to find an array property
        const arrayProps = Object.keys(responseData).filter(key => 
          Array.isArray(responseData[key])
        );
        if (arrayProps.length > 0) {
          transfers = responseData[arrayProps[0]];
        }
      }
    }
  } catch (err) {
    console.error('Error extracting P2P transfers:', err);
  }
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(transfers) 
    ? transfers.slice(indexOfFirstItem, indexOfLastItem) 
    : [];
  const totalPages = Array.isArray(transfers) 
    ? Math.ceil(transfers.length / itemsPerPage) 
    : 0;
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleDexExclusion = () => {
    setExcludeDexes(!excludeDexes);
    setCurrentPage(1); // Reset to first page
  };

  if (isLoading) {
    return (
      <Card title="P2P Transfers">
        <LoadingState height="h-64" message="Loading P2P transfer data..." />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card title="P2P Transfers">
        <ErrorDisplay
          title="Failed to load P2P transfer data"
          message={error?.message || 'An error occurred while fetching P2P transfer data'}
          onRetry={refetch}
        />
      </Card>
    );
  }

  if (!Array.isArray(transfers) || transfers.length === 0) {
    return (
      <Card title="P2P Transfers">
        <div className="py-8 text-center text-dark-400">
          {debugInfo ? (
            <div className="text-left p-4 bg-dark-800 rounded overflow-auto text-xs">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <p>Response Type: {debugInfo.type}</p>
              <p>Is Array: {debugInfo.isArray.toString()}</p>
              <p>Has P2PTransfers: {debugInfo.hasP2PTransfersProperty.toString()}</p>
              <p>Keys: {debugInfo.keys.join(', ')}</p>
              <p>Value: {debugInfo.value}</p>
            </div>
          ) : 'No P2P transfer data available'}
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="P2P Transfers" 
      subtitle="Direct wallet-to-wallet transfers excluding DEX transactions"
    >
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-dark-400">
          {excludeDexes ? 'Showing direct P2P transfers only' : 'Showing all transfers including DEX transactions'}
        </div>
        <button
          onClick={toggleDexExclusion}
          className="btn-outline text-xs px-3 py-1.5"
        >
          {excludeDexes ? 'Include DEX Transactions' : 'Exclude DEX Transactions'}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-800">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                From
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                To
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {currentItems.map((transfer, index) => {
              // Safely extract properties
              const signature = transfer?.signature || '';
              const fromAddress = transfer?.fromAddress || transfer?.from_address || '';
              const toAddress = transfer?.toAddress || transfer?.to_address || '';
              const amount = transfer?.amount;
              const isDexTransaction = transfer?.isDexTransaction || transfer?.is_dex_transaction || false;
              const blockTime = transfer?.blockTime || transfer?.block_time || null;
              
              return (
                <tr key={signature || index} className="hover:bg-dark-800/50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    <CopyToClipboard 
                      text={fromAddress} 
                      displayText={fromAddress 
                        ? `${fromAddress.slice(0, 4)}...${fromAddress.slice(-4)}` 
                        : 'Unknown'
                      }
                    />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    <CopyToClipboard 
                      text={toAddress} 
                      displayText={toAddress 
                        ? `${toAddress.slice(0, 4)}...${toAddress.slice(-4)}` 
                        : 'Unknown'
                      }
                    />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-dark-200">
                    {amount !== undefined 
                      ? Number(amount).toLocaleString(undefined, { maximumFractionDigits: 4 })
                      : 'Unknown'
                    }
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    <Badge variant={isDexTransaction ? 'secondary' : 'primary'}>
                      {isDexTransaction ? 'DEX' : 'P2P'}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-dark-300">
                    {blockTime 
                      ? new Date(typeof blockTime === 'number' && blockTime > 1000000000 ? blockTime * 1000 : blockTime).toLocaleDateString()
                      : 'Unknown'
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-dark-400">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, transfers.length)} of {transfers.length} transfers
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </Card>
  );
};

export default P2PTransfersTable;