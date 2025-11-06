// src/utils/networkUtils.ts

/**
 * Network utilities for getting local IP and handling network configuration
 */

/**
 * Get the current API base URL
 * This will use the production URL for consistency and reliability
 */
export const getApiBaseUrl = (): string => {
  // Always use production URL for now - more reliable than dynamic IP detection
  // TODO: Add development mode detection for local development
  return 'https://safebubble.duckdns.org/api';
};

/**
 * Get the current Metro bundler URL
 */
export const getMetroUrl = (): string => {
  if (__DEV__) {
    const metroUrl = process.env.EXPO_PUBLIC_METRO_URL;
    if (metroUrl) {
      return metroUrl;
    }

    // Fallback
    return 'http://localhost:8081';
  }

  return '';
};

/**
 * Check if we're running in development mode
 */
export const isDevelopment = (): boolean => {
  return __DEV__;
};

/**
 * Get network configuration info for debugging
 */
export const getNetworkInfo = () => {
  return {
    apiBaseUrl: getApiBaseUrl(),
    metroUrl: getMetroUrl(),
    isDevelopment: isDevelopment(),
    envIP: process.env.EXPO_PUBLIC_LOCAL_IP,
    envMetroUrl: process.env.EXPO_PUBLIC_METRO_URL,
    currentTime: new Date().toISOString()
  };
};
