// src/components/organisms/RiskBreakdown.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { Divider } from '../atoms/Divider';
import { RiskScore, Token } from '../../domain/models/Token';
import { colors, spacing, borderRadius } from '../../theme';

interface RiskBreakdownProps {
  riskScore: RiskScore;
  token?: Token;
}

// Helper functions for better formatting
const formatLiquidity = (value: number | undefined | null): string => {
  if (value === undefined || value === null || value === 0) return 'No pools found';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const formatAge = (days: number | undefined | null): string => {
  if (days === undefined || days === null || days === 0) return 'Brand new (0 days)';
  if (days === 1) return '1 day old';
  if (days < 7) return `${days} days old`;
  if (days < 30) return `${days} days old`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} old`;
  }
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} old`;
};

const formatVolume = (value: number | undefined | null): string => {
  if (value === undefined || value === null || value === 0) return '$0';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const parsePercentage = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value) || 0;
};

export const RiskBreakdown: React.FC<RiskBreakdownProps> = ({ riskScore, token }) => {
  const { breakdown } = riskScore;

  const riskFactors = [
    {
      title: 'Honeypot Check',
      score: breakdown.honeypotRisk.score,
      maxScore: 30,
      description: breakdown.honeypotRisk.isHoneypot === 'yes'
        ? `🚨 HONEYPOT DETECTED: ${breakdown.honeypotRisk.detectionMethod || 'Confirmed by analysis'}`
        : breakdown.honeypotRisk.isHoneypot === 'suspected'
        ? `⚠️ HONEYPOT SUSPECTED: ${breakdown.honeypotRisk.detectionMethod || 'Transaction patterns suspicious'}`
        : breakdown.honeypotRisk.isHoneypot === 'no'
        ? `✓ Verified safe: ${breakdown.honeypotRisk.detectionMethod || 'CoinGecko verified'}`
        : `⚠️ Unable to verify - ${breakdown.honeypotRisk.detectionMethod || 'Insufficient transaction data'}`,
    },
    {
      title: 'Authority Risk',
      score: breakdown.authorityRisk.score,
      maxScore: 30,
      description: breakdown.authorityRisk.score === 0
        ? '✓ All authorities renounced'
        : breakdown.authorityRisk.mintAuthorityPresent && breakdown.authorityRisk.freezeAuthorityPresent
        ? '⚠️ Mint & freeze authorities active'
        : breakdown.authorityRisk.mintAuthorityPresent
        ? '⚠️ Mint authority active'
        : '⚠️ Freeze authority active',
    },
    {
      title: 'Holder Concentration',
      score: breakdown.concentrationRisk.score,
      maxScore: 25,
      description: (() => {
        const top10 = parsePercentage(breakdown.concentrationRisk.top10Percentage);
        if (top10 === 0) return 'No concentration data';
        if (top10 < 20) return `✓ Well distributed (Top 10: ${(top10 || 0).toFixed(1)}%)`;
        if (top10 < 50) return `⚠️ Moderate concentration (Top 10: ${(top10 || 0).toFixed(1)}%)`;
        return `🔴 High concentration (Top 10: ${(top10 || 0).toFixed(1)}%)`;
      })(),
    },
    {
      title: 'Liquidity',
      score: breakdown.liquidityRisk.score,
      maxScore: 20,
      description: (() => {
        const liquidity = breakdown.liquidityRisk.totalLiquidityUsd;
        const locked = breakdown.liquidityRisk.liquidityLocked;
        
        if (liquidity === 0) return '🔴 No liquidity pools';
        
        let desc = formatLiquidity(liquidity);
        if (liquidity >= 1000000) desc = `✓ ${desc} (Strong)`;
        else if (liquidity >= 100000) desc = `${desc} (Good)`;
        else if (liquidity >= 10000) desc = `⚠️ ${desc} (Low)`;
        else desc = `🔴 ${desc} (Very low)`;
        
        if (locked) desc += ' 🔒';
        
        return desc;
      })(),
    },
    {
      title: 'Market Activity',
      score: breakdown.marketRisk.score,
      maxScore: 15,
      description: (() => {
        const volume = breakdown.marketRisk.volume24h;
        if (volume === 0) return '🔴 No volume';
        if (volume >= 1000000) return `✓ ${formatVolume(volume)} (High)`;
        if (volume >= 100000) return `${formatVolume(volume)} (Good)`;
        if (volume >= 10000) return `⚠️ ${formatVolume(volume)} (Low)`;
        return `🔴 ${formatVolume(volume)} (Very low)`;
      })(),
    },
    {
      title: 'Token Age',
      score: breakdown.ageRisk.score,
      maxScore: 10,
      description: (() => {
        const age = breakdown.ageRisk.ageInDays;
        if (age === 0) return '🔴 Brand new token';
        if (age < 7) return `🔴 ${formatAge(age)}`;
        if (age < 30) return `⚠️ ${formatAge(age)}`;
        return `✓ ${formatAge(age)}`;
      })(),
    },
    {
      title: 'GeckoTerminal Score',
      score: breakdown.gtScoreRisk.score,
      maxScore: 20,
      description: breakdown.gtScoreRisk.gtScore === 0
        ? 'No GT score available'
        : breakdown.gtScoreRisk.gtScore >= 85
        ? `✓ Excellent (${(breakdown.gtScoreRisk.gtScore || 0).toFixed(0)}/100)`
        : breakdown.gtScoreRisk.gtScore >= 70
        ? `Good (${(breakdown.gtScoreRisk.gtScore || 0).toFixed(0)}/100)`
        : breakdown.gtScoreRisk.gtScore >= 50
        ? `⚠️ Fair (${(breakdown.gtScoreRisk.gtScore || 0).toFixed(0)}/100)`
        : `🔴 Poor (${(breakdown.gtScoreRisk.gtScore || 0).toFixed(0)}/100)`,
    },
    // 🚀 NEW: Trading Pattern Risk
    {
      title: 'Trading Patterns',
      score: breakdown.tradingPatternRisk?.score || 0,
      maxScore: 15,
      description: (() => {
        const trading = breakdown.tradingPatternRisk;
        if (!trading) return 'No trading data available';
        
        if (trading.washTradingScore > 50) {
          return `🚨 High wash trading risk (${trading.washTradingScore}%)`;
        } else if (trading.washTradingScore > 20) {
          return `⚠️ Moderate wash trading risk (${trading.washTradingScore}%)`;
        } else if (trading.unusualTradingDetected) {
          return `⚠️ Unusual trading patterns detected`;
        } else if (trading.whaleActivityScore > 30) {
          return `🐋 High whale activity (${trading.whaleActivityScore}%)`;
        } else if (trading.whaleActivityScore > 10) {
          return `🐋 Moderate whale activity (${trading.whaleActivityScore}%)`;
        } else {
          return `✓ Normal trading patterns`;
        }
      })(),
    },
    // 🚀 NEW: Volatility Risk
    {
      title: 'Volatility & Stability',
      score: breakdown.volatilityRisk?.score || 0,
      maxScore: 10,
      description: (() => {
        const volatility = breakdown.volatilityRisk;
        if (!volatility) return 'No volatility data available';
        
        if (volatility.volatilityScore > 60) {
          return `🔴 High volatility (${volatility.volatilityScore}%)`;
        } else if (volatility.volatilityScore > 25) {
          return `⚠️ Moderate volatility (${volatility.volatilityScore}%)`;
        } else if (volatility.priceManipulationRisk > 50) {
          return `🚨 High manipulation risk (${volatility.priceManipulationRisk}%)`;
        } else if (volatility.priceManipulationRisk > 20) {
          return `⚠️ Moderate manipulation risk (${volatility.priceManipulationRisk}%)`;
        } else if (volatility.liquidityStability === 'volatile') {
          return `💧 Volatile liquidity`;
        } else {
          return `✓ Stable market conditions`;
        }
      })(),
    },
  ];

  return (
    <Card style={styles.card}>
      <Text variant="h3" weight="bold" style={styles.title}>
        Risk Assessment
      </Text>
      <Text color="secondary" style={styles.subtitle}>
        Breakdown of risk factors (lower is better)
      </Text>

      <Divider margin="md" />

      {riskFactors.map((factor, index) => (
        <View key={index}>
          <View style={styles.factorContainer}>
            <View style={styles.factorHeader}>
              <Text weight="semibold">{factor.title}</Text>
              <Text
                weight="bold"
                style={[
                  styles.score,
                  {
                    color:
                      factor.score === 0
                        ? colors.risk.safe.primary
                        : factor.score < factor.maxScore * 0.5
                        ? colors.risk.medium.primary
                        : colors.risk.danger.primary,
                  },
                ]}
              >
                {factor.score}/{factor.maxScore}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((factor.score / factor.maxScore) * 100, 100)}%`,
                    backgroundColor:
                      factor.score === 0
                        ? colors.risk.safe.primary
                        : factor.score < factor.maxScore * 0.5
                        ? colors.risk.medium.primary
                        : colors.risk.danger.primary,
                  },
                ]}
              />
            </View>

            <Text variant="caption" color="secondary" style={styles.description}>
              {factor.description}
            </Text>
          </View>

          {index < riskFactors.length - 1 && <Divider margin="md" />}
          
        </View>
      ))}

      {/* ⬇️ Enhanced Trading Insights */}
      {(token?.pools?.[0]?.transactions?.h24 || token?.recentTrades) && (
        <>
          <Divider margin="md" />
          <View style={styles.insightsContainer}>
            <Text weight="semibold" style={styles.insightsTitle}>
              📊 Trading Analysis
            </Text>

            {/* Legacy transaction data */}
            {token?.pools?.[0]?.transactions?.h24 && (
              <>
                <View style={styles.insightRow}>
                  <Text color="secondary">Buys vs Sells:</Text>
                  <Text weight="semibold">
                    {token.pools[0].transactions.h24.buys} / {token.pools[0].transactions.h24.sells}
                  </Text>
                </View>

                <View style={styles.insightRow}>
                  <Text color="secondary">Unique Traders:</Text>
                  <Text weight="semibold">
                    {token.pools[0].transactions.h24.buyers + token.pools[0].transactions.h24.sellers}
                  </Text>
                </View>

                {(() => {
                  const tx = token.pools[0].transactions!.h24;
                  const denom = tx.buys + tx.sells || 1;
                  const sellRatio = tx.sells / denom;

                  return (
                    <View style={styles.insightRow}>
                      <Text color="secondary">Sell Ratio:</Text>
                      <Text
                        weight="semibold"
                        style={{
                          color:
                            sellRatio < 0.15
                              ? colors.status.success
                              : sellRatio < 0.35
                              ? colors.status.warning
                              : colors.status.error,
                        }}
                      >
                        {((sellRatio || 0) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  );
                })()}
              </>
            )}

            {/* 🚀 NEW: Enhanced trading data */}
            {token?.recentTrades && (
              <>
                <View style={styles.insightRow}>
                  <Text color="secondary">Recent Trades (24h):</Text>
                  <Text weight="semibold">{token.recentTrades.totalTrades}</Text>
                </View>

                <View style={styles.insightRow}>
                  <Text color="secondary">Buy/Sell Ratio:</Text>
                  <Text weight="semibold">{token.recentTrades.analysis.buySellRatio.toFixed(2)}</Text>
                </View>

                <View style={styles.insightRow}>
                  <Text color="secondary">Avg Trade Size:</Text>
                  <Text weight="semibold">${token.recentTrades.analysis.averageTradeSize.toLocaleString()}</Text>
                </View>

                <View style={styles.insightRow}>
                  <Text color="secondary">Whale Activity:</Text>
                  <Text 
                    weight="semibold"
                    style={{
                      color: token.recentTrades.analysis.whaleActivityScore > 30 
                        ? colors.status.warning 
                        : token.recentTrades.analysis.whaleActivityScore > 10
                        ? colors.status.info
                        : colors.status.success
                    }}
                  >
                    {token.recentTrades.analysis.whaleActivityScore}%
                  </Text>
                </View>
              </>
            )}

            {/* 🚀 NEW: Volatility insights */}
            {token?.ohlcvAnalysis && (
              <>
                <View style={styles.insightRow}>
                  <Text color="secondary">Volatility Score:</Text>
                  <Text 
                    weight="semibold"
                    style={{
                      color: token.ohlcvAnalysis.analysis.volatilityScore > 40 
                        ? colors.status.warning 
                        : token.ohlcvAnalysis.analysis.volatilityScore > 15
                        ? colors.status.info
                        : colors.status.success
                    }}
                  >
                    {token.ohlcvAnalysis.analysis.volatilityScore}%
                  </Text>
                </View>

                <View style={styles.insightRow}>
                  <Text color="secondary">Trend Direction:</Text>
                  <Text 
                    weight="semibold"
                    style={{
                      color: token.ohlcvAnalysis.analysis.trendDirection === 'bullish' 
                        ? colors.status.success 
                        : token.ohlcvAnalysis.analysis.trendDirection === 'bearish'
                        ? colors.status.error
                        : colors.text.secondary
                    }}
                  >
                    {token.ohlcvAnalysis.analysis.trendDirection === 'bullish' ? '📈' : 
                     token.ohlcvAnalysis.analysis.trendDirection === 'bearish' ? '📉' : '➡️'} 
                    {token.ohlcvAnalysis.analysis.trendDirection}
                  </Text>
                </View>

                <View style={styles.insightRow}>
                  <Text color="secondary">Liquidity Stability:</Text>
                  <Text 
                    weight="semibold"
                    style={{
                      color: token.ohlcvAnalysis.analysis.liquidityStability === 'stable' 
                        ? colors.status.success 
                        : token.ohlcvAnalysis.analysis.liquidityStability === 'volatile'
                        ? colors.status.error
                        : colors.status.warning
                    }}
                  >
                    {token.ohlcvAnalysis.analysis.liquidityStability}
                  </Text>
                </View>
              </>
            )}
          </View>
        </>
      )}

      {/* Warnings */}
      {riskScore.warnings.length > 0 && (
        <>
          <Divider margin="md" />
          <View style={styles.warningsContainer}>
            <Text weight="semibold" style={styles.warningsTitle}>
              ⚠️ Risk Warnings
            </Text>
            {riskScore.warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <Text color="secondary" style={styles.warningText}>
                  • {warning}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.md,
  },
  factorContainer: {
    marginVertical: spacing.sm,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  score: {
    fontSize: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  description: {
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  warningsContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.risk.danger.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.risk.danger.primary + '30',
  },
  warningsTitle: {
    marginBottom: spacing.sm,
    color: colors.risk.danger.primary,
  },
  warningItem: {
    marginVertical: spacing.xs,
  },
  warningText: {
    lineHeight: 20,
  },

  insightsContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
  },
  insightsTitle: {
    marginBottom: spacing.sm,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },  
});