// src/components/molecules/SeekerBanner.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../atoms/Text';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { getSeekerPerks } from '../../utils/seekerDetection';

interface SeekerBannerProps {
  compact?: boolean;
}

export const SeekerBanner: React.FC<SeekerBannerProps> = ({ compact = false }) => {
  const perks = getSeekerPerks();

  if (compact) {
    return (
      <LinearGradient
        colors={['#9333EA', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.compactBanner}
      >
        <Text variant="caption" weight="bold" style={styles.compactText}>
          ⚡ Seeker Pro Active
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#9333EA', '#7C3AED', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.header}>
          <Text variant="h3" weight="bold" style={styles.title}>
            ⚡ Seeker Detected
          </Text>
          <View style={styles.badge}>
            <Text variant="caption" weight="bold" style={styles.badgeText}>
              PRO
            </Text>
          </View>
        </View>
        
        <Text variant="body" style={styles.subtitle}>
          Exclusive perks activated:
        </Text>

        <View style={styles.perksContainer}>
          {perks.map((perk, index) => (
            <View key={index} style={styles.perkItem}>
              <Text variant="caption" style={styles.perkText}>
                {perk}
              </Text>
            </View>
          ))}
        </View>

        <Text variant="caption" style={styles.disclaimer}>
          Device-based detection • UI-only for hackathon demo
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  banner: {
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.lg,
  },
  compactBanner: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  compactText: {
    color: colors.text.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeText: {
    color: colors.text.primary,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
  },
  perksContainer: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  perkItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  perkText: {
    color: colors.text.primary,
  },
  disclaimer: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});

