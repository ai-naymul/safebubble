# Web Setup for SafeBubble

This document explains the web-specific fixes applied to ensure proper scrolling behavior in the Expo web demo.

## Changes Made

### 1. Web CSS Configuration
- **File**: `app.web.css`
- **Purpose**: Ensures proper html/body/root height for React Native Web
- **Key fixes**:
  - `html, body, #root { height: 100%; }`
  - `overflow: hidden` on body to prevent conflicts
  - Flex container setup for proper height propagation

### 2. Web Entry Point
- **File**: `index.web.js`
- **Purpose**: Imports CSS and sets up web-specific app registration

### 3. Metro Configuration
- **File**: `metro.config.js`
- **Purpose**: Adds CSS support for web builds
- **Change**: `config.resolver.assetExts.push('css');`

### 4. Root Layout Fixes
- **File**: `App.tsx`
- **Purpose**: Ensures proper height constraints from root
- **Change**: Added `minHeight: '100%'` to GestureHandlerRootView

### 5. Navigation Container Fixes
- **File**: `src/navigation/AppNavigator.tsx`
- **Purpose**: Propagates flex and height constraints to all screens
- **Changes**:
  - Added `flex: 1, minHeight: '100%'` to cardStyle
  - Added SwapScreen route

### 6. Screen-Level Fixes
- **Files**: `TokenDetailScreen.tsx`, `SwapScreen.tsx`
- **Purpose**: Ensures ScrollView has bounded height
- **Changes**:
  - Wrapped ScrollView in content container with `flex: 1, minHeight: '100%'`
  - Proper parent-child height relationship

## How It Works

The key principle is that **ScrollView must have bounded height** on web. This is achieved by:

1. **Root Level**: `html, body, #root` all have `height: 100%`
2. **App Level**: Root container has `flex: 1, minHeight: '100%'`
3. **Navigation Level**: Screen containers have `flex: 1, minHeight: '100%'`
4. **Screen Level**: Content containers have `flex: 1, minHeight: '100%'`
5. **ScrollView Level**: ScrollView has `flex: 1` with bounded parent

## Testing

To test the web version:

```bash
npm run web
# or
expo start --web
```

The app should now scroll properly on web without any height-related issues.

## Troubleshooting

If scrolling still doesn't work:

1. Check browser dev tools for any CSS conflicts
2. Ensure no parent containers have `overflow: hidden` (except body)
3. Verify all containers in the hierarchy have proper flex/height values
4. Check that ScrollView has `flex: 1` and parent has bounded height

## Reference

- [React Native Web ScrollView Documentation](https://necolas.github.io/react-native-web/docs/scrollview/)
- [Expo Web Configuration](https://docs.expo.dev/workflow/web/)
