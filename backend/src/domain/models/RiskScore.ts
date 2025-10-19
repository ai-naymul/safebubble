export interface RiskScore {
    // Overall Score
    totalScore: number; // 0-100 (higher = riskier)
    riskLevel: RiskLevel;
    
    // Component Scores (each 0-100)
    breakdown: RiskBreakdown;
    
    // Signals & Warnings
    signals: RiskSignal[];
    warnings: string[];
    
    // Metadata
    calculatedAt: Date;
    confidence: number; // 0-1
}
  

export type RiskLevel = 'SAFE' | 'MEDIUM' | 'DANGER';
  

export interface RiskBreakdown {
    // Honeypot Risk (30 points max) - ENHANCED
    honeypotRisk: {
      score: number;
      isHoneypot: boolean | string | 'unknown';
      detectionMethod?: string;
      sellRatio?: number;
    };
    
    // Authority Risk (25 points max)
    authorityRisk: {
      score: number;
      mintAuthorityPresent: boolean;
      freezeAuthorityPresent: boolean;
    };
    
    // Holder Concentration (20 points max)
    concentrationRisk: {
      score: number;
      topHolderPercentage: number;
      top10Percentage: number;
    };
    
    // Liquidity Risk (15 points max) - ENHANCED
    liquidityRisk: {
      score: number;
      hasPool: boolean;
      totalLiquidityUsd: number;
      liquidityLocked: boolean;
      volumeToLiquidityRatio: number;
    };
    
    // Market Risk (10 points max) - ENHANCED
    marketRisk: {
      score: number;
      volume24h: number;
      marketCap: number;
      spreadPercentage: number;
    };
    
    // Age Risk (5 points max)
    ageRisk: {
      score: number;
      ageInDays: number;
      firstTradeDate: string | null;
    };
    
    // 🚀 NEW: Trading Pattern Risk (15 points max)
    tradingPatternRisk: {
      score: number;
      washTradingScore: number;
      unusualTradingDetected: boolean;
      whaleActivityScore: number;
      buySellRatio: number;
      suspiciousTransactions: number;
    };
    
    // 🚀 NEW: Volatility Risk (10 points max)
    volatilityRisk: {
      score: number;
      volatilityScore: number;
      trendDirection: 'bullish' | 'bearish' | 'neutral';
      priceManipulationRisk: number;
      liquidityStability: 'stable' | 'moderate' | 'volatile' | 'unknown';
    };
    
    // GT Score Risk (20 points max)
    gtScoreRisk: {
      score: number;
      gtScore: number;
    };
}
  

export interface RiskSignal {
    type: SignalType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    value?: number | string;
}
  

export type SignalType =
    | 'HONEYPOT_DETECTED'
    | 'HONEYPOT_SUSPECTED'
    | 'MINT_AUTHORITY_ACTIVE'
    | 'FREEZE_AUTHORITY_ACTIVE'
    | 'HIGH_CONCENTRATION'
    | 'LOW_LIQUIDITY'
    | 'NO_POOL'
    | 'LOW_VOLUME'
    | 'NEW_TOKEN'
    | 'UNVERIFIED_DEV'
    | 'WASH_TRADING_DETECTED'
    | 'UNUSUAL_TRADING_PATTERNS'
    | 'HIGH_WHALE_ACTIVITY'
    | 'HIGH_VOLATILITY'
    | 'PRICE_MANIPULATION_RISK'
    | 'LIQUIDITY_INSTABILITY'
    | 'LOW_GT_SCORE'
    | 'WASH_TRADING'
    | 'AUTHORITY_CONTROL'
    | 'PUMP_DETECTED';