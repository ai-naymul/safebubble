// src/components/molecules/StatItem.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { spacing } from '../../theme';
import { colors } from '../../theme';
import { formatPercentage } from '../../utils/formatters';
interface StatItemProps {
  label: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
}

export const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  trend,
  icon,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text variant="caption" color="secondary">
          {label}
        </Text>
      </View>
      <Text variant="h3" weight="bold" style={styles.value}>
        {value}
      </Text>
      {trend !== undefined && (
        <Text
          variant="caption"
          style={{
            color: trend >= 0 ? colors.status.success : colors.status.error,
          }}
        >
          {trend >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(trend))}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
  value: {
    marginBottom: spacing.xs,
  },
});