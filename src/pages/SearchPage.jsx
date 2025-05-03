import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ArrowUpRightIcon, ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingScreen from '../components/common/LoadingScreen';
import { fetchRecentSearches } from '../services/searchService';
import { truncateString } from '../services/dataFormatUtils';
import Badge from '../components/common/Badge';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const searchInputRef = useRef(null);
  const progressInterval = useRef(null);
  const navigate = useNavigate();
  
  // Fetch recent searches
  const { data: recentSearches = [], isLoading: isLoadingSearches } = useQuery(
    ['recentSearches'],
    fetchRecentSearches,
    {
      staleTime: 60 * 1000, // 1 minute
    }
  );

  // Handle the loading progress animation
  useEffect(() => {
    if (isLoading) {
      // Reset progress
      setLoadingProgress(0);
      
      // Set up interval to increment progress
      progressInterval.current = setInterval(() => {
        setLoadingProgress(prev => {
          // Calculate new progress value
          const newProgress = prev + (100 / 30); // 30 seconds total
          
          // If we're done, clear the interval
          if (newProgress >= 100) {
            clearInterval(progressInterval.current);
            return 100;
          }
          
          return newProgress;
        });
      }, 1000); // Update every second
    } else {
      // Clear interval when not loading
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
    
    // Cleanup
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const trimmedTerm = searchTerm.trim();
      
      // Check if it's a token address (simplified validation)
      const isAddress = trimmedTerm.length >= 32 && trimmedTerm.length <= 44;
      
      if (isAddress) {
        // Show loading screen
        setIsLoading(true);
        
        // Wait 30 seconds then navigate
        setTimeout(() => {
          setIsLoading(false);
          navigate(`/token/${trimmedTerm}`);
        }, 30000); // 30 seconds
      } else {
        // For non-address searches, navigate immediately
        navigate(`/token/${trimmedTerm}`);
      }
    }
  };

  // Particle effect for the terminal
  const initTerminalParticles = () => {
    // This is a placeholder for the particle animation logic
    // In a real implementation, you would use a library like particles.js
    // or implement custom canvas animation
    
    return () => {
      // Cleanup function
    };
  };

  // Terminal effect for search input focus
  useEffect(() => {
    if (isActive && searchInputRef.current) {
      const cleanup = initTerminalParticles();
      return cleanup;
    }
  }, [isActive]);

  // Custom loading screen component with progress indicator
  const CustomLoadingScreen = () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-dark-950/90 backdrop-blur-sm z-50">
      <div className="w-full max-w-md p-8 rounded-lg bg-dark-900 border border-dark-700 shadow-glow">
        <div className="flex flex-col items-center">
          <div className="relative mb-8">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-glow">
              <span className="text-3xl font-bold text-white">S</span>
            </div>
            <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-accent-500 border border-dark-950 animate-pulse"></div>
          </div>
          
          <h3 className="text-lg font-bold text-white mb-4 terminal-text">
            <span className="text-primary-500">$</span> Analyzing Token Data...
          </h3>
          
          {/* Terminal-style loading output */}
          <div className="w-full bg-dark-950 rounded p-4 font-mono text-xs text-dark-300 mb-6 h-32 overflow-y-auto terminal-output">
            <div className="flex"><span className="text-primary-500 mr-2">&gt;</span>Initializing token analyzer...</div>
            <div className="flex"><span className="text-primary-500 mr-2">&gt;</span>Connecting to blockchain...</div>
            <div className="flex"><span className="text-primary-500 mr-2">&gt;</span>Fetching token metadata...</div>
            <div className="flex"><span className="text-primary-500 mr-2">&gt;</span>Reading smart contract...</div>
            {loadingProgress > 20 && <div className="flex"><span className="text-primary-500 mr-2">&gt;</span>Analyzing holder distribution...</div>}
            {loadingProgress > 40 && <div className="flex"><span className="text-primary-500 mr-2">&gt;</span>Processing transaction history...</div>}
            {loadingProgress > 60 && <div className="flex"><span className="text-primary-500 mr-2">&gt;</span>Calculating metrics...</div>}
            {loadingProgress > 80 && <div className="flex"><span className="text-primary-500 mr-2">&gt;</span>Preparing visualization data...</div>}
            {loadingProgress > 95 && <div className="flex"><span className="text-primary-500 mr-2">&gt;</span>Finalizing analysis...</div>}
            <div className="blink-cursor">_</div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-dark-800 rounded-full h-2 mb-4">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 glow-sm transition-all duration-300 progress-pulse"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between w-full text-xs text-dark-400">
            <span>Analysis progress: {Math.round(loadingProgress)}%</span>
            <span>Est. time remaining: {Math.ceil((100 - loadingProgress) * 0.3)}s</span>
          </div>
          
          <Button 
            onClick={() => setIsLoading(false)} 
            className="mt-6" 
            variant="outline"
            icon={<ArrowPathIcon className="h-4 w-4" />}
          >
            Cancel Analysis
          </Button>
        </div>
      </div>
    </div>
  );

  // Show custom loading screen when loading
  if (isLoading) {
    return <CustomLoadingScreen />;
  }

  // Recent token card component with enhanced styling
  const TokenCard = ({ token }) => (
    <div className="token-card bg-dark-900/70 rounded-lg border border-dark-800 overflow-hidden transition-all duration-300 hover:border-primary-600 hover:shadow-glow relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 to-secondary-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Top highlight line animation */}
      <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-700"></div>
      
      <div className="p-4 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              {token.name || 'Unknown Token'}
            </h3>
            <p className="text-sm text-dark-400 mt-1">
              {token.symbol || '???'}
            </p>
          </div>
          <Button
            as="link"
            to={`/token/${token.token_address}`}
            variant="outline"
            size="xs"
            className="group-hover:border-primary-500 group-hover:bg-dark-800 transition-all duration-300"
            icon={<ArrowUpRightIcon className="h-3 w-3 group-hover:text-primary-400" />}
            iconPosition="right"
            onClick={(e) => {
              e.preventDefault();
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                navigate(`/token/${token.token_address}`);
              }, 30000);
            }}
          >
            View
          </Button>
        </div>
        
        <div className="mt-3 flex items-center space-x-2">
          <Badge variant="primary" dot={true} className="text-xs">
            Solana Token
          </Badge>
          {token.search_count > 10 && (
            <Badge variant="secondary" className="text-xs">
              Popular
            </Badge>
          )}
        </div>
        
        <p className="mt-3 text-xs font-mono text-dark-500 truncate bg-dark-950/50 p-1.5 rounded">
          {truncateString(token.token_address, 12, 8)}
        </p>
        
        <div className="mt-3 flex justify-between items-center text-xs">
          <div className="flex items-center text-dark-400">
            <ClockIcon className="h-3 w-3 mr-1" />
            {new Date(token.last_searched_at).toLocaleDateString()}
          </div>
          <span className="px-2 py-0.5 bg-dark-800 rounded-full text-dark-400">
            {token.search_count} searches
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 relative">
      {/* Background circuit pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 circuit-pattern"></div>
      
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-400 to-secondary-400 mb-6 cyberpunk-header">
          Token Explorer
        </h1>
        
        {/* Search Form */}
        <Card className="mb-8 search-form-card hover:shadow-glow-sm transition-all duration-300">
          <div className="p-6">
            <h2 className="text-lg font-medium text-white mb-4 glitch-hover relative inline-block">
              Search for a Solana Token
              <div className="h-0.5 w-0 group-hover:w-full bg-primary-500 absolute -bottom-1 left-0 transition-all duration-300"></div>
            </h2>
            <form onSubmit={handleSubmit} className="search-terminal">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow terminal-container">
                  <div className="terminal-header flex items-center px-2 py-1 bg-dark-950 rounded-t-md border-t border-l border-r border-dark-700">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1.5"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-dark-500 ml-2">token_explorer.sh</span>
                  </div>
                  
                  <div className="terminal-body relative border border-dark-700 rounded-b-md bg-dark-950 flex items-center">
                    <div className="absolute left-3 text-primary-500 font-mono">$</div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsActive(true)}
                      onBlur={() => setIsActive(false)}
                      placeholder="Enter Solana token address..."
                      className="bg-transparent text-white w-full py-3 pl-7 pr-10 focus:outline-none font-mono text-sm"
                    />
                    <div className="absolute inset-0 pointer-events-none terminal-scanlines"></div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <MagnifyingGlassIcon className="h-5 w-5 text-dark-400" />
                    </div>
                    
                    {/* Animated cursor effect when active */}
                    {isActive && <div className="cursor-blink"></div>}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="md:w-auto neon-button"
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  iconPosition="left"
                >
                  Search
                </Button>
              </div>
              <p className="mt-2 text-sm text-dark-400">
                Enter the full token address to view detailed analytics
              </p>
            </form>
          </div>
        </Card>
        
        {/* Recent Searches section */}
        {recentSearches.length > 0 && (
          <div className="recent-searches-container">
            <h2 className="text-xl font-medium text-white mb-4 relative inline-block group">
              Recent Searches
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-secondary-500 absolute -bottom-1 left-0 transition-all duration-500"></div>
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 token-grid">
              {recentSearches.map((search) => (
                <TokenCard key={search.token_address} token={search} />
              ))}
            </div>
          </div>
        )}
        
        {/* Help Section */}
        <div className="mt-10 bg-dark-900/50 rounded-lg border border-dark-800 p-5 help-section">
          <h2 className="text-xl font-medium text-white mb-4">Search Tips</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col space-y-1 help-tip">
              <h3 className="font-medium text-primary-400">Token Address Format</h3>
              <p className="text-sm text-dark-300">
                Solana token addresses are typically 32-44 characters long and use base58 encoding.
              </p>
            </div>
            <div className="flex flex-col space-y-1 help-tip">
              <h3 className="font-medium text-secondary-400">Popular Tokens</h3>
              <p className="text-sm text-dark-300">
                Check the recent searches section to see popular tokens being analyzed by others.
              </p>
            </div>
            <div className="flex flex-col space-y-1 help-tip">
              <h3 className="font-medium text-accent-400">Analysis Time</h3>
              <p className="text-sm text-dark-300">
                Initial token analysis may take up to 30 seconds to compile comprehensive data.
              </p>
            </div>
            <div className="flex flex-col space-y-1 help-tip">
              <h3 className="font-medium text-blue-400">Bookmark Results</h3>
              <p className="text-sm text-dark-300">
                Save your token URLs for quick access to analytics in the future.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations and effects */}
      <style jsx>{`
        /* Circuit background pattern */
        .circuit-pattern {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px);
          background-size: 50px 50px, 50px 50px, 10px 10px, 10px 10px;
          background-position: -1px -1px, -1px -1px, -1px -1px, -1px -1px;
        }
        
        /* Cyberpunk header style */
        .cyberpunk-header {
          position: relative;
          text-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
        }
        
        .cyberpunk-header::after {
          content: 'Token Explorer';
          position: absolute;
          top: 2px;
          left: 2px;
          color: rgba(239, 68, 68, 0.4);
          z-index: -1;
        }
        
        /* Terminal styling */
        .terminal-container {
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }
        
        .terminal-scanlines {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.03) 50%,
            rgba(0, 0, 0, 0.03) 50%
          );
          background-size: 100% 4px;
          z-index: 1;
        }
        
        .cursor-blink {
          position: absolute;
          height: 14px;
          width: 7px;
          background-color: rgba(59, 130, 246, 0.7);
          left: calc(7px + 1ch + ${searchTerm.length}ch);
          top: 50%;
          transform: translateY(-50%);
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        /* Animated button glow */
        .neon-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .neon-button::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          z-index: -1;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
          background-size: 400%;
          animation: neon-border 3s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 0.5rem;
        }
        
        .neon-button:hover::before {
          opacity: 1;
        }
        
        @keyframes neon-border {
          0% { background-position: 0 0; }
          50% { background-position: 400% 0; }
          100% { background-position: 0 0; }
        }
        
        /* Shadow glow effect */
        .shadow-glow {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
        }
        
        .shadow-glow-sm {
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
        }
        
        /* Glitch hover effect */
        .glitch-hover {
          position: relative;
        }
        
        .glitch-hover:hover {
          animation: glitch 0.3s infinite;
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-1px, 1px); }
          40% { transform: translate(-1px, -1px); }
          60% { transform: translate(1px, 1px); }
          80% { transform: translate(1px, -1px); }
          100% { transform: translate(0); }
        }
        
        /* Terminal text style */
        .terminal-text {
          font-family: monospace;
        }
        
        /* Loading terminal output */
        .terminal-output {
          line-height: 1.5;
        }
        
        .blink-cursor {
          animation: blink 1s infinite;
        }
        
        /* Progress bar pulse */
        .progress-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 5px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        
        /* Token card grid animation */
        .token-grid {
          opacity: 0;
          animation: fade-in 0.5s forwards;
        }
        
        @keyframes fade-in {
          to { opacity: 1; }
        }
        
        /* Help section hover effects */
        .help-tip {
          transition: all 0.3s ease;
          padding: 0.75rem;
          border-radius: 0.375rem;
        }
        
        .help-tip:hover {
          background-color: rgba(30, 41, 59, 0.5);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default SearchPage;