/**
 * Format number with appropriate suffix based on size
 */
export const formatNumber = (num, digits = 1) => {
    if (num === null || num === undefined) return 'N/A';
    
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "K" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function(item) {
      return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
  };
  
  /**
   * Format percentage with + sign for positive values
   */
  export const formatPercentage = (value, digits = 2) => {
    if (value === null || value === undefined) return 'N/A';
    
    const formatted = value.toFixed(digits);
    return value > 0 ? `+${formatted}%` : `${formatted}%`;
  };
  
  /**
   * Format date to readable string
   */
  export const formatDate = (date) => {
    if (!date) return 'N/A';
    
    // Handle string dates
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  /**
   * Format time to readable string
   */
  export const formatTime = (date) => {
    if (!date) return 'N/A';
    
    // Handle string dates
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Format date and time together
   */
  export const formatDateTime = (date) => {
    if (!date) return 'N/A';
    
    // Handle string dates
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return `${formatDate(date)} ${formatTime(date)}`;
  };
  
  /**
   * Truncate a string (like an address) with ellipsis in the middle
   */
  export const truncateString = (str, frontChars = 6, endChars = 4) => {
    if (!str) return '';
    if (str.length <= frontChars + endChars) return str;
    
    return `${str.substring(0, frontChars)}...${str.substring(str.length - endChars)}`;
  };
  
  /**
   * Format data for different chart types
   */
  export const formatChartData = (data, type) => {
    switch (type) {
      case 'pie':
        return formatPieChartData(data);
      case 'line':
        return formatLineChartData(data);
      case 'bar':
        return formatBarChartData(data);
      default:
        return data;
    }
  };
  
  // Helper formatting functions for specific chart types
  const formatPieChartData = (data) => {
    // Implementation for pie chart data
    return data;
  };
  
  const formatLineChartData = (data) => {
    // Implementation for line chart data
    return data;
  };
  
  const formatBarChartData = (data) => {
    // Implementation for bar chart data
    return data;
  };