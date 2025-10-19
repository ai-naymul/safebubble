// REPLACE src/domain/models/Token.ts

// Import and re-export RiskScore from the dedicated file
import { RiskScore } from './RiskScore';
export { RiskScore };

/**
 * Token Model (Enhanced with transaction data)
 */
export interface Token {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  priceChange24h: number;
  priceChange1h?: number;
  priceChange6h?: number;
  priceChange5m?: number;
  marketCap: number;
  volume24h: number;
  holderCount: number;
  topHoldersPercentage: number | string;
  topHolders: TokenHolder[];
  totalSupply: bigint;
  totalLiquidity: number;
  riskScore: RiskScore;
  pools: LiquidityPool[];
  authorities: TokenAuthorities;
  createdAt: string | null;
  gtScore: number;
  isHoneypot: boolean | string | 'unknown';
  logoUri?: string;
  category?: string;
  website?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  lastUpdated: Date;
  
  // 🚀 NEW: Enhanced Risk Assessment Data (REAL ENDPOINTS)
  recentTrades?: TokenRecentTrades;
  ohlcvAnalysis?: TokenOHLCVAnalysis;
}

export interface TokenHolder {
  address: string;
  amount: bigint;
  percentage: number;
  rank?: number;
}

export interface TokenAuthorities {
  mintAuthority: string | null;
  freezeAuthority: string | null;
  mintRenounced: boolean;
  freezeRenounced: boolean;
}

export interface LiquidityPool {
  amm: string;
  poolAddress: string;
  baseToken: string;
  quoteToken: string;
  tvlUsd: number;
  volume24h: number;
  apr: number;
  createdAt: Date;
  lockedLiquidityPercentage: number;
  
  // 🔥 NEW: Transaction data for honeypot detection
  transactions?: {
    h24: {
      buys: number;
      sells: number;
      buyers: number;
      sellers: number;
    };
    h1?: {
      buys: number;
      sells: number;
      buyers: number;
      sellers: number;
    };
  };
  
  // 🔥 NEW: Volume breakdown
  volumeUsd?: {
    h24: number;
    h1?: number;
  };
  
  // 🔥 NEW: Price change data
  priceChangePercentage?: {
    h24: number;
    h6?: number;
    h1?: number;
  };
}

export type RiskLevel = 'SAFE' | 'MEDIUM' | 'DANGER';

// 🚀 NEW: Enhanced Risk Assessment Interfaces (REAL DATA)

export interface TokenRecentTrades {
  trades: any[]; // Raw trade data from API
  analysis: {
    washTradingScore: number; // 0-100 (higher = more suspicious)
    unusualTradingDetected: boolean;
    whaleActivityScore: number; // 0-100 (higher = more whale activity)
    buySellRatio: number;
    averageTradeSize: number;
    suspiciousTransactions: number;
    totalBuyVolume: number;
    totalSellVolume: number;
  };
  totalTrades: number;
  lastTradeTime: string | null;
}

export interface TokenOHLCVAnalysis {
  ohlcvData: any[]; // Raw OHLCV data from API
  analysis: {
    volatilityScore: number; // 0-100 (higher = more volatile)
    trendDirection: 'bullish' | 'bearish' | 'neutral';
    volumeAnomalies: Array<{
      timestamp: number;
      volume: number;
      avgVolume: number;
      spikeRatio: number;
    }>;
    priceManipulationRisk: number; // 0-100 (higher = more risk)
    liquidityStability: 'stable' | 'moderate' | 'volatile' | 'unknown';
    averageVolume: number;
    priceRange: {
      high: number;
      low: number;
      range: number;
    };
  };
  timeframe: 'day' | 'hour' | 'minute';
  dataPoints: number;
}