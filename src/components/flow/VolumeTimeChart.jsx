import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Card from '../common/Card';
import LoadingState from '../common/LoadingState';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchVolumeOverTime } from '../../services/transactionService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VolumeTimeChart = ({ tokenAddress }) => {
  const [timeframe, setTimeframe] = useState('7d');
  const [debugInfo, setDebugInfo] = useState(null);
  
  const { data: responseData, isLoading, isError, error, refetch } = useQuery(
    ['volumeOverTime', tokenAddress, timeframe],
    () => fetchVolumeOverTime(tokenAddress, timeframe),
    {
      enabled: !!tokenAddress,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  );

  // Debug logging
  useEffect(() => {
    if (responseData) {
      console.log('Volume Over Time API Response:', responseData);
      setDebugInfo({
        type: typeof responseData,
        isArray: Array.isArray(responseData),
        hasDataProperty: responseData && 'data' in responseData,
        keys: responseData ? Object.keys(responseData) : [],
        value: JSON.stringify(responseData).substring(0, 500) + '...'
      });
    }
  }, [responseData]);
  
  // Safely extract volume data
  let volumeData = [];
  try {
    if (responseData) {
      if (Array.isArray(responseData)) {
        volumeData = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        volumeData = responseData.data;
      } else if (typeof responseData === 'object') {
        // Try to find any array property
        const arrayProps = Object.keys(responseData).filter(key => 
          Array.isArray(responseData[key])
        );
        if (arrayProps.length > 0) {
          volumeData = responseData[arrayProps[0]];
        }
      }
    }
  } catch (err) {
    console.error('Error extracting volume data:', err);
  }

  const timeframeOptions = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
  ];

  if (isLoading) {
    return (
      <Card title="Transaction Volume">
        <LoadingState height="h-60" message="Loading volume data..." />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card title="Transaction Volume">
        <ErrorDisplay
          title="Failed to load volume data"
          message={error?.message || 'An error occurred while fetching volume data'}
          onRetry={refetch}
        />
      </Card>
    );
  }

  if (!Array.isArray(volumeData) || volumeData.length === 0) {
    return (
      <Card title="Transaction Volume">
        <div className="py-8 text-center text-dark-400">
          {debugInfo ? (
            <div className="text-left p-4 bg-dark-800 rounded overflow-auto text-xs">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <p>Response Type: {debugInfo.type}</p>
              <p>Is Array: {debugInfo.isArray.toString()}</p>
              <p>Has Data Property: {debugInfo.hasDataProperty.toString()}</p>
              <p>Keys: {debugInfo.keys.join(', ')}</p>
              <p>Value: {debugInfo.value}</p>
            </div>
          ) : 'No volume data available for the selected timeframe'}
        </div>
      </Card>
    );
  }

  // Map data to expected format if needed
  const chartData = {
    labels: volumeData.map(item => 
      item.label || 
      (item.time ? new Date(item.time).toLocaleDateString() : 'Unknown')
    ),
    datasets: [
      {
        label: 'Volume',
        data: volumeData.map(item => item.volume || 0),
        backgroundColor: 'rgba(14, 165, 233, 0.7)', // primary-500
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(56, 189, 248, 0.8)', // primary-400
      },
      {
        label: 'Transactions',
        data: volumeData.map(item => item.count || item.transaction_count || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.7)', // secondary-500
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(167, 139, 250, 0.8)', // secondary-400
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(209, 213, 219, 1)', // dark-300
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(31, 41, 55, 0.9)', // dark-800
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(209, 213, 219, 1)',
        borderColor: 'rgba(75, 85, 99, 1)', // dark-600
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(31, 41, 55, 0.5)', // dark-800
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)', // dark-400
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(31, 41, 55, 0.5)', // dark-800
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)', // dark-400
          callback: function(value) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
          },
        },
        title: {
          display: true,
          text: 'Volume',
          color: 'rgba(156, 163, 175, 1)', // dark-400
        }
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false, // only show grid for the left y-axis
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)', // dark-400
          callback: function(value) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
          },
        },
        title: {
          display: true,
          text: 'Transaction Count',
          color: 'rgba(156, 163, 175, 1)', // dark-400
        }
      }
    },
  };

  // Calculate total volume and transactions with safe access
  const totalVolume = volumeData.reduce((sum, item) => sum + (item.volume || 0), 0);
  const totalTransactions = volumeData.reduce((sum, item) => 
    sum + (item.count || item.transaction_count || 0), 0);
  
  // Get average daily volume and transactions
  const periodDays = volumeData.length || 1;
  const avgVolume = totalVolume / periodDays;
  const avgTransactions = totalTransactions / periodDays;

  return (
    <Card 
      title="Transaction Volume" 
      subtitle="Token transfer volume and transaction count over time"
    >
      <div className="flex justify-end mb-4">
        <div className="flex space-x-2">
          {timeframeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value)}
              className={`px-2 py-1 text-xs rounded ${
                timeframe === option.value
                  ? 'bg-primary-900/30 text-primary-400'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-dark-800/50 rounded-md text-center">
          <p className="text-xs text-dark-400">Total Volume</p>
          <p className="text-lg font-medium text-white">
            {totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-dark-400">
            Avg {avgVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}/day
          </p>
        </div>
        <div className="p-3 bg-dark-800/50 rounded-md text-center">
          <p className="text-xs text-dark-400">Total Transactions</p>
          <p className="text-lg font-medium text-white">
            {totalTransactions.toLocaleString()}
          </p>
          <p className="text-xs text-dark-400">
            Avg {avgTransactions.toLocaleString(undefined, { maximumFractionDigits: 0 })}/day
          </p>
        </div>
      </div>
    </Card>
  );
};

export default VolumeTimeChart;