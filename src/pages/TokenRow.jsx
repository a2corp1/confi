import React, { useState } from 'react';

const TokenRow = ({ token }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <tr className="border-b border-gray-800 hover:bg-[#2C2C2C] transition-colors group">
      {/* Token Logo and Name */}
      <td className="p-4 flex items-center">
        {token.logoUrl ? (
          <img 
            src={token.logoUrl} 
            alt={`${token.symbol} logo`} 
            className="h-10 w-10 mr-4 rounded-full border-2 border-gray-700 group-hover:border-green-600 transition-all"
          />
        ) : (
          <div className="h-10 w-10 mr-4 bg-green-800 rounded-full"></div>
        )}
        <div>
          <div className="flex items-center">
            <span className="font-bold text-green-400 mr-2">{token.symbol}</span>
            <span className="text-xs text-gray-500">{token.name}</span>
          </div>
        </div>
      </td>

      {/* Contract Address */}
      <td className="p-4 relative">
        <div className="flex items-center">
          <span className="font-mono text-sm text-gray-400">
            {token.address.slice(0,6)}...{token.address.slice(-4)}
          </span>
          <button 
            onClick={handleCopyAddress}
            className="ml-2 text-gray-500 hover:text-green-400 transition-colors"
            title="Copy Address"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {copied && (
            <span className="absolute left-full ml-2 bg-green-700 text-white text-xs px-2 py-1 rounded">
              Copied!
            </span>
          )}
        </div>
      </td>

      {/* Market Cap */}
      <td className="p-4">
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-200">
            ${token.marketCap.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </span>
        </div>
      </td>

      {/* Price */}
      <td className="p-4">
        <div className="flex items-center">
          <span className={`text-sm font-mono font-bold ${
            token.price > 1 ? 'text-green-500' : 'text-yellow-500'
          }`}>
            ${token.price.toFixed(4)}
          </span>
        </div>
      </td>

      {/* Token Supply */}
      <td className="p-4">
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-400">
            {token.supply.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </span>
        </div>
      </td>

      {/* Badges */}
      <td className="p-4">
        <div className="flex space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400">
            Verified
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400">
            KYC
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-400">
            Audit
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="p-4 space-x-2">
        <button 
          onClick={() => window.open(`https://dexscreener.com/solana/${token.address}`, '_blank')}
          className="px-3 py-1 rounded-md text-sm bg-blue-800/50 text-blue-400 hover:bg-blue-800/70 transition-colors"
        >
          Chart
        </button>
        <button 
          onClick={() => window.location.href = `/token/${token.address}`}
          className="px-3 py-1 rounded-md text-sm bg-green-800/50 text-green-400 hover:bg-green-800/70 transition-colors"
        >
          Analyze
        </button>
      </td>
    </tr>
  );
};

export default TokenRow;