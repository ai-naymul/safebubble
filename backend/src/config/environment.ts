// src/config/environment.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment variable schema validation
 * Ensures all required environment variables are present
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  
  // API Keys
  HELIUS_API_KEY: z.string().min(1, 'Helius API key is required'),
  COINGECKO_API_KEY: z.string().min(1, 'CoinGecko API key is required'),
  BIRDEYE_API_KEY: z.string().optional(), // Now optional - fallback only
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CACHE_TTL_SECONDS: z.string().default('30'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  // Solana
  RPC_URL: z.string().optional(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

/**
 * Application Configuration
 * Centralized configuration for all services
 */
export const config = {
  server: {
    env: env.NODE_ENV,
    port: parseInt(env.PORT, 10),
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },
  
  api: {
    // PRIMARY: CoinGecko Terminal (Pro API)
    coingecko: {
      apiKey: env.COINGECKO_API_KEY,
      baseUrl: 'https://pro-api.coingecko.com/api/v3',
      rateLimit: {
        callsPerMinute: 500,
        callsPerMonth: 500000
      }
    },
    
    // For blockchain data (supply, decimals)
    helius: {
      apiKey: env.HELIUS_API_KEY,
      baseUrl: `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_API_KEY}`,
    },
    
    // FALLBACK: Birdeye (if CoinGecko fails)
    birdeye: {
      apiKey: env.BIRDEYE_API_KEY || '',
      baseUrl: 'https://public-api.birdeye.so',
      enabled: !!env.BIRDEYE_API_KEY
    },
    
    // Jupiter for swap quotes
    jupiter: {
      quoteUrl: 'https://lite-api.jup.ag/swap/v1/quote',
      swapUrl: 'https://lite-api.jup.ag/swap/v1/swap',
    },
    
    // Raydium for supplementary pool data
    raydium: {
      baseUrl: 'https://api-v3.raydium.io',
    },
    
    // Solana RPC
    solana: {
      rpcUrl: env.RPC_URL || `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_API_KEY}`,
    },
  },
  
  cache: {
    redisUrl: env.REDIS_URL,
    ttlSeconds: parseInt(env.CACHE_TTL_SECONDS, 10),
  },
  
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },
} as const;