// src/utils/raydiumLink.ts
import { Linking } from 'react-native';

export async function openRaydiumSwap(inputMint?: string, outputMint?: string): Promise<void> {
  // Build URL as plain string (not URL constructor)
  let url = `https://raydium.io/swap/?inputMint=${inputMint}&outputMint=${outputMint}`;

  // Just open it - simple as that
  await Linking.openURL(url);
}
