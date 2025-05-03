import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ placeholder = "Search by token name or address...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Add processing state
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Validate if input looks like a Solana address (simplified check)
      const isAddress = query.length >= 32 && query.length <= 44;
      
      if (isAddress) {
        // Show loading screen for 30 seconds
        setIsProcessing(true);
        
        // Wait 30 seconds before navigating
        setTimeout(() => {
          setIsProcessing(false);
          navigate(`/token/${query.trim()}`);
        }, 30000); // 30 seconds
      } else {
        // For non-address searches, navigate immediately
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  // If processing, show loading screen
  if (isProcessing) {
    return <LoadingScreen />;
  }

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div 
          className={`flex items-center bg-dark-800 rounded-xl border ${
            isActive ? 'border-primary-500 ring-1 ring-primary-500/30' : 'border-dark-700'
          } transition-all duration-200 w-full`}
        >
          <div className="pl-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-dark-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsActive(true)}
            onBlur={() => setIsActive(false)}
            placeholder={placeholder}
            className="bg-transparent text-white w-full py-3 px-3 placeholder-dark-400 focus:outline-none text-sm md:text-base"
          />
          <button
            type="submit"
            className={`rounded-r-xl px-4 py-3 font-medium transition-colors ${
              query.trim() 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-dark-700 text-dark-400 cursor-not-allowed'
            }`}
            disabled={!query.trim()}
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;