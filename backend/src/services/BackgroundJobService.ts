// src/services/BackgroundJobService.ts
import { TokenAggregationService } from './TokenAggregationService';
import { CacheService } from './CacheService';
import { logger } from '../utils/logger';

/**
 * Background Job Service
 * Handles pre-fetching and caching of trending tokens data
 * Runs periodically to ensure fresh data is always available
 */
export class BackgroundJobService {
  private aggregationService: TokenAggregationService;
  private cacheService: CacheService;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.aggregationService = new TokenAggregationService();
    this.cacheService = new CacheService();
  }

  /**
   * Initialize the background job service
   */
  async initialize(): Promise<void> {
    await this.cacheService.connect();
    logger.info('🔄 Background Job Service initialized');
  }

  /**
   * Start the background job scheduler
   * Runs every 1 hour to pre-fetch trending tokens
   */
  startScheduler(): void {
    if (this.intervalId) {
      logger.warn('Background scheduler already running');
      return;
    }

    // Run immediately on start
    this.runBackgroundJob();

    // Then run every 1 hour
    this.intervalId = setInterval(() => {
      this.runBackgroundJob();
    }, 60 * 60 * 1000); // 1 hour

    logger.info('🚀 Background job scheduler started (runs every 1 hour)');
  }

  /**
   * Stop the background job scheduler
   */
  stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('⏹️ Background job scheduler stopped');
    }
  }

  /**
   * Run the background job to pre-fetch trending tokens
   */
  private async runBackgroundJob(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Background job already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('🔄 Starting background job: Pre-fetching trending tokens...');

      // Pre-fetch trending tokens with full data
      const trendingTokens = await this.aggregationService.getTrendingTokens(100);
      
      if (trendingTokens && trendingTokens.length > 0) {
        // Serialize tokens before caching to handle BigInt values
        const serializedTokens = trendingTokens.map(token => this.serializeToken(token));

        // Cache the serialized results for 1 hour
        try {
          await this.cacheService.set(
            CacheService.trendingKey(),
            serializedTokens,
            3600 // 1 hour
          );
        } catch (error) {
          logger.warn('⚠️ Failed to cache trending tokens (Redis unavailable)');
        }

        const duration = Date.now() - startTime;
        logger.info(`✅ Background job completed successfully!`);
        logger.info(`📊 Cached ${trendingTokens.length} trending tokens`);
        logger.info(`⏱️ Job took ${Math.round(duration / 1000)}s`);
        
        // Log sample token for verification
        if (trendingTokens[0]) {
          const sample = trendingTokens[0];
          logger.info(`📈 Sample token: ${sample.symbol} - Risk: ${sample.riskScore?.totalScore || 'N/A'}`);
        }
      } else {
        logger.warn('⚠️ Background job: No trending tokens fetched');
      }

    } catch (error) {
      logger.error('❌ Background job failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manually trigger a background job (for testing or immediate refresh)
   */
  async triggerManualJob(): Promise<void> {
    logger.info('🔧 Manual background job triggered');
    await this.runBackgroundJob();
  }

  /**
   * Get job status
   */
  getStatus(): { isRunning: boolean; hasScheduler: boolean } {
    return {
      isRunning: this.isRunning,
      hasScheduler: this.intervalId !== null
    };
  }

  /**
   * Serialize token for caching (handle BigInt values)
   * Comprehensive serialization that handles all BigInt values recursively
   */
  private serializeToken(token: any): any {
    if (token === null || token === undefined) {
      return token;
    }

    // Handle BigInt values
    if (typeof token === 'bigint') {
      return token.toString();
    }

    // Handle arrays
    if (Array.isArray(token)) {
      return token.map(item => this.serializeToken(item));
    }

    // Handle objects
    if (typeof token === 'object') {
      const serialized: any = {};
      for (const [key, value] of Object.entries(token)) {
        serialized[key] = this.serializeToken(value);
      }
      return serialized;
    }

    // Handle primitive values (string, number, boolean, etc.)
    return token;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.stopScheduler();
    await this.cacheService.disconnect();
    logger.info('🧹 Background Job Service cleaned up');
  }
}
