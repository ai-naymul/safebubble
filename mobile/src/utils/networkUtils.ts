// src/utils/networkUtils.ts

/**
 * Network utilities for getting local IP and handling network configuration
 */

/**
 * Get the current API base URL
 * This will use the dynamically detected IP or fallback to localhost
 */
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // Try to get IP from environment variable first
    const envIP = process.env.EXPO_PUBLIC_LOCAL_IP;
    if (envIP && envIP !== 'localhost' && envIP !== '127.0.0.1') {
      return `http://${envIP}:3000/api`;
    }
    
    // Try to get IP from Metro bundler URL if available
    const metroUrl = process.env.EXPO_PUBLIC_METRO_URL || '';
    if (metroUrl) {
      const match = metroUrl.match(/http:\/\/([^:]+):/);
      if (match && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return `http://${match[1]}:3000/api`;
      }
    }
    
    // Fallback to your local IP for development
    return 'http://172.19.121.18:3000/api';
  }
  
  // Production: Use HTTPS domain
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
  };
};
