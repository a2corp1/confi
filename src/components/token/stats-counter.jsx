import React, { useState, useEffect } from 'react';

// Helper function to get stored stats or initialize with defaults
const getStoredStats = () => {
  try {
    const stats = JSON.parse(localStorage.getItem('tokenStats') || 'null');
    if (stats) return stats;
  } catch (error) {
    console.error('Error retrieving token stats:', error);
  }
  
  // Default initial values
  return {
    tokensTracked: 3982,
    scansToday: 284,
    liveUsers: 181,
    lastUpdated: new Date().toISOString()
  };
};

// Helper function to store updated stats
const storeStats = (stats) => {
  try {
    localStorage.setItem('tokenStats', JSON.stringify({
      ...stats,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error storing token stats:', error);
  }
};

// Helper to generate random increment
const getRandomIncrement = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const StatsCounter = () => {
  const [stats, setStats] = useState(getStoredStats());
  const [animatedStats, setAnimatedStats] = useState(stats);
  
  // Function to update stat with random increment
  const updateStat = (statName, minIncrement, maxIncrement, interval) => {
    setInterval(() => {
      setStats(prevStats => {
        const increment = getRandomIncrement(minIncrement, maxIncrement);
        const updatedStats = {
          ...prevStats,
          [statName]: prevStats[statName] + increment
        };
        storeStats(updatedStats);
        return updatedStats;
      });
    }, interval);
  };
  
  // Set up the random increments with different intervals
  useEffect(() => {
    // Reset stats at midnight
    const checkForNewDay = () => {
      const lastUpdated = new Date(stats.lastUpdated);
      const now = new Date();
      
      // If it's a new day (different day than last update)
      if (lastUpdated.getDate() !== now.getDate() || 
          lastUpdated.getMonth() !== now.getMonth() || 
          lastUpdated.getFullYear() !== now.getFullYear()) {
        // Reset daily stats
        setStats(prevStats => {
          const resetStats = {
            ...prevStats,
            scansToday: 0,
            liveUsers: Math.max(5, Math.floor(prevStats.liveUsers * 0.1)) // Keep some base users
          };
          storeStats(resetStats);
          return resetStats;
        });
      }
    };
    
    // Check for new day on load
    checkForNewDay();
    
    // Tokens tracked increases slowly (1-3 every 5-15 minutes)
    const tokensInterval = updateStat('tokensTracked', 1, 3, 300000 + Math.random() * 600000);
    
    // Scans today increases more frequently (1-5 every 10-30 seconds)
    const scansInterval = updateStat('scansToday', 1, 5, 10000 + Math.random() * 20000);
    
    // Live users fluctuates (±1-3 every 30-60 seconds)
    const usersInterval = setInterval(() => {
      setStats(prevStats => {
        // 70% chance to increase, 30% chance to decrease
        const direction = Math.random() < 0.1 ? 1 : -1;
        const change = getRandomIncrement(1, 3) * direction;
        
        // Ensure we don't go below a minimum threshold
        const newLiveUsers = Math.max(5, prevStats.liveUsers + change);
        
        const updatedStats = {
          ...prevStats,
          liveUsers: newLiveUsers
        };
        storeStats(updatedStats);
        return updatedStats;
      });
    }, 30000 + Math.random() * 30000);
    
    // Check for new day every hour
    const newDayInterval = setInterval(checkForNewDay, 3600000);
    
    // Clean up intervals on unmount
    return () => {
      clearInterval(tokensInterval);
      clearInterval(scansInterval);
      clearInterval(usersInterval);
      clearInterval(newDayInterval);
    };
  }, []);
  
  // Animate the counters
  useEffect(() => {
    const animateCounters = () => {
      // For each stat, gradually animate from current animated value to target value
      const animate = (statName) => {
        if (animatedStats[statName] === stats[statName]) return;
        
        const diff = stats[statName] - animatedStats[statName];
        const increment = Math.max(1, Math.ceil(Math.abs(diff) / 10)) * Math.sign(diff);
        
        setAnimatedStats(prev => ({
          ...prev,
          [statName]: prev[statName] + increment
        }));
      };
      
      animate('tokensTracked');
      animate('scansToday');
      animate('liveUsers');
    };
    
    const animationInterval = setInterval(animateCounters, 100);
    return () => clearInterval(animationInterval);
  }, [stats, animatedStats]);
  
  return (
    <div className="flex justify-center space-x-6 mb-8">
      <div className="stat-card live-stat-card">
        <div className="relative">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {animatedStats.tokensTracked.toLocaleString()}
          </div>
          <span className="absolute -top-1 -right-6 pulse-dot bg-green-500"></span>
        </div>
        <div className="text-sm text-gray-500 dark:text-dark-400">Tokens Tracked</div>
      </div>
      
      <div className="stat-card live-stat-card">
        <div className="relative">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {animatedStats.scansToday.toLocaleString()}
          </div>
          <span className="absolute -top-1 -right-6 pulse-dot bg-blue-500"></span>
        </div>
        <div className="text-sm text-gray-500 dark:text-dark-400">Scans Today</div>
      </div>
      
      <div className="stat-card live-stat-card">
        <div className="relative">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {animatedStats.liveUsers.toLocaleString()}
          </div>
          <span className="absolute -top-1 -right-6 pulse-dot bg-purple-500"></span>
        </div>
        <div className="text-sm text-gray-500 dark:text-dark-400">Unique Users</div>
      </div>
    </div>
  );
};

export default StatsCounter;