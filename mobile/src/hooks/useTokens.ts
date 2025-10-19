// src/hooks/useTokens.ts
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/ApiService';
import { CACHE_DURATION } from '../config/constants';

/**
 * Hook to fetch token summary
 */
export const useTokenSummary = (mint: string) => {
  return useQuery({
    queryKey: ['token', mint],
    queryFn: () => apiService.getTokenSummary(mint),
    staleTime: CACHE_DURATION,
    enabled: !!mint,
  });
};

/**
 * Hook to fetch trending tokens
 */
export const useTrendingTokens = (limit: number = 20) => {
  return useQuery({
    queryKey: ['trending', limit],
    queryFn: async () => {
      const result = await apiService.getTrendingTokens(limit);
      return result.data; // Return just the tokens array for compatibility
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch trending tokens with cache info
 */
export const useTrendingTokensWithCache = (limit: number = 20) => {
  return useQuery({
    queryKey: ['trending-with-cache', limit],
    queryFn: () => apiService.getTrendingTokens(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch multiple tokens
 */
export const useTokensBatch = (mints: string[]) => {
  return useQuery({
    queryKey: ['tokens', ...mints],
    queryFn: () => apiService.getTokensBatch(mints),
    staleTime: CACHE_DURATION,
    enabled: mints.length > 0,
  });
};