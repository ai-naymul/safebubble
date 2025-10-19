import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import Svg, { Circle, Text as SvgText, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Token } from '../../domain/models/Token';
import { colors } from '../../theme';

interface AnimatedBubbleProps {
  token: Token;
  x: number;
  y: number;
  radius: number;
  color: string;
  onPress: () => void;
  delay?: number;
}

export const AnimatedBubble: React.FC<AnimatedBubbleProps> = ({
  token,
  x,
  y,
  radius,
  color,
  onPress,
  delay = 0,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [floatAnim] = useState(new Animated.Value(0));
  const [horizontalFloatAnim] = useState(new Animated.Value(0));
  
  const gradientId = `gradient-${token.mint}`;
  const glowId = `glow-${token.mint}`;

  useEffect(() => {
    // Entrance animation
    const entranceAnimation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Continuous vertical floating animation for all bubbles
    const verticalFloatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000 + (radius * 20), // Duration varies by size
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000 + (radius * 20),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Continuous horizontal floating animation for all bubbles
    const horizontalFloatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(horizontalFloatAnim, {
          toValue: 1,
          duration: 4000 + (radius * 30), // Different duration for variety
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(horizontalFloatAnim, {
          toValue: 0,
          duration: 4000 + (radius * 30),
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    entranceAnimation.start();
    verticalFloatAnimation.start();
    horizontalFloatAnimation.start();

    return () => {
      entranceAnimation.stop();
      verticalFloatAnimation.stop();
      horizontalFloatAnimation.stop();
    };
  }, [delay, scaleAnim, opacityAnim, floatAnim, horizontalFloatAnim, radius]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const truncateSymbol = (symbol: string, maxLength: number = 8): string => {
    if (symbol.length <= maxLength) return symbol;
    return symbol.substring(0, maxLength - 2) + '..';
  };

  // Better text sizing for readability - increased minimum font sizes
  const symbolFontSize = Math.max(Math.min(radius * 0.5, 18), 12);
  const scoreFontSize = Math.max(Math.min(radius * 0.35, 14), 10);
  
  // Show text for all bubbles, but adjust content based on size
  const showText = radius > 6;
  const showScore = radius > 8;

  // Calculate vertical floating offset
  const verticalFloatOffset = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  // Calculate horizontal floating offset
  const horizontalFloatOffset = horizontalFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });


  const BubbleContent = () => (
    <Svg width={radius * 2} height={radius * 2}>
      <Defs>
        {/* Main gradient */}
        <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <Stop offset="70%" stopColor={color} stopOpacity="0.8" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </RadialGradient>
        
        {/* Glow gradient for dangerous tokens */}
        {token.riskScore.riskLevel === 'DANGER' && (
          <RadialGradient id={glowId} cx="50%" cy="50%" r="80%">
            <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#FF8E8E" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#FFB3B3" stopOpacity="0.1" />
          </RadialGradient>
        )}
      </Defs>
      
          {/* Main bubble - single clean circle with size-responsive border */}
          <Circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill={`url(#${gradientId})`}
            stroke={color}
            strokeWidth={Math.max(1, radius / 20)} // Border width scales with bubble size
            strokeOpacity={0.4}
          />
      
      {/* Symbol text - only for larger bubbles */}
      {showText && (
        <SvgText
          x={radius}
          y={radius - 1}
          textAnchor="middle"
          fontSize={symbolFontSize}
          fontWeight="bold"
          fill="white"
          opacity={0.95}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth={0.3}
        >
          {truncateSymbol(token.symbol, Math.floor(radius / 6))}
        </SvgText>
      )}
      
      {/* Risk score - only for larger bubbles */}
      {showScore && (
        <SvgText
          x={radius}
          y={radius + symbolFontSize + 2}
          textAnchor="middle"
          fontSize={scoreFontSize}
          fill="white"
          opacity={0.8}
          fontWeight="600"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth={0.2}
        >
          {Math.round(token.riskScore.totalScore)}
        </SvgText>
      )}
    </Svg>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x - radius,
          top: y - radius,
          width: radius * 2,
          height: radius * 2,
          transform: [
            { scale: scaleAnim },
            { translateY: verticalFloatOffset },
            { translateX: horizontalFloatOffset },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <BubbleContent />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  touchable: {
    width: '100%',
    height: '100%',
  },
});
