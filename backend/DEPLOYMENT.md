# SafeBubble Backend - Deployment Guide

## Quick Deploy for Judges

### Option 1: Railway (Recommended)
1. **Connect GitHub**: Link your repository to Railway
2. **Deploy**: Railway will auto-deploy from main branch
3. **Environment Variables**: Add these in Railway dashboard:
   ```
   PORT=3000
   REDIS_URL=redis://localhost:6379
   COINGECKO_API_KEY=your_key
   BIRDEYE_API_KEY=your_key
   HELIUS_API_KEY=your_key
   CACHE_TTL_SECONDS=300
   ```
4. **Get URL**: Railway provides a public URL like `https://your-app.railway.app`

### Option 2: Render
1. **Create Web Service**: Connect GitHub repo
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Environment**: Add same variables as above

### Option 3: Local Development
```bash
# Install dependencies
npm install

# Start Redis (if not running)
redis-server

# Run in development
npm run dev

# Or build and run production
npm run build
npm start
```

## API Endpoints for Testing

### Health Check
```
GET https://your-backend-url.com/api/health
```

### Trending Tokens
```
GET https://your-backend-url.com/api/tokens/trending?limit=100
```

### Token Summary
```
GET https://your-backend-url.com/api/tokens/{mint}/summary
```

### Swap Quote
```
POST https://your-backend-url.com/api/swap/quote
{
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": "1000000",
  "slippageBps": 50
}
```

## Update Mobile App

After deploying backend, update the mobile app:

1. **Edit**: `mobile/src/config/constants.ts`
2. **Change**: `API_BASE_URL` to your deployed backend URL
3. **Rebuild**: Run the build script again

```typescript
export const API_BASE_URL = 'https://your-backend-url.com/api';
```

## Troubleshooting

### Common Issues:
- **CORS errors**: Backend should handle CORS for mobile requests
- **Rate limiting**: API has rate limiting (100 requests/minute)
- **Redis connection**: Make sure Redis is running for caching
- **API keys**: Ensure all required API keys are set

### Testing Backend:
```bash
# Test trending tokens
curl https://your-backend-url.com/api/tokens/trending

# Test health
curl https://your-backend-url.com/api/health
```
