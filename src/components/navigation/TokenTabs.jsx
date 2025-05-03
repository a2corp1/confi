import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';

const TokenTabs = () => {
  const { tokenAddress } = useParams();
  const location = useLocation();
  
  // Define the tabs for token dashboard
  const tabs = [
    { name: 'Overview', path: `/token/${tokenAddress}` },
    { name: 'Transactions', path: `/token/${tokenAddress}/transactions` },
    { name: 'Holders', path: `/token/${tokenAddress}/holders` },
    { name: 'Flow Analysis', path: `/token/${tokenAddress}/transactions` },
    { name: 'Distribution', path: `/token/${tokenAddress}/distribution` }
  ];

  // Determine if a tab is active
  const isActive = (path) => {
    // Exact match for overview
    if (path === `/token/${tokenAddress}` && location.pathname === path) {
      return true;
    }
    // For other tabs, check if the location starts with the path
    return location.pathname.startsWith(path) && path !== `/token/${tokenAddress}`;
  };

  return (
    <div className="border-b border-dark-800 mb-6">
      <nav className="flex overflow-x-auto hide-scrollbar">
        <div className="flex space-x-1 sm:space-x-4">
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive: active }) => `
                px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 
                transition-colors duration-200
                ${isActive(tab.path) 
                  ? 'border-primary-500 text-primary-500' 
                  : 'border-transparent text-dark-300 hover:text-white hover:border-dark-600'}
              `}
              end={tab.path === `/token/${tokenAddress}`}
            >
              {tab.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default TokenTabs;