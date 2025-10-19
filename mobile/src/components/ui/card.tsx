import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: keyof typeof spacing;
  style?: any;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: any;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: any;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: any;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: any;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: any;
}

const cardVariants = {
  default: {
    backgroundColor: colors.background.card,
    borderColor: colors.border.primary,
    borderWidth: 1,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  elevated: {
    backgroundColor: colors.background.card,
    borderColor: 'transparent',
    borderWidth: 0,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: colors.border.primary,
    borderWidth: 1,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'base',
  style,
}) => {
  const variantStyle = cardVariants[variant];
  const paddingValue = spacing[padding];

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: borderRadius.lg,
          padding: paddingValue,
        },
        variantStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  style,
}) => {
  return (
    <View
      style={[styles.header, style]}
    >
      {children}
    </View>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  style,
}) => {
  return (
    <View
      style={[styles.content, style]}
    >
      {children}
    </View>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  style,
}) => {
  return (
    <View
      style={[styles.footer, style]}
    >
      {children}
    </View>
  );
};

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  style,
}) => {
  return (
    <View
      style={[styles.title, style]}
    >
      <Text style={styles.titleText}>
        {children}
      </Text>
    </View>
  );
};

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  style,
}) => {
  return (
    <View
      style={[styles.description, style]}
    >
      <Text style={styles.descriptionText}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
  },
  header: {
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  description: {
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
