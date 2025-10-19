// src/config/constants.ts

/**
 * Application Constants
 * 
 * Metro bundler (port 8081) and API server (port 3000) are separate services:
 * - Metro: Serves your React Native app bundle
 * - API: Your backend server for data
 */

import { getApiBaseUrl } from '../utils/networkUtils';

// Get the API base URL dynamically
export const API_BASE_URL = getApiBaseUrl();

export const CACHE_DURATION = 30 * 1000; // 30 seconds

export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%

export const POPULAR_TOKENS = [
  'So11111111111111111111111111111111111111112', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',  // JUP
];
