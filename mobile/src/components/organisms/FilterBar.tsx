// src/components/organisms/FilterBar.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { FilterChip } from '../molecules/FilterChip';
import { spacing, colors } from '../../theme';

export type FilterType = 'ALL' | 'SAFE' | 'MEDIUM' | 'DANGER';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: {
    all: number;
    safe: number;
    medium: number;
    danger: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: 'All Tokens' },
    { key: 'SAFE', label: 'Safe' },
    { key: 'MEDIUM', label: 'Medium Risk' },
    { key: 'DANGER', label: 'High Risk' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            active={activeFilter === filter.key}
            onPress={() => onFilterChange(filter.key)}
            count={counts ? counts[filter.key.toLowerCase() as keyof typeof counts] : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs, // Reduced from spacing.md to spacing.xs
  },
});