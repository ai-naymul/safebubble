# SafeBubble - Solana Token Risk Scanner

**Mobile-first risk intelligence for Solana traders**

SafeBubble is a native mobile application that compresses 7-12 minutes of manual token verification into a 3-second visual scan. Built for the Solana Cypherpunk Hackathon.

**Live Links:**
- Web Preview: https://safebubble.vercel.app
- Android APK: https://expo.dev/accounts/tailung_nym/projects/safebubble/builds/aaf67ea7-6afc-4420-9382-ba43b22cc2d3
- API Endpoint: https://safebubble.duckdns.org/api
- Pitch Video: https://www.loom.com/share/da97e504d2464b18ace0380ac15e1d1b?sid=9d217d42-fcd0-42fa-9298-a44f6d8b87de
- Technical Demo: https://www.loom.com/share/dd6460a948314c8b87d2d5be4123cfa4?sid=2857af1c-da95-419b-bfbc-291b76f2bfff

---

## The Problem

In Q1 2025, Solana traders lost $6 billion to rug pulls. On Pump.fun, 98.6% of tokens launched in 2024 were scams. On Raydium, 93% of pools showed rug pull patterns. (Source: Solidus Labs, CoinLaw 2025)

**Why this happens:** Verifying if a token is safe requires three manual checks on mobile:
1. Block explorer diving to check mint/freeze authority (2-3 minutes)
2. Exporting holder data to calculate concentration (3-5 minutes)
3. Cross-referencing multiple DEXs to verify liquidity (2-4 minutes)

**Total: 7-12 minutes per token.** On mobile, traders skip this and either lose money or miss trades.

---

## The Solution

SafeBubble compresses that 7-12 minute process into a 3-second visual scan.

**How it works:**
- Aggregates on-chain data from CoinGecko Terminal, Helius RPC, Raydium, and Birdeye
- Scores tokens on 9 factors (authority status, holder concentration, liquidity depth, market data, token age, GT score, trading patterns, honeypot detection, volatility)
- Authority carries the highest weight based on Solidus Labs research: every rug pull fails at least one of these three checks

**Visual system:**
- Lower risk = Larger bubble
- Color encodes verdict: Green (SAFE), Amber (MEDIUM), Red (DANGER)
- Tap any bubble to see complete risk breakdown with reasons

This is a complete mobile product, not a swap widget or wallet plugin.

---

## For Judges - Quick Test

### Try the App (5 minutes)

**Web Preview (fastest):**
Visit https://safebubble.vercel.app

**Android Build (full features):**
1. Install from https://expo.dev/accounts/tailung_nym/projects/safebubble/builds/aaf67ea7-6afc-4420-9382-ba43b22cc2d3
2. Browse tokens by risk level (Safe/Medium/High Risk)
3. Tap any bubble to see risk breakdown
4. Observe: DANGER tokens show clear warnings with blocked actions

**What to look for:**
- Three-tier risk system (Safe, Medium, High Risk)
- Authority, Holder Concentration, and Liquidity checks visible on every token
- Complete user flow: Scan → Tap → See risk breakdown → Decide
- Real data from live Solana tokens

---

## Architecture

```
Mobile App (React Native/Expo)
        ↓
   Backend API (Express)
        ↓
   ┌────┴─────┬──────────┬─────────┬──────────┐
   ↓          ↓          ↓         ↓          ↓
CoinGecko   Helius    Raydium   Birdeye   Jupiter
Terminal     RPC      Pools    (backup)   (swaps)
   ↓          ↓          ↓         ↓          ↓
   └──────────┴──────────┴─────────┴──────────┘
                      ↓
          Token Aggregation Service
                      ↓
          Risk Scoring Engine (9 factors)
                      ↓
             Redis Cache Service
                      ↓
           SAFE / MEDIUM / DANGER
```

### Key Components

**Backend (Node.js/Express):**
- TokenAggregationService: Orchestrates data from multiple APIs
- RiskCalculatorService: 9-factor scoring model
- CacheService: Redis memoization for sub-200ms responses
- BackgroundJobService: Hourly trending token prefetch
- API routes: /tokens/:mint/summary, /tokens/trending, /tokens/batch

**Mobile (React Native/Expo):**
- BubbleChart: Interactive risk visualization with touch gestures
- RiskCard: Detailed breakdown showing all 9 factors
- Three-tier navigation: Safe, Medium Risk, High Risk sections
- Native mobile app (not a web wrapper)

**Data Sources:**
- Primary: CoinGecko Terminal (holders, authorities, pools, transactions, OHLCV, GT score)
- Supplemental: Helius (decimals, supply), Raydium (pool data), Birdeye (price, fallback), Jupiter (swaps)

---

## Risk Scoring Model

### Nine Factors (150-point scale)

1. **Honeypot Detection (30 points):** Analyzes buy/sell ratio, unique sellers, volume patterns
2. **Authority Status (25 points):** Checks if mint/freeze control is renounced (highest weight)
3. **Holder Concentration (20 points):** Top 10 wallet ownership percentage
4. **Liquidity Depth (15 points):** TVL, pool presence, wash trading detection (volume/liquidity ratio)
5. **Market Data (15 points):** 24h volume, trader count, bot detection
6. **Token Age (10 points):** Creation date, maturity assessment
7. **Gecko Terminal Score (10 points):** Platform trust rating
8. **Trading Patterns (15 points):** Recent transaction analysis for manipulation
9. **Volatility (10 points):** OHLCV analysis for price stability

**Output:** SAFE (0-40 points), MEDIUM (41-80 points), DANGER (81-150 points)

**Confidence Score:** Based on data completeness from all sources

---

## What's Live Today

**Backend API:**
- Deployed at https://safebubble.duckdns.org/api
- 9-factor risk engine running
- Redis caching active (300s TTL)
- Rate limiting and error handling implemented
- Endpoints: /tokens/:mint/summary, /tokens/trending, /tokens/batch

**Mobile App:**
- Web preview: safebubble.vercel.app
- Android build: Installable via EAS
- Native mobile app (React Native/Expo)
- Three risk tiers with bubble visualization
- Complete risk breakdown on tap
- Real-time data from live tokens

**What Users Can Do Today:**
- Scan any Solana token for risk
- See authority, holder concentration, and liquidity checks
- View trending tokens by risk level
- Get complete risk breakdown with reasons
- Make informed trading decisions

This is not a prototype. The product is functional and users can scan tokens today.

---

## Technical Stack

**Frontend:**
- React Native 0.74
- Expo SDK 54
- TypeScript
- React Navigation
- Gesture Handler for interactions

**Backend:**
- Node.js 18+
- Express.js
- TypeScript
- Redis for caching
- Helmet, CORS, rate limiting

**APIs & Services:**
- CoinGecko Terminal API (primary data)
- Helius RPC (Solana on-chain data)
- Raydium API (pool information)
- Birdeye API (fallback pricing)
- Jupiter API (swap quotes)

**Infrastructure:**
- Backend: Oracle Cloud Instance
- Redis: Inside the cloud instance
- Mobile: Expo Application Services (EAS)

---

## Setup Instructions

### Backend

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment:
```bash
# .env file
PORT=3000
REDIS_URL=redis://localhost:6379
COINGECKO_API_KEY=your_key
HELIUS_API_KEY=your_key
BIRDEYE_API_KEY=your_key
CACHE_TTL_SECONDS=300
```

3. Start Redis:
```bash
redis-server
```

4. Run backend:
```bash
npm run dev
```

### Mobile

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Update API endpoint in `src/config/constants.ts`:
```typescript
export const API_BASE_URL = 'http://YOUR_IP:3000/api';
```

3. Run on Android:
```bash
npx expo run:android
```

Or create development build:
```bash
eas build --profile development --platform android
```

---

## API Documentation

### GET /api/tokens/:mint/summary

Returns complete risk analysis for a token.

**Response:**
```json
{
  "mint": "string",
  "symbol": "string",
  "name": "string",
  "risk": {
    "score": 45,
    "level": "MEDIUM",
    "factors": {
      "honeypot": { "score": 15, "signals": [...] },
      "authority": { "score": 10, "signals": [...] },
      "concentration": { "score": 5, "signals": [...] },
      "liquidity": { "score": 8, "signals": [...] },
      // ... other factors
    },
    "verdict": "MEDIUM",
    "confidence": 85
  },
  "market": {
    "price": 0.0045,
    "marketCap": 450000,
    "volume24h": 12000,
    "liquidity": 15000
  },
  "holders": {
    "total": 1200,
    "top10Percentage": 45
  }
}
```

### GET /api/tokens/trending

Returns cached list of trending tokens (updated hourly).

### POST /api/tokens/batch

Batch request for up to 50 tokens.

---

## Post-Hackathon Roadmap

**Month 1 (Next 30 days):**
- Mobile Wallet Adapter integration for bottom-sheet signing
- Push alerts for Pro users when watchlist tokens cross risk thresholds
- First 1,000 user milestone

**Month 2 (Next 60 days):**
- Mint App NFT and Release NFT
- Submit to Solana dApp Store via publisher portal
- First B2B API pilot with wallet integration

**Month 3:**
- Complete B2B integration with 100K+ user wallet
- Pro tier revenue launch
- Expand to 10K free users

**Month 6 Target:**
- 10,000 free users
- 500 Pro subscribers at $9/month = $4.5K MRR
- 3 B2B API clients at $1K/month average = $3K MRR
- Total: $7.5K MRR

---

## Business Model

**Free Tier:**
- Risk scanning for all tokens
- Three hard checks visible (Authority, Holders, Liquidity)
- Complete risk breakdown
- Trending tokens feed

**Pro Tier ($9/month):**
- Watchlist with push alerts
- Risk threshold notifications
- Advanced volatility signals
- Priority support

**B2B API ($500-2,000/month):**
- White-label risk engine
- Custom risk thresholds
- Wallet and portfolio tracker integration
- Enterprise analytics
- Dedicated support

---

## Why This Won't Be Abandoned

**Real Problem:** $6 billion lost to rug pulls in Q1 2025 alone. 98.6% scam rate on Pump.fun means traders need this more than ever.

**Complete Product:** This is not a swap widget or wallet plugin. It's a complete mobile product solving the full user journey: scan → understand → decide.

**Clear Revenue Model:** Freemium with Pro tier and B2B API. Concrete targets: $7.5K MRR by month 6.

**Technical Foundation:** Production-ready backend with caching, error handling, rate limiting. Native mobile app with clear path to dApp Store. Not a hackathon toy.

**Market Validation:** Early feedback from 9+ traders in Solana Discord confirmed: "I don't have time to check authority on my phone, but I'd look at this app before every trade."

---

## Technical Highlights

**Data Aggregation:**
- Merges data from 4 different APIs
- Normalizes inconsistent formats
- Handles missing data gracefully
- Falls back to secondary sources

**Performance:**
- Redis caching keeps responses under 200ms
- Background jobs prefetch trending tokens
- Batch endpoint handles up to 50 tokens
- Rate limiting prevents abuse

**Risk Intelligence:**
- Enhanced honeypot detection using transaction patterns
- Authority status weighted highest per Solidus Labs research
- Wash trading detection via volume/liquidity ratio
- Bot trading detection via trader count analysis

**Mobile UX:**
- Bubble size = risk level (counterintuitive but effective)
- Color coding: Green, Amber, Red
- One-tap access to full breakdown
- Smooth animations with spring physics
- Native gestures throughout

---

## Testing

### Backend Tests
```bash
cd backend
npm test
```

## Project Structure

```
safebubble/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── CoinGeckoTerminalService.ts
│   │   │   ├── HeliusService.ts
│   │   │   ├── BirdeyeService.ts
│   │   │   ├── JupiterService.ts
│   │   │   ├── RiskCalculatorService.ts
│   │   │   ├── TokenAggregationService.ts
│   │   │   ├── CacheService.ts
│   │   │   └── BackgroundJobService.ts
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── middleware/
│   │   └── domain/
│   │       └── models/
│   └── tests/
│
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen/
│   │   │   └── TokenDetailScreen/
│   │   ├── components/
│   │   │   ├── BubbleChart/
│   │   │   ├── RiskCard/
│   │   │   └── RiskBreakdown/
│   │   ├── services/
│   │   │   └── ApiService.ts
│   │   └── utils/
│   └── app.json
│
└── shared/
    └── types/
```

---

## Contributing

Contributions are welcome. Please open an issue first to discuss proposed changes.

---

## License

MIT License

---

## Acknowledgments

**Data Sources:**
- CoinGecko Terminal for comprehensive token data
- Helius for Solana RPC infrastructure
- Raydium for DEX pool information
- Birdeye for market data
- Jupiter for swap aggregation

**Research:**
- Solidus Labs for rug pull analysis (98.6% scam rate data)
- CoinLaw for Q1 2025 loss statistics

**Infrastructure:**
- Solana Mobile for Mobile Wallet Adapter specifications
- Expo for mobile development framework

---

**Note to Judges:** SafeBubble demonstrates a complete product solving a real problem with measurable impact ($6B lost in Q1 2025). The technical implementation goes beyond simple API aggregation to provide genuine risk intelligence through a 9-factor scoring model. Post-hackathon plans include dApp Store publishing, B2B API licensing, and clear revenue targets. This is not a feature or prototype. it's a complete mobile product with live users scanning tokens today.
