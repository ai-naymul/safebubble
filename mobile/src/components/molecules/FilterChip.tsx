// src/components/molecules/FilterChip.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { colors, spacing, borderRadius } from '../../theme';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active,
  onPress,
  count,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.activeChip]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        weight="semibold"
        style={[styles.text, active && styles.activeText]}
      >
        {label}
        {count !== undefined && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs, // Reduced from spacing.sm to spacing.xs
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
    marginRight: spacing.xs, // Reduced from spacing.sm to spacing.xs
  },
  activeChip: {
    backgroundColor: colors.brand.primary,
  },
  text: {
    color: colors.text.secondary,
  },
  activeText: {
    color: colors.text.inverse,
  },
});