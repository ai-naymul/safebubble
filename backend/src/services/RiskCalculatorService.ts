// REPLACE the entire RiskCalculatorService.ts with this enhanced version

import { Token } from '../domain/models/Token';
import { RiskScore, RiskLevel, RiskSignal, SignalType } from '../domain/models/RiskScore';

export class RiskCalculator {
  /**
   * Calculate comprehensive risk score using ALL available data
   */
  calculateRiskScore(token: Partial<Token>): RiskScore {
    const honeypotRisk = this.calculateHoneypotRisk(token);
    const authorityRisk = this.calculateAuthorityRisk(token);
    const concentrationRisk = this.calculateConcentrationRisk(token);
    const liquidityRisk = this.calculateLiquidityRisk(token);
    const marketRisk = this.calculateMarketRisk(token);
    const ageRisk = this.calculateAgeRisk(token);
    const gtScoreRisk = this.calculateGTScoreRisk(token);
    
    // 🚀 NEW: Enhanced risk factors using trading and OHLCV data
    const tradingPatternRisk = this.calculateTradingPatternRisk(token);
    const volatilityRisk = this.calculateVolatilityRisk(token);

    const totalScore =
      honeypotRisk.score +        // 30 points max
      authorityRisk.score +       // 25 points max
      concentrationRisk.score +   // 20 points max
      gtScoreRisk.score +         // 20 points max
      liquidityRisk.score +       // 15 points max
      tradingPatternRisk.score +  // 15 points max
      marketRisk.score +          // 10 points max
      volatilityRisk.score +      // 10 points max
      ageRisk.score;              // 5 points max

    const riskLevel = this.determineRiskLevel(totalScore);
    const signals = this.generateSignals(token, {
      honeypotRisk,
      authorityRisk,
      concentrationRisk,
      liquidityRisk,
      marketRisk,
      ageRisk,
      gtScoreRisk,
      tradingPatternRisk,
      volatilityRisk,
    });
    const warnings = signals
      .filter((s) => s.severity === 'high' || s.severity === 'critical')
      .map((s) => s.message);

    const confidence = this.calculateConfidence(token);

    return {
      totalScore,
      riskLevel,
      breakdown: {
        honeypotRisk,
        authorityRisk,
        concentrationRisk,
        liquidityRisk,
        marketRisk,
        ageRisk,
        gtScoreRisk,
        tradingPatternRisk,
        volatilityRisk,
      },
      signals,
      warnings,
      calculatedAt: new Date(),
      confidence,
    };
  }

  /**
   * 🔥 ENHANCED HONEYPOT DETECTION (0-30 points)
   * Uses transaction patterns to detect honeypots even if CoinGecko says "unknown"
   */
  private calculateHoneypotRisk(token: Partial<Token>) {
    let score = 0;
    let detectionMethod = 'unknown';
    const isHoneypot = token.isHoneypot;
  
    // console.log(`🔍 Honeypot check for ${token.symbol}:`, {
    //   hasIsHoneypot: isHoneypot !== undefined,
    //   isHoneypotValue: isHoneypot,
    //   hasPools: (token.pools?.length || 0) > 0,
    //   hasTransactions: !!(token.pools?.[0] as any)?.transactions,
    //   transactions: (token.pools?.[0] as any)?.transactions
    // });
  
    // Method 1: CoinGecko's explicit flag
    if (isHoneypot === true || isHoneypot === 'yes') {
      score = 30;
      detectionMethod = 'CoinGecko confirmed';
      const result = { score, isHoneypot: 'yes', detectionMethod };
      console.log(`✅ ${token.symbol} Result:`, result); // ⬅️ ADD THIS
      return result;
    }
  
    // Method 2: CoinGecko says safe
    if (isHoneypot === false || isHoneypot === 'no') {
      score = 0;
      detectionMethod = 'CoinGecko verified safe';
      const result = { score, isHoneypot: 'no', detectionMethod };
      console.log(`✅ ${token.symbol} Result:`, result); // ⬅️ ADD THIS
      return result;
    }
  
    // Method 3: Transaction analysis (MOST RELIABLE)
    const poolData = token.pools?.[0];
    if (poolData && (poolData as any).transactions) {
      const txData = (poolData as any).transactions;
      
      const tx24h = txData.h24;
      const tx1h = txData.h1;
      const tx6h = txData.h6;
      
      const tx = tx24h || tx1h || tx6h;
      
      if (tx) {
        const totalTx = (tx.buys || 0) + (tx.sells || 0);
  
        if (totalTx > 10) {
          const sellRatio = (tx.sells || 0) / totalTx;
          
          // 🚨 HONEYPOT PATTERN 1
          if (sellRatio < 0.05) {
            score = 30;
            detectionMethod = 'No one can sell (honeypot pattern)';
            const result = { score, isHoneypot: 'yes', detectionMethod, sellRatio };
            console.log(`✅ ${token.symbol} Result:`, result); // ⬅️ ADD THIS
            return result;
          }
          
          if (sellRatio < 0.15) {
            score = 25;
            detectionMethod = 'Very few sellers (suspicious)';
            const result = { score, isHoneypot: 'suspected', detectionMethod, sellRatio };
            console.log(`✅ ${token.symbol} Result:`, result); // ⬅️ ADD THIS
            return result;
          }
  
          // 🚨 HONEYPOT PATTERN 2
          const uniqueTraders = (tx.buyers || 0) + (tx.sellers || 0);
          if (uniqueTraders > 10) {
            const sellerRatio = (tx.sellers || 0) / uniqueTraders;
            
            if (sellerRatio < 0.1) {
              score = Math.max(score, 28);
              detectionMethod = 'Few unique sellers can exit';
              const result = { score, isHoneypot: 'yes', detectionMethod, sellerRatio };
              console.log(`✅ ${token.symbol} Result:`, result); // ⬅️ ADD THIS
              return result;
            }
          }
  
          // 🚨 HONEYPOT PATTERN 3
          const volData = (poolData as any).volumeUsd;
          if (volData && volData.h24) {
            const vol24h = volData.h24;
            if (vol24h > 10000) {
              const estimatedBuyVol = vol24h * (tx.buys / totalTx);
              const estimatedSellVol = vol24h * (tx.sells / totalTx);
              
              if (estimatedSellVol / estimatedBuyVol < 0.1) {
                score = Math.max(score, 25);
                detectionMethod = 'Sell volume suspiciously low';
                const result = { score, isHoneypot: 'suspected', detectionMethod };
                console.log(`✅ ${token.symbol} Result:`, result); // ⬅️ ADD THIS
                return result;
              }
            }
          }
  
          // ✅ PASSED ALL CHECKS - Token is safe
          score = 0;
          detectionMethod = `Transaction analysis (${(sellRatio * 100).toFixed(1)}% sells, ${tx.sellers} unique sellers)`;
          const result = { 
            score, 
            isHoneypot: 'no', 
            detectionMethod,
            sellRatio,
            uniqueSellers: tx.sellers 
          };
          // console.log(`✅ ${token.symbol} Result:`, result); // ⬅️ ADD THIS
          return result;
        }
      }
    }
  
    // Default: Unknown (no transaction data)
    const result = { 
      score: 0, 
      isHoneypot: 'unknown', 
      detectionMethod: 'Insufficient transaction data - unable to verify' 
    };
    console.log(`✅ ${token.symbol} Result:`, result); // ⬅️ ADD THIS
    return result;
  }

  /**
   * Authority Risk (0-30 points) - UNCHANGED
   */
  private calculateAuthorityRisk(token: Partial<Token>) {
    let score = 0;
    let mintAuthorityPresent = false;
    let freezeAuthorityPresent = false;

    if (token.authorities) {
      if (token.authorities.mintAuthority === 'yes' || !token.authorities.mintRenounced) {
        score += 15;
        mintAuthorityPresent = true;
      }
      if (token.authorities.freezeAuthority === 'yes' || !token.authorities.freezeRenounced) {
        score += 15;
        freezeAuthorityPresent = true;
      }
    }

    return { score, mintAuthorityPresent, freezeAuthorityPresent };
  }

  /**
   * Concentration Risk (0-25 points) - UNCHANGED
   */
  private calculateConcentrationRisk(token: Partial<Token>) {
    let score = 0;
    let topHolderPercentage = 0;
    let top10Percentage = 0;

    if (token.topHoldersPercentage) {
      const percentage = typeof token.topHoldersPercentage === 'string' 
        ? parseFloat(token.topHoldersPercentage) 
        : token.topHoldersPercentage;
      
      top10Percentage = percentage;
      topHolderPercentage = percentage / 10;

      if (percentage >= 90) score = 25;
      else if (percentage >= 75) score = 20;
      else if (percentage >= 60) score = 15;
      else if (percentage >= 50) score = 10;
      else if (percentage >= 40) score = 7;
      else if (percentage >= 30) score = 5;
      else if (percentage >= 20) score = 3;
      else if (percentage >= 10) score = 1;
    }

    return { score, topHolderPercentage, top10Percentage };
  }

  /**
   * 🔥 ENHANCED LIQUIDITY RISK (0-20 points)
   * Now includes wash trading detection
   */
  private calculateLiquidityRisk(token: Partial<Token>) {
    let score = 0;
    const totalLiquidityUsd = token.totalLiquidity || 0;
    const hasPool = (token.pools?.length || 0) > 0;
    const volume24h = token.volume24h || 0;

    // Base liquidity score
    if (totalLiquidityUsd === 0) {
      score = 20;
    } else if (totalLiquidityUsd < 1000) {
      score = 18;
    } else if (totalLiquidityUsd < 10000) {
      score = 15;
    } else if (totalLiquidityUsd < 50000) {
      score = 10;
    } else if (totalLiquidityUsd < 100000) {
      score = 5;
    } else if (totalLiquidityUsd < 500000) {
      score = 3;
    } else if (totalLiquidityUsd < 1000000) {
      score = 1;
    }

    // 🚨 WASH TRADING DETECTION
    // If volume is 50x+ the liquidity, likely fake volume
    if (totalLiquidityUsd > 0 && volume24h > 0) {
      const volumeToLiquidityRatio = volume24h / totalLiquidityUsd;
      if (volumeToLiquidityRatio > 100) {
        score = Math.min(score + 10, 20); // Extreme wash trading
      } else if (volumeToLiquidityRatio > 50) {
        score = Math.min(score + 5, 20); // Suspicious volume
      }
    }

    const liquidityLocked = token.pools?.some(
      (pool: any) => pool.lockedLiquidityPercentage > 0
    ) || false;

    return {
      score,
      hasPool,
      totalLiquidityUsd,
      liquidityLocked,
      volumeToLiquidityRatio: totalLiquidityUsd > 0 ? volume24h / totalLiquidityUsd : 0,
    };
  }

  /**
   * 🔥 ENHANCED MARKET RISK (0-15 points)
   * Now includes unique trader analysis
   */
  private calculateMarketRisk(token: Partial<Token>) {
    let score = 0;
    const volume24h = token.volume24h || 0;
    const marketCap = token.marketCap || 0;

    // Volume score
    if (volume24h === 0) {
      score += 10;
    } else if (volume24h < 1000) {
      score += 8;
    } else if (volume24h < 10000) {
      score += 6;
    } else if (volume24h < 100000) {
      score += 4;
    } else if (volume24h < 1000000) {
      score += 2;
    }

    // Market cap check
    if (marketCap > 0 && marketCap < 10000) {
      score += 5;
    } else if (marketCap > 0 && marketCap < 100000) {
      score += 2;
    }

    // 🔥 NEW: Check for bot trading (few unique traders but high volume)
    const poolData = token.pools?.[0];
    if (poolData && (poolData as any).transactions) {
      const tx24h = (poolData as any).transactions.h24;
      const uniqueTraders = tx24h.buyers + tx24h.sellers;
      const totalTx = tx24h.buys + tx24h.sells;

      // If there are many transactions but few unique traders = bots
      if (totalTx > 50 && uniqueTraders < 10) {
        score = Math.min(score + 3, 15);
      }
    }

    return { score, volume24h, marketCap, spreadPercentage: 0 };
  }



  /**
   * ✅ NEW: Detect pump patterns using short-term price changes
   */
  private detectPumpPattern(token: Partial<Token>) {
    const poolData = token.pools?.[0];
    if (!poolData || !(poolData as any).priceChangePercentage) {
      return { isPump: false, severity: 'low' };
    }

    const priceChanges = (poolData as any).priceChangePercentage;
    
    // Helper function to safely get numeric value
    const getNumericValue = (value: any): number => {
      if (typeof value === 'number' && !isNaN(value)) {
        return value;
      }
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };
    
    const m5 = getNumericValue(priceChanges.m5);
    const h1 = getNumericValue(priceChanges.h1);
    const h6 = getNumericValue(priceChanges.h6);
    
    // 🚨 PUMP PATTERN: Massive gains in short timeframe
    if (m5 > 50) {
      return { 
        isPump: true, 
        severity: 'critical',
        message: `Extreme pump detected: +${m5.toFixed(1)}% in 5 minutes`
      };
    }
    
    if (h1 > 100) {
      return { 
        isPump: true, 
        severity: 'high',
        message: `Major pump: +${h1.toFixed(1)}% in 1 hour`
      };
    }
    
    if (h6 > 200) {
      return { 
        isPump: true, 
        severity: 'high',
        message: `Significant pump: +${h6.toFixed(1)}% in 6 hours`
      };
    }
    
    return { isPump: false, severity: 'low' };
  }
  /**
   * Age Risk (0-10 points) - UNCHANGED
   */
  private calculateAgeRisk(token: Partial<Token>) {
    let score = 0;
    let ageInDays = 0;
    let firstTradeDate: string | null = null;

    if (token.createdAt) {
      const created = new Date(token.createdAt);
      const now = new Date();
      ageInDays = Math.floor(
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
      firstTradeDate = token.createdAt;

      if (ageInDays === 0) score = 10;
      else if (ageInDays < 1) score = 10;
      else if (ageInDays < 7) score = 8;
      else if (ageInDays < 30) score = 5;
      else if (ageInDays < 90) score = 2;
    }

    return { score, ageInDays, firstTradeDate };
  }

  /**
   * GT Score Risk (0-20 points) - UNCHANGED
   */
  private calculateGTScoreRisk(token: Partial<Token>) {
    let score = 0;
    const gtScore = token.gtScore || 0;

    if (gtScore === 0) {
      score = 5;
    } else if (gtScore < 30) {
      score = 20;
    } else if (gtScore < 50) {
      score = 15;
    } else if (gtScore < 70) {
      score = 10;
    } else if (gtScore < 85) {
      score = 5;
    }

    return { score, gtScore };
  }

  /**
   * Determine risk level from total score
   */
  private determineRiskLevel(totalScore: number): RiskLevel {
    if (totalScore >= 70) return 'DANGER';
    if (totalScore >= 35) return 'MEDIUM';
    return 'SAFE';
  }

  /**
   * 🔥 ENHANCED SIGNAL GENERATION
   */
  private generateSignals(token: Partial<Token>, risks: any): RiskSignal[] {
    const signals: RiskSignal[] = [];

    // Honeypot
    if (risks.honeypotRisk.isHoneypot === 'yes') {
      signals.push({
        type: 'HONEYPOT_DETECTED' as SignalType,
        severity: 'critical' as const,
        message: `🚨 HONEYPOT: ${risks.honeypotRisk.detectionMethod}`,
        value: 'true',
      });
    } else if (risks.honeypotRisk.isHoneypot === 'suspected') {
      signals.push({
        type: 'HONEYPOT_SUSPECTED' as SignalType,
        severity: 'high' as const,
        message: `⚠️ Honeypot suspected: ${risks.honeypotRisk.detectionMethod}`,
        value: 'true',
      });
    }

    // 🚀 NEW: Trading Pattern Signals
    if (risks.tradingPatternRisk.washTradingScore > 50) {
      signals.push({
        type: 'WASH_TRADING_DETECTED' as SignalType,
        severity: risks.tradingPatternRisk.washTradingScore > 70 ? 'critical' : 'high' as const,
        message: `🚨 Wash trading detected: ${risks.tradingPatternRisk.washTradingScore}% suspicious`,
        value: risks.tradingPatternRisk.washTradingScore,
      });
    }

    if (risks.tradingPatternRisk.unusualTradingDetected) {
      signals.push({
        type: 'UNUSUAL_TRADING_PATTERNS' as SignalType,
        severity: 'high' as const,
        message: `⚠️ Unusual trading patterns detected`,
        value: 'true',
      });
    }

    if (risks.tradingPatternRisk.whaleActivityScore > 60) {
      signals.push({
        type: 'HIGH_WHALE_ACTIVITY' as SignalType,
        severity: 'medium' as const,
        message: `🐋 High whale activity: ${risks.tradingPatternRisk.whaleActivityScore}%`,
        value: risks.tradingPatternRisk.whaleActivityScore,
      });
    }

    // 🚀 NEW: Volatility Signals
    if (risks.volatilityRisk.volatilityScore > 60) {
      signals.push({
        type: 'HIGH_VOLATILITY' as SignalType,
        severity: risks.volatilityRisk.volatilityScore > 80 ? 'high' : 'medium' as const,
        message: `📈 High volatility: ${risks.volatilityRisk.volatilityScore}%`,
        value: risks.volatilityRisk.volatilityScore,
      });
    }

    if (risks.volatilityRisk.priceManipulationRisk > 50) {
      signals.push({
        type: 'PRICE_MANIPULATION_RISK' as SignalType,
        severity: risks.volatilityRisk.priceManipulationRisk > 70 ? 'high' : 'medium' as const,
        message: `⚠️ Price manipulation risk: ${risks.volatilityRisk.priceManipulationRisk}%`,
        value: risks.volatilityRisk.priceManipulationRisk,
      });
    }

    if (risks.volatilityRisk.liquidityStability === 'volatile') {
      signals.push({
        type: 'LIQUIDITY_INSTABILITY' as SignalType,
        severity: 'medium' as const,
        message: `💧 Volatile liquidity detected`,
        value: 'true',
      });
    }

    // Legacy wash trading check (keep for backward compatibility)
    if (risks.liquidityRisk.volumeToLiquidityRatio > 50) {
      const ratio = typeof risks.liquidityRisk.volumeToLiquidityRatio === 'number' 
        ? risks.liquidityRisk.volumeToLiquidityRatio 
        : 0;
      signals.push({
        type: 'WASH_TRADING' as SignalType,
        severity: ratio > 100 ? 'high' : 'medium' as const,
        message: 'Suspicious volume/liquidity ratio - possible wash trading',
        value: ratio.toFixed(1),
      });
    }

    // New token
    if (risks.ageRisk.ageInDays < 7) {
      signals.push({
        type: 'NEW_TOKEN' as SignalType,
        severity: 'high' as const,
        message: 'Very new token - high risk of pump and dump',
        value: `${risks.ageRisk.ageInDays} days old`,
      });
    }

    // Authority controls
    if (risks.authorityRisk.score > 0) {
      signals.push({
        type: 'AUTHORITY_CONTROL' as SignalType,
        severity: 'high' as const,
        message: 'Token authorities not renounced - risk of rug pull',
        value: risks.authorityRisk,
      });
    }

    // Low liquidity
    if (risks.liquidityRisk.totalLiquidityUsd < 10000 && risks.liquidityRisk.totalLiquidityUsd > 0) {
      signals.push({
        type: 'LOW_LIQUIDITY' as SignalType,
        severity: 'high' as const,
        message: 'Very low liquidity - high slippage risk',
        value: risks.liquidityRisk.totalLiquidityUsd,
      });
    }

    // High concentration
    if (risks.concentrationRisk.top10Percentage > 70) {
      const percentage = typeof risks.concentrationRisk.top10Percentage === 'number' 
        ? risks.concentrationRisk.top10Percentage 
        : 0;
      signals.push({
        type: 'HIGH_CONCENTRATION' as SignalType,
        severity: 'high' as const,
        message: 'Top holders control majority of supply - whale risk',
        value: `${percentage.toFixed(1)}%`,
      });
    }

    // Low GT Score
    if (risks.gtScoreRisk.gtScore > 0 && risks.gtScoreRisk.gtScore < 50) {
      signals.push({
        type: 'LOW_GT_SCORE' as SignalType,
        severity: 'medium' as const,
        message: 'Low GeckoTerminal trust score',
        value: risks.gtScoreRisk.gtScore,
      });
    }
    const pumpPattern = this.detectPumpPattern(token);
    if (pumpPattern.isPump) {
      signals.push({
        type: 'PUMP_DETECTED' as SignalType,
        severity: pumpPattern.severity as 'low' | 'medium' | 'high' | 'critical',
        message: pumpPattern.message || 'Pump pattern detected',
        value: 'true',
      });
    }

    return signals;
  }

  /**
   * 🚀 NEW: Trading Pattern Risk (0-15 points)
   * Analyzes recent trading data for wash trading, unusual patterns, and whale activity
   */
  private calculateTradingPatternRisk(token: Partial<Token>) {
    const recentTrades = token.recentTrades;
    
    // 🔍 DEBUG: Trading Pattern Risk Calculation
    console.log(`🔍 Trading Pattern Risk Debug for ${token.symbol || 'unknown'}:`);
    console.log(`  - hasRecentTrades:`, !!recentTrades);
    console.log(`  - hasAnalysis:`, !!recentTrades?.analysis);
    if (recentTrades?.analysis) {
      console.log(`  - washTradingScore:`, recentTrades.analysis.washTradingScore);
      console.log(`  - unusualTradingDetected:`, recentTrades.analysis.unusualTradingDetected);
      console.log(`  - whaleActivityScore:`, recentTrades.analysis.whaleActivityScore);
    }
    
    if (!recentTrades || !recentTrades.analysis) {
      console.log(`❌ No trading data - returning defaults for ${token.symbol || 'unknown'}`);
      return {
        score: 0,
        washTradingScore: 0,
        unusualTradingDetected: false,
        whaleActivityScore: 0,
        buySellRatio: 0,
        suspiciousTransactions: 0
      };
    }

    const analysis = recentTrades.analysis;
    let score = 0;

    // Wash trading detection (0-8 points) - Adjusted thresholds
    if (analysis.washTradingScore > 50) {
      score += 8;
    } else if (analysis.washTradingScore > 30) {
      score += 6;
    } else if (analysis.washTradingScore > 20) {
      score += 4;
    } else if (analysis.washTradingScore > 10) {
      score += 2;
    }

    // Unusual trading patterns (0-4 points)
    if (analysis.unusualTradingDetected) {
      score += 4;
    }

    // Whale activity (0-3 points) - Adjusted thresholds
    if (analysis.whaleActivityScore > 40) {
      score += 3;
    } else if (analysis.whaleActivityScore > 25) {
      score += 2;
    } else if (analysis.whaleActivityScore > 10) {
      score += 1;
    }

    return {
      score: Math.min(score, 15),
      washTradingScore: analysis.washTradingScore,
      unusualTradingDetected: analysis.unusualTradingDetected,
      whaleActivityScore: analysis.whaleActivityScore,
      buySellRatio: analysis.buySellRatio,
      suspiciousTransactions: analysis.suspiciousTransactions
    };
  }

  /**
   * 🚀 NEW: Volatility Risk (0-10 points)
   * Analyzes OHLCV data for volatility, manipulation risk, and liquidity stability
   */
  private calculateVolatilityRisk(token: Partial<Token>) {
    const ohlcvAnalysis = token.ohlcvAnalysis;
    
    // 🔍 DEBUG: Volatility Risk Calculation
    console.log(`🔍 Volatility Risk Debug for ${token.symbol || 'unknown'}:`);
    console.log(`  - hasOHLCVAnalysis:`, !!ohlcvAnalysis);
    console.log(`  - hasAnalysis:`, !!ohlcvAnalysis?.analysis);
    if (ohlcvAnalysis?.analysis) {
      console.log(`  - volatilityScore:`, ohlcvAnalysis.analysis.volatilityScore);
      console.log(`  - trendDirection:`, ohlcvAnalysis.analysis.trendDirection);
      console.log(`  - priceManipulationRisk:`, ohlcvAnalysis.analysis.priceManipulationRisk);
      console.log(`  - liquidityStability:`, ohlcvAnalysis.analysis.liquidityStability);
    }
    
    if (!ohlcvAnalysis || !ohlcvAnalysis.analysis) {
      console.log(`❌ No OHLCV data - returning defaults for ${token.symbol || 'unknown'}`);
      return {
        score: 0,
        volatilityScore: 0,
        trendDirection: 'neutral' as const,
        priceManipulationRisk: 0,
        liquidityStability: 'unknown' as const
      };
    }

    const analysis = ohlcvAnalysis.analysis;
    let score = 0;

    // High volatility risk (0-5 points) - Adjusted thresholds
    if (analysis.volatilityScore > 60) {
      score += 5;
    } else if (analysis.volatilityScore > 40) {
      score += 4;
    } else if (analysis.volatilityScore > 25) {
      score += 3;
    } else if (analysis.volatilityScore > 15) {
      score += 2;
    } else if (analysis.volatilityScore > 8) {
      score += 1;
    }

    // Price manipulation risk (0-3 points) - Adjusted thresholds
    if (analysis.priceManipulationRisk > 50) {
      score += 3;
    } else if (analysis.priceManipulationRisk > 35) {
      score += 2;
    } else if (analysis.priceManipulationRisk > 20) {
      score += 1;
    }

    // Liquidity instability (0-2 points)
    if (analysis.liquidityStability === 'volatile') {
      score += 2;
    } else if (analysis.liquidityStability === 'moderate') {
      score += 1;
    }

    return {
      score: Math.min(score, 10),
      volatilityScore: analysis.volatilityScore,
      trendDirection: analysis.trendDirection,
      priceManipulationRisk: analysis.priceManipulationRisk,
      liquidityStability: analysis.liquidityStability
    };
  }

  /**
   * Calculate confidence in risk assessment
   */
  private calculateConfidence(token: Partial<Token>): number {
    let confidence = 0.5;

    if (token.holderCount && token.holderCount > 0) confidence += 0.1;
    if (token.totalLiquidity && token.totalLiquidity > 0) confidence += 0.1;
    if (token.volume24h && token.volume24h > 0) confidence += 0.1;
    if (token.createdAt) confidence += 0.1;
    if (token.gtScore && token.gtScore > 0) confidence += 0.1;

    // Bonus confidence if we have transaction data
    const poolData = token.pools?.[0];
    if (poolData && (poolData as any).transactions) {
      confidence += 0.1;
    }

    // 🚀 NEW: Enhanced confidence with trading and OHLCV data
    if (token.recentTrades && token.recentTrades.totalTrades > 0) {
      confidence += 0.1;
    }

    if (token.ohlcvAnalysis && token.ohlcvAnalysis.dataPoints > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }
}