import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pie, Doughnut, PolarArea } from 'react-chartjs-2';
import Card from '../common/Card';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchTopHolders } from '../../services/tokenService';

// Register ChartJS components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  LineController, // 🔥 this is the fix
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  LineController // ✅ register the missing controller
);


// Color palette for the chart - vibrant colors
const COLOR_PALETTE = [
  'rgba(0, 122, 255, 0.8)',    // iOS blue
  'rgba(255, 45, 85, 0.8)',    // iOS red
  'rgba(52, 199, 89, 0.8)',    // iOS green
  'rgba(255, 149, 0, 0.8)',    // iOS orange
  'rgba(175, 82, 222, 0.8)',   // iOS purple
  'rgba(88, 86, 214, 0.8)',    // iOS indigo
  'rgba(90, 200, 250, 0.8)',   // iOS light blue
  'rgba(255, 204, 0, 0.8)',    // iOS yellow
  'rgba(0, 199, 190, 0.8)',    // teal
  'rgba(76, 217, 100, 0.8)',   // lime green
  'rgba(255, 59, 48, 0.8)',    // bright red
  'rgba(224, 102, 255, 0.8)',  // hot pink
  'rgba(88, 141, 255, 0.8)',   // cerulean
  'rgba(254, 138, 65, 0.8)',   // coral
  'rgba(36, 178, 125, 0.8)',   // emerald
  'rgba(255, 81, 151, 0.8)',   // fuchsia
  'rgba(78, 116, 215, 0.8)',   // royal blue
  'rgba(249, 155, 51, 0.8)',   // amber
  'rgba(54, 146, 109, 0.8)',   // jade
  'rgba(193, 53, 132, 0.8)',   // magenta
];

const TopHoldersPieChart = ({ tokenAddress }) => {
  // State to track the number of top holders to display
  const [topHoldersCount, setTopHoldersCount] = useState(10);
  // State to track chart type
  const [chartType, setChartType] = useState('doughnut');
  // State to track if others category is expanded
  const [expandOthers, setExpandOthers] = useState(false);

  // Fetch top holders data
  const { 
    data: responseData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery(
    ['topHolders', tokenAddress],
    () => fetchTopHolders(tokenAddress, 100), // Fetch top 100 holders
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Memoized data processing
  const processedData = useMemo(() => {
    // If no data or holders, return empty array
    if (!responseData || !responseData.holders) return [];

    // Use the original data's rank and percentage
    return responseData.holders
      .map(holder => {
        // Safely format the wallet address if it exists
        let wallet = "Unknown";
        if (holder.wallet_address) {
          wallet = holder.wallet_address.substring(0, 6) + '...' + holder.wallet_address.substring(holder.wallet_address.length - 4);
        }
        
        return {
          ...holder,
          percentage: parseFloat(holder.percentage.toFixed(2)),
          wallet
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [responseData]);
  
  // Check if response data has whale tags
  const hasWhaleTags = useMemo(() => {
    if (!processedData.length) return false;
    return processedData.some(holder => holder.tag || holder.label);
  }, [processedData]);

  // Calculate concentration metrics
  const concentrationMetrics = useMemo(() => {
    if (!processedData.length) return null;
    
    const top1Percentage = processedData[0]?.percentage || 0;
    const top3Percentage = processedData.slice(0, 3).reduce((sum, holder) => sum + holder.percentage, 0);
    const top5Percentage = processedData.slice(0, 5).reduce((sum, holder) => sum + holder.percentage, 0);
    const top10Percentage = processedData.slice(0, 10).reduce((sum, holder) => sum + holder.percentage, 0);
    const top20Percentage = processedData.slice(0, 20).reduce((sum, holder) => sum + holder.percentage, 0);
    
    // Calculate Gini coefficient
    // Higher value means more concentration (1 = one person has everything, 0 = everyone has equal amount)
    let giniCoefficient = 0;
    if (processedData.length > 1) {
      const n = Math.min(processedData.length, 100); // Cap at 100 holders
      let sumAbsoluteDifferences = 0;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          sumAbsoluteDifferences += Math.abs(processedData[i].percentage - processedData[j].percentage);
        }
      }
      giniCoefficient = (sumAbsoluteDifferences / (2 * n * n * processedData[0].percentage)).toFixed(2);
    }
    const va = '100%';
    return {
      top1Percentage,
      top3Percentage,
      top5Percentage,
      top10Percentage,
      top20Percentage,
      giniCoefficient,
      totalHolders: va
    };
  }, [processedData]);

  // Distribution category based on concentration
  const distributionCategory = useMemo(() => {
    if (!concentrationMetrics) return null;
    
    const { top3Percentage, top10Percentage, giniCoefficient } = concentrationMetrics;
    
    if (top3Percentage > 70) return { 
      type: 'Highly Centralized', 
      description: 'Top 3 wallets control most of the supply, indicating very concentrated ownership.',
      risk: 'high',
      color: 'text-red-400'
    };
    if (top3Percentage > 50) return { 
      type: 'Centralized', 
      description: 'Ownership is concentrated among a small number of wallets.',
      risk: 'medium-high',
      color: 'text-orange-400'
    };
    if (top10Percentage > 70) return { 
      type: 'Moderately Concentrated', 
      description: 'Top 10 wallets hold significant supply, but distribution is improving.',
      risk: 'medium',
      color: 'text-yellow-400'
    };
    if (giniCoefficient > 0.5) return { 
      type: 'Somewhat Distributed', 
      description: 'Some large holders but moving toward wider distribution.',
      risk: 'medium-low',
      color: 'text-blue-400'
    };
    return { 
      type: 'Well Distributed', 
      description: 'No single wallet or small group dominates the supply.',
      risk: 'low',
      color: 'text-green-400'
    };
  }, [concentrationMetrics]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!processedData.length) return null;

    // Maximum number of wallets to display individually (max 20)
    const maxDisplayWallets = Math.min(20, topHoldersCount);
    
    // Get the top wallets to display
    const topWallets = processedData.slice(0, maxDisplayWallets);
    
    // Calculate top wallets percentage
    const topWalletsPercentage = topWallets.reduce((sum, holder) => sum + holder.percentage, 0);
    
    // Others calculation
    const otherWallets = processedData.slice(maxDisplayWallets);
    const othersPercentage = otherWallets.reduce((sum, holder) => sum + holder.percentage, 0);

    // Prepare labels and data
    let labels = [];
    let data = [];
    let backgroundColors = [];
    
    // Add top wallets
    topWallets.forEach((holder, index) => {
      // Use whale tag/label if available, otherwise use address
      const displayName = (holder.tag || holder.label) 
        ? `${holder.tag || holder.label}`
        : `Wallet ${holder.rank}`;
        
      labels.push(displayName);
      data.push(holder.percentage);
      backgroundColors.push(COLOR_PALETTE[index % COLOR_PALETTE.length]);
    });
    
    // Add others category if needed
    if (othersPercentage > 0) {
      if (expandOthers && otherWallets.length <= 20) {
        // Show each wallet in "Others" individually (up to 20 more)
        otherWallets.forEach((holder, index) => {
          const displayName = (holder.tag || holder.label) 
            ? `${holder.tag || holder.label}`
            : `Wallet ${holder.rank}`;
            
          labels.push(displayName);
          data.push(holder.percentage);
          // Use a gradient of grays for "others" wallets
          const opacity = 0.7 - (index / (otherWallets.length * 2));
          backgroundColors.push(`rgba(107, 114, 128, ${Math.max(0.3, opacity)})`);
        });
      } else {
        // Group as "Others"
        labels.push('Others');
        data.push(othersPercentage);
        backgroundColors.push('rgba(107, 114, 128, 0.7)');
      }
    }

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: 'rgba(17, 24, 39, 0.8)',
          borderWidth: 1,
          hoverOffset: 15,
        },
      ],
    };
  }, [processedData, topHoldersCount, expandOthers]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 15
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(209, 213, 219, 1)',
          font: { size: 11 },
          boxWidth: 12,
          padding: 10,
          // Truncate long labels
          generateLabels: (chart) => {
            const originalLabels = ChartJS.overrides.pie.plugins.legend.labels.generateLabels(chart);
            return originalLabels.map(label => {
              // Truncate long labels to 20 characters
              if (label.text && label.text.length > 20) {
                label.text = label.text.substring(0, 18) + '...';
              }
              return label;
            });
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(209, 213, 219, 1)',
        borderColor: 'rgba(55, 65, 81, 1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const percentage = context.raw.toFixed(2) + '%';
            
            // For top wallets section, try to show address info
            if (context.dataIndex < Math.min(processedData.length, topHoldersCount)) {
              try {
                const holder = processedData[context.dataIndex];
                if (holder && holder.wallet) {
                  return [`Percentage: ${percentage}`, `Address: ${holder.wallet}`];
                }
              } catch (e) {
                // If any error occurs accessing the data, fall back to simple display
                console.log("Error in tooltip:", e);
              }
            }
            
            // Fallback for "Others" category or if there was an error
            return `Percentage: ${percentage}`;
          },
          title: function(context) {
            return context[0].label;
          }
        }
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  // Polar area specific options
  const polarAreaOptions = {
    ...chartOptions,
    scales: {
      r: {
        ticks: {
          color: 'rgba(156, 163, 175, 0.8)',
          backdropColor: 'rgba(17, 24, 39, 0.5)',
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.4)',
        },
        angleLines: {
          color: 'rgba(55, 65, 81, 0.4)',
        },
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card title="Token Distribution">
        <LoadingState height="h-96" message="Loading distribution data..." />
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card title="Token Distribution">
        <ErrorDisplay
          title="Failed to load distribution data"
          message={error?.message || 'An error occurred while fetching distribution data'}
          onRetry={refetch}
        />
      </Card>
    );
  }

  // No data state
  if (!processedData || processedData.length === 0) {
    return (
      <Card title="Token Distribution">
        <div className="py-8 text-center text-dark-400">
          No distribution data available
        </div>
      </Card>
    );
  }

  // Render the selected chart type
  const renderChart = () => {
    if (!chartData) return null;

    switch (chartType) {
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'polarArea':
        return <PolarArea data={chartData} options={polarAreaOptions} />;
      case 'doughnut':
      default:
        return <Doughnut data={chartData} options={chartOptions} />;
    }
  };

  return (
    <Card 
      title="Token Distribution" 
      subtitle="Percentage of total supply held by top wallets"
    >
      <div className="flex flex-col gap-4">
        {/* Control Bar */}
        <div className="grid grid-cols-2 gap-4">
          {/* Holder Count Selector */}
          <div>
            <p className="text-xs text-dark-400 mb-1">Top Wallets</p>
            <div className="flex space-x-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => setTopHoldersCount(count)}
                  className={`px-3 py-1 text-xs rounded ${
                    topHoldersCount === count 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart Type Selector */}
          <div>
            <p className="text-xs text-dark-400 mb-1">Chart Type</p>
            <div className="flex space-x-2">
              {[
                { id: 'doughnut', label: 'Doughnut' },
                { id: 'pie', label: 'Pie' },
                { id: 'polarArea', label: 'Polar' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id)}
                  className={`px-3 py-1 text-xs rounded ${
                    chartType === type.id 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart and Distribution Info */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Chart Area */}
          <div className="w-full md:w-3/5">
            <div className="h-80">
              {renderChart()}
            </div>
            
            {/* Others expand button - show only if there are "others" */}
            {processedData.length > topHoldersCount && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => setExpandOthers(!expandOthers)}
                  className="text-xs text-primary-400 hover:text-primary-300 underline"
                >
                  {expandOthers ? 'Group smaller wallets' : 'Expand smaller wallets'}
                </button>
              </div>
            )}
          </div>
          
          {/* Analysis Panel */}
          <div className="w-full md:w-2/5">
            <div className="space-y-4">
              {/* Distribution Category */}
              <div className="bg-dark-800/50 p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-dark-300">Distribution Type</p>
                  <span className={`text-sm font-semibold ${distributionCategory?.color}`}>
                    {distributionCategory?.type}
                  </span>
                </div>
                <p className="text-dark-400 text-xs">
                  {distributionCategory?.description}
                </p>
              </div>
              
              {/* Concentration Metrics */}
              <div className="bg-dark-800/50 p-3 rounded-md">
                <p className="text-sm font-medium text-dark-300 mb-2">Concentration Metrics</p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <p className="text-xs text-dark-400">Top Holder</p>
                    <p className="text-lg font-semibold text-white">
                      {concentrationMetrics?.top1Percentage.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Top 3 Holders</p>
                    <p className="text-lg font-semibold text-white">
                      {concentrationMetrics?.top3Percentage.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Top 10 Holders</p>
                    <p className="text-lg font-semibold text-white">
                      {concentrationMetrics?.top10Percentage.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400">Total Holders</p>
                    <p className="text-lg font-semibold text-white">
                      {concentrationMetrics?.totalHolders.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Distribution Quality Score */}
              <div className="bg-dark-800/50 p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-dark-300">Gini Coefficient</p>
                  <span className="text-xs text-dark-400">
                    (0 = Equal, 1 = Concentrated)
                  </span>
                </div>
                
                {/* Gini Coefficient Progress Bar */}
                <div className="h-4 w-full bg-dark-700 rounded-full overflow-hidden mb-1">
                  <div 
                    className={`h-full rounded-full ${
                      concentrationMetrics?.giniCoefficient < 0.3 ? 'bg-green-500' :
                      concentrationMetrics?.giniCoefficient < 0.5 ? 'bg-blue-500' :
                      concentrationMetrics?.giniCoefficient < 0.7 ? 'bg-yellow-500' :
                      concentrationMetrics?.giniCoefficient < 0.9 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{width: `${(concentrationMetrics?.giniCoefficient || 0) * 100}%`}}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-dark-400">Equal distribution</span>
                  <span className="text-sm font-semibold text-white">
                    {concentrationMetrics?.giniCoefficient}
                  </span>
                  <span className="text-xs text-dark-400">Concentrated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-3 text-xs text-dark-500 text-right">
        Last updated: {new Date().toLocaleString()}
      </div>
    </Card>
  );
};

export default TopHoldersPieChart;