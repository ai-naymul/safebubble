// src/services/BirdeyeService.ts
import axios, { AxiosInstance } from 'axios';
import { config } from '../config/environment';
import { CoinGeckoService } from './CgService';


/**
 * Birdeye Service
 * Handles all interactions with Birdeye API for market data
 */
export class BirdeyeService {
  private cg = new CoinGeckoService();
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.birdeye.baseUrl,
      headers: {
        'x-api-key': config.api.birdeye.apiKey,
        'x-chain': 'solana',
        'accept': 'application/json'
      }
    });
  }

  /**
   * Get token price
   */
  async getPrice(mint: string): Promise<number | null> {
    try {
      const response = await this.client.get('/defi/price', {
        params: { address: mint }  // Changed from 'mint' to 'address'
      });
  
      return response.data.data?.value || null;
    } catch (error) {
      console.error(`Failed to fetch price from Birdeye: ${error}`);
      return null;
    }
  }

  /**
   * Get token OHLCV data
   */
  async getOHLCV(
    mint: string,
    type: '1m' | '5m' | '15m' | '1H' | '4H' | '1D' = '1D',
    time_from: number,
    time_to: number
  ): Promise<any[]> {
    try {
      const response = await this.client.get('/defi/ohlcv', {
        params: {
          address: mint,      // Changed from 'mint' to 'address'
          type,
          time_from,
          time_to
        }
      });
  
      return response.data.data?.items || [];
    } catch (error) {
      console.error(`Failed to fetch OHLCV: ${error}`);
      return [];
    }
  }

  /**
   * Get token holder information
   */
  async getTokenOverview(mint: string) {
    try {
      const response = await this.client.get('/defi/token_overview', {
        params: { address: mint },
      });
  
      const d = response.data?.data;
  
      return {
        holder: d?.holder ?? 0,
        v24hUSD: d?.v24hUSD ?? 0,
        priceChange24h: d?.priceChange24h ?? 0,
      };
    } catch (err: any) {
      const status = err?.response?.status;
      // + fallback to CG on common Birdeye failures
      if (status === 429 || status === 401 || status === 500) {
        return this.cg.getTokenOverviewByAddress(mint, 'solana');
      }
      console.error(`Failed to fetch token overview: ${err}`);
      return null;
    }
  }


  /**
   * Get trending tokens
   */
  async getTrendingTokens(limit = 100): Promise<any[]> {
    try {
      const response = await this.client.get('/defi/token_trending', {
        params: {
          sort_by: 'rank',
          sort_type: 'asc',
          offset: 0,
          limit: Math.min(limit, 100)
        }
      });
  
      // Birdeye returns: { success: true, data: { tokens: [...], total: 1000 } }
      const tokens = response.data.data?.tokens || [];
      
      console.log(`Birdeye returned ${tokens.length} trending tokens`);
      
      return tokens;
    } catch (error) {
      console.error(`Failed to fetch trending tokens: ${error}`);
      return [];
    }
  }

  /**
   * Get token security information
   */
  async getTokenSecurity(mint: string): Promise<any> {
    try {
      const response = await this.client.get('/defi/token_security', {
        params: { address: mint }
      });

      return response.data.data || null;
    } catch (error) {
      console.error(`Failed to fetch token security: ${error}`);
      return null;
    }
  }

  /**
   * Get 24h price change
   */
  async getPriceChange24h(mint: string): Promise<number> {
    try {
      const response = await this.client.get('/defi/price', {
        params: { address: mint }
      });

      return response.data.data?.priceChange24h || 0;
    } catch (error) {
      console.error(`Failed to fetch price change: ${error}`);
      return 0;
    }
  }

  /**
   * Get token volume
   */
  async getVolume24h(mint: string): Promise<number> {
    try {
      const response = await this.client.get('/defi/token_overview', {
        params: { address: mint }
      });

      return response.data.data?.v24hUSD || 0;
    } catch (error) {
      console.error(`Failed to fetch volume: ${error}`);
      return 0;
    }
  }
}