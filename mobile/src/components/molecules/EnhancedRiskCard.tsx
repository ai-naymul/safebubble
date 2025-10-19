import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Text } from '../atoms/Text';
import { colors, spacing, shadows, borderRadius } from '../../theme';
import { Token } from '../../domain/models/Token';

interface RiskCheck {
  label: string;
  pass: boolean;
  value?: string;
  score: number;
}

interface EnhancedRiskCardProps {
  token: Token;
  onSwapPress?: () => void;
}

export const EnhancedRiskCard: React.FC<EnhancedRiskCardProps> = ({ token, onSwapPress }) => {
  const { riskScore } = token;
  const verdict = riskScore.riskLevel;
  const [isExpanded, setIsExpanded] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  
  // Define enhanced risk checks
  const checks: RiskCheck[] = [
    {
      label: 'Authorities',
      pass: !riskScore.breakdown.authorityRisk.mintAuthorityPresent && 
            !riskScore.breakdown.authorityRisk.freezeAuthorityPresent,
      value: riskScore.breakdown.authorityRisk.mintAuthorityPresent || 
             riskScore.breakdown.authorityRisk.freezeAuthorityPresent ? 
             'Active' : 'Renounced',
      score: riskScore.breakdown.authorityRisk.score
    },
    {
      label: 'Liquidity',
      pass: riskScore.breakdown.liquidityRisk.totalLiquidityUsd >= 10000,
      value: formatLiquidity(riskScore.breakdown.liquidityRisk.totalLiquidityUsd),
      score: riskScore.breakdown.liquidityRisk.score
    },
    {
      label: 'Concentration',
      pass: parsePercentage(riskScore.breakdown.concentrationRisk.top10Percentage) < 80,
      value: `${parsePercentage(riskScore.breakdown.concentrationRisk.top10Percentage).toFixed(1)}%`,
      score: riskScore.breakdown.concentrationRisk.score
    },
    {
      label: 'Market Activity',
      pass: riskScore.breakdown.marketRisk.volume24h > 1000,
      value: formatLiquidity(riskScore.breakdown.marketRisk.volume24h),
      score: riskScore.breakdown.marketRisk.score
    },
  ];

  // Check if honeypot
  const isHoneypot = riskScore.breakdown.honeypotRisk.isHoneypot === 'yes' || 
                     riskScore.breakdown.honeypotRisk.isHoneypot === true;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  };

  const handleSwapPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSwapPress();
  };

  const getGradientColors = (): [string, string] => {
    // Use more subtle colors
    switch (verdict) {
      case 'SAFE':
        return [colors.background.secondary, colors.background.elevated];
      case 'MEDIUM':
        return [colors.background.secondary, colors.background.elevated];
      case 'DANGER':
        return [colors.background.secondary, colors.background.elevated];
      default:
        return [colors.background.secondary, colors.background.elevated];
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'SAFE': return colors.risk.safe.primary;
      case 'MEDIUM': return colors.risk.medium.primary;
      case 'DANGER': return colors.risk.danger.primary;
      default: return colors.text.tertiary;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'SAFE': return '';
      case 'MEDIUM': return '';
      case 'DANGER': return '';
      default: return '';
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Card variant="elevated" style={styles.card}>
        <Pressable onPress={handlePress} style={styles.pressable}>
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <CardHeader style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.riskInfo}>
                  <Text variant="h3" weight="bold" style={styles.riskIcon}>
                    {getRiskIcon(verdict)}
                  </Text>
                  <View style={styles.riskText}>
                    <Text variant="h3" weight="bold" style={styles.riskLevel}>
                      {verdict} RISK
                    </Text>
                    <Text style={styles.riskScore}>
                      Score: {Math.round(riskScore.totalScore)}/100
                    </Text>
                  </View>
                </View>
                <Badge 
                  variant={verdict === 'SAFE' ? 'success' : verdict === 'MEDIUM' ? 'warning' : 'destructive'}
                  size="lg"
                >
                  {Math.round(riskScore.totalScore)}
                </Badge>
              </View>
              
              <Progress
                value={riskScore.totalScore}
                variant={verdict === 'SAFE' ? 'success' : verdict === 'MEDIUM' ? 'warning' : 'danger'}
                size="md"
                animated
                style={styles.progress}
              />
            </CardHeader>
          </LinearGradient>

          <CardContent style={styles.content}>
            {/* Honeypot Warning */}
            {isHoneypot && (
              <View style={styles.honeypotWarning}>
                <Text variant="caption" weight="bold" style={styles.warningText}>
                  HONEYPOT DETECTED - DO NOT TRADE
                </Text>
              </View>
            )}

            {/* Risk Checks */}
            <View style={styles.checksContainer}>
              {checks.map((check, index) => (
                <View key={index} style={styles.checkItem}>
                  <View style={styles.checkHeader}>
                    <Text variant="caption" weight="medium" style={styles.checkLabel}>
                      {check.label}
                    </Text>
                    <View style={styles.checkValue}>
                      <Text variant="caption" style={styles.checkValueText}>
                        {check.value}
                      </Text>
                      <View style={[
                        styles.checkIndicator,
                        { backgroundColor: check.pass ? colors.risk.safe.primary : colors.risk.danger.primary }
                      ]} />
                    </View>
                  </View>
                  <Progress
                    value={check.score}
                    variant={check.pass ? 'success' : 'danger'}
                    size="sm"
                    style={styles.checkProgress}
                  />
                </View>
              ))}
            </View>


            {/* Action Button - Only show if onSwapPress is provided */}
            {onSwapPress && (
              <Button
                variant={verdict === 'SAFE' ? 'default' : 'outline'}
                size="lg"
                onPress={handleSwapPress}
                fullWidth
                style={styles.swapButton}
              >
                {verdict === 'SAFE' ? 'Open in Raydium' : 'Proceed with Caution'}
              </Button>
            )}
          </CardContent>
        </Pressable>
      </Card>
    </Animated.View>
  );
};

// Helper functions
const formatLiquidity = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
};

const parsePercentage = (value: string | number): number => {
  if (typeof value === 'number') return value;
  return parseFloat(value.toString().replace('%', '')) || 0;
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  pressable: {
    width: '100%',
  },
  headerGradient: {
    padding: 0,
  },
  header: {
    padding: spacing.base,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  riskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  riskIcon: {
    marginRight: spacing.sm,
    fontSize: 24,
  },
  riskText: {
    flex: 1,
  },
  riskLevel: {
    color: 'white',
    marginBottom: 2,
  },
  riskScore: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  progress: {
    marginTop: spacing.sm,
  },
  content: {
    padding: spacing.base,
  },
  honeypotWarning: {
    backgroundColor: colors.risk.danger.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.base,
  },
  warningText: {
    color: colors.risk.danger.primary,
    textAlign: 'center',
  },
  checksContainer: {
    marginBottom: spacing.base,
  },
  checkItem: {
    marginBottom: spacing.sm,
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  checkLabel: {
    color: colors.text.primary,
  },
  checkValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkValueText: {
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  checkIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkProgress: {
    height: 3,
  },
  swapButton: {
    marginTop: spacing.sm,
  },
});
