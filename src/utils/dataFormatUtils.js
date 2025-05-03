
export const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    
    return parseFloat(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  /**
   * Format a number as currency (USD)
   * @param {number} num - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted currency
   */
  export const formatCurrency = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };
  
  /**
   * Format a percentage
   * @param {number} num - Number to format as percentage
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage
   */
  export const formatPercent = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0%';
    }
    
    return `${parseFloat(num).toFixed(decimals)}%`;
  };
  
  /**
   * Format a date to a readable string
   * @param {string|Date} date - Date to format
   * @param {boolean} includeTime - Whether to include time
   * @returns {string} Formatted date
   */
  export const formatDate = (date, includeTime = false) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    
    if (includeTime) {
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  /**
   * Format a timestamp to relative time (e.g. "2 hours ago")
   * @param {string|Date} timestamp - Timestamp to format
   * @returns {string} Relative time
   */
  export const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  };
  
  /**
   * Shorten an address or hash for display
   * @param {string} address - The address to shorten
   * @param {number} chars - Number of characters to show at start and end
   * @returns {string} Shortened address
   */
  export const shortenAddress = (address, chars = 4) => {
    if (!address) return '';
    if (address.length <= chars * 2) return address;
    
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
  };
  
  /**
   * Format token amounts with symbol and decimal precision
   * @param {number} amount - Token amount
   * @param {number} decimals - Token decimals
   * @param {string} symbol - Token symbol
   * @returns {string} Formatted token amount
   */
  export const formatTokenAmount = (amount, decimals = 9, symbol = '') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return symbol ? `0 ${symbol}` : '0';
    }
    
    const formattedAmount = formatNumber(amount, decimals);
    return symbol ? `${formattedAmount} ${symbol}` : formattedAmount;
  };
  
  /**
   * Format data for charts with proper labels and values
   * @param {Array} data - Raw data array
   * @param {string} labelKey - Key for labels
   * @param {string} valueKey - Key for values
   * @returns {Array} Formatted data for charts
   */
  export const formatData = (data, labelKey, valueKey) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      label: item[labelKey],
      value: item[valueKey]
    }));
  };


export const formatPercentage = (value, digits = 2) => {
  if (value === null || value === undefined) return 'N/A';
  
  const formatted = value.toFixed(digits);
  return value > 0 ? `+${formatted}%` : `${formatted}%`;
};

export default { formatNumber, formatPercentage };