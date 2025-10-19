// src/theme/colors.ts

/**
 * Modern Professional Color Palette
 * Enhanced with modern design tokens and improved contrast
 * Uses sophisticated colors with better accessibility
 */
export const colors = {
  // Base Colors - Enhanced dark theme
  background: {
    primary: '#0A0E14',      // Deep navy black
    secondary: '#111827',     // Slightly lighter
    tertiary: '#1F2937',      // Card background
    elevated: '#374151',      // Elevated elements
    card: '#1F2937',          // Card background
    disabled: '#374151',      // Disabled state
  },

  // Primary Colors - Enhanced with better variants
  primary: {
    main: '#00D18C',          // Muted teal (Solana-inspired)
    light: '#1FE8A5',         // Lighter teal
    dark: '#00A871',          // Darker teal
    contrast: '#FFFFFF',      // Contrast text
  },

  // Solana Brand - Enhanced gradient system
  brand: {
    primary: '#00D18C',       // Muted teal (Solana-inspired)
    light: '#1FE8A5',         // Lighter teal
    dark: '#00A871',          // Darker teal
    gradient: {
      start: '#00D18C',
      end: '#7B61FF',         // Purple gradient end
    },
  },

  // Risk Colors - Lighter, more subtle tones
  risk: {
    safe: {
      primary: '#34D399',     // Lighter green with white tint
      light: '#6EE7B7',       // Even lighter green
      background: '#064E3B',  // Dark green background
    },
    medium: {
      primary: '#FBBF24',     // Lighter amber with white tint
      light: '#FCD34D',       // Even lighter amber
      background: '#78350F',  // Dark amber background
    },
    danger: {
      primary: '#F87171',     // Lighter red with white tint
      light: '#FCA5A5',       // Even lighter red
      background: '#7F1D1D',  // Dark red background
    },
  },

  // Text Colors
  text: {
    primary: '#F9FAFB',       // Almost white
    secondary: '#D1D5DB',     // Light gray
    tertiary: '#9CA3AF',      // Medium gray
    disabled: '#6B7280',      // Darker gray
    inverse: '#111827',       // For light backgrounds
  },

  // Interactive Elements
  interactive: {
    primary: '#00D18C',       // Teal
    hover: '#1FE8A5',         // Lighter teal
    pressed: '#00A871',       // Darker teal
    disabled: '#374151',      // Gray
  },

  // Border Colors - Enhanced
  border: {
    primary: '#374151',       // Subtle border
    secondary: '#4B5563',     // More visible
    focus: '#00D18C',         // Teal for focus
    disabled: '#6B7280',      // Disabled border
  },

  // Status Colors
  status: {
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#3B82F6',
  },

  // Chart/Graph Colors (for data visualization)
  chart: {
    positive: '#10B981',
    negative: '#EF4444',
    neutral: '#6B7280',
    gradient: [
      '#00D18C',
      '#7B61FF',
      '#FF6B9D',
      '#FFB800',
    ],
  },

  // Overlay/Shadow - Enhanced
  overlay: {
    light: 'rgba(0, 0, 0, 0.4)',
    medium: 'rgba(0, 0, 0, 0.6)',
    heavy: 'rgba(0, 0, 0, 0.8)',
  },

  // Shadow Colors - Modern shadow system
  shadow: {
    primary: '#000000',
    secondary: 'rgba(0, 0, 0, 0.1)',
    elevated: 'rgba(0, 0, 0, 0.2)',
  },

  // Glass/Blur effects
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    backdrop: 'rgba(0, 0, 0, 0.3)',
  },
};