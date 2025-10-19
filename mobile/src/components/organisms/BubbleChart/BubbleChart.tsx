// src/components/organisms/BubbleChart/BubbleChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Token } from '../../../domain/models/Token';
import { calculateBubbleLayout } from './BubbleLayout';
import { Bubble } from './Bubble';
import { AnimatedBubble } from '../../ui/animated-bubble';
import { ModernBubble } from '../../ui/modern-bubble';
import { EmptyState } from '../../molecules/EmptyState';
import { colors, spacing } from '../../../theme';

interface BubbleChartProps {
  tokens: Token[];
  onBubblePress: (token: Token) => void;
}

export const BubbleChart: React.FC<BubbleChartProps> = ({
  tokens,
  onBubblePress,
}) => {
  const { width } = useWindowDimensions();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [useEnhancedBubbles, setUseEnhancedBubbles] = useState(true);
  const [useModernBubbles, setUseModernBubbles] = useState(false); // Toggle for modern bubbles
  
  // Calculate layout - limit to 50 bubbles for performance
  const bubbles = useMemo(() => {
    if (tokens.length === 0) return [];
    
    // Limit tokens for better performance
    const limitedTokens = tokens.slice(0, 50);
    
    // Calculate height needed (increased for larger bubbles and better spacing)
    const rows = Math.ceil(limitedTokens.length / 3);
    const height = rows * 160 + 200; // Increased spacing for larger bubbles
    
    return calculateBubbleLayout(limitedTokens, width, height);
  }, [tokens, width]);

  // Calculate total height
  const contentHeight = useMemo(() => {
    if (bubbles.length === 0) return 500;
    
    const maxY = Math.max(...bubbles.map(b => b.y + b.radius));
    return maxY + 40; // Increased padding for better spacing with larger bubbles
  }, [bubbles]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


  if (tokens.length === 0) {
    return (
      <EmptyState
        title="No tokens found"
        message="Try adjusting your filters or refresh the list"
      />
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.1)', 'rgba(15, 23, 42, 0.05)', 'transparent']}
        style={styles.backgroundGradient}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ height: contentHeight }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.chart, { width, height: contentHeight }]}>
          {bubbles.map((bubble, index) => {
            if (useModernBubbles) {
              return (
                <ModernBubble
                  key={bubble.token.mint}
                  token={bubble.token}
                  size={bubble.radius * 2}
                  delay={index * 100}
                  offsetX={bubble.x - bubble.radius}
                  offsetY={bubble.y - bubble.radius}
                  onClick={() => onBubblePress(bubble.token)}
                />
              );
            } else if (useEnhancedBubbles) {
              return (
                <AnimatedBubble
                  key={bubble.token.mint}
                  token={bubble.token}
                  x={bubble.x}
                  y={bubble.y}
                  radius={bubble.radius}
                  color={bubble.color}
                  onPress={() => onBubblePress(bubble.token)}
                  delay={index * 100} // Staggered animation
                />
              );
            } else {
              return (
                <Bubble
                  key={bubble.token.mint}
                  bubble={bubble}
                  onPress={() => onBubblePress(bubble.token)}
                />
              );
            }
          })}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  chart: {
    position: 'relative',
  },
});