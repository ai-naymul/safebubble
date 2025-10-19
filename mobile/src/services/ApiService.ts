// src/services/ApiService.ts
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/constants';
import { Token } from '../domain/models/Token';

/**
 * API Service
 * Handles all communication with the backend
 */
export class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get token summary
   */
  async getTokenSummary(mint: string): Promise<Token> {
    const response = await this.client.get(`/tokens/${mint}/summary`);
    return response.data.data;
  }

  /**
   * Get trending tokens
   */
  async getTrendingTokens(limit: number = 20): Promise<{
    data: Token[];
    cached: boolean;
    message?: string;
  }> {
    const response = await this.client.get('/tokens/trending', {
      params: { limit },
    });
    return {
      data: response.data.data,
      cached: response.data.cached || false,
      message: response.data.message
    };
  }

  /**
   * Get multiple tokens in batch
   */
  async getTokensBatch(mints: string[]): Promise<Token[]> {
    const response = await this.client.post('/tokens/batch', { mints });
    return response.data.data;
  }

  /**
   * Get swap quote
   */
  async getSwapQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps?: number
  ): Promise<any> {
    const response = await this.client.post('/swap/quote', {
      inputMint,
      outputMint,
      amount,
      slippageBps,
    });
    return response.data.data;
  }

  /**
   * Build swap transaction
   */
  async buildSwapTransaction(
    userPublicKey: string,
    quoteResponse: any
  ): Promise<any> {
    const response = await this.client.post('/swap/transaction', {
      userPublicKey,
      quoteResponse,
    });
    return response.data.data;
  }
}
// Export singleton instance
export const apiService = new ApiService();