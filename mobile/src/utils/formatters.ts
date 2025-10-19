// src/utils/formatters.ts

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '$0.00';
  }
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
};

/**
 * Format price with appropriate decimal places
 */
export const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null || isNaN(price)) {
    return '$0.00';
  }
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  }
  if (price >= 0.0001) {
    return `$${price.toFixed(6)}`;
  }
  return `$${price.toFixed(8)}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (percent: number | string | undefined | null): string => {
  // Debug logging to help identify issues
  if (process.env.NODE_ENV === 'development') {
    console.log('formatPercentage called with:', { percent, type: typeof percent });
  }
  
  // Handle undefined/null
  if (percent === undefined || percent === null) {
    return '+0.00%';
  }
  
  // Convert string to number if needed
  let numValue: number;
  if (typeof percent === 'string') {
    numValue = parseFloat(percent);
  } else if (typeof percent === 'number') {
    numValue = percent;
  } else {
    console.warn('formatPercentage received unexpected type:', typeof percent, percent);
    return '+0.00%';
  }
  
  // Check if the converted value is valid
  if (isNaN(numValue)) {
    console.warn('formatPercentage received invalid number:', percent);
    return '+0.00%';
  }
  
  const sign = numValue >= 0 ? '+' : '';
  return `${sign}${numValue.toFixed(2)}%`;
};

/**
 * Format date/time
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Get color for risk level
 */
export const getRiskColor = (riskLevel: 'SAFE' | 'MEDIUM' | 'DANGER'): string => {
  const { colors } = require('../theme');
  switch (riskLevel) {
    case 'SAFE':
      return colors.risk.safe.primary;
    case 'MEDIUM':
      return colors.risk.medium.primary;
    case 'DANGER':
      return colors.risk.danger.primary;
    default:
      return colors.text.tertiary;
  }
};

/**
 * Get background color for risk level
 */
export const getRiskBackgroundColor = (riskLevel: 'SAFE' | 'MEDIUM' | 'DANGER'): string => {
  const { colors } = require('../theme');
  switch (riskLevel) {
    case 'SAFE':
      return colors.risk.safe.background;
    case 'MEDIUM':
      return colors.risk.medium.background;
    case 'DANGER':
      return colors.risk.danger.background;
    default:
      return colors.background.tertiary;
  }
};

/**
 * Truncate wallet address
 */
export const truncateAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};