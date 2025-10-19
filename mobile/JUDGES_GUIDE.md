# SafeBubble - Judge Testing Guide

## Quick Start (Android)

### 1. Install the App
- **Download Link**: [EAS Internal Distribution Link will be provided after build]
- Tap the link on your Android device to install the APK directly
- No Play Store required - this is a sideloaded APK via Expo

### 2. Install a Wallet
- Install **Phantom** or **Solflare** wallet from Play Store
- Create a new wallet or import existing one
- **Important**: Add some SOL to your wallet for transaction fees (0.01-0.1 SOL should be enough)

### 3. Test the App

#### Basic Flow:
1. Open SafeBubble
2. Connect wallet using Mobile Wallet Adapter (bottom-sheet will appear)
3. Browse token bubbles - larger bubbles = safer tokens
4. Tap any bubble to see detailed risk assessment
5. For safe tokens, try the swap feature

#### Key Features to Test:
- **Risk Assessment**: Tap any bubble → see detailed risk breakdown
- **Danger Tokens**: Some bubbles will show "DANGER" - swap should be blocked
- **Safe Swaps**: For safe tokens, you can get Jupiter quotes and execute swaps
- **Raydium Integration**: Look for "Route includes Raydium" chips
- **Seeker Perks**: Check if you have Seeker NFT for special features

#### Expected Behavior:
- ✅ Wallet connection should persist between screens
- ✅ Risk assessment should show detailed breakdown
- ✅ Dangerous tokens should block swaps with clear reasons
- ✅ Safe tokens should allow Jupiter swaps
- ✅ Transaction signing should use native bottom-sheet

## Backend API
- **Base URL**: `https://your-backend-url.com/api`
- **Status**: Should be running and accessible
- **Endpoints**: `/tokens/trending`, `/swap/quote`, `/swap/transaction`

## Troubleshooting

### Common Issues:
1. **"Insufficient SOL balance"**: Add SOL to your wallet for transaction fees
2. **"Wallet connection failed"**: Make sure Phantom/Solflare is installed
3. **"Swap failed"**: Check if you have enough SOL for fees
4. **"No tokens found"**: Check backend API is running

### For Developers:
- **Repo**: [GitHub link]
- **Tech Stack**: React Native + Expo, Solana Mobile Wallet Adapter, Jupiter API
- **Backend**: Node.js + TypeScript, deployed on [platform]

## Demo Videos
- **Pitch Video**: [Link to be provided]
- **Tech Demo**: [Link to be provided]

## What's Next
Post-hackathon: Publish to Solana dApp Store (App NFT → Release NFT → submit via publisher portal)
