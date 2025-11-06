// src/screens/HomeScreen/HomeScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../components/atoms/Text';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner';
import { ErrorView } from '../../components/molecules/ErrorView';
import { BubbleChart } from '../../components/organisms/BubbleChart/BubbleChart';
import { FilterBar, FilterType } from '../../components/organisms/FilterBar';
import { SeekerBanner } from '../../components/molecules/SeekerBanner';
import { getNetworkInfo } from '../../utils/networkUtils';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { LoadingBubbleChart } from '../../components/ui/loading-states';
import { useTrendingTokens } from '../../hooks/useTokens';
import { Token } from '../../domain/models/Token';
import { colors, spacing, shadows } from '../../theme';
import { isSeekerDevice } from '../../utils/seekerDetection';

// Utility function to deduplicate tokens by mint address
const deduplicateTokens = (tokens: Token[]): Token[] => {
  return tokens.reduce((acc, token) => {
    if (!acc.find(t => t.mint === token.mint)) {
      acc.push(token);
    }
    return acc;
  }, [] as Token[]);
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [fadeAnim] = useState(new Animated.Value(0));
  const isSeeker = isSeekerDevice();

  // Fetch trending tokens
  const {
    data: tokens,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useTrendingTokens(100);
  console.log('HomeScreen - Trending tokens hook result:', {
    hasData: !!tokens,
    tokenCount: tokens?.length || 0,
    isLoading,
    hasError: !!error,
    error: error?.message,
    isRefetching
  });
  // Filter tokens based on risk level and deduplicate by mint address
  const filteredTokens = useMemo(() => {
    if (!tokens) return [];

    // First deduplicate tokens by mint address
    const uniqueTokens = deduplicateTokens(tokens);

    // Then apply risk level filter
    switch (activeFilter) {
      case 'SAFE':
        return uniqueTokens.filter(t => t.riskScore.riskLevel === 'SAFE');
      case 'MEDIUM':
        return uniqueTokens.filter(t => t.riskScore.riskLevel === 'MEDIUM');
      case 'DANGER':
        return uniqueTokens.filter(t => t.riskScore.riskLevel === 'DANGER');
      default:
        return uniqueTokens;
    }
  }, [tokens, activeFilter]);

  // Calculate filter counts (using deduplicated tokens)
  const filterCounts = useMemo(() => {
    if (!tokens) return { all: 0, safe: 0, medium: 0, danger: 0 };

    // Deduplicate tokens for accurate counts
    const uniqueTokens = deduplicateTokens(tokens);

    return {
      all: uniqueTokens.length,
      safe: uniqueTokens.filter(t => t.riskScore.riskLevel === 'SAFE').length,
      medium: uniqueTokens.filter(t => t.riskScore.riskLevel === 'MEDIUM').length,
      danger: uniqueTokens.filter(t => t.riskScore.riskLevel === 'DANGER').length,
    };
  }, [tokens]);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const networkInfo = getNetworkInfo();
  console.log('Network Info:', networkInfo);

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    refetch();
  };

  // Handle bubble press
  const handleBubblePress = (token: Token) => {
    (navigation as any).navigate('TokenDetail', { token });
  };

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading tokens..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorView
        message="Failed to load tokens. Please check your connection."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={[colors.brand.primary, colors.brand.light]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text variant="h2" weight="bold" style={styles.headerTitle}>
                SafeBubble
              </Text>
              <Text color="secondary" style={styles.subtitle}>
                Scan {filteredTokens.length} tokens in seconds
              </Text>
            </View>
            {isSeeker && <SeekerBanner compact />}
          </View>
        </LinearGradient>

        {/* Filter Bar */}
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />

        {/* Stats Bar */}
        <Card style={styles.statsCard}>
          <CardContent style={styles.statsBarContent}>
            <View style={styles.statItem}>
              <Text variant="caption" color="secondary">
                Total
              </Text>
              <Badge variant="default" size="sm">
                {filterCounts.all}
              </Badge>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="caption" style={{ color: colors.risk.safe.primary }}>
                Safe
              </Text>
              <Badge variant="success" size="sm">
                {filterCounts.safe}
              </Badge>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="caption" style={{ color: colors.risk.danger.primary }}>
                High Risk
              </Text>
              <Badge variant="danger" size="sm">
                {filterCounts.danger}
              </Badge>
            </View>
          </CardContent>
        </Card>

        {/* Debug Info - Only show in development */}
        {__DEV__ && (
          <Card style={[styles.statsCard, { marginTop: spacing.sm }]}>
            <CardContent style={{ padding: spacing.sm }}>
              <Text variant="caption" color="secondary" style={{ marginBottom: spacing.xs }}>
                Debug Info (Dev Mode)
              </Text>
              <Text variant="small" style={{ marginBottom: spacing.xs }}>
                API: {networkInfo.apiBaseUrl}
              </Text>
              <Text variant="small" style={{ marginBottom: spacing.sm }}>
                Tokens: {tokens?.length || 0} loaded, {filteredTokens.length} filtered
              </Text>
              <Button
                title="Refresh Data"
                onPress={handleManualRefresh}
                disabled={isRefetching}
                size="sm"
                variant="outline"
              />
            </CardContent>
          </Card>
        )}

        {/* Bubble Chart */}
        <BubbleChart
          tokens={filteredTokens}
          onBubblePress={handleBubblePress}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.base,
    paddingHorizontal: spacing.base,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  headerContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  headerTitle: {
    color: colors.text.inverse,
    fontSize: 28,
    lineHeight: 32,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  seekerContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  statsCard: {
    marginHorizontal: spacing.base,
    marginTop: -spacing.lg, // Overlap with header gradient
    marginBottom: spacing.md,
    backgroundColor: colors.background.card,
    ...shadows.md,
  },
  statsBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.primary,
    height: '100%',
  },
});