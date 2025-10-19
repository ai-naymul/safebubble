// src/services/CoinGeckoTerminalService.ts
import axios, { AxiosInstance } from 'axios';
import { config } from '../config/environment';
import { 
  TokenHolder, 
  TokenAuthorities, 
  LiquidityPool 
} from '../domain/models/Token';

/**
 * CoinGecko Terminal Service
 * Primary data source for Solana token data
 * Provides: holders, liquidity, volume, price, authorities, age
 */
export class CoinGeckoTerminalService {
  private readonly client: AxiosInstance;
  private readonly network = 'solana';
  private lastRequestTime = 0;
  private readonly minRequestInterval = 100; // 100ms between requests (10 requests per second max)

  constructor() {
    this.client = axios.create({
      baseURL: config.api.coingecko.baseUrl,
      headers: {
        'x-cg-pro-api-key': config.api.coingecko.apiKey,
        'accept': 'application/json'
      },
      timeout: 10000
    });
  }

  /**
   * Rate limiting helper
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Get comprehensive token info including holders and authorities
   * Endpoint: /networks/{network}/tokens/{address}/info
   */
  async getTokenInfo(address: string) {
    try {
      const response = await this.client.get(
        `/onchain/networks/${this.network}/tokens/${address}/info`
      );

      const attrs = response.data.data?.attributes;
      
      if (!attrs) return null;

      return {
        name: attrs.name || 'Unknown',
        symbol: attrs.symbol || '???',
        imageUrl: attrs.image_url || null,
        description: attrs.description || null,
        websites: attrs.websites || [],
        coingeckoId: attrs.coingecko_coin_id || null,
        
        // Holder information
        holders: {
          count: attrs.holders?.count || 0,
          distribution: {
            top10: attrs.holders?.distribution_percentage?.top_10 || 0,
            top11_30: attrs.holders?.distribution_percentage?.['11_30'] || 0,
            top31_50: attrs.holders?.distribution_percentage?.['31_50'] || 0,
            rest: attrs.holders?.distribution_percentage?.rest || 0
          }
        },
        
        // Authority information (critical for rug pull detection)
        authorities: {
          mintAuthority: attrs.mint_authority,
          freezeAuthority: attrs.freeze_authority,
          mintRenounced: attrs.mint_authority === 'no',
          freezeRenounced: attrs.freeze_authority === 'no'
        },
        
        // Security score
        gtScore: attrs.gt_score || 0,
        gtScoreDetails: attrs.gt_score_details || null,
        
        // Social links
        discordUrl: attrs.discord_url || null,
        telegramHandle: attrs.telegram_handle || null,
        twitterHandle: attrs.twitter_handle || null,
        
        categories: attrs.categories || [],
        isHoneypot: attrs.is_honeypot || false
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Token not found on CoinGecko Terminal: ${address}`);
        return null;
      }
      console.error(`Failed to fetch token info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get token market data (price, volume, market cap)
   * Endpoint: /networks/{network}/tokens/{address}
   */
  async getTokenData(address: string) {
    try {
      const response = await this.client.get(
        `onchain/networks/${this.network}/tokens/${address}`,
        {
          params: {
            include: 'top_pools',
            include_composition: true
          }
        }
      );

      const data = response.data.data;
      const attrs = data?.attributes;
      
      if (!attrs) return null;

      // Extract top pool data from included section
      const topPool = response.data.included?.find(
        (item: any) => item.type === 'pool'
      );

      return {
        address: attrs.address,
        name: attrs.name,
        symbol: attrs.symbol,
        decimals: attrs.decimals || 9,
        
        // Price data
        priceUsd: parseFloat(attrs.price_usd || '0'),
        
        // Market data
        fdvUsd: parseFloat(attrs.fdv_usd || '0'),
        marketCapUsd: attrs.market_cap_usd 
          ? parseFloat(attrs.market_cap_usd) 
          : null,
        
        // Volume data
        volume24h: parseFloat(attrs.volume_usd?.h24 || '0'),
        volumeChange24h: parseFloat(attrs.price_change_percentage?.h24 || '0'),
        
        // Price changes
        priceChange24h: parseFloat(attrs.price_change_percentage?.h24 || '0'),
        priceChange7d: parseFloat(attrs.price_change_percentage?.d7 || '0'),
        
        // Top pool info
        topPool: topPool ? {
          address: topPool.attributes.address,
          name: topPool.attributes.name,
          reserveUsd: parseFloat(topPool.attributes.reserve_in_usd || '0'),
          volume24h: parseFloat(topPool.attributes.volume_usd?.h24 || '0'),
          createdAt: topPool.attributes.pool_created_at 
            ? new Date(topPool.attributes.pool_created_at)
            : null,
          lockedLiquidityPercentage: parseFloat(
            topPool.attributes.locked_liquidity_percentage || '0'
          )
        } : null,
        
        // Metadata
        imageUrl: attrs.image_url || null,
        totalSupply: attrs.total_supply || '0',
        circulatingSupply: attrs.circulating_supply || '0'
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Token data not found: ${address}`);
        return null;
      }
      console.error(`Failed to fetch token data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all pools for a token (sorted by liquidity)
   * Endpoint: /networks/{network}/tokens/{address}/pools
   */
  async getTokenPools(address: string, limit: number = 10): Promise<LiquidityPool[]> {
    try {
      const response = await this.client.get(
        `onchain/networks/${this.network}/tokens/${address}/pools`,
        {
          params: {
            include: 'base_token,quote_token,dex',
            page: 1,
            sort: 'h24_volume_usd_liquidity_desc'
          }
        }
      );

      const pools = response.data.data || [];
      
      return pools.slice(0, limit).map((pool: any) => {
        const attrs = pool.attributes;
        
        return {
          amm: 'Unknown', // Will be in relationships
          poolAddress: attrs.address,
          baseToken: attrs.base_token_price_usd ? pool.id.split('_')[1] : '',
          quoteToken: attrs.quote_token_price_usd ? pool.id.split('_')[2] : '',
          tvlUsd: parseFloat(attrs.reserve_in_usd || '0'),
          volume24h: parseFloat(attrs.volume_usd?.h24 || '0'),
          apr: 0, // Not provided by CoinGecko
          createdAt: attrs.pool_created_at 
            ? new Date(attrs.pool_created_at)
            : new Date(),
          lockedLiquidityPercentage: parseFloat(
            attrs.locked_liquidity_percentage || '0'
          )
        };
      });
    } catch (error: any) {
      console.error(`Failed to fetch token pools: ${error.message}`);
      return [];
    }
  }

  /**
   * Get detailed pool data with transactions (ENHANCED VERSION)
   * This gives us buy/sell ratios, unique traders, volume patterns
   */
  async getDetailedPoolData(poolAddress: string) {
    try {
      const response = await this.client.get(
        `/onchain/networks/${this.network}/pools/${poolAddress}`
      );

      const attrs = response.data.data?.attributes;
      if (!attrs) return null;

      return {
        address: attrs.address,
        name: attrs.name,
        
        // Liquidity
        reserveUsd: parseFloat(attrs.reserve_in_usd || '0'),
        
        // Price data
        priceUsd: parseFloat(attrs.token_price_usd || '0'),
        priceChangePercentage: {
          m5: parseFloat(attrs.price_change_percentage?.m5 || '0'),
          m15: parseFloat(attrs.price_change_percentage?.m15 || '0'),
          m30: parseFloat(attrs.price_change_percentage?.m30 || '0'),
          h1: parseFloat(attrs.price_change_percentage?.h1 || '0'),
          h6: parseFloat(attrs.price_change_percentage?.h6 || '0'),
          h24: parseFloat(attrs.price_change_percentage?.h24 || '0'),
        },
        
        // 🔥 TRANSACTION DATA (KEY FOR HONEYPOT DETECTION)
        transactions: {
          m5: {
            buys: attrs.transactions?.m5?.buys || 0,
            sells: attrs.transactions?.m5?.sells || 0,
            buyers: attrs.transactions?.m5?.buyers || 0,
            sellers: attrs.transactions?.m5?.sellers || 0,
          },
          h1: {
            buys: attrs.transactions?.h1?.buys || 0,
            sells: attrs.transactions?.h1?.sells || 0,
            buyers: attrs.transactions?.h1?.buyers || 0,
            sellers: attrs.transactions?.h1?.sellers || 0,
          },
          h24: {
            buys: attrs.transactions?.h24?.buys || 0,
            sells: attrs.transactions?.h24?.sells || 0,
            buyers: attrs.transactions?.h24?.buyers || 0,
            sellers: attrs.transactions?.h24?.sellers || 0,
          },
        },
        
        // Volume data
        volumeUsd: {
          m5: parseFloat(attrs.volume_usd?.m5 || '0'),
          h1: parseFloat(attrs.volume_usd?.h1 || '0'),
          h24: parseFloat(attrs.volume_usd?.h24 || '0'),
        },
        
        // Pool metadata
        createdAt: attrs.pool_created_at ? new Date(attrs.pool_created_at) : null,
        lockedLiquidityPercentage: parseFloat(attrs.locked_liquidity_percentage || '0'),
      };
    } catch (error: any) {
      console.error(`Failed to fetch detailed pool data: ${error.message}`);
      return null;
    }
  }

  /**
   * Get token data WITH detailed pool information
   */
  async getTokenDataWithPools(address: string) {
    try {
      // Fetch basic token data
      const tokenData = await this.getTokenData(address);
      if (!tokenData || !tokenData.topPool) return null;

      // Fetch detailed pool data for the top pool
      const poolDetails = await this.getDetailedPoolData(tokenData.topPool.address);
      
      return {
        ...tokenData,
        topPool: {
          ...tokenData.topPool,
          ...poolDetails, // Merge detailed data
        }
      };
    } catch (error: any) {
      console.error(`Failed to fetch token with pool details: ${error.message}`);
      return null;
    }
  }


  /**
   * Get multiple tokens data in a single call (batch endpoint)
   * Endpoint: /networks/{network}/tokens/multi/{addresses}
   * IMPORTANT: Can query up to 50 tokens per call (Pro API exclusive)
   */
  async getMultipleTokensData(addresses: string[]) {
    if (addresses.length === 0) return [];
    if (addresses.length > 50) {
      throw new Error('Maximum 50 addresses per batch request');
    }

    try {
      const addressString = addresses.join(',');
      
      const response = await this.client.get(
        `onchain/networks/${this.network}/tokens/multi/${addressString}`,
        {
          params: {
            include: 'top_pools',
            include_composition: true
          }
        }
      );

      const tokensData = response.data.data || [];
      const pools = response.data.included || [];
      
      return tokensData.map((token: any) => {
        const attrs = token.attributes;
        
        // Find associated top pool
        const topPoolId = token.relationships?.top_pool?.data?.id;
        const topPool = pools.find((p: any) => p.id === topPoolId);
        
        return {
          address: attrs.address,
          name: attrs.name,
          symbol: attrs.symbol,
          decimals: attrs.decimals || 9,
          priceUsd: parseFloat(attrs.price_usd || '0'),
          fdvUsd: parseFloat(attrs.fdv_usd || '0'),
          marketCapUsd: attrs.market_cap_usd 
            ? parseFloat(attrs.market_cap_usd) 
            : null,
          volume24h: parseFloat(attrs.volume_usd?.h24 || '0'),
          priceChange24h: parseFloat(attrs.price_change_percentage?.h24 || '0'),
          imageUrl: attrs.image_url || null,
          
          topPool: topPool ? {
            address: topPool.attributes.address,
            reserveUsd: parseFloat(topPool.attributes.reserve_in_usd || '0'),
            volume24h: parseFloat(topPool.attributes.volume_usd?.h24 || '0'),
            createdAt: topPool.attributes.pool_created_at 
              ? new Date(topPool.attributes.pool_created_at)
              : null,
            lockedLiquidityPercentage: parseFloat(
              topPool.attributes.locked_liquidity_percentage || '0'
            )
          } : null
        };
      });
    } catch (error: any) {
      console.error(`Failed to fetch multiple tokens: ${error.message}`);
      return [];
    }
  }

  /**
   * Get trending tokens across Solana network
   * Note: CoinGecko doesn't have a direct "trending" endpoint
   * Instead, we'll use recently updated tokens or fetch specific tokens
   */
  async getTrendingTokens(limit: number = 100): Promise<any[]> {
    try {
      // Use "recently updated tokens" as proxy for trending
      const response = await this.client.get(
        '/tokens/info_recently_updated',
        {
          params: {
            include: 'network',
            network: this.network
          }
        }
      );

      const tokens = response.data.data || [];
      
      return tokens.slice(0, limit).map((token: any) => ({
        address: token.attributes.address,
        name: token.attributes.name,
        symbol: token.attributes.symbol,
        imageUrl: token.attributes.image_url
      }));
    } catch (error: any) {
      console.error(`Failed to fetch trending tokens: ${error.message}`);
      return [];
    }
  }


  // Add after the existing getTrendingTokens method (around line 200)

/**
 * Get trending pools on Solana (NEW - BETTER METHOD)
 * Returns 20 pools per page, can fetch multiple pages
 */
  async getTrendingPools(
    limit: number = 100,
    duration: '5m' | '1h' | '6h' | '24h' = '24h'
  ): Promise<any[]> {
    try {
      const pages = Math.ceil(limit / 50);
      const allPools: any[] = [];

      const pagePromises = Array.from({ length: pages }, (_, i) =>
        this.fetchTrendingPoolsPage(i + 1, duration)
      );

      const results = await Promise.all(pagePromises);
      
      for (const pools of results) {
        allPools.push(...pools);
      }

      console.log(`✅ Fetched ${allPools.length} trending pools with transaction data`);
      
      return allPools.slice(0, limit);
      
    } catch (error: any) {
      console.error(`Failed to fetch trending pools: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Fetch a single page of trending pools
   */
  private async fetchTrendingPoolsPage(
    page: number,
    duration: '5m' | '1h' | '6h' | '24h'
  ): Promise<any[]> {
    try {
      const response = await this.client.get(
        `/onchain/networks/${this.network}/trending_pools`,
        {
          params: {
            include: 'base_token,quote_token',
            page,
            duration
          }
        }
      );
  
      const pools = response.data.data || [];
      const uniqueTokens = new Map<string, any>();
      
      // ✅ KEEP ALL POOL DATA including transactions
      pools.forEach((pool: any) => {
        const baseTokenId = pool.relationships?.base_token?.data?.id;
        if (baseTokenId) {
          const address = baseTokenId.split('_')[1];
          if (address && !uniqueTokens.has(address)) {
            uniqueTokens.set(address, {
              address,
              name: pool.attributes.name,
              // ✅ CRITICAL: Include pool data with transactions
              poolData: {
                address: pool.attributes.address,
                reserveUsd: parseFloat(pool.attributes.reserve_in_usd || '0'),
                volume24h: parseFloat(pool.attributes.volume_usd?.h24 || '0'),
                createdAt: pool.attributes.pool_created_at 
                  ? new Date(pool.attributes.pool_created_at)
                  : null,
                // ✅ Include transaction data directly
                transactions: pool.attributes.transactions || null,
                volumeUsd: pool.attributes.volume_usd || null,
                priceChangePercentage: pool.attributes.price_change_percentage || null,
              }
            });
          }
        }
      });
  
      return Array.from(uniqueTokens.values());
      
    } catch (error: any) {
      console.error(`Failed to fetch page ${page}: ${error.message}`);
      return [];
    }
  }
  
  /**
   * MEGAFILTER: Most powerful option (ALTERNATIVE METHOD)
   * Filter by liquidity, volume, exclude honeypots, etc.
   */
  async getMegafilterPools(options: {
    page?: number;
    networks?: string[];
    sort?: string;
    minLiquidity?: number;
    minVolume?: number;
    noHoneypot?: boolean;
    goodGtScore?: boolean;
  }): Promise<any[]> {
    try {
      const params: any = {
        page: options.page || 1,
        networks: options.networks?.join(',') || this.network,
      };
  
      // Add optional filters
      if (options.sort) params.sort = options.sort; // e.g., 'h24_trending'
      if (options.minLiquidity) params.reserve_in_usd_min = options.minLiquidity;
      if (options.minVolume) params.h24_volume_usd_min = options.minVolume;
      if (options.noHoneypot) params.checks = 'no_honeypot';
      if (options.goodGtScore) params.checks = 'good_gt_score';
  
      const response = await this.client.get(
        '/onchain/pools/megafilter',
        { params }
      );
  
      const pools = response.data.data || [];
      
      // Extract token addresses
      const tokenAddresses = new Set<string>();
      
      pools.forEach((pool: any) => {
        const baseTokenId = pool.relationships?.base_token?.data?.id;
        if (baseTokenId) {
          const address = baseTokenId.split('_')[1];
          if (address) tokenAddresses.add(address);
        }
      });
  
      return Array.from(tokenAddresses).map(address => ({
        address,
        name: 'Unknown',
        symbol: 'UNKNOWN',
        imageUrl: null
      }));
      
    } catch (error: any) {
      console.error(`Megafilter failed: ${error.message}`);
      return [];
    }
  }

  /**
   * PREMIUM: Get top token holders (up to 40 for Solana)
   * Endpoint: /networks/{network}/tokens/{address}/top_holders
   * Requires: Analyst plan or above
   */
  async getTopHolders(address: string, count: number = 10): Promise<TokenHolder[]> {
    try {
      console.log(`🔍 Fetching top holders for ${address} (count: ${count})`);
      
      const response = await this.client.get(
        `onchain/networks/solana/tokens/${address}/top_holders`,
        {
          params: {
            holders: Math.min(count, 40) // Max 40 for Solana
          }
        }
      );

      console.log('📊 Top holders response:', JSON.stringify(response.data, null, 2));

      const holders = response.data.data?.attributes?.holders || [];
      console.log(`📈 Found ${holders.length} holders`);
      
      return holders.map((holder: any, index: number) => ({
        address: holder.address,
        amount: BigInt(Math.floor(parseFloat(holder.amount || '0'))), // Convert decimal to integer for BigInt
        percentage: parseFloat(holder.percentage || '0'),
        rank: holder.rank || index + 1 // Use API rank if available
      }));
    } catch (error: any) {
      console.error(`❌ Failed to fetch top holders for ${address}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data
      });
      
      if (error.response?.status === 403) {
        console.warn('🔒 Top holders endpoint requires Pro API subscription');
      } else if (error.response?.status === 404) {
        console.warn('🔍 Token not found or no holders data available');
      }
      
      return [];
    }
  }

  /**
   * PREMIUM: Get OHLCV chart data for token
   * Endpoint: /networks/{network}/tokens/{address}/ohlcv/{timeframe}
   * Requires: Analyst plan or above
   */
  async getTokenOHLCV(
    address: string,
    timeframe: 'day' | 'hour' | 'minute' = 'day',
    aggregate: number = 1,
    limit: number = 100
  ) {
    try {
      await this.rateLimit(); // Apply rate limiting
      const response = await this.client.get(
        `onchain/networks/${this.network}/tokens/${address}/ohlcv/${timeframe}`,
        {
          params: {
            aggregate,
            limit: Math.min(limit, 1000), // Max 1000
            currency: 'usd',
            include_empty_intervals: false
          }
        }
      );

      const ohlcvList = response.data.data?.attributes?.ohlcv_list || [];
      
      // Convert to more usable format
      return ohlcvList.map((candle: number[]) => ({
        timestamp: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5]
      }));
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.warn('OHLCV endpoint requires Pro API subscription');
      }
      console.error(`Failed to fetch OHLCV data: ${error.message}`);
      return [];
    }
  }

  /**
   * PREMIUM: Get historical holder growth chart
   * Endpoint: /networks/{network}/tokens/{address}/holders_chart
   * Requires: Analyst plan or above
   */
  async getHolderGrowthChart(
    address: string,
    days: '7' | '30' | 'max' = '30'
  ) {
    try {
      const response = await this.client.get(
        `onchain/networks/${this.network}/tokens/${address}/holders_chart`,
        {
          params: { days }
        }
      );

      const chartData = response.data.data?.attributes?.holders_chart || [];
      
      return chartData.map((point: any) => ({
        timestamp: point[0],
        holderCount: point[1]
      }));
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.warn('Holder chart endpoint requires Pro API subscription');
      }
      console.error(`Failed to fetch holder chart: ${error.message}`);
      return [];
    }
  }



  /**
 * 💼 Get globally trending search pools (cross-network)
 * Returns the hottest pools being searched across all networks
 */
  async getGlobalTrendingPools(limit: number = 10): Promise<any[]> {
    try {
      const response = await this.client.get(
        '/onchain/search/pools',
        {
          params: {
            include: 'base_token,quote_token,dex,network',
            pools: Math.min(limit, 10) // Max 10 per request
          }
        }
      );

      const pools = response.data.data || [];
      const solanaTokens: any[] = [];
      
      pools.forEach((pool: any) => {
        // Only get Solana tokens
        const networkId = pool.relationships?.network?.data?.id;
        if (networkId === 'solana') {
          const baseTokenId = pool.relationships?.base_token?.data?.id;
          if (baseTokenId) {
            const address = baseTokenId.split('_')[1];
            if (address) {
              solanaTokens.push({
                address,
                poolAddress: pool.attributes.address,
                reserveUsd: parseFloat(pool.attributes.reserve_in_usd || '0'),
                volume24h: parseFloat(pool.attributes.volume_usd?.h24 || '0'),
                createdAt: pool.attributes.pool_created_at 
                  ? new Date(pool.attributes.pool_created_at)
                  : null,
                trendingRank: pool.attributes.trending_rank || 0
              });
            }
          }
        }
      });

      return solanaTokens;
    } catch (error: any) {
      console.error(`Failed to fetch global trending: ${error.message}`);
      return [];
    }
  }
  /**
   * Get recent trades for a token (REAL ENDPOINT)
   * Endpoint: /networks/{network}/tokens/{address}/trades
   * Provides: Last 300 trades in past 24 hours for trading pattern analysis
   */
  async getTokenRecentTrades(address: string, minVolumeUsd: number = 0) {
    try {
      await this.rateLimit(); // Apply rate limiting
      const response = await this.client.get(
        `onchain/networks/${this.network}/tokens/${address}/trades`,
        {
          params: {
            trade_volume_in_usd_greater_than: minVolumeUsd
          }
        }
      );

      const trades = response.data.data || [];
      console.log(`📊 Found ${trades.length} recent trades for ${address}`);

      // Analyze trading patterns
      const analysis = this.analyzeTradingPatterns(trades);
      
      return {
        trades: trades,
        analysis: analysis,
        totalTrades: trades.length,
        lastTradeTime: trades[0]?.attributes?.block_timestamp || null
      };
    } catch (error: any) {
      console.warn(`❌ Failed to fetch recent trades for ${address}: ${error.message}`);
      if (error.response) {
        console.log(`🔍 DEBUG: Trades API Error for ${address}:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      return null;
    }
  }

  /**
   * Analyze trading patterns from recent trades data
   */
  private analyzeTradingPatterns(trades: any[]) {
    if (!trades || trades.length === 0) {
      return {
        washTradingScore: 0,
        unusualTradingDetected: false,
        whaleActivityScore: 0,
        buySellRatio: 0,
        averageTradeSize: 0,
        suspiciousTransactions: 0,
        totalBuyVolume: 0,
        totalSellVolume: 0
      };
    }

    let totalBuyVolume = 0;
    let totalSellVolume = 0;
    let buyCount = 0;
    let sellCount = 0;
    let totalVolume = 0;
    let suspiciousCount = 0;
    let whaleTrades = 0;

    trades.forEach(trade => {
      const attrs = trade.attributes;
      const volume = parseFloat(attrs.volume_in_usd || '0');
      const isSell = attrs.kind === 'sell';
      
      totalVolume += volume;
      
      if (isSell) {
        totalSellVolume += volume;
        sellCount++;
      } else {
        totalBuyVolume += volume;
        buyCount++;
      }

      // Detect whale trades (>$1k for more realistic detection)
      if (volume > 1000) {
        whaleTrades++;
      }

      // Detect suspicious patterns (very large trades, unusual timing, etc.)
      if (volume > 10000 || (attrs.tx_from_address && attrs.tx_from_address.length < 10)) {
        suspiciousCount++;
      }
    });

    const buySellRatio = sellCount > 0 ? buyCount / sellCount : 0;
    const averageTradeSize = trades.length > 0 ? totalVolume / trades.length : 0;
    
    // Calculate wash trading score (improved heuristic)
    const suspiciousRatio = suspiciousCount / trades.length;
    const washTradingScore = Math.min(100, suspiciousRatio * 200); // More sensitive detection
    
    // Calculate whale activity score (improved)
    const whaleRatio = whaleTrades / trades.length;
    const whaleActivityScore = Math.min(100, whaleRatio * 150); // More realistic scaling

    return {
      washTradingScore: Math.round(washTradingScore),
      unusualTradingDetected: washTradingScore > 20 || whaleActivityScore > 30,
      whaleActivityScore: Math.round(whaleActivityScore),
      buySellRatio: Math.round(buySellRatio * 100) / 100,
      averageTradeSize: Math.round(averageTradeSize),
      suspiciousTransactions: suspiciousCount,
      totalBuyVolume: Math.round(totalBuyVolume),
      totalSellVolume: Math.round(totalSellVolume)
    };
  }

  /**
   * Get most recently updated tokens (REAL ENDPOINT)
   * Endpoint: /tokens
   * Provides: List of recently updated tokens with metadata
   */
  async getRecentlyUpdatedTokens(limit: number = 100) {
    try {
      const response = await this.client.get(
        `tokens`,
        {
          params: {
            network: this.network,
            include: 'token_networks'
          }
        }
      );

      const tokens = response.data.data || [];
      console.log(`📊 Found ${tokens.length} recently updated tokens`);

      return tokens.map((token: any) => ({
        address: token.attributes.address,
        name: token.attributes.name,
        symbol: token.attributes.symbol,
        decimals: token.attributes.decimals,
        imageUrl: token.attributes.image_url,
        websites: token.attributes.websites || [],
        discordUrl: token.attributes.discord_url,
        telegramHandle: token.attributes.telegram_handle,
        twitterHandle: token.attributes.twitter_handle,
        description: token.attributes.description,
        gtScore: token.attributes.gt_score,
        metadataUpdatedAt: token.attributes.metadata_updated_at
      }));
    } catch (error: any) {
      console.warn(`Failed to fetch recently updated tokens: ${error.message}`);
      return [];
    }
  }

  /**
   * Enhanced OHLCV analysis (REAL ENDPOINT - ENHANCED)
   * Uses existing OHLCV endpoint but with enhanced analysis
   */
  async getEnhancedOHLCVAnalysis(
    address: string, 
    timeframe: 'day' | 'hour' | 'minute' = 'day',
    limit: number = 30
  ) {
    try {
      await this.rateLimit(); // Apply rate limiting
      const ohlcvData = await this.getTokenOHLCV(address, timeframe, 1, limit);
      
      if (!ohlcvData || ohlcvData.length === 0) {
        console.log(`❌ No OHLCV data found for ${address}`);
        return null;
      }

      // Analyze OHLCV data for patterns
      const analysis = this.analyzeOHLCVPatterns(ohlcvData);
      
      return {
        ohlcvData: ohlcvData,
        analysis: analysis,
        timeframe: timeframe,
        dataPoints: ohlcvData.length
      };
    } catch (error: any) {
      console.warn(`❌ Failed to fetch enhanced OHLCV analysis for ${address}: ${error.message}`);
      if (error.response) {
        console.log(`🔍 DEBUG: OHLCV API Error for ${address}:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      return null;
    }
  }

  /**
   * Analyze OHLCV patterns for risk assessment
   */
  private analyzeOHLCVPatterns(ohlcvData: any[]) {
    if (!ohlcvData || ohlcvData.length < 2) {
      return {
        volatilityScore: 0,
        trendDirection: 'neutral' as const,
        volumeAnomalies: [],
        priceManipulationRisk: 0,
        liquidityStability: 'unknown' as const,
        averageVolume: 0,
        priceRange: {
          high: 0,
          low: 0,
          range: 0
        }
      };
    }

    // Debug: Log data structure for troubleshooting
    // console.log(`🔍 DEBUG: OHLCV data structure:`, {
    //   length: ohlcvData.length,
    //   firstItem: ohlcvData[0],
    //   firstItemType: typeof ohlcvData[0],
    //   isArray: Array.isArray(ohlcvData[0])
    // });

    let totalVolume = 0;
    let priceChanges: number[] = [];
    let volumeSpikes: Array<{
      timestamp: number;
      volume: number;
      avgVolume: number;
      spikeRatio: number;
    }> = [];
    let maxPrice = 0;
    let minPrice = Infinity;

    ohlcvData.forEach((candle, index) => {
      // Debug: Log each candle for troubleshooting
      // console.log(`🔍 DEBUG: Processing candle ${index}:`, candle);
      
      // Handle different data structures
      let timestamp, open, high, low, close, volume;
      
      if (Array.isArray(candle)) {
        // Array format: [timestamp, open, high, low, close, volume]
        [timestamp, open, high, low, close, volume] = candle;
      } else if (candle && typeof candle === 'object') {
        // Object format: { timestamp, open, high, low, close, volume }
        timestamp = candle.timestamp;
        open = candle.open;
        high = candle.high;
        low = candle.low;
        close = candle.close;
        volume = candle.volume;
      } else {
        console.error(`❌ Invalid candle format at index ${index}:`, candle);
        return;
      }
      
      // Validate extracted values
      if (typeof timestamp !== 'number' || typeof open !== 'number' || 
          typeof high !== 'number' || typeof low !== 'number' || 
          typeof close !== 'number' || typeof volume !== 'number') {
        console.error(`❌ Invalid candle values at index ${index}:`, {
          timestamp, open, high, low, close, volume
        });
        return;
      }
      
      totalVolume += volume;
      maxPrice = Math.max(maxPrice, high);
      minPrice = Math.min(minPrice, low);

      // Calculate price change
      if (index > 0) {
        let prevClose;
        const prevCandle = ohlcvData[index - 1];
        if (Array.isArray(prevCandle)) {
          prevClose = prevCandle[4]; // Previous close
        } else if (prevCandle && typeof prevCandle === 'object') {
          prevClose = prevCandle.close;
        }
        
        if (prevClose && prevClose > 0) {
          const priceChange = ((close - prevClose) / prevClose) * 100;
          priceChanges.push(priceChange);
        }
      }

      // Detect volume spikes (volume > 2x average)
      const avgVolume = totalVolume / (index + 1);
      if (volume > avgVolume * 2) {
        volumeSpikes.push({
          timestamp,
          volume,
          avgVolume,
          spikeRatio: volume / avgVolume
        });
      }
    });

    // Calculate volatility (standard deviation of price changes)
    const avgPriceChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    const variance = priceChanges.reduce((sum, change) => sum + Math.pow(change - avgPriceChange, 2), 0) / priceChanges.length;
    const volatility = Math.sqrt(variance);
    const volatilityScore = Math.min(100, volatility * 2); // More reasonable scaling (was ×10, now ×2)

    // Determine trend direction
    const firstPrice = ohlcvData[0][4]; // First close
    const lastPrice = ohlcvData[ohlcvData.length - 1][4]; // Last close
    const overallChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    let trendDirection: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (overallChange > 5) trendDirection = 'bullish';
    else if (overallChange < -5) trendDirection = 'bearish';

    // Calculate price manipulation risk based on volatility and volume patterns
    const priceManipulationRisk = Math.min(100, (volatilityScore * 0.6) + (volumeSpikes.length * 5));

    // Determine liquidity stability
    let liquidityStability: 'stable' | 'moderate' | 'volatile' | 'unknown' = 'stable';
    if (volatilityScore > 50) liquidityStability = 'volatile';
    else if (volatilityScore > 30) liquidityStability = 'moderate';

    return {
      volatilityScore: Math.round(volatilityScore),
      trendDirection,
      volumeAnomalies: volumeSpikes,
      priceManipulationRisk: Math.round(priceManipulationRisk),
      liquidityStability,
      averageVolume: Math.round(totalVolume / ohlcvData.length),
      priceRange: {
        high: maxPrice,
        low: minPrice,
        range: maxPrice - minPrice
      }
    };
  }

  /**
   * Calculate total liquidity across all pools
   */
  async getTotalLiquidity(address: string): Promise<number> {
    const pools = await this.getTokenPools(address, 20);
    return pools.reduce((total, pool) => total + pool.tvlUsd, 0);
  }

  /**
   * Get token age in days (from oldest pool)
   */
  async getTokenAge(address: string): Promise<number> {
    const pools = await this.getTokenPools(address, 1);
    
    if (pools.length === 0 || !pools[0].createdAt) {
      return 0;
    }

    const now = new Date();
    const ageMs = now.getTime() - pools[0].createdAt.getTime();
    return Math.floor(ageMs / (1000 * 60 * 60 * 24));
  }
}