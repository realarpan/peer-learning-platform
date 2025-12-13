/**
 * Database Query Caching Manager
 * Implements Redis-based caching for frequently accessed database queries
 */

import redis from 'redis';
import { promisify } from 'util';

interface CacheConfig {
  host: string;
  port: number;
  ttl: number; // Time to live in seconds
}

class CacheManager {
  private client: redis.RedisClient;
  private getAsync: (key: string) => Promise<string | null>;
  private setAsync: (key: string, value: string, ...args: any[]) => Promise<string>;
  private delAsync: (key: string) => Promise<number>;
  private ttl: number;

  constructor(config: CacheConfig) {
    this.client = redis.createClient({
      host: config.host || 'localhost',
      port: config.port || 6379,
    });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    this.ttl = config.ttl || 3600; // Default 1 hour

    this.client.on('error', (error) => {
      console.error('Redis error:', error);
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cachedValue = await this.getAsync(key);
      if (cachedValue) {
        return JSON.parse(cachedValue) as T;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const expiryTime = ttl || this.ttl;
      await this.setAsync(
        key,
        JSON.stringify(value),
        'EX',
        expiryTime
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.delAsync(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<void> {
    try {
      this.client.flushdb((error) => {
        if (error) console.error('Flush error:', error);
      });
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  /**
   * Close Redis connection
   */
  close(): void {
    this.client.quit();
  }
}

// Export singleton instance
const cacheManager = new CacheManager({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  ttl: parseInt(process.env.CACHE_TTL || '3600'),
});

export default cacheManager;
