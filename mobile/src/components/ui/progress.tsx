import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { colors, borderRadius } from '../../theme';

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  animated?: boolean;
  showLabel?: boolean;
  style?: any;
}

const sizeVariants = {
  sm: {
    height: 4,
    borderRadius: 2,
  },
  md: {
    height: 8,
    borderRadius: 4,
  },
  lg: {
    height: 12,
    borderRadius: 6,
  },
};

const variantColors = {
  default: colors.primary.main,
  success: colors.status.success,
  warning: colors.status.warning,
  danger: colors.status.error,
  info: colors.status.info,
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  animated = true,
  showLabel = false,
  style,
}) => {
  const [progressAnim] = useState(new Animated.Value(0));
  const sizeStyle = sizeVariants[size];
  const variantColor = variantColors[variant];
  
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(percentage);
    }
  }, [percentage, animated, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{Math.round(percentage)}%</Text>
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height: sizeStyle.height,
            borderRadius: sizeStyle.borderRadius,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: progressWidth,
              height: sizeStyle.height,
              borderRadius: sizeStyle.borderRadius,
              backgroundColor: variantColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  track: {
    backgroundColor: colors.background.tertiary,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.primary.main,
  },
});
