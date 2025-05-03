import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Custom animations and styles
const chartAnimations = `
  @keyframes pulse-dot {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.5); opacity: 1; }
  }
  
  @keyframes shimmer-bg {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  @keyframes fade-in-out {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  @keyframes bar-glow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
  }
  
  .chart-container {
    position: relative;
    border-radius: 0.5rem;
    overflow: hidden;
    backdrop-filter: blur(5px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.1);
  }
  
  .live-indicator {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    z-index: 10;
    background: rgba(30, 41, 59, 0.85);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(99, 102, 241, 0.2);
  }

  .live-dot {
    height: 8px;
    width: 8px;
    border-radius: 50%;
    margin-right: 6px;
    animation: pulse-dot 1.5s infinite;
  }
  
  .shimmer-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to right, rgba(99, 102, 241, 0) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(99, 102, 241, 0) 100%);
    background-size: 1000px 100%;
    pointer-events: none;
    z-index: 2;
    animation: shimmer-bg 4s infinite linear;
  }
  
  .pulse-badge {
    animation: fade-in-out 2s infinite;
  }
  
  .trend-indicator {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 5;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    background: rgba(30, 41, 59, 0.85);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(99, 102, 241, 0.2);
  }
  
  .glowing-bar {
    animation: bar-glow 2s infinite;
  }
  
  .stat-card {
    background: rgba(30, 41, 59, 0.6);
    border-radius: 0.5rem;
    padding: 1rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    border: 1px solid rgba(99, 102, 241, 0.1);
  }
  
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.3);
  }
  
  .grid-bg {
    background-image: radial-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  }
`;

const TokenDistributionChart = () => {
  const [timeframe, setTimeframe] = useState('3d');
  const [holderLimit, setHolderLimit] = useState(20);
  const [liveIndicator, setLiveIndicator] = useState(false);
  const [trendDirection, setTrendDirection] = useState('neutral'); // 'up', 'down', or 'neutral'
  const [simulatedData, setSimulatedData] = useState(null);
  const chartRef = useRef(null);
  
  // Simulate fetching data
  useEffect(() => {
    // Generate simulated data that mimics the structure of the original data
    const generateSimulatedData = () => {
      // Simulate token info
      const tokenInfo = {
        total_supply: 1000000000, // 1 billion tokens
        symbol: 'SIM',
        name: 'Simulated Token'
      };
      
      // Simulate wallet data
      const wallets = Array(holderLimit).fill(0).map((_, i) => {
        const rank = i + 1;
        const isWhale = rank <= 5;
        const isMedium = rank <= 15;
        
        // Larger holdings for top wallets
        const holdingPercentage = isWhale 
          ? 5 + Math.random() * 10 // 5-15% for whales
          : isMedium 
            ? 1 + Math.random() * 4 // 1-5% for medium
            : 0.1 + Math.random() * 0.9; // 0.1-1% for smaller holders
            
        const holdings = (holdingPercentage / 100) * tokenInfo.total_supply;
        
        // Simulate buy/sell behavior
        // Whales tend to accumulate, smaller holders tend to sell
        const buyBias = isWhale ? 0.7 : isMedium ? 0.5 : 0.3;
        const buyVolume = Math.random() * holdings * 0.1 * (Math.random() < buyBias ? 1.5 : 0.5);
        const sellVolume = Math.random() * holdings * 0.1 * (Math.random() < (1-buyBias) ? 1.5 : 0.5);
        
        return {
          address: `0x${Math.random().toString(16).slice(2, 42)}`,
          holdings,
          holdingPercentage,
          buyVolume,
          sellVolume,
          netVolume: buyVolume - sellVolume
        };
      });
      
      // Sort wallets by holdings
      wallets.sort((a, b) => b.holdings - a.holdings);
      
      // Generate time series data for the chart
      const numberOfPoints = timeframe === '1d' ? 24 : timeframe === '3d' ? 72 : 168;
      const intervalMinutes = timeframe === '1d' ? 60 : timeframe === '3d' ? 60 : 60;
      
      const now = new Date();
      const trend = Array(numberOfPoints).fill(0).map((_, i) => {
        const timestamp = new Date(now.getTime() - (numberOfPoints - i) * intervalMinutes * 60000);
        
        // Create a natural looking pattern with some trend
        const trendFactor = i / numberOfPoints; // Increases as we get closer to present
        const randomFactor = Math.random() * 0.5 + 0.75; // Random between 0.75 and 1.25
        
        // More buys than sells generally (for uptrend simulation)
        const baseBuyVolume = tokenInfo.total_supply * 0.001 * (1 + trendFactor) * randomFactor;
        const baseSellVolume = tokenInfo.total_supply * 0.0008 * (1 - trendFactor/2) * randomFactor;
        
        return {
          timestamp: timestamp.toISOString(),
          buyVolume: baseBuyVolume,
          sellVolume: baseSellVolume,
          netVolume: baseBuyVolume - baseSellVolume
        };
      });
      
      // Calculate summary statistics
      const totalBuyVolume = trend.reduce((sum, point) => sum + point.buyVolume, 0);
      const totalSellVolume = trend.reduce((sum, point) => sum + point.sellVolume, 0);
      const netVolume = totalBuyVolume - totalSellVolume;
      
      return {
        wallets,
        trend,
        summary: {
          totalBuyVolume,
          totalSellVolume,
          netVolume,
          isNetAccumulation: netVolume > 0
        },
        tokenInfo
      };
    };
    
    const simData = generateSimulatedData();
    setSimulatedData(simData);
    
    // Set trend direction based on data
    setTrendDirection(simData.summary.netVolume > 0 ? 'up' : 'down');
    
    // Simulate live updates
    const liveInterval = setInterval(() => {
      setLiveIndicator(prev => !prev);
    }, 1000);
    
    return () => clearInterval(liveInterval);
  }, [timeframe, holderLimit]);
  
  // Simulate live chart updates
  useEffect(() => {
    if (!simulatedData || !chartRef.current) return;
    
    const simulationInterval = setInterval(() => {
      // Get current chart data
      const chart = chartRef.current;
      if (!chart) return;
      
      // Update bar and line chart data with slight randomization
      const volumeData = chart.data.datasets[1].data;
      const lineData = chart.data.datasets[0].data;
      if (!volumeData || volumeData.length === 0 || !lineData || lineData.length === 0) return;
      
      // Last values
      const lastVolumeValue = parseFloat(volumeData[volumeData.length - 1]);
      const lastLineValue = lineData[lineData.length - 1];
      
      // Random change (0.5-1.5% for volume, 0.1-0.3% for line)
      const volumeChange = lastVolumeValue * (Math.random() * 0.01 + 0.005) * (Math.random() < 0.7 ? 1 : -1);
      const lineChange = lastLineValue * (Math.random() * 0.002 + 0.001) * (Math.random() < 0.7 ? 1 : -1);
      
      // New values
      const newVolumeValue = Math.max(0, lastVolumeValue + volumeChange).toFixed(4);
      const newLineValue = Math.max(lastLineValue * 0.95, lastLineValue + lineChange);
      
      // Create a new timestamp
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      // Update direction based on line change
      const newDirection = lineChange > 0 ? 'up' : lineChange < 0 ? 'down' : 'neutral';
      setTrendDirection(newDirection);
      
      // Determine color based on direction
      const volumeColor = newDirection === 'up' ? 'rgba(52, 211, 153, 0.7)' : 'rgba(248, 113, 113, 0.7)';
      const volumeBorderColor = newDirection === 'up' ? 'rgba(52, 211, 153, 1)' : 'rgba(248, 113, 113, 1)';
      
      // Add new data point (shifting if we have more than 15 points)
      if (chart.data.labels.length >= 15) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
        chart.data.datasets[1].backgroundColor.shift();
        chart.data.datasets[1].borderColor.shift();
      }
      
      chart.data.labels.push(timeString);
      chart.data.datasets[0].data.push(newLineValue);
      chart.data.datasets[1].data.push(newVolumeValue);
      chart.data.datasets[1].backgroundColor.push(volumeColor);
      chart.data.datasets[1].borderColor.push(volumeBorderColor);
      
      // Update the chart
      chart.update('none'); // Update without animation for smoother performance
    }, 2000); // Update every 2 seconds
    
    return () => clearInterval(simulationInterval);
  }, [simulatedData, chartRef.current]);

  // Handle loading state
  if (!simulatedData) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2">Whale Accumulation Trend</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="h-80 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Timeframe options
  const timeframeOptions = [
    { value: '1d', label: '5m' },
    { value: '3d', label: '15m' },
    { value: '7d', label: '1h' },
  ];
  
  // Holder limit options
  const holderLimitOptions = [
    { value: 20, label: 'Top 20' },
    { value: 50, label: 'Top 50' },
    { value: 100, label: 'Top 100' },
  ];

  // Prepare chart data from simulated data
  const { trend, tokenInfo, summary } = simulatedData;
  const totalSupply = tokenInfo.total_supply;
  
  // Process trend data for the chart
  const formattedLabels = trend.map(item => {
    const date = new Date(item.timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  });

  // Calculate volume trend (line chart data)
  let cumulativeVolume = 0;
  const volumeTrend = trend.map(item => {
    cumulativeVolume += (item.buyVolume - item.sellVolume) / totalSupply * 100;
    return cumulativeVolume;
  });

  // Calculate trading volume percentages (bar chart data)
  const tradingVolumes = trend.map(item => {
    return ((item.buyVolume + item.sellVolume) / totalSupply * 100).toFixed(4);
  });

  // Create bar colors
  const barColors = trend.map(item => {
    if (item.buyVolume === 0 && item.sellVolume === 0) {
      return 'rgba(156, 163, 175, 0.3)'; // gray for no activity
    }
    return (item.buyVolume > item.sellVolume) 
      ? 'rgba(52, 211, 153, 0.7)' // green for net buy
      : 'rgba(248, 113, 113, 0.7)'; // red for net sell
  });

  const barBorderColors = trend.map(item => {
    if (item.buyVolume === 0 && item.sellVolume === 0) {
      return 'rgba(156, 163, 175, 0.5)';
    }
    return (item.buyVolume > item.sellVolume) 
      ? 'rgba(52, 211, 153, 1)' 
      : 'rgba(248, 113, 113, 1)';
  });

  // Combined chart data
  const combinedChartData = {
    labels: formattedLabels,
    datasets: [
      {
        type: 'line',
        label: 'Volume Trend',
        data: volumeTrend,
        borderColor: 'rgba(99, 102, 241, 1)', // Indigo for line
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');   
          gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.25)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');     
          return gradient;
        },
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: trend.length > 30 ? 0 : 2, 
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
        pointBorderColor: 'rgba(99, 102, 241, 1)',
        pointBorderWidth: 1.5,
        order: 0, // Make sure line is drawn on top
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Trading Volume',
        data: tradingVolumes,
        backgroundColor: barColors,
        borderColor: barBorderColors,
        borderWidth: 1,
        borderRadius: 4,
        order: 1, // Make sure bars are drawn behind line
        barPercentage: 0.8,
        categoryPercentage: 0.8,
        yAxisID: 'y1', // Use secondary y-axis
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 250
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(226, 232, 240, 1)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const value = context.raw;
            
            if (context.datasetIndex === 0) {
              // Line chart - Volume Trend
              return `${datasetLabel}: ${parseFloat(value).toFixed(2)}%`;
            } else {
              // Bar chart - Trading Volume
              return `${datasetLabel}: ${parseFloat(value).toFixed(4)}%`;
            }
          }
        }
      },
    },
    scales: {
      x: {
        grid: { 
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45,
        }
      },
      y: {
        type: 'linear',
        position: 'left',
        beginAtZero: false,
        min: Math.min(...volumeTrend) * 0.95,
        max: Math.max(...volumeTrend) * 1.05,
        grid: { 
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(99, 102, 241, 0.8)',
          font: { size: 10 },
          callback: function(value) {
            return value.toFixed(2) + '%';
          },
        },
        border: { display: false },
        title: {
          display: true,
          text: 'Volume Trend',
          color: 'rgba(99, 102, 241, 0.8)',
          font: { size: 12 },
          padding: { bottom: 10 }
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        suggestedMax: 0.5, // 0.5% of supply
        grid: {
          drawOnChartArea: false, // Only want the labels, not the grid
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)',
          font: { size: 10 },
          callback: function(value) {
            return `${value.toFixed(3)}%`;
          },
        },
        title: {
          display: true,
          text: 'Trading Volume',
          color: 'rgba(148, 163, 184, 0.8)',
          font: { size: 12 },
          padding: { bottom: 10 }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow-xl text-white grid-bg">
      <style>{chartAnimations}</style>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold mb-1">Whale Accumulation Trend</h2>
          <p className="text-slate-400 text-sm">Buy/sell activity from top {holderLimit} wallet holders</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex items-center">
            <span className="text-slate-400 text-xs mr-2">Analyze:</span>
            <div className="flex bg-slate-800 rounded-md p-1">
              {holderLimitOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setHolderLimit(option.value)}
                  className={`px-2 py-1 text-xs rounded ${
                    holderLimit === option.value
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-slate-400 text-xs mr-2">Timeframe:</span>
            <div className="flex bg-slate-800 rounded-md p-1">
              {timeframeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeframe(option.value)}
                  className={`px-2 py-1 text-xs rounded ${
                    timeframe === option.value
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* TradingView-like chart with combined price and volume */}
      <div className="chart-container bg-slate-800/60 p-4 mb-4">
        {/* Live indicator */}
        <div className="live-indicator">
          <div className={`live-dot ${liveIndicator ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
          <span className="text-white">LIVE</span>
        </div>
        
        {/* Trend indicator */}
        <div className="trend-indicator">
          {trendDirection === 'up' ? (
            <div className="text-emerald-400 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" /> ACCUMULATING
            </div>
          ) : trendDirection === 'down' ? (
            <div className="text-red-400 flex items-center">
              <TrendingDown className="w-4 h-4 mr-1" /> DISTRIBUTING
            </div>
          ) : (
            <div className="text-indigo-400 flex items-center">
              NEUTRAL
            </div>
          )}
        </div>
        
        {/* Shimmer overlay effect */}
        <div className="shimmer-overlay"></div>
        
        {/* Combined chart */}
        <div className="h-80">
          <Chart 
            ref={chartRef}
            type="bar" 
            data={combinedChartData} 
            options={chartOptions} 
          />
        </div>
      </div>
      
      {/* Stats panel with additional technical indicators */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs text-slate-400 mb-1">Buy Volume %</p>
          <p className="text-2xl font-semibold text-emerald-400">
            {((summary.totalBuyVolume / totalSupply) * 100).toFixed(4)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {formatNumber(summary.totalBuyVolume)} {tokenInfo.symbol}
          </p>
        </div>
        
        <div className="stat-card">
          <p className="text-xs text-slate-400 mb-1">Sell Volume %</p>
          <p className="text-2xl font-semibold text-red-400">
            {((summary.totalSellVolume / totalSupply) * 100).toFixed(4)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {formatNumber(summary.totalSellVolume)} {tokenInfo.symbol}
          </p>
        </div>
        
        <div className="stat-card">
          <p className="text-xs text-slate-400 mb-1">Net Volume %</p>
          <p className={`text-2xl font-semibold ${
            summary.netVolume >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {((summary.netVolume / totalSupply) * 100).toFixed(4)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {formatNumber(Math.abs(summary.netVolume))} {tokenInfo.symbol}
          </p>
        </div>
        
        <div className="stat-card">
          <p className="text-xs text-slate-400 mb-1">Trend Signal</p>
          <p className={`text-2xl font-semibold flex items-center ${
            summary.isNetAccumulation ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {summary.isNetAccumulation ? (
              <>ACCUMULATION <Zap className="w-5 h-5 ml-1 glowing-bar" /></>
            ) : (
              <>DISTRIBUTION <Zap className="w-5 h-5 ml-1 glowing-bar" /></>
            )}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {timeframe} period
          </p>
        </div>
      </div>
      
      {/* Footer with last update info */}
      <div className="mt-2 text-right text-xs text-slate-500 flex justify-between items-center">
        <span className="px-2 py-1 rounded bg-slate-800/50 text-xs">
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${liveIndicator ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
          Live data visualization
        </span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

// Helper function to format numbers
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  
  if (Math.abs(num) >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  } else {
    return num.toFixed(0);
  }
};

export default TokenDistributionChart;