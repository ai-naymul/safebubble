// src/theme/index.ts

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { borderRadius } from './borderRadius';

/**
 * Complete Theme Object
 * All design tokens in one place
 */
export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
} as const;

export type Theme = typeof theme;

// Export individual pieces for convenience
export { colors, typography, spacing, shadows, borderRadius };