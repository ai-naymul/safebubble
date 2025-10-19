// src/screens/TokenDetailScreen/TokenDetailScreen.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Text } from '../../components/atoms/Text';
import { TokenCard } from '../../components/molecules/TokenCard';
import { EnhancedRiskCard } from '../../components/molecules/EnhancedRiskCard';
import { StatsOverview } from '../../components/organisms/StatsOverview';
import { RiskBreakdown } from '../../components/organisms/RiskBreakdown';
import { Token } from '../../domain/models/Token';
import { colors, spacing } from '../../theme';
import { isSeekerDevice } from '../../utils/seekerDetection';

type TokenDetailRouteProp = RouteProp<
  { TokenDetail: { token: Token } },
  'TokenDetail'
>;

export const TokenDetailScreen: React.FC = () => {
  const route = useRoute<TokenDetailRouteProp>();
  const navigation = useNavigation();
  const { token } = route.params;
  const isSeeker = isSeekerDevice();


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      
      <View style={styles.content}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text weight="semibold" style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          {isSeeker && (
            <View style={styles.seekerIndicator}>
              <Text variant="caption" style={styles.seekerText}>Seeker</Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Token Card */}
        <TokenCard
          token={token}
          onPress={() => {}} // Already showing details
        />

        {/* Enhanced Risk Card */}
        <EnhancedRiskCard
          token={token}
        />

        {/* Stats Overview */}
        <StatsOverview token={token} />

        {/* Detailed Risk Breakdown */}
        <RiskBreakdown
          riskScore={token.riskScore}
          token={token}
        />
        </ScrollView>
      </View>
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
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing.xs,
  },
  backText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  seekerIndicator: {
    backgroundColor: colors.risk.safe.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  seekerText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
});