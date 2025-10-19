import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  style?: any;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  style,
  width = '100%',
  height = 20,
  borderRadius = 4,
  animated = true,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0.3));

  React.useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, fadeAnim]);

  const skeletonStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: '#E2E8F0',
    opacity: animated ? fadeAnim : 0.3,
  };

  return (
    <Animated.View
      style={[skeletonStyle, style]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
});
