import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Text } from '../atoms/Text';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Token } from '../../domain/models/Token';

interface ModernTokenDetailProps {
  token: Token;
  visible: boolean;
  onClose: () => void;
  onSwapPress: () => void;
}

export const ModernTokenDetail: React.FC<ModernTokenDetailProps> = ({ 
  token, 
  visible, 
  onClose, 
  onSwapPress 
}) => {
  const [copied, setCopied] = useState(false);
  const priceChangeValue = typeof token.priceChange24h === 'number' 
    ? token.priceChange24h 
    : parseFloat(token.priceChange24h?.toString() || '0');
  const isPositive = !isNaN(priceChangeValue) && priceChangeValue >= 0;
  const { riskScore } = token;
  const verdict = riskScore.riskLevel;

  const getRiskColor = (riskLevel: string) => {
    // Use more subtle colors
    switch (riskLevel) {
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


  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatLargeNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const parsePercentage = (value: string | number): number => {
    if (typeof value === 'number') return value;
    return parseFloat(value.toString().replace('%', '')) || 0;
  };

  const handleCopy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In a real app, you'd use Clipboard.setString(token.mint)
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwapPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (verdict === 'DANGER') {
      Alert.alert(
        'High Risk Token',
        'This token has high-risk indicators. Please review the risk breakdown before proceeding.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    onSwapPress();
  };

  const [gradientStart, gradientEnd] = getRiskColor(verdict);

  // Check if honeypot
  const isHoneypot = riskScore.breakdown.honeypotRisk.isHoneypot === 'yes' ||
                     riskScore.breakdown.honeypotRisk.isHoneypot === 'suspected';

  return (
    <Sheet visible={visible} onClose={onClose} side="bottom">
      <SheetContent>
        <SheetHeader>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <SheetTitle>Token Details</SheetTitle>
              <SheetDescription>
                Risk analysis and trading information for {token.symbol}
              </SheetDescription>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </SheetHeader>

        <View style={styles.content}>
          {/* Token Header with gradient */}
          <LinearGradient
            colors={[gradientStart, gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.headerGradient,
              isHoneypot && {
                shadowColor: colors.risk.danger.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 5,
                elevation: 5,
              }
            ]}
          >
            <View style={styles.headerContent}>
              <View style={styles.tokenInfo}>
                {token.logoUri && (
                  <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                      <Text variant="h3" weight="bold" style={styles.logoText}>
                        {token.symbol.charAt(0)}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.tokenDetails}>
                  <Text variant="h2" weight="bold" style={styles.tokenName}>
                    {token.symbol}
                  </Text>
                  <Text variant="body" color="secondary" style={styles.tokenFullName}>
                    {token.name}
                  </Text>
                </View>
              </View>
              <View style={styles.scoreContainer}>
                <Text variant="h1" weight="bold" style={styles.scoreText}>
                  {!isNaN(riskScore.totalScore) ? riskScore.totalScore.toFixed(0) : '0'}
                </Text>
                <Text variant="caption" style={styles.scoreLabel}>
                  / 150
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Price Info Cards */}
          <View style={styles.priceCards}>
            <Card style={styles.priceCard}>
              <CardContent>
                <Text variant="caption" color="secondary" style={styles.priceLabel}>
                  Current Price
                </Text>
                <Text variant="h2" weight="bold" style={styles.priceValue}>
                  {formatPrice(token.price)}
                </Text>
              </CardContent>
            </Card>

            <Card style={styles.priceCard}>
              <CardContent>
                <Text variant="caption" color="secondary" style={styles.priceLabel}>
                  24h Change
                </Text>
                <Text 
                  variant="h2" 
                  weight="bold" 
                  style={[
                    styles.priceValue,
                    { color: isPositive ? colors.risk.safe.primary : colors.risk.danger.primary }
                  ]}
                >
                  {isPositive ? "+" : ""}{!isNaN(priceChangeValue) ? priceChangeValue.toFixed(2) : '0.00'}%
                </Text>
              </CardContent>
            </Card>
          </View>

          {/* Detailed Risk Assessment */}
          <Card style={styles.riskAssessmentCard}>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Risk Level Badge */}
              <View style={styles.riskLevelContainer}>
                <Badge 
                  variant={verdict === 'SAFE' ? 'success' : verdict === 'MEDIUM' ? 'warning' : 'destructive'} 
                  size="lg"
                >
                  {verdict} RISK - Score: {!isNaN(riskScore.totalScore) ? riskScore.totalScore.toFixed(0) : '0'}/150
                </Badge>
              </View>

              {/* Honeypot Warning */}
              {isHoneypot && (
                <View style={styles.honeypotWarning}>
                  <Text variant="body" weight="bold" style={styles.warningText}>
                    HONEYPOT {riskScore.breakdown.honeypotRisk.isHoneypot === 'suspected' ? 'SUSPECTED' : 'DETECTED'}
                  </Text>
                  <Text variant="caption" color="secondary" style={styles.warningSubtext}>
                    {riskScore.breakdown.honeypotRisk.detectionMethod || 'Selling may be restricted'}
                  </Text>
                </View>
              )}

              {/* Risk Checks */}
              <View style={styles.riskChecksContainer}>
                {/* Authority Risk */}
                <View style={styles.riskCheckItem}>
                  <View style={styles.riskCheckHeader}>
                    <Text variant="body" weight="medium">Authority Risk</Text>
                    <View style={styles.riskCheckValue}>
                      <Text variant="body" weight="semibold">
                        {riskScore.breakdown.authorityRisk.mintAuthorityPresent || 
                         riskScore.breakdown.authorityRisk.freezeAuthorityPresent ? 
                         'Active' : 'Renounced'}
                      </Text>
                      <View style={[
                        styles.riskIndicator,
                        { backgroundColor: (!riskScore.breakdown.authorityRisk.mintAuthorityPresent && 
                                           !riskScore.breakdown.authorityRisk.freezeAuthorityPresent) ? 
                                           colors.risk.safe.primary : colors.risk.danger.primary }
                      ]} />
                    </View>
                  </View>
                  <Text variant="caption" color="secondary">
                    Score: {riskScore.breakdown.authorityRisk.score}/30
                  </Text>
                </View>

                {/* Liquidity Risk */}
                <View style={styles.riskCheckItem}>
                  <View style={styles.riskCheckHeader}>
                    <Text variant="body" weight="medium">Liquidity</Text>
                    <View style={styles.riskCheckValue}>
                      <Text variant="body" weight="semibold">
                        {formatLargeNumber(riskScore.breakdown.liquidityRisk.totalLiquidityUsd)}
                      </Text>
                      <View style={[
                        styles.riskIndicator,
                        { backgroundColor: riskScore.breakdown.liquidityRisk.totalLiquidityUsd >= 10000 ? 
                                           colors.risk.safe.primary : colors.risk.danger.primary }
                      ]} />
                    </View>
                  </View>
                  <Text variant="caption" color="secondary">
                    Score: {riskScore.breakdown.liquidityRisk.score}/30
                  </Text>
                </View>

                {/* Concentration Risk */}
                <View style={styles.riskCheckItem}>
                  <View style={styles.riskCheckHeader}>
                    <Text variant="body" weight="medium">Concentration</Text>
                    <View style={styles.riskCheckValue}>
                      <Text variant="body" weight="semibold">
                        {parsePercentage(riskScore.breakdown.concentrationRisk.top10Percentage).toFixed(1)}%
                      </Text>
                      <View style={[
                        styles.riskIndicator,
                        { backgroundColor: parsePercentage(riskScore.breakdown.concentrationRisk.top10Percentage) < 80 ? 
                                           colors.risk.safe.primary : colors.risk.danger.primary }
                      ]} />
                    </View>
                  </View>
                  <Text variant="caption" color="secondary">
                    Score: {riskScore.breakdown.concentrationRisk.score}/30
                  </Text>
                </View>

                {/* Market Risk */}
                <View style={styles.riskCheckItem}>
                  <View style={styles.riskCheckHeader}>
                    <Text variant="body" weight="medium">Market Activity</Text>
                    <View style={styles.riskCheckValue}>
                      <Text variant="body" weight="semibold">
                        {formatLargeNumber(riskScore.breakdown.marketRisk.volume24h)}
                      </Text>
                      <View style={[
                        styles.riskIndicator,
                        { backgroundColor: riskScore.breakdown.marketRisk.volume24h > 1000 ? 
                                           colors.risk.safe.primary : colors.risk.danger.primary }
                      ]} />
                    </View>
                  </View>
                  <Text variant="caption" color="secondary">
                    Score: {riskScore.breakdown.marketRisk.score}/30
                  </Text>
                </View>
              </View>

            </CardContent>
          </Card>

          {/* Market Stats */}
          <Card style={styles.statsCard}>
            <CardHeader>
              <CardTitle>Market Data</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.statRow}>
                <Text variant="body" color="secondary">Market Cap</Text>
                <Text variant="body" weight="semibold">
                  {formatLargeNumber(token.marketCap)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text variant="body" color="secondary">24h Volume</Text>
                <Text variant="body" weight="semibold">
                  {formatLargeNumber(token.volume24h)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text variant="body" color="secondary">Supply</Text>
                <Text variant="body" weight="semibold">
                  {formatLargeNumber(token.marketCap / (token.price || 1))}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Contract Address */}
          <Card style={styles.contractCard}>
            <CardHeader>
              <CardTitle>Contract Address</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.contractRow}>
                <Text variant="caption" style={styles.contractAddress} numberOfLines={1}>
                  {token.mint}
                </Text>
                <TouchableOpacity
                  onPress={handleCopy}
                  style={styles.copyButton}
                >
                  <Text variant="caption" style={styles.copyText}>
                    {copied ? '✓' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <SheetFooter>
            <Button
              variant="outline"
              onPress={onClose}
              style={styles.actionButton}
            >
              Close
            </Button>
            <Button
              variant={verdict === 'DANGER' ? 'destructive' : 'default'}
              onPress={handleSwapPress}
              style={styles.actionButton}
            >
              {verdict === 'DANGER' ? 'High Risk' : 'Open in Raydium'}
            </Button>
          </SheetFooter>
        </View>
      </SheetContent>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  headerGradient: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: spacing.md,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
  },
  tokenDetails: {
    flex: 1,
  },
  tokenName: {
    color: 'white',
    marginBottom: spacing.xs,
  },
  tokenFullName: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    color: 'white',
  },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  priceCards: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  priceCard: {
    flex: 1,
  },
  priceLabel: {
    marginBottom: spacing.xs,
  },
  priceValue: {
    color: colors.text.primary,
  },
  statsCard: {
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  contractCard: {
    marginBottom: spacing.lg,
  },
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contractAddress: {
    flex: 1,
    fontFamily: 'monospace',
    color: colors.text.primary,
  },
  copyButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
  },
  copyText: {
    color: colors.primary.main,
  },
  actionButton: {
    flex: 1,
  },
  riskAssessmentCard: {
    marginBottom: spacing.md,
  },
  riskLevelContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  honeypotWarning: {
    backgroundColor: colors.risk.danger.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  warningText: {
    color: colors.risk.danger.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  warningSubtext: {
    color: colors.risk.danger.primary,
    opacity: 0.8,
    textAlign: 'center',
  },
  riskChecksContainer: {
    marginBottom: spacing.md,
  },
  riskCheckItem: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  riskCheckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  riskCheckValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
});
