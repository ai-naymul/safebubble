import { StyleSheet } from 'react-native';

/**
 * Utility function to combine class names (adapted for React Native)
 * This is a simplified version of the web-based cn utility
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Create a style object with conditional styles
 */
export function createStyles<T extends Record<string, any>>(styles: T): T {
  return StyleSheet.create(styles);
}

/**
 * Combine multiple style objects
 */
export function combineStyles(...styles: any[]): any {
  return styles.filter(Boolean).reduce((acc, style) => {
    if (Array.isArray(style)) {
      return [...acc, ...style];
    }
    return [...acc, style];
  }, []);
}

/**
 * Generate a unique ID for components
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
