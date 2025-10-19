// src/domain/models/Token.ts

/**
 * Token Model (Mobile)
 * Simplified version for mobile app
 */
export interface Token {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  priceChange24h?: number | string;
  marketCap: number;
  volume24h: number;
  holderCount: number;
  riskScore: RiskScore;
  logoUri?: string;
  category?: string;
  pools?: any[]; // Simplified for mobile
  
  // 🚀 NEW: Enhanced Risk Assessment Data
  recentTrades?: TokenRecentTrades;
  ohlcvAnalysis?: TokenOHLCVAnalysis;
}

export interface RiskScore {
  totalScore: number;
  riskLevel: 'SAFE' | 'MEDIUM' | 'DANGER';
  breakdown: {
    honeypotRisk: {
      score: number;
      isHoneypot: boolean | string | 'unknown';
      detectionMethod?: string;
      sellRatio?: number | string;
    };
    authorityRisk: { 
      score: number;
      mintAuthorityPresent: boolean;
      freezeAuthorityPresent: boolean;
    };
    concentrationRisk: { score: number; top10Percentage: number | string };
    liquidityRisk: { 
      score: number; 
      totalLiquidityUsd: number;
      liquidityLocked: boolean;
    };
    marketRisk: { score: number; volume24h: number };
    ageRisk: { score: number; ageInDays: number };
    gtScoreRisk: {
      score: number;
      gtScore: number;
    };
    // 🚀 NEW: Enhanced risk factors
    tradingPatternRisk?: {
      score: number;
      washTradingScore: number;
      unusualTradingDetected: boolean;
      whaleActivityScore: number;
      buySellRatio: number;
      suspiciousTransactions: number;
    };
    volatilityRisk?: {
      score: number;
      volatilityScore: number;
      trendDirection: 'bullish' | 'bearish' | 'neutral';
      priceManipulationRisk: number;
      liquidityStability: 'stable' | 'moderate' | 'volatile' | 'unknown';
    };
  };
  warnings: string[];
  confidence: number | string;
}

// 🚀 NEW: Enhanced Risk Assessment Interfaces (Mobile)

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