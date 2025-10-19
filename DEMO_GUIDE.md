# 🎥 SafeBubble Demo Video Guide

This guide will help you record two compelling 20-30 second demo clips for the hackathon judges.

## 📹 Equipment & Setup

### Required
- **Android device** with a compatible wallet (Phantom, Solflare, Backpack)
- **Screen recording app** (built-in Android screen recorder or AZ Screen Recorder)
- **Good lighting** (for face camera, optional)
- **Stable surface** or tripod

### Preparation
1. **Charge your device** to 80%+
2. **Clear notifications** (DND mode)
3. **Set brightness** to 80-100%
4. **Practice the flow** 2-3 times before recording
5. **Have test SOL** in your wallet (~0.1 SOL)

## 🎬 Clip 1: Mobile Wallet Adapter Flow (20-30s)

### Goal
Demonstrate **native MWA integration** - the core Solana Mobile feature.

### Script

**[0-5s]** Opening
- Open SafeBubble app
- Home screen with bubble chart visible
- **Voiceover**: "SafeBubble - your Solana token risk scanner"

**[5-10s]** Select Token
- Tap on a **green bubble** (SAFE token)
- Token detail screen loads
- Shows price, risk score, stats
- **Voiceover**: "Tap any token to see comprehensive risk analysis"

**[10-15s]** Initiate Swap
- Scroll down to Risk Card
- Shows "🚀 Swap with Jupiter" button enabled
- Tap the button
- SwapScreen loads with SOL input
- **Voiceover**: "Risk checks passed - let's swap"

**[15-20s]** Connect Wallet (KEY MOMENT)
- Tap "Connect Wallet"
- **MWA bottom sheet slides up** from your wallet app
- Shows app name "SafeBubble" + icon
- Fingerprint/PIN prompt
- **Voiceover**: "Native Mobile Wallet Adapter integration"

**[20-25s]** Complete Connection
- Authenticate successfully
- Bottom sheet dismisses
- Shows connected wallet address (truncated)
- Input field now active
- **Voiceover**: "Wallet connected securely"

**[25-30s]** Get Quote & Sign
- Enter "1" SOL
- Quote loads (shows Raydium chip if present)
- Tap "Swap"
- MWA sign sheet appears
- Authenticate again
- **Success toast** appears
- **Voiceover**: "Transaction signed and sent"

### Pro Tips
- **Slow down** your taps so viewers can see what you're doing
- **Hold on key screens** for 1-2 seconds (MWA sheet, success toast)
- **Keep the wallet name visible** in the MWA sheet (shows it's a real wallet, not a browser)
- **Show the fingerprint/PIN prompt** (proves security)

---

## 🎬 Clip 2: Safety Guardrail & Raydium Detection (20-30s)

### Goal
Showcase **risk detection blocking dangerous trades** and **Raydium integration**.

### Script

**[0-5s]** Danger Token
- Start on Home screen
- Filter bar visible
- Tap "DANGER" filter
- Red bubbles appear
- **Voiceover**: "Not all tokens are safe"

**[5-12s]** Risk Breakdown
- Tap a **red bubble** (DANGER token)
- Token detail screen loads
- Risk Card shows:
  - **Red gradient** header
  - "DANGER" verdict with high score
  - Risk checks showing **red X marks**:
    - ❌ Authority Active
    - ❌ Liquidity < $10K
    - ❌ Top 10 > 80%
- **Voiceover**: "SafeBubble detects multiple risk factors"

**[12-18s]** Swap Blocked
- Scroll to swap button
- Button shows "🚫 Swap Disabled"
- **Grayed out** / disabled state
- Subtext: "Fix risk issues above to enable swapping"
- Try tapping it → Alert pops up
- Alert explains: "This token has high-risk indicators"
- **Voiceover**: "Swap is blocked to protect you"

**[18-25s]** Safe Token Comparison
- Tap back
- Tap "SAFE" filter
- Tap a **green bubble**
- Risk Card shows:
  - **Green gradient** header
  - "SAFE" verdict
  - All checks ✅ passed
- Scroll down
- Swap button **enabled** and colorful
- **Voiceover**: "Safe tokens get the green light"

**[25-30s]** Raydium Detection
- Tap into SwapScreen
- Shows quote with route info
- **"Includes Raydium" badge** visible
- Price Impact: "< 0.5%"
- Route Path shows: SOL → Raydium → TOKEN
- **Voiceover**: "Jupiter routing through Raydium - safe to trade"

### Pro Tips
- **Contrast is key**: Show DANGER first, then SAFE
- **Linger on the disabled button** so judges see the protection
- **Point out the Raydium badge** clearly (it's a key integration)
- **Show the price impact** (demonstrates Jupiter quote quality)

---

## 🎯 Alternative: Single 45-60s Combined Clip

If you prefer one longer demo:

**[0-10s]** Opening & Bubble Chart
- App intro
- Bubble interaction
- Filter demonstration

**[10-25s]** DANGER Token → Blocked Swap
- Select red token
- Show risk factors
- Demonstrate swap block

**[25-40s]** SAFE Token → MWA Connect
- Select green token
- Connect wallet via MWA
- Show authentication flow

**[40-60s]** Complete Swap
- Get quote
- Show Raydium route
- Sign transaction
- Success confirmation

---

## 📝 Voiceover Script Templates

### Option A: Technical
```
"SafeBubble scans Solana tokens in real-time, aggregating data from CoinGecko, 
Helius, and Birdeye. Our enhanced honeypot detection analyzes transaction patterns, 
not just API flags. When a token fails our checks, swaps are blocked. For safe 
tokens, we integrate Jupiter swaps with native Mobile Wallet Adapter—no browser, 
just your phone and your wallet. Built for Solana Mobile."
```

### Option B: User-Focused
```
"Trading Solana tokens? SafeBubble has your back. We analyze 9 risk factors 
in seconds—honeypots, liquidity traps, whale concentration—and block dangerous 
swaps before you lose money. For safe tokens, swap instantly with Jupiter through 
your mobile wallet. Tap, authenticate, done. This is DeFi security, mobile-first."
```

### Option C: Casual
```
"Ever get rugged on a Solana token? Yeah, us too. So we built SafeBubble. 
It's a live risk scanner that actually blocks you from buying honeypots. Green 
bubble? You're good—swap with one tap. Red bubble? Our system detected issues 
and won't let you trade. Mobile Wallet Adapter keeps it secure. No more rug pulls."
```

---

## 🎨 Visual Checklist

### Must-Show Elements
- [ ] **Bubble Chart** - Interactive, colorful, smooth animations
- [ ] **Filter Bar** - ALL / SAFE / MEDIUM / DANGER with counts
- [ ] **Risk Card** - Gradient header, checks, verdict
- [ ] **MWA Bottom Sheet** - Your actual wallet app appearing
- [ ] **Fingerprint/PIN Prompt** - Security authentication
- [ ] **Raydium Badge** - "Includes Raydium" chip
- [ ] **Price Impact** - "< X%" display
- [ ] **Swap Block** - Disabled button with explanation
- [ ] **Success Toast** - Transaction confirmed
- [ ] *(Optional)* **Seeker Banner** - If recording on Seeker device

### Good-to-Show
- [ ] Token logo (if available)
- [ ] Market cap, volume, holders
- [ ] Route path visualization
- [ ] Wallet address (truncated)
- [ ] Stats overview cards
- [ ] Risk breakdown accordion

---

## 🚫 Common Mistakes to Avoid

1. **Tapping too fast** - Judges need to see each screen
2. **Poor lighting** - Makes screen glare or hard to see
3. **Low battery warning** - Charge first!
4. **Notification interruptions** - Enable Do Not Disturb
5. **Rushing the MWA flow** - This is THE key feature, take your time
6. **Not showing the disabled button** - Critical for safety demo
7. **Skipping the Raydium badge** - It's a required integration
8. **No voiceover or captions** - Explain what's happening

---

## ✂️ Editing Tips

### Recommended Software
- **Mobile**: InShot, CapCut, Adobe Premiere Rush
- **Desktop**: DaVinci Resolve (free), Premiere Pro, Final Cut Pro

### Editing Checklist
- [ ] Trim dead time (loading screens > 2s)
- [ ] Add **text overlays** for key moments:
  - "Connecting via MWA..."
  - "Risk Detected: Swap Blocked"
  - "Includes Raydium"
- [ ] Background music (subtle, royalty-free)
- [ ] Add **zoom/highlight** on MWA sheet
- [ ] Include **timestamp** or **timer** (optional)
- [ ] Export at **1080p 60fps**

---

## 📤 Submission Checklist

Before uploading:
- [ ] Video is **20-30s per clip** (or 45-60s combined)
- [ ] Shows **Mobile Wallet Adapter** flow clearly
- [ ] Demonstrates **swap blocking** for dangerous tokens
- [ ] Includes **Raydium detection**
- [ ] Has **voiceover or captions** explaining the flow
- [ ] Exported in **high quality** (1080p min)
- [ ] File size < 50MB (or platform limit)
- [ ] Filename: `safebubble-demo-mwa.mp4` and `safebubble-demo-risk.mp4`

---

## 🎯 Judge Evaluation Criteria (Align Your Demo)

### What Judges Look For
1. **Mobile Wallet Adapter** - Native integration (not web)
2. **Solana Mobile Alignment** - Seeker support, dApp Store readiness
3. **Innovation** - Unique approach to DeFi security
4. **User Experience** - Smooth, intuitive, production-quality
5. **Technical Depth** - Real data analysis, not just API wrappers

### How Your Demo Addresses Each
1. **MWA**: Show bottom sheet from actual wallet app
2. **Solana Mobile**: Mention Seeker perks + dApp Store plan
3. **Innovation**: Highlight transaction-based honeypot detection
4. **UX**: Smooth animations, clear safety messaging
5. **Technical**: Explain multi-source aggregation in voiceover

---

## 💡 Bonus: Screen Recording Settings

### Android Built-in Recorder
```
Settings → System → Developer Options → Screen Recording
- Quality: High (1080p)
- Audio: Microphone (for voiceover)
- Show touches: Optional (helpful for demos)
```

### AZ Screen Recorder (Recommended)
```
- Resolution: 1080p
- Frame rate: 60 fps
- Bit rate: 12 Mbps
- Audio source: Internal + Mic
- Show touches: Enable
```

---

## 🎬 Final Tips from the Pros

1. **Practice 3 times minimum** before recording
2. **Record 3-5 takes** and pick the best
3. **Use a script** for voiceover (don't wing it)
4. **Show personality** - judges are humans too
5. **End with a hook**: "Trade safe. Trade smart. SafeBubble."

---

**Ready to record?** 🎥

Use this guide as a checklist and remember: **slow, clear, and compelling** beats fast and confusing every time. Good luck! 🚀

---

**Questions?** Check the main [README.md](README.md) for technical setup details.

