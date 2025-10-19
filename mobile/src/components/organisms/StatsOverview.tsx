// src/components/organisms/StatsOverview.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../atoms/Card';
import { StatItem } from '../molecules/StatItem';
import { spacing } from '../../theme';
import { Token } from '../../domain/models/Token';
import { formatNumber, formatPrice } from '../../utils/formatters';

interface StatsOverviewProps {
  token: Token;
}

// Helper to calculate token age in days
const getTokenAge = (createdAt: string | null): string => {
  if (!createdAt) return 'Unknown';
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day';
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
  return `${Math.floor(diffDays / 365)} years`;
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({ token }) => {
  return (
    <Card style={styles.card}>
      {/* Row 1: Market Cap & Volume */}
      <View style={styles.grid}>
        <StatItem
          label="Market Cap"
          value={formatNumber(token.marketCap)}
        />
        <StatItem
          label="Volume 24h"
          value={formatNumber(token.volume24h)}
        />
      </View>
      
      {/* Row 2: Liquidity & Holders */}
      <View style={[styles.grid, styles.gridMiddle]}>
        <StatItem
          label="Liquidity"
          value={(token as any).totalLiquidity > 0 ? formatNumber((token as any).totalLiquidity) : 'N/A'}
        />
        <StatItem
          label="Holders"
          value={token.holderCount ? token.holderCount.toLocaleString() : 'N/A'}
        />
      </View>
      
      {/* Row 3: Price & Token Age */}
      <View style={[styles.grid, styles.gridBottom]}>
        <StatItem
          label="Price"
          value={formatPrice(token.price)}
          trend={token.priceChange24h ?? 0}
        />
        <StatItem
          label="Token Age"
          value={getTokenAge((token as any).createdAt)}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridMiddle: {
    marginTop: spacing.lg,
  },
  gridBottom: {
    marginTop: spacing.lg,
  },
});