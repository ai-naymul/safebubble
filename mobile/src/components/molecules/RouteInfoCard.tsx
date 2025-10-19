// src/components/molecules/RouteInfoCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../atoms/Card';
import { Text } from '../atoms/Text';
import { Badge } from '../ui/badge';
import { colors, spacing, borderRadius } from '../../theme';
import { JupiterQuote } from '../../services/JupiterService';

interface RouteInfoCardProps {
  quote: JupiterQuote;
  includesRaydium: boolean;
}

export const RouteInfoCard: React.FC<RouteInfoCardProps> = ({
  quote,
  includesRaydium,
}) => {
  const priceImpact = Math.abs(typeof quote.priceImpactPct === 'string' ? parseFloat(quote.priceImpactPct) : quote.priceImpactPct);
  const impactColor = 
    priceImpact < 1 ? colors.status.success :
    priceImpact < 5 ? colors.status.warning :
    colors.status.error;

  return (
    <Card variant="default" padding="sm" style={styles.card}>
      <View style={styles.header}>
        <Text variant="caption" color="secondary">
          Route Info (Raydium Compatible)
        </Text>
        {includesRaydium && (
          <Badge variant="info" size="sm">
            Includes Raydium
          </Badge>
        )}
      </View>

      <View style={styles.infoRow}>
        <Text variant="caption" color="secondary">
          Price Impact
        </Text>
        <Text 
          variant="body" 
          weight="semibold"
          style={{ color: impactColor }}
        >
          {priceImpact < 0.01 ? '< 0.01%' : `${priceImpact.toFixed(2)}%`}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text variant="caption" color="secondary">
          Route Hops
        </Text>
        <Text variant="body" weight="semibold">
          {quote.routePlan?.length || 1}
        </Text>
      </View>

      {quote.routePlan && quote.routePlan.length > 0 && (
        <View style={styles.routeContainer}>
          <Text variant="caption" color="secondary" style={styles.routeLabel}>
            Path:
          </Text>
          <View style={styles.routePath}>
            {quote.routePlan.map((hop, index) => (
              <React.Fragment key={index}>
                <Badge 
                  variant="default" 
                  size="sm" 
                >
                  {hop.swapInfo.label}
                </Badge>
                {index < quote.routePlan.length - 1 && (
                  <Text variant="caption" color="secondary">
                    →
                  </Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      )}
    </Card>
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
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  routeContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.secondary,
  },
  routeLabel: {
    marginBottom: spacing.xs,
  },
  routePath: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

