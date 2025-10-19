// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { TokenDetailScreen } from '../screens/TokenDetailScreen';
import { SwapScreen } from '../screens/SwapScreen';
import { colors } from '../theme';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.brand.primary,
          background: colors.background.primary,
          card: colors.background.secondary,
          text: colors.text.primary,
          border: colors.border.primary,
          notification: colors.status.error,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { 
            backgroundColor: colors.background.primary,
            flex: 1,
            minHeight: '100%'
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TokenDetail" component={TokenDetailScreen} />
        <Stack.Screen name="SwapScreen" component={SwapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};