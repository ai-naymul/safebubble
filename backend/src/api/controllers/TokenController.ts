// src/api/controllers/TokenController.ts
import { Request, Response } from 'express';
import { TokenAggregationService } from '../../services/TokenAggregationService';
import { CacheService } from '../../services/CacheService';
import { Token } from '../../domain/models/Token';

/**
 * Comprehensive serialization function that handles all BigInt values recursively
 * This ensures that any BigInt values in nested objects are properly converted to strings
 */
const serializeToken = (token: any): any => {
  if (token === null || token === undefined) {
    return token;
  }

  // Handle BigInt values
  if (typeof token === 'bigint') {
    return token.toString();
  }

  // Handle arrays
  if (Array.isArray(token)) {
    return token.map(item => serializeToken(item));
  }

  // Handle objects
  if (typeof token === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(token)) {
      serialized[key] = serializeToken(value);
    }
    return serialized;
  }

  // Handle primitive values (string, number, boolean, etc.)
  return token;
};

/**
 * Token Controller
 * Handles all token-related API requests using CoinGecko as primary source
 */
export class TokenController {
  private aggregationService: TokenAggregationService;
  private cacheService: CacheService;

  constructor() {
    this.aggregationService = new TokenAggregationService();
    this.cacheService = new CacheService();
  }

  /**
   * Initialize controller (connect to cache)
   */
  async initialize(): Promise<void> {
    await this.cacheService.connect();
  }

  /**
   * GET /api/tokens/:mint/summary
   * Get comprehensive token summary with risk analysis
   */
  getTokenSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mint } = req.params;

      console.log(`📊 Fetching token summary for: ${mint}`);

      // Check cache first
      const cacheKey = CacheService.tokenKey(mint);
      const cached = await this.cacheService.get<Token>(cacheKey);

      if (cached) {
        console.log(`✅ Cache hit for ${mint}`);
        res.json({ success: true, data: cached, cached: true });
        return;
      }

      console.log(`🔄 Cache miss, fetching from CoinGecko...`);

      // Use aggregation service to get complete data
      const token = await this.aggregationService.getCompleteTokenData(mint);

      if (!token) {
        console.log(`❌ Token not found: ${mint}`);
        res.status(404).json({
          success: false,
          error: 'Token not found',
          message: 'Could not fetch token data from any source'
        });
        return;
      }

      console.log(`✅ Token data fetched successfully:`, {
        symbol: token.symbol,
        price: token.price,
        holders: token.holderCount,
        liquidity: token.totalLiquidity,
        riskScore: token.riskScore.totalScore
      });

      // Serialize and return
      const serialized = serializeToken(token);
      res.json({ success: true, data: serialized, cached: false });

    } catch (error) {
      console.error('❌ Error in getTokenSummary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch token summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/tokens/trending
   * Get trending tokens with risk scores
   */
  getTrendingTokens = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;

      console.log(`📈 Fetching ${limit} trending tokens...`);

      // Check cache first (this should be populated by background jobs)
      const cacheKey = CacheService.trendingKey();
      const cached = await this.cacheService.get<Token[]>(cacheKey);

      if (cached && cached.length > 0) {
        console.log(`✅ Cache hit for trending tokens (${cached.length} tokens)`);
        const serialized = cached.slice(0, limit).map(serializeToken);
        res.json({ 
          success: true, 
          data: serialized, 
          cached: true,
          message: 'Data served from cache (background job)'
        });
        return;
      }

      console.log(`🔄 Cache miss, fetching fresh data...`);

      // Fallback: fetch fresh data if cache is empty
      const tokens = await this.aggregationService.getTrendingTokens(limit);

      if (!tokens || tokens.length === 0) {
        console.log(`⚠️ No trending tokens found`);
        res.json({ success: true, data: [], cached: false });
        return;
      }

      console.log(`✅ Fetched ${tokens.length} trending tokens`);
      console.log(`Sample token:`, {
        symbol: tokens[0]?.symbol,
        price: tokens[0]?.price,
        holders: tokens[0]?.holderCount,
        riskScore: tokens[0]?.riskScore?.totalScore
      });

      // Serialize and cache the fresh data for future requests
      const serializedForCache = tokens.map(serializeToken);
      await this.cacheService.set(cacheKey, serializedForCache, 2 * 60 * 60); // 2 hours

      // Serialize and return
      const serialized = tokens.map(serializeToken);
      res.json({ 
        success: true, 
        data: serialized, 
        cached: false,
        message: 'Fresh data fetched and cached'
      });

    } catch (error) {
      console.error('❌ Error in getTrendingTokens:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trending tokens',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/tokens/batch
   * Get multiple token summaries (up to 100 tokens)
   */
  getTokensBatch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mints } = req.body;

      if (!Array.isArray(mints) || mints.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid request: mints array required'
        });
        return;
      }

      console.log(`📦 Fetching batch of ${mints.length} tokens...`);

      // Limit to 100 (CoinGecko batch limit)
      const limitedMints = mints.slice(0, 100);

      // Use aggregation service for batch processing
      const tokens = await this.aggregationService.getMultipleTokens(limitedMints);

      console.log(`✅ Fetched ${tokens.length}/${limitedMints.length} tokens successfully`);

      // Serialize and return
      const serialized = tokens.map(serializeToken);
      res.json({ success: true, data: serialized });

    } catch (error) {
      console.error('❌ Error in getTokensBatch:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch token batch',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}