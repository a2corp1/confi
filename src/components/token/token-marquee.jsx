import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchTopTokensByMarketCap } from '../../services/tokenService';

const TokenMarquee = () => {
  const navigate = useNavigate();
  
  // Fetch token data
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['topTokensForMarquee'],
    queryFn: fetchTopTokensByMarketCap,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Extract tokens from API response
  const tokens = apiResponse?.data || [];
  
  const handleTokenClick = (token) => {
    navigate(`/token/${token.address}`);
  };
  
  // If loading or error, show a simplified marquee
  if (isLoading || error || tokens.length === 0) {
    return (
      <div className="bg-dark-900 border-b border-dark-800 text-gray-400 py-1 overflow-hidden">
        <div className="flex justify-center items-center h-6">
          <span className="text-sm">
            {isLoading ? 'Loading market data...' : error ? 'Market data unavailable' : 'No token data available'}
          </span>
        </div>
      </div>
    );
  }
  
  // Calculate price change indicators
  const getChangeIndicator = (percentChange) => {
    const isPositive = percentChange > 0;
    return {
      text: `${isPositive ? '+' : ''}${percentChange.toFixed(1)}%`,
      color: isPositive ? 'text-green-500' : 'text-red-500'
    };
  };

  // Logo placeholder for fallback
  const handleImageError = (e) => {
    // Replace with a colored div containing the first letter
    const symbol = e.target.getAttribute('data-symbol');
    e.target.style.display = 'none';
    const parent = e.target.parentNode;
    
    // Create colored circle with token initial
    const placeholder = document.createElement('div');
    placeholder.className = 'w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center';
    placeholder.innerHTML = symbol.charAt(0).toUpperCase();
    parent.insertBefore(placeholder, e.target);
  };

  return (
    <div className="bg-dark-900 border-b border-dark-800 text-gray-300 py-2 overflow-hidden">
      <div className="marquee-container">
        <div className="marquee-content">
          <div className="flex space-x-6 whitespace-nowrap">
            {/* Duplicate the token list to create a seamless loop */}
            {Array(2).fill().map((_, duplicateIndex) => (
              <React.Fragment key={duplicateIndex}>
                {tokens.map((token, index) => {
                  // Generate random price change for demo (replace with actual data in production)
                  const priceChange = token.priceChange || (Math.random() * 20 - 5);
                  const changeIndicator = getChangeIndicator(priceChange);
                  
                  return (
                    <React.Fragment key={`${duplicateIndex}-${token.address || index}`}>
                      <button 
                        onClick={() => handleTokenClick(token)}
                        className="flex items-center text-sm hover:text-blue-400 transition-colors cursor-pointer focus:outline-none group"
                      >
                        <div className="mr-1.5 w-4 h-4 rounded-full overflow-hidden flex-shrink-0 relative">
                          {token.logoUrl ? (
                            <img 
                              src={token.logoUrl} 
                              alt={token.symbol} 
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                              data-symbol={token.symbol}
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                              {token.symbol ? token.symbol.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{token.symbol}:</span> ${token.price < 0.01 
                          ? token.price.toFixed(8) 
                          : token.price.toFixed(2)
                        } <span className={changeIndicator.color}>{changeIndicator.text}</span>
                      </button>
                      {index < tokens.length - 1 && <span className="text-dark-600 mx-2">•</span>}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenMarquee;