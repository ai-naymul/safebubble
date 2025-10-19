// src/services/HeliusService.ts
import axios from 'axios';
import { config } from '../config/environment';
import { TokenHolder, TokenAuthorities } from '../domain/models/Token';

export class HeliusService {
  private readonly rpcUrl: string;

  constructor() {
    this.rpcUrl = config.api.solana.rpcUrl;
  }

  /**
   * Get token metadata using getAccountInfo with jsonParsed
   * This works for all SPL tokens (including SOL)
   */
  async getTokenMetadata(mint: string): Promise<{
    symbol: string;
    name: string;
    decimals: number;
  } | null> {
    try {
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '2.0',
        id: '1',
        method: 'getAccountInfo',
        params: [
          mint,
          { 
            encoding: 'jsonParsed',
            commitment: 'finalized'
          }
        ]
      });

      const parsed = response.data.result?.value?.data?.parsed;
      
      if (parsed?.type === 'mint') {
        return {
          symbol: 'UNKNOWN', // We'll get this from Birdeye
          name: 'Unknown Token',
          decimals: parsed.info.decimals || 9
        };
      }

      // Fallback for native SOL
      if (mint === 'So11111111111111111111111111111111111111112') {
        return {
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch token metadata:', error);
      return null;
    }
  }

  /**
   * Get token supply using Solana RPC
   */
  async getTokenSupply(mint: string): Promise<bigint> {
    try {
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '2.0',
        id: '1',
        method: 'getTokenSupply',
        params: [mint, { commitment: 'finalized' }]
      });

      const amount = response.data.result?.value?.amount;
      return BigInt(amount || '0');
    } catch (error) {
      console.error(`Failed to fetch token supply: ${error}`);
      return BigInt(0);
    }
  }

  /**
   * Get largest token holders using Solana RPC
   * Returns top 20 holders
   */
  async getLargestAccounts(mint: string): Promise<TokenHolder[]> {
    try {
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '2.0',
        id: '1',
        method: 'getTokenLargestAccounts',
        params: [mint, { commitment: 'finalized' }]
      });

      const accounts = response.data.result?.value || [];
      
      // Get total supply for percentage calculation
      const supply = await this.getTokenSupply(mint);
      const supplyNumber = Number(supply);

      return accounts.map((account: any) => ({
        address: account.address,
        amount: BigInt(account.amount),
        percentage: supplyNumber > 0 
          ? (Number(account.amount) / supplyNumber) * 100 
          : 0
      }));
    } catch (error) {
      console.error(`Failed to fetch largest accounts: ${error}`);
      return [];
    }
  }

  /**
   * Get token authorities from mint account
   */
  async getTokenAuthorities(mint: string): Promise<TokenAuthorities> {
    try {
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '2.0',
        id: '1',
        method: 'getAccountInfo',
        params: [
          mint,
          { encoding: 'jsonParsed', commitment: 'finalized' }
        ]
      });

      const parsed = response.data.result?.value?.data?.parsed;
      
      if (parsed?.type === 'mint') {
        const mintAuthority = parsed.info.mintAuthority;
        const freezeAuthority = parsed.info.freezeAuthority;

        return {
          mintAuthority,
          freezeAuthority,
          mintRenounced: !mintAuthority,
          freezeRenounced: !freezeAuthority
        };
      }

      // Default to safe values if parsing fails
      return {
        mintAuthority: null,
        freezeAuthority: null,
        mintRenounced: true,
        freezeRenounced: true
      };
    } catch (error) {
      console.error(`Failed to fetch authorities: ${error}`);
      return {
        mintAuthority: null,
        freezeAuthority: null,
        mintRenounced: true,
        freezeRenounced: true
      };
    }
  }
}