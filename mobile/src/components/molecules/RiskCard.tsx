// src/components/molecules/RiskCard.tsx
import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { Badge } from '../ui/badge';
import { colors, spacing, shadows, borderRadius } from '../../theme';
import { Token } from '../../domain/models/Token';

interface RiskCheck {
  label: string;
  pass: boolean;
  value?: string;
}

interface RiskCardProps {
  token: Token;
  onSwapPress: () => void;
}

export const RiskCard: React.FC<RiskCardProps> = ({ token, onSwapPress }) => {
  const { riskScore } = token;
  const verdict = riskScore.riskLevel;
  
  // Define risk checks
  const checks: RiskCheck[] = [
    {
      label: 'Authorities',
      pass: !riskScore.breakdown.authorityRisk.mintAuthorityPresent && 
            !riskScore.breakdown.authorityRisk.freezeAuthorityPresent,
      value: riskScore.breakdown.authorityRisk.mintAuthorityPresent || 
             riskScore.breakdown.authorityRisk.freezeAuthorityPresent ? 
             'Active' : 'Renounced'
    },
    {
      label: 'Liquidity',
      pass: riskScore.breakdown.liquidityRisk.totalLiquidityUsd >= 10000,
      value: formatLiquidity(riskScore.breakdown.liquidityRisk.totalLiquidityUsd)
    },
    {
      label: 'Top 10 Holders',
      pass: parsePercentage(riskScore.breakdown.concentrationRisk.top10Percentage) < 80,
      value: `${parsePercentage(riskScore.breakdown.concentrationRisk.top10Percentage).toFixed(1)}%`
    },
  ];

  // Check if honeypot
  const isHoneypot = riskScore.breakdown.honeypotRisk.isHoneypot === 'yes' || 
                     riskScore.breakdown.honeypotRisk.isHoneypot === 'suspected';
  
  const allChecksPassed = checks.every(check => check.pass) && !isHoneypot;
  const canSwap = verdict !== 'DANGER' && !isHoneypot;

  const handleSwapPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!canSwap) {
      Alert.alert(
        'Swap Disabled',
        'This token has high-risk indicators. Please review the risk breakdown before proceeding.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    onSwapPress();
  };

  // Get gradient colors based on risk level
  const getGradientColors = (): [string, string] => {
    switch (verdict) {
      case 'SAFE':
        return [colors.risk.safe.primary, colors.risk.safe.light];
      case 'MEDIUM':
        return [colors.risk.medium.primary, colors.risk.medium.light];
      case 'DANGER':
        return [colors.risk.danger.primary, colors.risk.danger.light];
      default:
        return [colors.brand.primary, colors.brand.light];
    }
  };

  const [gradientStart, gradientEnd] = getGradientColors();

  return (
    <Card variant="elevated" padding="base" style={styles.card}>
      {/* Header with Risk Level */}
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text variant="caption" style={styles.headerLabel}>
              Risk Assessment
            </Text>
            <Text variant="h3" weight="bold" style={styles.headerTitle}>
              {verdict}
            </Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text variant="h2" weight="bold" style={styles.scoreText}>
              {riskScore.totalScore.toFixed(0)}
            </Text>
            <Text variant="caption" style={styles.scoreLabel}>
              / 150
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Honeypot Warning */}
      {isHoneypot && (
        <View style={styles.warningContainer}>
          <Text variant="body" weight="bold" color="primary" style={styles.warningText}>
            ⚠️ HONEYPOT {riskScore.breakdown.honeypotRisk.isHoneypot === 'suspected' ? 'SUSPECTED' : 'DETECTED'}
          </Text>
          <Text variant="caption" color="secondary" style={styles.warningSubtext}>
            {riskScore.breakdown.honeypotRisk.detectionMethod || 'Selling may be restricted'}
          </Text>
        </View>
      )}

      {/* Risk Checks */}
      <View style={styles.checksContainer}>
        {checks.map((check, index) => (
          <View key={index} style={styles.checkItem}>
            <View style={styles.checkLeft}>
              <View style={[
                styles.checkIndicator, 
                check.pass ? styles.checkPass : styles.checkFail
              ]} />
              <Text variant="body" color="secondary">
                {check.label}
              </Text>
            </View>
            {check.value && (
              <Text 
                variant="body" 
                weight="semibold"
                style={check.pass ? styles.checkValuePass : styles.checkValueFail}
              >
                {check.value}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Swap Button or Warning */}
      {canSwap ? (
        <Pressable 
          onPress={handleSwapPress}
          style={({ pressed }) => [
            styles.swapButton,
            pressed && styles.swapButtonPressed
          ]}
        >
          <LinearGradient
            colors={[colors.brand.primary, colors.brand.light]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.swapButtonGradient}
          >
            <Text variant="body" weight="bold" style={styles.swapButtonText}>
              🌐 Open in Raydium
            </Text>
          </LinearGradient>
        </Pressable>
      ) : (
        <View style={styles.disabledContainer}>
          <Text variant="body" weight="semibold" style={styles.disabledText}>
            🚫 Swap Disabled
          </Text>
          <Text variant="caption" color="secondary" style={styles.disabledSubtext}>
            Fix risk issues above to enable swapping
          </Text>
        </View>
      )}

      {/* Confidence Badge */}
      <View style={styles.footer}>
        <Badge 
          variant="info" 
          size="sm"
        >
          {`${parseConfidence(riskScore.confidence)}% Confidence`}
        </Badge>
      </View>
    </Card>
  );
};

// Helper functions
const formatLiquidity = (value: number): string => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const parsePercentage = (value: string | number): number => {
  if (typeof value === 'number') return value;
  return parseFloat(value) || 0;
};

const parseConfidence = (value: string | number): number => {
  const conf = typeof value === 'number' ? value : parseFloat(value) || 0;
  // If confidence is already a percentage (0-100), return as is
  // If it's a decimal (0-1), multiply by 100
  return conf > 1 ? Math.round(conf) : Math.round(conf * 100);
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xxs,
  },
  headerTitle: {
    color: colors.text.primary,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    color: colors.text.primary,
  },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  warningContainer: {
    backgroundColor: colors.risk.danger.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  warningText: {
    color: colors.risk.danger.primary,
    marginBottom: spacing.xxs,
  },
  warningSubtext: {
    color: colors.risk.danger.primary,
    opacity: 0.8,
  },
  checksContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkPass: {
    backgroundColor: colors.status.success,
  },
  checkFail: {
    backgroundColor: colors.status.error,
  },
  checkValuePass: {
    color: colors.status.success,
  },
  checkValueFail: {
    color: colors.status.error,
  },
  swapButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  swapButtonPressed: {
    opacity: 0.8,
  },
  swapButtonGradient: {
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  swapButtonText: {
    color: colors.text.primary,
  },
  disabledContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  disabledText: {
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  disabledSubtext: {
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
});

