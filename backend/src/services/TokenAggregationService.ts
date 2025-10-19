// src/services/TokenAggregationService.ts
// ✅ FIXED VERSION - Now properly fetches pool data with transactions
import { CoinGeckoTerminalService } from './CoinGeckoTerminalService';
import { HeliusService } from './HeliusService';
import { BirdeyeService } from './BirdeyeService';
import { RiskCalculator } from './RiskCalculatorService';
import { CacheService } from './CacheService';
import { Token } from '../domain/models/Token';

/**
 * Token Aggregation Service
 * Orchestrates data collection from multiple sources
 * Priority: CoinGecko > Birdeye (fallback)
 */
export class TokenAggregationService {
  private coingecko: CoinGeckoTerminalService;
  private helius: HeliusService;
  private birdeye: BirdeyeService;
  private riskCalculator: RiskCalculator;
  private cache: CacheService;

  constructor() {
    this.coingecko = new CoinGeckoTerminalService();
    this.helius = new HeliusService();
    this.birdeye = new BirdeyeService();
    this.riskCalculator = new RiskCalculator();
    this.cache = new CacheService();
  }

  /**
 * ✅ ENHANCED: Get complete token data with detailed pool analysis
 */
  async getCompleteTokenData(mint: string): Promise<Token | null> {
    try {
      // Check cache first
      const cached = await this.cache.get<Token>(
        CacheService.tokenKey(mint)
      );
      if (cached) return cached;

      // 🚀 Step 1: Fetch enhanced risk assessment data FIRST (REAL ENDPOINTS)
      // This should happen before basic data fetching so we can get enhanced data even if basic data fails
      console.log(`🔍 DEBUG: About to fetch enhanced data for ${mint}`);
      let recentTrades = null;
      let ohlcvAnalysis = null;
      
      try {
        console.log(`🔍 DEBUG: Calling getTokenRecentTrades for ${mint}`);
        // Try with lower volume threshold first, then even lower
        recentTrades = await this.coingecko.getTokenRecentTrades(mint, 10);
        if (!recentTrades) {
          console.log(`🔍 DEBUG: No trades with $10 threshold, trying $1 for ${mint}`);
          recentTrades = await this.coingecko.getTokenRecentTrades(mint, 1);
        }
        console.log(`🔍 DEBUG: getTokenRecentTrades completed for ${mint} - result:`, recentTrades ? 'SUCCESS' : 'NULL');
      } catch (error) {
        console.error(`❌ Error in getTokenRecentTrades for ${mint}:`, error);
      }
      
      try {
        console.log(`🔍 DEBUG: Calling getEnhancedOHLCVAnalysis for ${mint}`);
        // Try different timeframes to get more data
        ohlcvAnalysis = await this.coingecko.getEnhancedOHLCVAnalysis(mint, 'day', 30);
        if (!ohlcvAnalysis) {
          console.log(`🔍 DEBUG: No daily OHLCV data, trying hourly for ${mint}`);
          ohlcvAnalysis = await this.coingecko.getEnhancedOHLCVAnalysis(mint, 'hour', 24);
        }
        if (!ohlcvAnalysis) {
          console.log(`🔍 DEBUG: No hourly OHLCV data, trying minute for ${mint}`);
          ohlcvAnalysis = await this.coingecko.getEnhancedOHLCVAnalysis(mint, 'minute', 60);
        }
        console.log(`🔍 DEBUG: getEnhancedOHLCVAnalysis completed for ${mint} - result:`, ohlcvAnalysis ? 'SUCCESS' : 'NULL');
      } catch (error) {
        console.error(`❌ Error in getEnhancedOHLCVAnalysis for ${mint}:`, error);
      }
      
      console.log(`🔍 DEBUG: Enhanced data fetch completed for ${mint}`);

      // 🔍 DEBUG: Enhanced Risk Assessment Data
      console.log(`🔍 DEBUG Enhanced Data for ${mint}:`);
      console.log(`  - recentTrades:`, recentTrades ? '✅ Found' : '❌ Missing');
      console.log(`  - ohlcvAnalysis:`, ohlcvAnalysis ? '✅ Found' : '❌ Missing');
      if (recentTrades) {
        console.log(`  - trades count:`, recentTrades.totalTrades);
        console.log(`  - washTradingScore:`, recentTrades.analysis.washTradingScore);
        console.log(`  - unusualTradingDetected:`, recentTrades.analysis.unusualTradingDetected);
        console.log(`  - whaleActivityScore:`, recentTrades.analysis.whaleActivityScore);
      }
      if (ohlcvAnalysis) {
        console.log(`  - volatilityScore:`, ohlcvAnalysis.analysis.volatilityScore);
        console.log(`  - trendDirection:`, ohlcvAnalysis.analysis.trendDirection);
        console.log(`  - priceManipulationRisk:`, ohlcvAnalysis.analysis.priceManipulationRisk);
        console.log(`  - liquidityStability:`, ohlcvAnalysis.analysis.liquidityStability);
      }
      
      // Summary for this token
      const hasEnhancedData = recentTrades || ohlcvAnalysis;
      console.log(`📊 Enhanced Data Summary for ${mint}: ${hasEnhancedData ? '✅ Available' : '❌ No Data'}`);

      // ✅ Step 2: Fetch basic token data
      const [cgInfo, cgDataWithPools, heliusSupply, topHolders] = await Promise.all([
        this.coingecko.getTokenInfo(mint),
        this.coingecko.getTokenDataWithPools(mint),
        this.helius.getTokenSupply(mint),
        this.coingecko.getTopHolders(mint, 10) // Fetch top 10 holders
      ]);

      if (!cgInfo || !cgDataWithPools) {
        console.warn(`Token not found on CoinGecko: ${mint}`);
        return this.fallbackToBirdeye(mint);
      }

      const topPool = cgDataWithPools.topPool;
      const hasPoolData = topPool && topPool.address;

      // ✅ Step 2: Fetch ENHANCED pool data with volume breakdown & composition
      let enhancedPoolData = null;
      if (hasPoolData) {
        try {
          // Use the public method instead of accessing private client
          enhancedPoolData = await this.coingecko.getDetailedPoolData(topPool.address);
          console.log(`✅ Enhanced pool data fetched for ${mint}`);
        } catch (error: any) {
          console.warn(`Failed to fetch enhanced pool data: ${error.message}`);
          // Continue without enhanced data
        }
      }

      // ✅ Step 3: Merge pool data (prefer enhanced, fallback to basic)
      const finalPoolData = enhancedPoolData || topPool;

      // Aggregate all data
      const token: Partial<Token> = {
        mint,
        name: cgInfo.name,
        symbol: cgInfo.symbol,
        decimals: cgDataWithPools.decimals,
        logoUri: cgInfo.imageUrl,
        
        // Price & Market Data
        price: cgDataWithPools.priceUsd,
        
        // ✅ Use enhanced pool price changes if available
        priceChange24h: enhancedPoolData?.priceChangePercentage?.h24 
          ?? cgDataWithPools.priceChange24h,
        priceChange6h: enhancedPoolData?.priceChangePercentage?.h6 ?? undefined,
        priceChange1h: enhancedPoolData?.priceChangePercentage?.h1 ?? undefined,
        
        marketCap: cgDataWithPools.marketCapUsd || cgDataWithPools.fdvUsd,
        volume24h: cgDataWithPools.volume24h,
        
        // Supply
        totalSupply: heliusSupply,
        
        // Holder Information
        holderCount: cgInfo.holders.count,
        topHoldersPercentage: cgInfo.holders.distribution.top10,
        topHolders: topHolders || [],
        
        // Authority Information
        authorities: cgInfo.authorities,
        
        // ✅ Liquidity from enhanced or basic pool data
        totalLiquidity: hasPoolData 
          ? (typeof enhancedPoolData?.reserveUsd === 'number' ? enhancedPoolData.reserveUsd : parseFloat(String(enhancedPoolData?.reserveUsd ?? finalPoolData.reserveUsd)))
          : 0,
        
        // ✅ Pool with FULL transaction and volume data
        pools: hasPoolData ? [{
          amm: 'DEX',
          poolAddress: finalPoolData.address,
          baseToken: mint,
          quoteToken: 'SOL',
          tvlUsd: typeof enhancedPoolData?.reserveUsd === 'number' ? enhancedPoolData.reserveUsd : parseFloat(String(enhancedPoolData?.reserveUsd ?? finalPoolData.reserveUsd)),
          volume24h: typeof enhancedPoolData?.volumeUsd?.h24 === 'number' ? enhancedPoolData.volumeUsd.h24 : parseFloat(String(enhancedPoolData?.volumeUsd?.h24 ?? '0')),
          apr: 0,
          createdAt: enhancedPoolData?.createdAt 
            ? new Date(enhancedPoolData.createdAt)
            : finalPoolData.createdAt || new Date(),
          lockedLiquidityPercentage: typeof enhancedPoolData?.lockedLiquidityPercentage === 'number' 
            ? enhancedPoolData.lockedLiquidityPercentage 
            : parseFloat(String(enhancedPoolData?.lockedLiquidityPercentage ?? finalPoolData.lockedLiquidityPercentage ?? '0')),
          
          // ✅ CRITICAL: Full transaction data
          transactions: enhancedPoolData?.transactions ?? finalPoolData.transactions,
          
          // ✅ Volume breakdown by timeframe
          volumeUsd: enhancedPoolData?.volumeUsd ?? finalPoolData.volumeUsd,
          
          // ✅ Price changes by timeframe
          priceChangePercentage: enhancedPoolData?.priceChangePercentage 
            ?? finalPoolData.priceChangePercentage,
        }] : [],
        
        // ✅ Token age from pool creation
        createdAt: hasPoolData && finalPoolData.createdAt 
          ? (typeof finalPoolData.createdAt === 'string' 
              ? finalPoolData.createdAt 
              : finalPoolData.createdAt.toISOString())
          : null,
        
        // Security
        gtScore: cgInfo.gtScore,
        isHoneypot: cgInfo.isHoneypot,
        
        // Social
        website: cgInfo.websites?.[0] || null,
        twitter: cgInfo.twitterHandle 
          ? `https://twitter.com/${cgInfo.twitterHandle}` 
          : null,
        telegram: cgInfo.telegramHandle 
          ? `https://t.me/${cgInfo.telegramHandle}` 
          : null,
        
        // Timestamp
        lastUpdated: new Date(),
        
        // 🚀 NEW: Enhanced Risk Assessment Data (REAL ENDPOINTS)
        recentTrades: recentTrades || undefined,
        ohlcvAnalysis: ohlcvAnalysis || undefined
      };

      // Calculate risk score with enhanced data
      token.riskScore = this.riskCalculator.calculateRiskScore(token);

      // Cache for 60 seconds
      await this.cache.set(CacheService.tokenKey(mint), token, 60);

      return token as Token;
      
    } catch (error: any) {
      console.error(`Error aggregating token data: ${error.message}`);
      return this.fallbackToBirdeye(mint);
    }
  }

  /**
   * ✅ FIXED: Get multiple tokens (batch processing)
   * Now properly fetches pool details with transactions
   */
  async getMultipleTokens(mints: string[]): Promise<Token[]> {
    if (mints.length === 0) return [];

    try {
      // Process in batches of 50
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < mints.length; i += batchSize) {
        const batch = mints.slice(i, i + batchSize);
        batches.push(this.processBatch(batch));
      }

      const results = await Promise.all(batches);
      return results.flat().filter((t): t is Token => t !== null);
      
    } catch (error: any) {
      console.error(`Error fetching multiple tokens: ${error.message}`);
      return [];
    }
  }

  /**
   * ✅ FIXED: Process a single batch of tokens with full pool details
   */
  private async processBatch(mints: string[]): Promise<(Token | null)[]> {
    try {
      console.log(`📦 Processing batch of ${mints.length} tokens...`);
      
      // Step 1: Fetch batch data from CoinGecko (basic pool info)
      const cgBatchData = await this.coingecko.getMultipleTokensData(mints);
      
      // Step 2: Fetch individual info for each token (holder data)
      const infoPromises = mints.map(mint => 
        this.coingecko.getTokenInfo(mint)
      );
      const cgInfoData = await Promise.all(infoPromises);
  
      // ✅ FIX: Fetch detailed pool data with transactions for ALL tokens
      console.log('🔥 Fetching detailed pool data with transactions...');
      const poolDetailsPromises = cgBatchData
        .filter((t: any) => t && t.topPool && t.topPool.address)
        .map((t: any) => ({
          mint: t.address,
          poolAddress: t.topPool!.address,
          promise: this.coingecko.getDetailedPoolData(t.topPool!.address)
        }));
      
      const poolDetailsResults = await Promise.all(
        poolDetailsPromises.map((p: any) => p.promise)
      );
      
      // Create a map for quick lookup
      const poolDetailsMap = new Map();
      poolDetailsPromises.forEach((p: any, index: number) => {
        if (poolDetailsResults[index]) {
          poolDetailsMap.set(p.poolAddress, poolDetailsResults[index]);
        }
      });

      // ✅ Fetch top holders for all tokens in parallel
      console.log('👥 Fetching top holders for all tokens...');
      const topHoldersPromises = mints.map(mint => 
        this.coingecko.getTopHolders(mint, 5)
      );
      const topHoldersResults = await Promise.all(topHoldersPromises);
      const topHoldersMap = new Map();
      mints.forEach((mint, index) => {
        topHoldersMap.set(mint, topHoldersResults[index]);
      });
  
      // Step 3: Combine all data
      const tokens = mints.map((mint, index) => {
        const cgData = cgBatchData.find((t: any) => t.address === mint);
        const cgInfo = cgInfoData[index];
  
        if (!cgData || !cgInfo) return null;
  
        // Get detailed pool data
        const poolDetails = cgData.topPool && poolDetailsMap.has(cgData.topPool.address)
          ? poolDetailsMap.get(cgData.topPool.address)
          : null;
  
        // Calculate liquidity from pool
        const totalLiquidity = cgData.topPool?.reserveUsd || 0;
        const createdAt = cgData.topPool?.createdAt || null;
  
        const token: Partial<Token> = {
          mint,
          name: cgInfo.name,
          symbol: cgInfo.symbol,
          decimals: cgData.decimals,
          logoUri: cgInfo.imageUrl,
          price: cgData.priceUsd,
          priceChange24h: cgData.priceChange24h,
          marketCap: cgData.marketCapUsd || cgData.fdvUsd,
          volume24h: cgData.volume24h,
          holderCount: cgInfo.holders.count,
          topHoldersPercentage: cgInfo.holders.distribution.top10,
          topHolders: topHoldersMap.get(mint) || [],
          authorities: cgInfo.authorities,
          totalLiquidity,
          
          // ✅ CRITICAL: Pool with full transaction data
          pools: cgData.topPool ? [{
            amm: 'DEX',
            poolAddress: cgData.topPool.address,
            baseToken: mint,
            quoteToken: 'SOL',
            tvlUsd: cgData.topPool.reserveUsd,
            volume24h: cgData.topPool.volume24h,
            apr: 0,
            createdAt: cgData.topPool.createdAt || new Date(),
            lockedLiquidityPercentage: cgData.topPool.lockedLiquidityPercentage,
            
            // ✅ Add transaction data if available
            ...(poolDetails && {
              transactions: poolDetails.transactions,
              volumeUsd: poolDetails.volumeUsd,
              priceChangePercentage: poolDetails.priceChangePercentage,
            })
          }] : [],
          
          createdAt: createdAt ? createdAt.toISOString() : null,
          gtScore: cgInfo.gtScore,
          isHoneypot: cgInfo.isHoneypot,
          website: cgInfo.websites?.[0] || null,
          totalSupply: BigInt(0),
          lastUpdated: new Date()
        };
  
        // Calculate risk score with enhanced data
        token.riskScore = this.riskCalculator.calculateRiskScore(token);
  
        return token as Token;
      });
  
      const validTokens = tokens.filter(t => t !== null);
      console.log(`✅ Processed ${validTokens.length}/${mints.length} tokens with transaction data`);
      
      return tokens;
      
    } catch (error: any) {
      console.error(`Batch processing error: ${error.message}`);
      return new Array(mints.length).fill(null);
    }
  }

  /**
   * ✅ FIXED: Get trending tokens with full pool details
   */
  async getTrendingTokens(limit: number = 100): Promise<Token[]> {
    try {
      const cached = await this.cache.get<Token[]>(
        CacheService.trendingKey()
      );
      if (cached) {
        console.log(`✅ Using cached trending tokens (${cached.length} tokens)`);
        return cached.slice(0, limit);
      }
  
      console.log(`🔥 Fetching ${limit} trending tokens from pools...`);
  
      // ✅ Get trending data with pool information included
      const trendingData = await this.coingecko.getTrendingPools(limit * 2, '24h');
      
      if (trendingData.length === 0) {
        console.log('⚠️ No trending pools found, using well-known tokens');
        return this.getWellKnownTokens();
      }
  
      console.log(`📊 Found ${trendingData.length} trending tokens with pool data`);
  
      // ✅ Process with pre-fetched pool data
      const tokens = await this.processTrendingTokens(trendingData, limit);
      
      // Filter out wrapped SOL and stablecoins
      const filteredTokens = tokens.filter(token => 
        token.mint !== 'So11111111111111111111111111111111111111112' &&
        token.mint !== 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' &&
        token.mint !== 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      );
      
      // Cache the full tokens for 1 hour
      await this.cache.set(CacheService.trendingKey(), filteredTokens, 3600); // 1 hour
  
      console.log(`✅ Returning ${filteredTokens.length} trending tokens`);
      return filteredTokens;
      
    } catch (error: any) {
      console.error(`Error fetching trending tokens: ${error.message}`);
      return this.getWellKnownTokens();
    }
  }


  /**
   * ✅ NEW: Process trending tokens with pre-fetched pool data
   */
  private async processTrendingTokens(
    trendingData: any[],
    limit: number
  ): Promise<Token[]> {
    try {
      // ✅ FIX: Ensure we don't exceed limit
      const tokensToProcess = trendingData.slice(0, limit);
      const mints = tokensToProcess.map(t => t.address);
      
      console.log(`🔄 Processing ${mints.length} tokens...`);

      // ✅ FIX: Process in smaller batches to respect rate limits
      const batchSize = 5;
      const allTokens: Token[] = [];
      
      for (let i = 0; i < mints.length; i += batchSize) {
        const batchMints = mints.slice(i, i + batchSize);
        const batchTrendingData = tokensToProcess.slice(i, i + batchSize);
        
        console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}: ${batchMints.length} tokens`);
        
        // Fetch token info for this batch
        const infoPromises = batchMints.map(mint => 
          this.coingecko.getTokenInfo(mint).catch(err => {
            console.warn(`Failed to fetch info for ${mint}: ${err.message}`);
            return null;
          })
        );
        const cgInfoData = await Promise.all(infoPromises);

        // Fetch basic token data (price, market cap, etc.) for this batch
        const cgBatchData = await this.coingecko.getMultipleTokensData(batchMints);

        // ✅ Fetch top holders for this batch
        const topHoldersPromises = batchMints.map(mint => 
          this.coingecko.getTopHolders(mint, 5)
        );
        const topHoldersResults = await Promise.all(topHoldersPromises);
        const topHoldersMap = new Map();
        batchMints.forEach((mint, index) => {
          topHoldersMap.set(mint, topHoldersResults[index]);
        });

        // Process each token in this batch SEQUENTIALLY to avoid rate limits
        const batchTokens: (Token | null)[] = [];
        
        for (let index = 0; index < batchMints.length; index++) {
          const mint = batchMints[index];
          const cgInfo = cgInfoData[index];
          const cgData = cgBatchData.find((t: any) => t.address === mint);
          const trendingItem = batchTrendingData[index];

          if (!cgInfo || !cgData) {
            console.warn(`⚠️ Missing data for ${mint}`);
            batchTokens.push(null);
            continue;
          }

          console.log(`🔍 Processing token ${index + 1}/${batchMints.length}: ${mint}`);

          // 🚀 Fetch enhanced risk assessment data for trending tokens with rate limiting
          let recentTrades = null;
          let ohlcvAnalysis = null;
          
          try {
            console.log(`🔍 DEBUG: Calling getTokenRecentTrades for trending token ${mint}`);
            recentTrades = await this.coingecko.getTokenRecentTrades(mint, 10);
            if (!recentTrades) {
              console.log(`🔍 DEBUG: No trades with $10 threshold, trying $1 for trending token ${mint}`);
              recentTrades = await this.coingecko.getTokenRecentTrades(mint, 1);
            }
            console.log(`🔍 DEBUG: getTokenRecentTrades completed for trending token ${mint} - result:`, recentTrades ? 'SUCCESS' : 'NULL');
          } catch (error: any) {
            console.error(`❌ Error in getTokenRecentTrades for trending token ${mint}:`, error);
            // If we hit rate limit, wait and retry
            if (error.response?.status === 429) {
              console.log(`⏳ Rate limit hit for trades, waiting 5 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 5000));
              try {
                recentTrades = await this.coingecko.getTokenRecentTrades(mint, 1);
              } catch (retryError) {
                console.error(`❌ Retry failed for trades ${mint}:`, retryError);
              }
            }
          }
          
          // Add delay between API calls
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            console.log(`🔍 DEBUG: Calling getEnhancedOHLCVAnalysis for trending token ${mint}`);
            ohlcvAnalysis = await this.coingecko.getEnhancedOHLCVAnalysis(mint, 'day', 30);
            if (!ohlcvAnalysis) {
              console.log(`🔍 DEBUG: No daily OHLCV data, trying hourly for trending token ${mint}`);
              ohlcvAnalysis = await this.coingecko.getEnhancedOHLCVAnalysis(mint, 'hour', 24);
            }
            if (!ohlcvAnalysis) {
              console.log(`🔍 DEBUG: No hourly OHLCV data, trying minute for trending token ${mint}`);
              ohlcvAnalysis = await this.coingecko.getEnhancedOHLCVAnalysis(mint, 'minute', 60);
            }
            console.log(`🔍 DEBUG: getEnhancedOHLCVAnalysis completed for trending token ${mint} - result:`, ohlcvAnalysis ? 'SUCCESS' : 'NULL');
          } catch (error: any) {
            console.error(`❌ Error in getEnhancedOHLCVAnalysis for trending token ${mint}:`, error);
            // If we hit rate limit, wait and retry
            if (error.response?.status === 429) {
              console.log(`⏳ Rate limit hit for OHLCV, waiting 5 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 5000));
              try {
                ohlcvAnalysis = await this.coingecko.getEnhancedOHLCVAnalysis(mint, 'day', 30);
              } catch (retryError) {
                console.error(`❌ Retry failed for OHLCV ${mint}:`, retryError);
              }
            }
          }
          
          console.log(`🔍 DEBUG: Enhanced data fetch completed for trending token ${mint}`);
          console.log(`📊 Enhanced Data Summary for trending token ${mint}: ${(recentTrades || ohlcvAnalysis) ? '✅ Available' : '❌ No Data'}`);

          // ✅ Use pre-fetched pool data from trending response
          const poolData = trendingItem?.poolData;
          const hasPoolData = poolData && poolData.address;

          const token: Partial<Token> = {
            mint,
            name: cgInfo.name,
            symbol: cgInfo.symbol,
            decimals: cgData.decimals,
            logoUri: cgInfo.imageUrl,
            price: cgData.priceUsd,
            priceChange24h: hasPoolData && poolData.priceChangePercentage?.h24
              ? poolData.priceChangePercentage.h24
              : cgData.priceChange24h,
            priceChange6h: hasPoolData && poolData.priceChangePercentage?.h6
              ? poolData.priceChangePercentage.h6
              : undefined,
            priceChange1h: hasPoolData && poolData.priceChangePercentage?.h1
              ? poolData.priceChangePercentage.h1
              : undefined,
            priceChange5m: hasPoolData && poolData.priceChangePercentage?.m5
              ? poolData.priceChangePercentage.m5
              : undefined,
            marketCap: cgData.marketCapUsd || cgData.fdvUsd,
            volume24h: cgData.volume24h,
            holderCount: cgInfo.holders.count,
            topHoldersPercentage: cgInfo.holders.distribution.top10,
            topHolders: topHoldersMap.get(mint) || [],
            authorities: cgInfo.authorities,
            
            // ✅ Set liquidity from pool data
            totalLiquidity: hasPoolData ? poolData.reserveUsd : 0,
            
            // ✅ Set createdAt from pool
            createdAt: hasPoolData && poolData.createdAt 
              ? poolData.createdAt.toISOString() 
              : null,
            
            // ✅ CRITICAL: Include pool with transaction data
            pools: hasPoolData ? [{
              amm: 'DEX',
              poolAddress: poolData.address,
              baseToken: mint,
              quoteToken: 'SOL',
              tvlUsd: poolData.reserveUsd,
              volume24h: poolData.volume24h || 0,
              apr: 0,
              createdAt: poolData.createdAt || new Date(),
              lockedLiquidityPercentage: 0,
              
              // ✅ Transaction data from trending pools
              transactions: poolData.transactions,
              volumeUsd: poolData.volumeUsd,
              priceChangePercentage: poolData.priceChangePercentage,
            }] : [],
            
            gtScore: cgInfo.gtScore,
            isHoneypot: cgInfo.isHoneypot,
            website: cgInfo.websites?.[0] || null,
            totalSupply: BigInt(0),
            lastUpdated: new Date(),
            
            // 🚀 Enhanced Risk Assessment Data
            recentTrades: recentTrades || undefined,
            ohlcvAnalysis: ohlcvAnalysis || undefined
          };

          // Calculate risk score
          token.riskScore = this.riskCalculator.calculateRiskScore(token);

          batchTokens.push(token as Token);
          
          // Add delay between tokens to respect rate limits
          if (index < batchMints.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        // Add valid tokens from this batch
        const validBatchTokens = batchTokens.filter((t): t is Token => t !== null);
        allTokens.push(...validBatchTokens);
        
        console.log(`✅ Batch complete: ${validBatchTokens.length}/${batchMints.length} tokens processed`);
        
        // Add delay between batches to respect rate limits
        if (i + batchSize < mints.length) {
          console.log(`⏳ Waiting 1 second before next batch...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`✅ Total processed: ${allTokens.length}/${mints.length} tokens with full data`);
      
      return allTokens;
      
    } catch (error: any) {
      console.error(`Error processing trending tokens: ${error.message}`);
      return [];
    }
  }
  /**
   * Fallback to Birdeye if CoinGecko fails
   */
  private async fallbackToBirdeye(mint: string): Promise<Token | null> {
    try {
      console.log(`Falling back to Birdeye for ${mint}`);
      
      const [overview, price] = await Promise.all([
        this.birdeye.getTokenOverview(mint),
        this.birdeye.getPrice(mint)
      ]);

      if (!overview || !price) return null;

      const token: Partial<Token> = {
        mint,
        name: 'Unknown',
        symbol: 'UNKNOWN',
        decimals: 9,
        price: price,
        priceChange24h: overview.priceChange24h,
        marketCap: 0,
        volume24h: overview.v24hUSD,
        holderCount: overview.holder,
        topHoldersPercentage: 0,
        topHolders: await this.coingecko.getTopHolders(mint, 5), // Fetch top 5 for fallback
        totalSupply: BigInt(0),
        totalLiquidity: 0,
        pools: [],
        authorities: {
          mintAuthority: null,
          freezeAuthority: null,
          mintRenounced: true,
          freezeRenounced: true
        },
        createdAt: null, // ✅ Set to null instead of undefined
        lastUpdated: new Date()
      };

      token.riskScore = this.riskCalculator.calculateRiskScore(token);

      return token as Token;
      
    } catch (error: any) {
      console.error(`Birdeye fallback failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Well-known Solana tokens as ultimate fallback
   */
  private async getWellKnownTokens(): Promise<Token[]> {
    const wellKnownMints = [
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
      'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',  // JUP
      'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
    ];

    return this.getMultipleTokens(wellKnownMints);
  }
}