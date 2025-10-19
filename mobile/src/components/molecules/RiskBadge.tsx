// src/components/molecules/RiskBadge.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { colors, spacing, borderRadius } from '../../theme';
import { getRiskColor, getRiskBackgroundColor } from '../../utils/formatters';

interface RiskBadgeProps {
  score: number;
  level: 'SAFE' | 'MEDIUM' | 'DANGER';
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  level,
  size = 'md',
}) => {
  const color = getRiskColor(level);
  const backgroundColor = getRiskBackgroundColor(level);

  return (
    <View style={[styles.container, { backgroundColor }, styles[size]]}>
      <Text
        variant={size === 'lg' ? 'h2' : size === 'md' ? 'h3' : 'body'}
        weight="bold"
        style={{ color }}
      >
        {score}
      </Text>
      <Text
        variant="caption"
        weight="semibold"
        style={[styles.label, { color }]}
      >
        /{size === 'lg' ? '100' : ''} {level}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    minWidth: 60,
    minHeight: 60,
  },
  md: {
    minWidth: 80,
    minHeight: 80,
  },
  lg: {
    minWidth: 120,
    minHeight: 120,
  },
  label: {
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
});