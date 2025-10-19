// src/components/atoms/Divider.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  margin?: keyof typeof spacing;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  margin = 'md',
  style,
}) => {
  const dividerStyles = [
    styles.divider,
    orientation === 'horizontal' ? styles.horizontal : styles.vertical,
    {
      marginVertical: orientation === 'horizontal' ? spacing[margin] : 0,
      marginHorizontal: orientation === 'vertical' ? spacing[margin] : 0,
    },
    style,
  ];

  return <View style={dividerStyles} />;
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.border.primary,
  },
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});