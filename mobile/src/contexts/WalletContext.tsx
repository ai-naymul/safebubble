// src/contexts/WalletContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectMWA, reauthorizeMWA, AuthorizationResult } from '../services/MobileWalletService';

interface WalletContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  authToken: string | null;
  publicKey: any;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  reconnectWallet: () => Promise<void>;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load saved wallet data on app start
  useEffect(() => {
    loadSavedWallet();
  }, []);

  const loadSavedWallet = async () => {
    try {
      const savedAuthToken = await AsyncStorage.getItem('wallet_auth_token');
      const savedAddress = await AsyncStorage.getItem('wallet_address');
      
      if (savedAuthToken && savedAddress) {
        setAuthToken(savedAuthToken);
        setWalletAddress(savedAddress);
        setWalletConnected(true);
        
        // Try to reconnect with saved token
        try {
          const result = await reauthorizeMWA(savedAuthToken);
          setPublicKey(result.publicKey);
        } catch (error) {
          console.log('Failed to reconnect wallet, clearing saved data');
          await clearSavedWallet();
        }
      }
    } catch (error) {
      console.error('Error loading saved wallet:', error);
    }
  };

  const saveWalletData = async (result: AuthorizationResult) => {
    try {
      await AsyncStorage.setItem('wallet_auth_token', result.authToken);
      await AsyncStorage.setItem('wallet_address', result.address);
    } catch (error) {
      console.error('Error saving wallet data:', error);
    }
  };

  const clearSavedWallet = async () => {
    try {
      await AsyncStorage.removeItem('wallet_auth_token');
      await AsyncStorage.removeItem('wallet_address');
    } catch (error) {
      console.error('Error clearing saved wallet:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      const result = await connectMWA('solana:mainnet');
      
      setWalletAddress(result.address);
      setAuthToken(result.authToken);
      setPublicKey(result.publicKey);
      setWalletConnected(true);
      
      await saveWalletData(result);
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setWalletConnected(false);
      setWalletAddress(null);
      setAuthToken(null);
      setPublicKey(null);
      
      await clearSavedWallet();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const reconnectWallet = async () => {
    if (!authToken) return;
    
    try {
      setLoading(true);
      const result = await reauthorizeMWA(authToken);
      
      setWalletAddress(result.address);
      setPublicKey(result.publicKey);
      setWalletConnected(true);
    } catch (error) {
      console.error('Wallet reconnection error:', error);
      await disconnectWallet();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: WalletContextType = {
    walletConnected,
    walletAddress,
    authToken,
    publicKey,
    connectWallet,
    disconnectWallet,
    reconnectWallet,
    loading,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    // During development/hot reloading, the context might not be available initially
    // Return a safe fallback instead of throwing an error
    console.warn('useWallet called outside WalletProvider - returning safe defaults');
    return {
      walletConnected: false,
      walletAddress: null,
      authToken: null,
      publicKey: null,
      connectWallet: async () => {
        console.warn('WalletProvider not available - cannot connect wallet');
        throw new Error('Wallet system is not ready yet. Please try again in a moment.');
      },
      disconnectWallet: async () => {},
      reconnectWallet: async () => {},
      loading: false,
    };
  }
  return context;
};

// Helper component to ensure wallet context is ready
export const WalletReadyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    // Show loading state while context is initializing
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A0E14'
      }}>
        <Text style={{ color: 'white', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }
  return <>{children}</>;
};
