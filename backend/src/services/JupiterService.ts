// src/services/JupiterService.ts
import axios, { AxiosInstance } from 'axios';
import { config } from '../config/environment';
import { SwapQuote, SwapTransaction } from '../domain/models/SwapQuote';

/**
 * Jupiter Service
 * Handles swap quotes and transaction building
 */
export class JupiterService {
  private readonly quoteClient: AxiosInstance;
  private readonly swapClient: AxiosInstance;

  constructor() {
    this.quoteClient = axios.create({
      baseURL: config.api.jupiter.quoteUrl
    });

    this.swapClient = axios.create({
      baseURL: config.api.jupiter.swapUrl
    });
  }

  /**
   * Get swap quote
   */
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps: number = 50
  ): Promise<SwapQuote> {
    try {
      const response = await axios.get(config.api.jupiter.quoteUrl, {
        params: {
          inputMint,
          outputMint,
          amount,
          slippageBps,
          swapMode: 'ExactIn',
          restrictIntermediateTokens: true,
          maxAccounts: 64,
          instructionVersion: 'V1'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get Jupiter quote: ${error}`);
    }
  }

  /**
   * Build swap transaction
   */
  async buildSwapTransaction(
    userPublicKey: string,
    quoteResponse: SwapQuote
  ): Promise<SwapTransaction> {
    try {
      const response = await axios.post(config.api.jupiter.swapUrl, {
        userPublicKey,
        quoteResponse,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            priorityLevel: 'veryHigh',
            maxLamports: 10000000
          }
        }
      });

      return {
        swapTransaction: response.data.swapTransaction,
        lastValidBlockHeight: response.data.lastValidBlockHeight
      };
    } catch (error) {
      throw new Error(`Failed to build swap transaction: ${error}`);
    }
  }
}