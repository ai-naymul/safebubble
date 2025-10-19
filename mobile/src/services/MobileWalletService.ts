// src/services/MobileWalletService.ts
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {
  Connection,
  VersionedTransaction,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import { Buffer } from '@craftzdog/react-native-buffer';

const APP_IDENTITY = {
  name: 'SafeBubble',
  uri: 'https://safebubble.app',
  icon: 'favicon.ico'
};

/**
 * Decode base64 string to Uint8Array without relying on Buffer
 */
function base64ToUint8Array(base64: string): Uint8Array {
  // Remove any padding characters and decode
  const cleanBase64 = base64.replace(/=/g, '');
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Convert wallet address to proper base58 format
 * Some wallets return base64 encoded addresses that need conversion
 */
function normalizeWalletAddress(address: string): string {
  try {
    // First try to create PublicKey directly (handles base58)
    new PublicKey(address);
    return address; // Already valid base58
  } catch (error) {
    // If that fails, try to decode as base64
    try {
      // Check if it looks like base64 (contains + or / or = at end)
      if (address.includes('+') || address.includes('/') || address.endsWith('=')) {
        const decoded = base64ToUint8Array(address);
        // Convert to base58
        const publicKey = new PublicKey(decoded);
        return publicKey.toBase58();
      }
    } catch (base64Error) {
      console.warn('Failed to decode base64 address:', base64Error);
    }

    // If all else fails, throw original error
    throw error;
  }
}

export interface AuthorizationResult {
  address: string;
  publicKey: PublicKey;
  authToken: string;
}

/**
 * Connect wallet using Mobile Wallet Adapter
 */
export async function connectMWA(
  cluster: 'solana:mainnet' | 'solana:devnet' = 'solana:mainnet'
): Promise<AuthorizationResult> {
  return transact(async (wallet) => {
    const auth = await wallet.authorize({
      cluster,
      identity: APP_IDENTITY
    });

    const firstAccount = auth.accounts[0];
    if (!firstAccount || !firstAccount.address) {
      throw new Error('No wallet account found');
    }

    // Normalize and validate the address format
    try {
      const normalizedAddress = normalizeWalletAddress(firstAccount.address);
      const publicKey = new PublicKey(normalizedAddress);

      console.log('Wallet connected successfully:', {
        originalAddress: firstAccount.address,
        normalizedAddress,
        publicKey: publicKey.toBase58()
      });

      return {
        address: normalizedAddress,
        publicKey,
        authToken: auth.auth_token,
      };
    } catch (error) {
      console.error('Invalid wallet address format:', firstAccount.address, error);
      throw new Error('Invalid wallet address format. Please try again.');
    }
  });
}

/**
 * Reauthorize existing session
 */
export async function reauthorizeMWA(authToken: string): Promise<AuthorizationResult> {
  return transact(async (wallet) => {
    const auth = await wallet.reauthorize({
      auth_token: authToken,
      identity: APP_IDENTITY
    });

    const firstAccount = auth.accounts[0];
    if (!firstAccount || !firstAccount.address) {
      throw new Error('No wallet account found');
    }

    // Normalize and validate the address format
    try {
      const normalizedAddress = normalizeWalletAddress(firstAccount.address);
      const publicKey = new PublicKey(normalizedAddress);

      return {
        address: normalizedAddress,
        publicKey,
        authToken: auth.auth_token,
      };
    } catch (error) {
      console.error('Invalid wallet address format:', firstAccount.address, error);
      throw new Error('Invalid wallet address format. Please try again.');
    }
  });
}

/**
 * Sign and send transaction using MWA
 */
export async function signAndSendMWA(
  serializedTx: Uint8Array,
  authToken?: string
): Promise<string> {
  return transact(async (wallet) => {
    // Reauthorize if we have a token
    if (authToken) {
      await wallet.reauthorize({ 
        auth_token: authToken,
        identity: APP_IDENTITY 
      });
    } else {
      await wallet.authorize({ 
        cluster: 'solana:mainnet',
        identity: APP_IDENTITY 
      });
    }

    const tx = VersionedTransaction.deserialize(serializedTx);
    const { signatures } = await wallet.signAndSendTransactions({ 
      transactions: [tx] 
    });
    
    return signatures[0];
  });
}

/**
 * Sign transaction without sending (for Jupiter swap preparation)
 */
export async function signTransactionMWA(
  serializedTx: Uint8Array,
  authToken?: string
): Promise<Uint8Array> {
  return transact(async (wallet) => {
    // Reauthorize if we have a token
    if (authToken) {
      await wallet.reauthorize({ 
        auth_token: authToken,
        identity: APP_IDENTITY 
      });
    } else {
      await wallet.authorize({ 
        cluster: 'solana:mainnet',
        identity: APP_IDENTITY 
      });
    }

    const tx = VersionedTransaction.deserialize(serializedTx);
    const { signedTransactions } = await wallet.signTransactions({ 
      transactions: [tx] 
    });
    
    return signedTransactions[0];
  });
}

/**
 * Disconnect wallet session
 */
export async function disconnectMWA(authToken: string): Promise<void> {
  return transact(async (wallet) => {
    await wallet.deauthorize({ auth_token: authToken });
  });
}

