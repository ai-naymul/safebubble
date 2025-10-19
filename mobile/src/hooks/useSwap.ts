// src/hooks/useSwap.ts
import { useMutation } from '@tanstack/react-query';
import { apiService } from '../services/ApiService';

/**
 * Hook for swap operations
 */
export const useSwapQuote = () => {
  return useMutation({
    mutationFn: ({
      inputMint,
      outputMint,
      amount,
      slippageBps,
    }: {
      inputMint: string;
      outputMint: string;
      amount: string;
      slippageBps?: number;
    }) => apiService.getSwapQuote(inputMint, outputMint, amount, slippageBps),
  });
};

export const useBuildSwapTransaction = () => {
  return useMutation({
    mutationFn: ({
      userPublicKey,
      quoteResponse,
    }: {
      userPublicKey: string;
      quoteResponse: any;
    }) => apiService.buildSwapTransaction(userPublicKey, quoteResponse),
  });
};