export interface SwapQuote {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: 'ExactIn' | 'ExactOut';
    slippageBps: number;
    priceImpactPct: number;
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
  

export interface SwapTransaction {
    swapTransaction: string; // base64 encoded
    lastValidBlockHeight: number;
}