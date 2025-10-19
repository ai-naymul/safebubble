import React, { useState, useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text } from '../atoms/Text';
import { colors, spacing, borderRadius } from '../../theme';
import { Token } from '../../domain/models/Token';

interface ModernBubbleProps {
  token: Token;
  size: number;
  delay: number;
  offsetX: number;
  offsetY: number;
  onClick: () => void;
}

export const ModernBubble: React.FC<ModernBubbleProps> = ({ 
  token, 
  size, 
  delay, 
  offsetX, 
  offsetY, 
  onClick 
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [floatAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));
  const [pressAnim] = useState(new Animated.Value(1));

  const isPositive = token.priceChange24h >= 0;
  const isDanger = token.riskScore.riskLevel === 'DANGER';

  useEffect(() => {
    // Entrance animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      delay: delay,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.easeInOutQuad,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.easeInOutQuad,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation for DANGER tokens
    if (isDanger) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.easeInOutQuad,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.easeInOutQuad,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [scaleAnim, floatAnim, glowAnim, delay, isDanger]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(pressAnim, {
      toValue: 1.15,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClick();
  };

  const getBubbleColors = () => {
    switch (token.riskScore.riskLevel) {
      case 'SAFE':
        return [colors.risk.safe.primary, colors.risk.safe.light];
      case 'MEDIUM':
        return [colors.risk.medium.primary, colors.risk.medium.light];
      case 'DANGER':
        return [colors.risk.danger.primary, colors.risk.danger.light];
      default:
        return [colors.brand.primary, colors.brand.light];
    }
  };


  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.6, 0.2],
  });

  const [gradientStart, gradientEnd] = getBubbleColors();

  const truncateSymbol = (symbol: string, maxLength: number = 8): string => {
    if (symbol.length <= maxLength) return symbol;
    return symbol.substring(0, maxLength - 2) + '..';
  };

  const symbolFontSize = Math.max(Math.min(size * 0.4, 16), 10);
  const scoreFontSize = Math.max(Math.min(size * 0.25, 12), 8);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: offsetX,
          top: offsetY,
          width: size,
          height: size,
          transform: [
            { scale: Animated.multiply(scaleAnim, pressAnim) },
            { translateY: translateY },
          ],
        },
      ]}
    >
      {/* Glow effect for DANGER tokens */}
      {isDanger && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              width: size + 12,
              height: size + 12,
              borderRadius: (size + 12) / 2,
              opacity: glowOpacity,
              backgroundColor: colors.risk.danger.primary,
            },
          ]}
        />
      )}

      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[gradientStart, gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bubble,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          {/* Inner highlight for 3D effect */}
          <View style={styles.innerHighlight} />
          
          {/* Content */}
          <View style={styles.content}>
            <Text 
              variant="body" 
              weight="bold" 
              style={[
                styles.symbolText,
                { fontSize: symbolFontSize }
              ]}
              numberOfLines={1}
            >
              {truncateSymbol(token.symbol, Math.floor(size / 8))}
            </Text>
            <Text 
              variant="caption" 
              weight="semibold"
              style={[
                styles.scoreText,
                { 
                  fontSize: scoreFontSize,
                  color: isPositive ? colors.risk.safe.primary : colors.risk.danger.primary
                }
              ]}
            >
              {isPositive ? "+" : ""}{token.priceChange24h.toFixed(1)}%
            </Text>
          </View>

        </LinearGradient>
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
  glowEffect: {
    position: 'absolute',
    top: -6,
    left: -6,
  },
  bubble: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...colors.shadow?.elevated ? {
      shadowColor: colors.shadow.elevated,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    } : {},
  },
  innerHighlight: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    width: '30%',
    height: '30%',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  symbolText: {
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scoreText: {
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
