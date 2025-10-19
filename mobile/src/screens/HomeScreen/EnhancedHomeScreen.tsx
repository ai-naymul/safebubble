import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../components/atoms/Text';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner';
import { ErrorView } from '../../components/molecules/ErrorView';
import { BubbleChart } from '../../components/organisms/BubbleChart/BubbleChart';
import { FilterBar, FilterType } from '../../components/organisms/FilterBar';
import { SeekerBanner } from '../../components/molecules/SeekerBanner';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { LoadingBubbleChart, LoadingRiskCard } from '../../components/ui/loading-states';
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

export const EnhancedHomeScreen: React.FC = () => {
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

  // Filter tokens based on risk level and deduplicate by mint address
  const filteredTokens = useMemo(() => {
    if (!tokens) return [];

    // First deduplicate tokens by mint address
    const deduplicatedTokens = deduplicateTokens(tokens);

    // Then filter by risk level
    if (activeFilter === 'ALL') {
      return deduplicatedTokens;
    }

    return deduplicatedTokens.filter(token => {
      const riskLevel = token.riskScore.riskLevel;
      return riskLevel === activeFilter;
    });
  }, [tokens, activeFilter]);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    if (!tokens) return { all: 0, safe: 0, medium: 0, danger: 0 };
    
    const deduplicatedTokens = deduplicateTokens(tokens);
    
    return {
      all: deduplicatedTokens.length,
      safe: deduplicatedTokens.filter(t => t.riskScore.riskLevel === 'SAFE').length,
      medium: deduplicatedTokens.filter(t => t.riskScore.riskLevel === 'MEDIUM').length,
      danger: deduplicatedTokens.filter(t => t.riskScore.riskLevel === 'DANGER').length,
    };
  }, [tokens]);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleBubblePress = (token: Token) => {
    // @ts-ignore - navigation types
    navigation.navigate('TokenDetail', { token });
  };

  const handleRefresh = () => {
    refetch();
  };

  const getMarketStats = () => {
    if (!tokens) return null;
    
    const deduplicatedTokens = deduplicateTokens(tokens);
    const totalMarketCap = deduplicatedTokens.reduce((sum, token) => sum + token.marketCap, 0);
    const avgRiskScore = deduplicatedTokens.reduce((sum, token) => sum + token.riskScore.totalScore, 0) / deduplicatedTokens.length;
    
    return {
      totalTokens: deduplicatedTokens.length,
      totalMarketCap,
      avgRiskScore: Math.round(avgRiskScore),
    };
  };

  const marketStats = getMarketStats();

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
        <ErrorView
          message={error.message || 'Failed to load tokens'}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header with subtle gradient */}
        <LinearGradient
          colors={[colors.background.secondary, colors.background.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../../assets/logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.titleContainer}>
                <Text variant="h2" weight="bold" style={styles.title} numberOfLines={1}>
                  SafeBubble
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  Discover safe tokens to trade
                </Text>
              </View>
            </View>
            
            {isSeeker && (
              <Badge variant="success" size="sm">
                Seeker
              </Badge>
            )}
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary.main}
              colors={[colors.primary.main]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Market Stats */}
          {marketStats && (
            <Card variant="elevated" style={styles.statsCard}>
              <CardHeader>
                <Text variant="h3" weight="bold" style={styles.statsTitle}>
                  Market Overview
                </Text>
              </CardHeader>
              <CardContent>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text variant="h2" weight="bold" style={styles.statValue}>
                      {marketStats.totalTokens}
                    </Text>
                    <Text variant="caption" color="secondary">
                      Total Tokens
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="h2" weight="bold" style={styles.statValue}>
                      ${(marketStats.totalMarketCap / 1000000).toFixed(1)}M
                    </Text>
                    <Text variant="caption" color="secondary">
                      Market Cap
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="h2" weight="bold" style={styles.statValue}>
                      {marketStats.avgRiskScore}
                    </Text>
                    <Text variant="caption" color="secondary">
                      Avg Risk Score
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Seeker Banner */}
          {isSeeker && (
            <View style={styles.bannerContainer}>
              <SeekerBanner />
            </View>
          )}

          {/* Filter Bar */}
          <View style={styles.filterContainer}>
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={filterCounts}
            />
          </View>

          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <LoadingBubbleChart style={styles.loadingChart} />
              <Text variant="body" color="secondary" style={styles.loadingText}>
                Analyzing token safety...
              </Text>
            </View>
          ) : (
            /* Bubble Chart */
            <View style={styles.chartContainer}>
              <BubbleChart
                tokens={filteredTokens}
                onBubblePress={handleBubblePress}
              />
            </View>
          )}

        </ScrollView>
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
    paddingTop: spacing['2xl'], // Increased from spacing.xl to spacing.2xl for more top margin
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.base,
    minHeight: 140, // Increased from 120 to 140 to accommodate more padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  headerContent: {
    flex: 1,
    marginRight: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: spacing.md,
  },
  logo: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontSize: 24,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: spacing.base,
    marginTop: spacing.md,
  },
  statsTitle: {
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  bannerContainer: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  filterContainer: {
    marginHorizontal: spacing.base,
    marginBottom: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingChart: {
    marginBottom: spacing.base,
  },
  loadingText: {
    textAlign: 'center',
  },
  chartContainer: {
    flex: 1,
    minHeight: 500,
    marginTop: 0,
  },
});
