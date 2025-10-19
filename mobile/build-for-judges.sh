#!/bin/bash

# SafeBubble - Build Script for Judges
# This script builds an Android APK for internal distribution

echo "🫧 SafeBubble - Building for Judges..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: Please run this script from the mobile directory"
    exit 1
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ Error: EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Login to EAS (if not already logged in)
echo "🔐 Checking EAS authentication..."
if ! eas whoami &> /dev/null; then
    echo "Please login to EAS:"
    eas login
fi

# Build for Android (internal distribution)
echo "📱 Building Android APK for internal distribution..."
echo "This will create a shareable link for judges to install the app."

eas build --platform android --profile development

echo ""
echo "✅ Build completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy the shareable URL from the EAS dashboard"
echo "2. Update README.md with the install link"
echo "3. Share with judges for testing"
echo ""
echo "🔗 EAS Dashboard: https://expo.dev/accounts/tailung_nym/projects/safebubble/builds"
echo ""
echo "📝 Judge Testing Guide:"
echo "- Install Phantom or Solflare wallet"
echo "- Add some SOL for transaction fees"
echo "- Test wallet connection and swaps"
echo "- Check risk assessment features"
