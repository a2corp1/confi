import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { truncateString } from '../../services/dataFormatUtils';
import { addTokenToSearchHistory } from './top-tokens-navbar';

// Safety indicator component (friendlier than risk level)
const SafetyBadge = ({ level }) => {
  let color, text, icon;
  switch(level) {
    case 'safe':
      color = 'bg-green-100 text-green-700 border-green-200';
      text = 'Verified';
      icon = '✓';
      break;
    case 'caution':
      color = 'bg-yellow-100 text-yellow-700 border-yellow-200';
      text = 'Use Caution';
      icon = '!';
      break;
    case 'unknown':
      color = 'bg-blue-100 text-blue-700 border-blue-200';
      text = 'New Token';
      icon = '?';
      break;
    default:
      color = 'bg-blue-100 text-blue-700 border-blue-200';
      text = 'Unknown';
      icon = '?';
  }
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color} border`}>
      <span className="mr-1">{icon}</span>
      {text}
    </span>
  );
};

const TokenCard = ({ token, index }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  // Generate safety level for demonstration 
  const safetyLevels = ['safe', 'caution', 'unknown'];
  const safetyLevel = safetyLevels[index % 3]; // Cycle through levels
  
  const handleAnalyzeClick = () => {
    // Add to search history
    addTokenToSearchHistory(token);
    
    // Navigate to token page
    navigate(`/token/${token.address}`);
  };
  
  const handleCopyAddress = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div 
      className="token-card bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
      onClick={handleAnalyzeClick}
    >
      {/* Token Logo Header */}
      <div className="p-5 pb-3 flex items-center space-x-4">
        <div className="token-logo-container flex-shrink-0">
          {token.logoUrl ? (
            <img 
              src={token.logoUrl} 
              alt={`${token.name} logo`} 
              className="h-16 w-16 rounded-full border-2 border-gray-200 dark:border-dark-700 object-cover shadow-md"
              onError={(e) => { 
                e.target.src = 'https://placehold.co/200x200/3b82f6/FFFFFF?text=T'; 
                e.target.alt = 'Token placeholder';
              }}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {token.symbol ? token.symbol.charAt(0) : 'T'}
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {token.name || 'Unknown Token'}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-sm font-medium text-gray-500 dark:text-dark-400 bg-gray-100 dark:bg-dark-800 px-2 py-0.5 rounded-md">
              {token.symbol || '???'}
            </span>
            <SafetyBadge level={safetyLevel} />
          </div>
        </div>
      </div>
      
      {/* Token Address with Copy Button */}
      <div className="px-5 pb-3">
        <div className="p-2 bg-gray-50 dark:bg-dark-800 rounded font-mono text-xs text-gray-500 dark:text-dark-400 flex items-center justify-between">
          <span className="truncate">{truncateString(token.address, 10, 6)}</span>
          <button 
            onClick={handleCopyAddress}
            className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title="Copy address"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Key Metrics Section with Beginner-Friendly Labels */}
      <div className="px-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="metric-card hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <div className="text-xs text-gray-500 dark:text-dark-400 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Market Cap
              <span className="inline-block ml-1 cursor-help" title="The total value of all existing tokens at current price">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">${token.marketCap.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
          </div>
          <div className="metric-card hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <div className="text-xs text-gray-500 dark:text-dark-400 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Token Price
              <span className="inline-block ml-1 cursor-help" title="Current price per token in USD">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              ${token.price < 0.01 ? token.price.toFixed(6) : token.price.toFixed(4)}
            </div>
          </div>
          <div className="metric-card hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <div className="text-xs text-gray-500 dark:text-dark-400 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Supply
              <span className="inline-block ml-1 cursor-help" title="Total number of tokens in circulation">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {token.supply ? Number(token.supply).toLocaleString(undefined, {maximumFractionDigits: 0}) : 'N/A'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Created date and View Button */}
      <div className="mt-4 px-5 py-3 bg-gray-50 dark:bg-dark-800/50 flex justify-between items-center border-t border-gray-100 dark:border-dark-700">
        <span className="text-xs text-gray-500 dark:text-dark-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Created {new Date(token.createdAt).toLocaleDateString()}
        </span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAnalyzeClick();
          }}
          className="inline-flex items-center px-4 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Analyze
        </button>
      </div>
      
      {/* Progress bar showing analysis completeness */}
      <div className="h-1.5 w-full bg-gray-100 dark:bg-dark-800">
        <div 
          className={`h-full ${
            safetyLevel === 'safe' ? 'bg-green-500' : 
            safetyLevel === 'caution' ? 'bg-yellow-500' : 'bg-blue-500'
          }`} 
          style={{ width: `${safetyLevel === 'safe' ? '100' : safetyLevel === 'caution' ? '60' : '40'}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TokenCard;