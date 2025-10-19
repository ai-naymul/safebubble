// src/services/RaydiumService.ts
import axios, { AxiosInstance } from 'axios';
import { config } from '../config/environment';
import { LiquidityPool } from '../domain/models/Token';

/**
 * Raydium Service
 * Handles liquidity pool data from Raydium DEX
 */
export class RaydiumService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.raydium.baseUrl
    });
  }

  /**
   * Get pools for a specific token mint
   */
  async getPoolsByMint(mint: string): Promise<LiquidityPool[]> {
    try {
      const response = await this.client.get('/pools/info/mint', {
        params: { mint1: mint }
      });

      const pools = response.data.data || [];
      
      return pools.map((pool: any) => ({
        amm: 'Raydium',
        poolAddress: pool.id,
        baseToken: pool.mintA?.address || '',
        quoteToken: pool.mintB?.address || '',
        tvlUsd: pool.tvl || 0,
        volume24h: pool.day?.volume || 0,
        apr: pool.day?.apr || 0,
        createdAt: new Date(pool.openTime * 1000)
      }));
    } catch (error) {
      console.error(`Failed to fetch Raydium pools: ${error}`);
      return [];
    }
  }

  /**
   * Get total liquidity for a token across all pools
   */
  async getTotalLiquidity(mint: string): Promise<number> {
    const pools = await this.getPoolsByMint(mint);
    return pools.reduce((total, pool) => total + pool.tvlUsd, 0);
  }
}