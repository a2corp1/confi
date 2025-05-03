import React from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon 
} from '@heroicons/react/24/outline';
import Tooltip from '../common/Tooltip';

const TopWalletActivity = ({ 
  accumulationData, 
  totalSupply 
}) => {
  // Separate and sort top accumulators and sellers
  const topAccumulators = accumulationData.wallets
    .filter(w => w.isAccumulating)
    .sort((a, b) => b.netVolume - a.netVolume)
    .slice(0, 3);

  const topSellers = accumulationData.wallets
    .filter(w => !w.isAccumulating)
    .sort((a, b) => a.netVolume - b.netVolume)
    .slice(0, 3);

  // Helper to generate a consistent color based on wallet address
  const generateColor = (address) => {
    const hash = address.split('').reduce((acc, char) => 
      char.charCodeAt(0) + ((acc << 5) - acc), 0);
    return `hsl(${hash % 360}, 70%, 60%)`;
  };

  // Render wallet list item
  const renderWalletItem = (wallet, isAccumulating) => {
    const percentage = ((wallet.netVolume / totalSupply) * 100).toFixed(2);
    const walletColor = generateColor(wallet.wallet_address);

    return (
      <div 
        key={wallet.wallet_address} 
        className="flex items-center justify-between text-xs py-1 hover:bg-dark-800/50 rounded"
      >
        <div className="flex items-center space-x-2">
          <div 
            className="h-6 w-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: walletColor }}
          >
            {isAccumulating ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-white" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 text-white" />
            )}
          </div>
          <Tooltip content={wallet.wallet_address}>
            <span className="text-dark-300">
              {wallet.wallet_address.substring(0, 4)}...{wallet.wallet_address.substring(wallet.wallet_address.length - 4)}
            </span>
          </Tooltip>
        </div>
        <span className={`font-medium ${isAccumulating ? 'text-green-400' : 'text-red-400'}`}>
          {percentage}%
        </span>
      </div>
    );
  };

  return (
    <div className="bg-dark-800/30 rounded-md p-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h5 className="text-xs uppercase tracking-wider text-green-400 mb-2 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> 
            Accumulators
          </h5>
          <div className="space-y-1">
            {topAccumulators.length > 0 ? (
              topAccumulators.map(wallet => renderWalletItem(wallet, true))
            ) : (
              <div className="text-dark-400 text-xs text-center py-2">
                No accumulators
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h5 className="text-xs uppercase tracking-wider text-red-400 mb-2 flex items-center">
            <ArrowTrendingDownIcon className="h-4 w-4 mr-1" /> 
            Sellers
          </h5>
          <div className="space-y-1">
            {topSellers.length > 0 ? (
              topSellers.map(wallet => renderWalletItem(wallet, false))
            ) : (
              <div className="text-dark-400 text-xs text-center py-2">
                No sellers
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopWalletActivity;