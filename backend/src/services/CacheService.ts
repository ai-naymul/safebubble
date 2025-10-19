// src/services/CacheService.ts
import { createClient, RedisClientType } from 'redis';
import { config } from '../config/environment';

/**
 * Cache Service
 * Handles Redis caching to reduce API calls and improve performance
 */
export class CacheService {
  private client: RedisClientType;
  private readonly ttl: number;
  private connected: boolean = false;

  constructor() {
    this.client = createClient({
      url: config.cache.redisUrl
    });

    this.ttl = config.cache.ttlSeconds;

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.connected = true;
    });
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.disconnect();
      this.connected = false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.connected) return null;

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache GET error: ${error}`);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (!this.connected) return;

      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl || this.ttl, serialized);
    } catch (error) {
      console.error(`Cache SET error: ${error}`);
    }
  }

  /**
   * Set compressed value in cache with TTL
   */
  async setCompressed(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (!this.connected) return;

      const serialized = JSON.stringify(value);
      // Simple compression by removing unnecessary whitespace
      const compressed = serialized.replace(/\s+/g, ' ').trim();
      await this.client.setEx(key, ttl || this.ttl, compressed);
    } catch (error) {
      console.error(`Cache SET compressed error: ${error}`);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      if (!this.connected) return;
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache DELETE error: ${error}`);
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<void> {
    try {
      if (!this.connected) return;
      await this.client.flushAll();
    } catch (error) {
      console.error(`Cache CLEAR error: ${error}`);
    }
  }

  /**
   * Generate cache key for token
   */
  static tokenKey(mint: string): string {
    return `token:${mint}`;
  }

  /**
   * Generate cache key for trending tokens
   */
  static trendingKey(): string {
    return 'tokens:trending';
  }

}