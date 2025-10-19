// src/services/JupiterService.ts
import { PublicKey } from '@solana/web3.js';
import { apiService } from './ApiService';

/**
 * Decode base64 string to Uint8Array without relying on Buffer
 */
function base64ToUint8Array(base64: string): Uint8Array {
  // Remove any padding characters and decode
  const cleanBase64 = base64.replace(/=/g, '');
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

export interface JupiterQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: string; // Raw amount in smallest units
  slippageBps?: number;
}

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: 'ExactIn' | 'ExactOut';
  slippageBps: number;
  priceImpactPct: number | string;
  routePlan: RoutePlan[];
}

export interface RoutePlan {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface SwapResponse {
  swapTransaction: string; // Base64 encoded
  lastValidBlockHeight: number;
}

/**
 * Get swap quote from Jupiter via backend API
 */
export async function getJupiterQuote(params: JupiterQuoteParams): Promise<JupiterQuote> {
  try {
    const quote = await apiService.getSwapQuote(
      params.inputMint,
      params.outputMint,
      params.amount,
      params.slippageBps || 50
    );
    
    return quote;
  } catch (error) {
    console.error('Failed to get Jupiter quote:', error);
    throw new Error(`Jupiter quote failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build swap transaction from quote via backend API
 */
export async function buildJupiterSwap(
  quoteResponse: JupiterQuote,
  userPublicKey: string,
  options?: {
    dynamicSlippage?: boolean;
    prioritizationFeeLamports?: number;
  }
): Promise<Uint8Array> {
  try {
    const transaction = await apiService.buildSwapTransaction(
      userPublicKey,
      quoteResponse
    );
    
    // Decode base64 to Uint8Array
    if (!transaction.swapTransaction || typeof transaction.swapTransaction !== 'string') {
      throw new Error('Invalid swap transaction received from server');
    }

    try {
      console.log('Transaction string length:', transaction.swapTransaction.length);
      console.log('Transaction string preview:', transaction.swapTransaction.substring(0, 50) + '...');

      const uint8Array = base64ToUint8Array(transaction.swapTransaction);

      console.log('Decoded Uint8Array length:', uint8Array.length);

      return uint8Array;
    } catch (decodeError) {
      console.error('Failed to decode base64 transaction:', decodeError);
      console.error('Transaction string:', transaction.swapTransaction);
      const errorMessage = decodeError instanceof Error ? decodeError.message : 'Unknown decoding error';
      throw new Error(`Failed to decode swap transaction: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Failed to build Jupiter swap:', error);
    throw new Error(`Jupiter swap build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if route includes Raydium
 */
export function includesRaydium(quote: JupiterQuote): boolean {
  return quote.routePlan?.some((hop) => 
    (hop.swapInfo?.label || '').toLowerCase().includes('raydium')
  ) || false;
}

/**
 * Get route description for UI display
 */
export function getRouteDescription(quote: JupiterQuote): string {
  const labels = quote.routePlan?.map(hop => hop.swapInfo.label) || [];
  const uniqueLabels = [...new Set(labels)];
  
  if (uniqueLabels.length === 0) return 'Direct';
  if (uniqueLabels.length === 1) return uniqueLabels[0];
  return `${uniqueLabels.length} hops`;
}

/**
 * Format price impact for display
 */
export function formatPriceImpact(priceImpactPct: number | string): string {
  const impact = Math.abs(typeof priceImpactPct === 'string' ? parseFloat(priceImpactPct) : priceImpactPct);
  
  if (impact < 0.01) return '< 0.01%';
  if (impact < 1) return `${impact.toFixed(2)}%`;
  if (impact < 5) return `${impact.toFixed(1)}%`;
  return `${impact.toFixed(0)}%`;
}

/**
 * Get price impact severity
 */
export function getPriceImpactSeverity(priceImpactPct: number | string): 'low' | 'medium' | 'high' {
  const impact = Math.abs(typeof priceImpactPct === 'string' ? parseFloat(priceImpactPct) : priceImpactPct);
  
  if (impact < 1) return 'low';
  if (impact < 5) return 'medium';
  return 'high';
}

/**
 * Calculate output amount with slippage
 */
export function calculateMinimumReceived(
  outAmount: string,
  slippageBps: number
): string {
  const amount = BigInt(outAmount);
  const slippageMultiplier = BigInt(10000 - slippageBps);
  const minimumAmount = (amount * slippageMultiplier) / BigInt(10000);
  return minimumAmount.toString();
}

