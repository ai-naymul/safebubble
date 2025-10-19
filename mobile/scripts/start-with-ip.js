#!/usr/bin/env node

const { execSync } = require('child_process');
const { spawn } = require('child_process');

// Function to get local IP address
function getLocalIP() {
  try {
    console.log('🔍 Detecting available network interfaces...');

    // Get all available IPs
    const allIPs = [];
    const methods = [
      // macOS/Linux - get all IPs
      "ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}'",
      // Alternative for macOS
      "ifconfig | grep 'inet ' | grep -v 127.0.0.1 | cut -d' ' -f2",
      // Windows (if running on Windows)
      "ipconfig | findstr /R /C:'IPv4' | findstr /R /C:'[0-9][0-9]*\\.[0-9][0-9]*\\.[0-9][0-9]*\\.[0-9][0-9]*' | awk '{print $NF}'"
    ];

    for (const method of methods) {
      try {
        const result = execSync(method, { encoding: 'utf8', timeout: 5000 }).trim();
        const ips = result.split('\n').filter(ip => ip.match(/^\d+\.\d+\.\d+\.\d+$/));
        allIPs.push(...ips);
      } catch (e) {
        // Continue to next method
      }
    }

    // Remove duplicates
    const uniqueIPs = [...new Set(allIPs)];
    console.log('📋 Available IP addresses:', uniqueIPs.join(', '));

    // Prioritize common local network ranges that are likely accessible by mobile devices
    const priorityOrder = [
      /^172\./,  // 172.x.x.x (Docker, some corporate networks)
      /^192\.168\./,  // 192.168.x.x (most common home networks)
      /^10\./,   // 10.x.x.x (corporate networks)
      /.*/      // anything else
    ];

    for (const pattern of priorityOrder) {
      for (const ip of uniqueIPs) {
        if (pattern.test(ip)) {
          console.log(`✅ Selected IP: ${ip} (matches pattern: ${pattern})`);
          return ip;
        }
      }
    }

    // Fallback to first available IP
    if (uniqueIPs.length > 0) {
      console.log(`⚠️  Using first available IP: ${uniqueIPs[0]}`);
      return uniqueIPs[0];
    }

  } catch (e) {
    console.warn('Could not detect local IP automatically:', e.message);
  }

  return null;
}

// Check for help or manual IP override
const args = process.argv.slice(2);
const manualIP = args.find(arg => /^\d+\.\d+\.\d+\.\d+$/.test(arg)); // Find IP address argument
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
🚀 SafeBubble Mobile Development Server

USAGE:
  npm start                    # Auto-detect IP and start
  npm run start:ip             # Same as above
  npm run start:ip 192.168.1.100  # Manually specify IP address

DESCRIPTION:
  This script automatically detects your local IP address and starts Expo
  with the correct network configuration for mobile development.

  If auto-detection fails or picks the wrong IP, you can manually specify
  the IP address that your mobile device can connect to.

EXAMPLES:
  npm start                    # Auto-detect and start
  npm run start:ip 172.19.121.18  # Use specific IP for your network

TROUBLESHOOTING:
  - If Metro opens with wrong IP, specify it manually
  - Make sure your mobile device is on the same network
  - Check firewall settings if connection fails

  `);
  process.exit(0);
}

// Get the local IP
const detectedIP = getLocalIP();
const localIP = manualIP || detectedIP;

if (localIP) {
  if (manualIP) {
    console.log(`🔧 Using manually specified IP: ${localIP}`);
  } else {
    console.log(`🔍 Auto-detected IP: ${localIP}`);
  }
  console.log(`📱 Metro bundler will be available at: http://${localIP}:8081`);
  console.log(`🔗 API server should be available at: http://${localIP}:3000`);
  console.log('');
  
  // Set environment variables and start Expo
  const env = {
    ...process.env,
    EXPO_PUBLIC_LOCAL_IP: localIP,
    EXPO_PUBLIC_METRO_URL: `http://${localIP}:8081`,
    EXPO_PACKAGER_HOSTNAME: localIP, // This is the key environment variable Expo uses
    REACT_NATIVE_PACKAGER_HOSTNAME: localIP // Alternative variable
  };

  console.log(`🔧 Setting EXPO_PACKAGER_HOSTNAME=${localIP}`);
  console.log(`🔧 Setting REACT_NATIVE_PACKAGER_HOSTNAME=${localIP}`);

  // Start Expo with --lan (local area network) mode
  const expoProcess = spawn('npx', ['expo', 'start', '--lan'], {
    env,
    stdio: 'inherit',
    shell: true
  });
  
  expoProcess.on('error', (error) => {
    console.error('Failed to start Expo:', error);
    process.exit(1);
  });
  
  expoProcess.on('close', (code) => {
    process.exit(code);
  });
  
} else {
  console.log('❌ Could not detect local IP automatically');
  console.log('🔄 Starting Expo with default settings...');
  console.log('💡 You may need to manually update the IP in constants.ts');
  console.log('');
  
  // Start Expo normally
  const expoProcess = spawn('npx', ['expo', 'start', '--lan'], {
    stdio: 'inherit',
    shell: true
  });
  
  expoProcess.on('error', (error) => {
    console.error('Failed to start Expo:', error);
    process.exit(1);
  });
  
  expoProcess.on('close', (code) => {
    process.exit(code);
  });
}
