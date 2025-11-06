// src/services/ApiService.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
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
      timeout: 30000, // Increased from 10s to 30s for better reliability
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

    // Response interceptor with retry logic
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} for ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config;
        if (!config) {
          return Promise.reject(error);
        }

        // Get retry count from config or set default
        const retryCount = (config as any)._retryCount || 0;

        // Retry up to 2 times for certain errors
        if (retryCount < 2 && (
          error.code === 'ECONNABORTED' || // Timeout
          error.code === 'ENOTFOUND' ||    // DNS/Network issues
          error.response?.status === 429 || // Rate limiting
          error.response?.status >= 500     // Server errors
        )) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, retryCount) * 1000;

          console.log(`API Retry ${retryCount + 1}/2 in ${delay}ms for ${config.method?.toUpperCase()} ${config.url}`);

          (config as any)._retryCount = retryCount + 1;

          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(config);
        }

        console.error('API Error:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          status: error.response?.status,
          message: error.message,
          code: error.code,
          retryCount
        });

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