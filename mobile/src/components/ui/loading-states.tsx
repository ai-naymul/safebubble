import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './skeleton';
import { Card } from './card';
import { colors, spacing, borderRadius } from '../../theme';

interface LoadingBubbleProps {
  size?: number;
  style?: any;
}

export const LoadingBubble: React.FC<LoadingBubbleProps> = ({ size = 60, style }) => {
  return (
    <View style={[styles.bubbleContainer, { width: size, height: size }, style]}>
      <Skeleton
        width={size}
        height={size}
        borderRadius={size / 2}
        animated
      />
    </View>
  );
};

interface LoadingRiskCardProps {
  style?: any;
}

export const LoadingRiskCard: React.FC<LoadingRiskCardProps> = ({ style }) => {
  return (
    <Card style={[styles.riskCard, style]}>
      <View style={styles.header}>
        <Skeleton width={120} height={20} style={styles.title} />
        <Skeleton width={40} height={20} borderRadius={10} />
      </View>
      
      <Skeleton width="100%" height={8} style={styles.progress} />
      
      <View style={styles.checks}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.checkItem}>
            <View style={styles.checkHeader}>
              <Skeleton width={80} height={14} />
              <Skeleton width={60} height={14} />
            </View>
            <Skeleton width="100%" height={3} style={styles.checkProgress} />
          </View>
        ))}
      </View>
      
      <Skeleton width="100%" height={44} borderRadius={borderRadius.md} style={styles.button} />
    </Card>
  );
};

interface LoadingTokenListProps {
  count?: number;
  style?: any;
}

export const LoadingTokenList: React.FC<LoadingTokenListProps> = ({ count = 5, style }) => {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} style={styles.tokenItem}>
          <View style={styles.tokenHeader}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <View style={styles.tokenInfo}>
              <Skeleton width={80} height={16} style={styles.tokenSymbol} />
              <Skeleton width={120} height={14} />
            </View>
            <View style={styles.tokenPrice}>
              <Skeleton width={60} height={16} />
              <Skeleton width={40} height={14} />
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
};

interface LoadingBubbleChartProps {
  style?: any;
}

export const LoadingBubbleChart: React.FC<LoadingBubbleChartProps> = ({ style }) => {
  return (
    <View style={[styles.chart, style]}>
      {Array.from({ length: 12 }).map((_, index) => {
        const size = 40 + Math.random() * 40;
        const x = Math.random() * 300;
        const y = Math.random() * 400;
        
        return (
          <LoadingBubble
            key={index}
            size={size}
            style={{
              position: 'absolute',
              left: x,
              top: y,
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    borderRadius: 30,
  },
  riskCard: {
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  progress: {
    marginBottom: spacing.base,
  },
  checks: {
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
  checkProgress: {
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.sm,
  },
  list: {
    padding: spacing.base,
  },
  tokenItem: {
    marginBottom: spacing.sm,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  tokenSymbol: {
    marginBottom: spacing.xs,
  },
  tokenPrice: {
    alignItems: 'flex-end',
  },
  chart: {
    height: 500,
    position: 'relative',
  },
});
