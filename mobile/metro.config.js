const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add CSS support for web
config.resolver.assetExts.push('css');

// Force specific IP if provided via environment variable
const customIP = process.env.EXPO_PACKAGER_HOSTNAME;
if (customIP) {
  console.log(`🔧 Metro config: Forcing server to use IP ${customIP}`);
  config.server = {
    ...config.server,
    host: customIP,
  };
}

// Configure Metro to use your local IP for better device connectivity
config.server = {
  ...config.server,
  // This helps with device connectivity
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Allow connections from your local network
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;