import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

const badgeVariants = {
  default: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
    textColor: colors.text.inverse,
  },
  secondary: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.primary,
    textColor: colors.text.secondary,
  },
  destructive: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
    textColor: colors.text.inverse,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.border.primary,
    textColor: colors.text.primary,
  },
  success: {
    backgroundColor: colors.risk.safe.primary,
    borderColor: colors.risk.safe.primary,
    textColor: colors.text.inverse,
  },
  warning: {
    backgroundColor: colors.risk.medium.primary,
    borderColor: colors.risk.medium.primary,
    textColor: colors.text.inverse,
  },
  info: {
    backgroundColor: colors.status.info,
    borderColor: colors.status.info,
    textColor: colors.text.inverse,
  },
  danger: {
    backgroundColor: colors.risk.danger.primary,
    borderColor: colors.risk.danger.primary,
    textColor: colors.text.inverse,
  },
};

const sizeVariants = {
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    borderRadius: 12,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    borderRadius: 16,
  },
  lg: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    borderRadius: 20,
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const variantStyle = badgeVariants[variant] || badgeVariants.default;
  const sizeStyle = sizeVariants[size] || sizeVariants.md;

  return (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: variantStyle.backgroundColor,
              borderColor: variantStyle.borderColor,
              paddingHorizontal: sizeStyle.paddingHorizontal,
              paddingVertical: sizeStyle.paddingVertical,
              borderRadius: sizeStyle.borderRadius,
            },
            style,
          ]}
        >
      <Text
        style={[
          styles.text,
          {
            color: variantStyle.textColor,
            fontSize: sizeStyle.fontSize,
            fontWeight: '600',
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
