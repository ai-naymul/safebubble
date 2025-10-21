import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation';
import { colors } from './src/theme';

// Conditionally import Analytics only on web
const Analytics = Platform.OS === 'web' 
  ? require('@vercel/analytics/react').Analytics 
  : null;

/**
 * Create React Query client
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds
    },
  },
});

/**
 * Main App Component
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, minHeight: '100%' }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor={colors.background.primary} />
          <AppNavigator />
          {Analytics && <Analytics />}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}