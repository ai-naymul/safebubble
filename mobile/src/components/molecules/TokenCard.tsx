// src/components/molecules/TokenCard.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { Badge } from '../ui/badge';
import { colors, spacing, borderRadius } from '../../theme';
import { formatPrice, formatPercentage, getRiskColor } from '../../utils/formatters';
import { Token } from '../../domain/models/Token';

interface TokenCardProps {
  token: Token;
  onPress: () => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, onPress }) => {
  
  console.log('Token:', token);
  const isPositive = (token.priceChange24h ?? 0) >= 0;
  const riskColor = token.riskScore 
  ? getRiskColor(token.riskScore.riskLevel)
  : colors.text.tertiary; // Gray for unknown

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.tokenInfo}>
            {token.logoUri ? (
              <Image source={{ uri: token.logoUri }} style={styles.logo} />
            ) : (
              <View style={[styles.logo, styles.logoPlaceholder]}>
                <Text weight="bold">{token.symbol.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.nameContainer}>
              <Text weight="semibold">{token.symbol}</Text>
              <Text variant="caption" color="secondary" numberOfLines={1}>
                {token.name}
              </Text>
            </View>
          </View>
          <Badge
            variant={
              token.riskScore?.riskLevel === 'SAFE'
                ? 'success'
                : token.riskScore?.riskLevel === 'MEDIUM'
                ? 'warning'
                : token.riskScore?.riskLevel === 'DANGER'
                ? 'danger'
                : 'default'
            }
            size="sm"
          >
            {token.riskScore?.riskLevel || 'UNKNOWN'}
          </Badge>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metricItem}>
            <Text variant="caption" color="secondary">
              Price
            </Text>
            <Text weight="semibold">{formatPrice(token.price)}</Text>
          </View>

          <View style={styles.metricItem}>
            <Text variant="caption" color="secondary">
              24h Change
            </Text>
            <Text
              weight="semibold"
              style={{ color: isPositive ? colors.status.success : colors.status.error }}
            >
              {formatPercentage(token.priceChange24h)}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text variant="caption" color="secondary">
              Risk Score
            </Text>
            <Text weight="semibold" style={{ color: riskColor }}>
            {token.riskScore?.totalScore ?? '?'}/100
          </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  logoPlaceholder: {
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
});