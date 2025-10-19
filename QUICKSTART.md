# 🚀 SafeBubble - Quick Start Guide

Get SafeBubble running in **under 10 minutes**!

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ Redis installed (or use Docker)
- ✅ Android device or emulator
- ✅ Phantom/Solflare wallet installed on device

## 🏃 30-Second Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
PORT=3000
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=300
EOF

# 4. Start Redis (Terminal 1)
redis-server

# 5. Start backend (Terminal 2)
npm run dev
```

✅ Backend is now running on `http://localhost:3000`

## 📱 30-Second Mobile Setup

```bash
# 1. Navigate to mobile
cd mobile

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Update API URL
# Edit: mobile/src/config/constants.ts
# Change API_BASE_URL to your local IP:
# export const API_BASE_URL = 'http://192.168.1.X:3000/api';

# 4. Start Expo
npx expo start
```

## 🔧 For MWA Testing (Development Build)

**Option A: Quick Dev Build (5 min)**
```bash
cd mobile

# Prebuild for Android
npx expo prebuild --platform android

# Run on device
npx expo run:android
```

**Option B: EAS Build (10-15 min)**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Create dev build
eas build --profile development --platform android

# Install on device and run
eas update
```

## ✅ Quick Test Checklist

1. **Backend Health Check**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Get Trending Tokens**
   ```bash
   curl http://localhost:3000/api/tokens/trending?limit=5
   ```

3. **Mobile App Opens** - See bubble chart with trending tokens

4. **Tap a Bubble** - See token detail with risk score

5. **Try MWA** - Tap "Connect Wallet" → See bottom sheet

## 🐛 Common Issues

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Restart
npm run dev
```

### Redis connection error
```bash
# Start Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis
```

### Mobile can't connect to backend
1. Check firewall settings
2. Use your local IP (not localhost)
3. Both devices on same WiFi network

### MWA not working
1. Using Expo Go? → Won't work, need dev build
2. No wallet installed? → Install Phantom/Solflare
3. Using iOS? → MWA is Android-only

## 📖 Next Steps

- **Full Setup**: See [README.md](README.md)
- **Demo Recording**: See [DEMO_GUIDE.md](DEMO_GUIDE.md)
- **Hackathon Submission**: See [HACKATHON_SUBMISSION.md](HACKATHON_SUBMISSION.md)

## 🆘 Need Help?

Check the logs:
```bash
# Backend logs
tail -f backend/logs/combined.log

# Mobile logs
npx expo start --clear
```

---

**Ready to demo?** 🎥 Follow [DEMO_GUIDE.md](DEMO_GUIDE.md) for recording tips!

