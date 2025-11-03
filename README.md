# SafeBubble

**Mobile-first risk scanner for Solana tokens**

SafeBubble compresses 7-12 minutes of manual token verification into a 3-second visual scan.

## For Judges

Visit **https://safebubble.vercel.app** to see the live app in action. Browse tokens by risk level and tap bubbles for detailed breakdowns.

## Links

- **Web Preview**: https://safebubble.vercel.app
- **Android APK**: https://expo.dev/accounts/tailung_nym/projects/safebubble/builds/aaf67ea7-6afc-4420-9382-ba43b22cc2d3
- **API**: https://safebubble.duckdns.org/api
- **Pitch Video**: https://www.loom.com/share/da97e504d2464b18ace0380ac15e1d1b?sid=9d217d42-fcd0-42fa-9298-a44f6d8b87de

## The Problem

Solana traders lose billions to rug pulls annually. Manual verification requires checking multiple sources and takes 7-12 minutes per token on mobile devices.

## The Solution

SafeBubble provides instant risk analysis with a visual bubble system:
- **Green bubbles**: Safe tokens
- **Amber bubbles**: Medium risk
- **Red bubbles**: High risk

Tap any bubble for detailed risk breakdown across 9 factors.

**Future Plans:** Make it actionable - users can perform trades directly from risk assessments, with built-in safety checks and transaction previews.

## Quick Start

### Backend Setup

```bash
cd backend
npm install
# Create .env file with API keys
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

## API

### Get Token Risk
```
GET /api/tokens/:mint/summary
```

### Get Trending Tokens
```
GET /api/tokens/trending
```

## License

MIT
