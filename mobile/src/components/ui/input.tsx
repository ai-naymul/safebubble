import React, { useState, forwardRef } from 'react';
import { TextInput, View, StyleSheet, Text } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  style?: any;
  inputStyle?: any;
}

const sizeVariants = {
  sm: {
    height: 36,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
  },
  md: {
    height: 44,
    paddingHorizontal: spacing.base,
    fontSize: 16,
  },
  lg: {
    height: 52,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
  },
};

const variantStyles = {
  default: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.primary,
    borderWidth: 1,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: colors.border.primary,
    borderWidth: 1,
  },
  filled: {
    backgroundColor: colors.background.secondary,
    borderColor: 'transparent',
    borderWidth: 0,
  },
};

export const Input = forwardRef<TextInput, InputProps>(({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  size = 'md',
  variant = 'default',
  style,
  inputStyle,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const sizeStyle = sizeVariants[size];
  const variantStyle = variantStyles[variant];

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const containerStyle = [
    styles.container,
    {
      borderColor: error 
        ? colors.status.error 
        : isFocused 
          ? colors.border.focus 
          : variantStyle.borderColor,
      borderWidth: variantStyle.borderWidth,
      backgroundColor: disabled 
        ? colors.background.disabled 
        : variantStyle.backgroundColor,
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const textInputStyle = [
    styles.input,
    {
      height: multiline ? 'auto' : sizeStyle.height,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      fontSize: sizeStyle.fontSize,
      color: disabled ? colors.text.disabled : colors.text.primary,
    },
    inputStyle,
  ];

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      <View style={containerStyle}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={textInputStyle}
          {...props}
        />
      </View>
      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  container: {
    borderRadius: borderRadius.md,
    minHeight: 44,
  },
  input: {
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  error: {
    fontSize: 12,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
});
