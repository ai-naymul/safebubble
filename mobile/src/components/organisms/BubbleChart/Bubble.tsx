// src/components/organisms/BubbleChart/Bubble.tsx
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Easing, Image, View, Text } from 'react-native';
import Svg, { Circle, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { BubbleData } from './BubbleLayout';
import { colors } from '../../../theme';

interface BubbleProps {
  bubble: BubbleData;
  onPress: () => void;
}

export const Bubble: React.FC<BubbleProps> = ({ 
  bubble, 
  onPress, 
}) => {
  const { x, y, radius, color, token } = bubble;
  const [scaleAnim] = useState(new Animated.Value(1));
  const [floatAnim] = useState(new Animated.Value(0));
  const [horizontalFloatAnim] = useState(new Animated.Value(0));
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Create gradient ID
  const gradientId = `gradient-${token.mint}`;

  // Continuous floating animation for all bubbles
  useEffect(() => {
    // Continuous vertical floating animation
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

    // Continuous horizontal floating animation
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

    verticalFloatAnimation.start();
    horizontalFloatAnimation.start();

    return () => {
      verticalFloatAnimation.stop();
      horizontalFloatAnimation.stop();
    };
  }, [floatAnim, horizontalFloatAnim, radius]);

  // Truncate symbol if too long to prevent overflow - more intelligent truncation
  const truncateSymbol = (symbol: string, maxLength: number = 12): string => {
    if (symbol.length <= maxLength) return symbol;
    // For very long symbols, try to keep the most important part
    if (symbol.length > maxLength + 3) {
      return symbol.substring(0, maxLength - 3) + '...';
    }
    return symbol.substring(0, maxLength - 2) + '..';
  };

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 1.15,
      useNativeDriver: false, // Disable native driver for web compatibility
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false, // Disable native driver for web compatibility
      friction: 3,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  // Calculate font sizes based on radius with better scaling for visibility
  const symbolFontSize = Math.max(Math.min(radius * 0.6, 24), 14); // Increased max and min sizes
  const scoreFontSize = Math.max(Math.min(radius * 0.4, 18), 12); // Increased max and min sizes
  
  // Calculate text positioning based on bubble size
  const textVerticalOffset = radius * 0.1; // Small offset from center
  const scoreVerticalOffset = radius * 0.3; // Distance between symbol and score
  
  // For very small bubbles, show only symbol to avoid clutter
  const showOnlySymbol = radius < 35;
  
  // Calculate logo size based on bubble size
  const logoSize = Math.max(Math.min(radius * 0.6, 32), 16); // Logo size scales with bubble
  const logoOffset = radius * 0.25; // Offset from center for logo positioning
  
  // Check if we should show logo (show for all bubbles that have logoUri)
  const shouldShowLogo = token.logoUri && radius > 25;
  
  // Debug logging for logo
  useEffect(() => {
    console.log(`Token ${token.symbol}: logoUri = ${token.logoUri}, shouldShowLogo = ${shouldShowLogo}, radius = ${radius}`);
    if (token.logoUri) {
      console.log(`Token ${token.symbol}: logoUri = ${token.logoUri}, shouldShowLogo = ${shouldShowLogo}, radius = ${radius}`);
    } else {
      console.log(`Token ${token.symbol}: NO LOGO URI - showing fallback`);
    }
  }, [token.logoUri, shouldShowLogo, radius]);

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
        <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <Stop offset="70%" stopColor={color} stopOpacity="0.8" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </RadialGradient>
        {/* Shadow filter for larger bubbles */}
        {radius > 40 && (
          <filter id={`shadow-${token.mint}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)"/>
          </filter>
        )}
        {/* Text shadow filter for better readability */}
        <filter id={`textShadow-${token.mint}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.5)"/>
        </filter>
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
        filter={radius > 40 ? `url(#shadow-${token.mint})` : undefined}
      />
      
      {/* Token logo will be rendered as React Native Image overlay */}
      
      {/* Symbol text with better positioning and sizing - adjust position if logo is present */}
      <SvgText
        x={radius}
        y={shouldShowLogo && !logoError ? radius + textVerticalOffset + logoOffset : radius - textVerticalOffset}
        textAnchor="middle"
        fontSize={symbolFontSize}
        fontWeight="bold"
        fill="white"
        opacity={1}
        dominantBaseline="middle"
        filter={`url(#textShadow-${token.mint})`}
      >
        {truncateSymbol(token.symbol, Math.floor(radius / 4))}
      </SvgText>
      
      {/* Risk score with better positioning - only show for larger bubbles */}
      {!showOnlySymbol && (
        <SvgText
          x={radius}
          y={radius + scoreVerticalOffset + (shouldShowLogo && !logoError ? logoOffset : 0)}
          textAnchor="middle"
          fontSize={scoreFontSize}
          fill="white"
          opacity={0.9}
          fontWeight="600"
          dominantBaseline="middle"
          filter={`url(#textShadow-${token.mint})`}
        >
          {Math.round(token.riskScore.totalScore)}
        </SvgText>
      )}
      
      {/* Market cap indicator for large bubbles */}
      {radius > 45 && (
        <SvgText
          x={radius}
          y={radius + scoreVerticalOffset + scoreFontSize + 4 + (shouldShowLogo && !logoError ? logoOffset : 0)}
          textAnchor="middle"
          fontSize={Math.max(10, radius * 0.2)}
          fill="white"
          opacity={0.8}
          fontWeight="500"
          dominantBaseline="middle"
          filter={`url(#textShadow-${token.mint})`}
        >
          ${(token.marketCap / 1000000).toFixed(1)}M
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
        
        {/* Token logo overlay - React Native Image component */}
        {shouldShowLogo && !logoError && (
          <View style={[
            styles.logoContainer,
            {
              width: logoSize,
              height: logoSize,
              left: radius - logoSize / 2,
              top: radius - logoSize / 2 - logoOffset,
            }
          ]}>
            <Image
              source={{ uri: token.logoUri }}
              style={styles.logoImage}
              onLoad={() => {
                console.log(`Logo loaded for ${token.symbol}`);
                setLogoLoaded(true);
              }}
              onError={(error) => {
                console.log(`Logo failed to load for ${token.symbol}:`, error);
                setLogoError(true);
              }}
              resizeMode="contain"
            />
          </View>
        )}
        
        {/* Fallback logo overlay for tokens without logoUri or when image fails */}
        {(!shouldShowLogo || logoError) && radius > 25 && (
          <View style={[
            styles.logoFallback,
            {
              width: logoSize,
              height: logoSize,
              left: radius - logoSize / 2,
              top: radius - logoSize / 2 - logoOffset,
              borderRadius: logoSize / 2,
            }
          ]}>
            <Text style={[
              styles.logoFallbackText,
              { fontSize: logoSize * 0.4 }
            ]}>
              {token.symbol.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
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
  logoContainer: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  logoFallback: {
    position: 'absolute',
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoFallbackText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});