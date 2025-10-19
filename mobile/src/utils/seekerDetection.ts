// src/utils/seekerDetection.ts
import { Platform } from 'react-native';

/**
 * Detect if the app is running on a Solana Seeker device
 * Note: This is a UI-only check for the hackathon.
 * For production, verify Seeker Genesis Token ownership via SIWS + Helius
 */
export function isSeekerDevice(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }

  // Check device model for Seeker
  // @ts-ignore - Platform.constants may not be typed
  const model = Platform.constants?.Model || '';
  
  return model.toLowerCase().includes('seeker');
}

/**
 * Get Seeker-specific perks description
 */
export function getSeekerPerks(): string[] {
  return [
    '🔔 Advanced Risk Alerts',
    '⚡ Priority Swap Execution',
    '📊 Pro Analytics Dashboard',
    '🎯 Early Access Features',
  ];
}

/**
 * Check if user has Seeker perks enabled (placeholder for full implementation)
 * TODO: Implement full SIWS + SGT verification flow:
 * 1. Sign-in with Solana via MWA
 * 2. Verify signature server-side
 * 3. Check wallet owns Seeker Genesis Token using Helius API
 * 4. Return perk status
 */
export async function verifySeekerOwnership(walletAddress: string): Promise<boolean> {
  // Placeholder - implement server-side verification
  // For hackathon demo, we'll use device detection
  return isSeekerDevice();
}

/**
 * Seeker Genesis Token details
 */
export const SEEKER_GENESIS_TOKEN = {
  // Placeholder - replace with actual Seeker Genesis Token details
  mintAddress: 'SeekerGenesisToken...', // Update with actual mint
  name: 'Seeker Genesis Token',
  symbol: 'SGT',
};

