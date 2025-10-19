import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: any;
  fullWidth?: boolean;
}

const buttonVariants = {
  default: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
    textColor: colors.text.inverse,
    pressedBackgroundColor: colors.primary.dark,
  },
  destructive: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
    textColor: colors.text.inverse,
    pressedBackgroundColor: '#DC2626',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.border.primary,
    textColor: colors.text.primary,
    pressedBackgroundColor: colors.background.secondary,
  },
  secondary: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.background.secondary,
    textColor: colors.text.primary,
    pressedBackgroundColor: colors.background.tertiary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: colors.text.primary,
    pressedBackgroundColor: colors.background.secondary,
  },
  link: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: colors.primary.main,
    pressedBackgroundColor: 'transparent',
  },
};

const sizeVariants = {
  default: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: 16,
    height: 44,
    borderRadius: borderRadius.md,
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    height: 36,
    borderRadius: borderRadius.sm,
  },
  lg: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    fontSize: 18,
    height: 52,
    borderRadius: borderRadius.lg,
  },
  icon: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 16,
    height: 44,
    width: 44,
    borderRadius: borderRadius.md,
  },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  onPress,
  style,
  fullWidth = false,
}) => {
  const variantStyle = buttonVariants[variant];
  const sizeStyle = sizeVariants[size];

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled 
            ? colors.background.disabled 
            : variantStyle.backgroundColor,
          borderColor: disabled 
            ? colors.border.disabled 
            : variantStyle.borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          height: sizeStyle.height,
          width: size === 'icon' ? sizeStyle.width : fullWidth ? '100%' : 'auto',
          borderRadius: sizeStyle.borderRadius,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variantStyle.textColor}
            style={styles.loader}
          />
        )}
        <Text
          style={[
            styles.text,
            {
              color: disabled 
                ? colors.text.disabled 
                : variantStyle.textColor,
              fontSize: sizeStyle.fontSize,
              fontWeight: '600',
            },
          ]}
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    marginRight: spacing.xs,
  },
});
