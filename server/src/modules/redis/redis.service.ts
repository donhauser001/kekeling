import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Redis 客户端类型（动态导入，避免未安装时出错）
// 注意：需要安装 redis 包：npm install redis
type RedisClientType = any;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;
  private isConnected = false;

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    const redisEnabled = this.configService.get<string>('REDIS_ENABLED') !== 'false';

    if (!redisEnabled) {
      this.logger.warn('Redis 未启用，将使用内存缓存');
      return;
    }

    try {
      // 动态导入 redis 库
      const { createClient } = await import('redis');
      this.client = createClient({
        url: redisUrl,
      }) as RedisClientType;

      this.client.on('error', (err: any) => {
        this.logger.error('Redis 连接错误:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Redis 连接成功');
        this.isConnected = true;
      });

      await this.client.connect();
      this.logger.log('Redis 服务已启动');
    } catch (error: any) {
      if (error.code === 'MODULE_NOT_FOUND') {
        this.logger.warn('Redis 库未安装，请运行: npm install redis');
        this.logger.warn('将使用内存缓存作为降级方案');
      } else {
        this.logger.error('Redis 初始化失败:', error);
        this.logger.warn('将使用内存缓存作为降级方案');
      }
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis 连接已关闭');
    }
  }

  /**
   * 检查 Redis 是否可用
   */
  isAvailable(): boolean {
    return this.client !== null && this.isConnected;
  }

  /**
   * 获取值
   */
  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      return await this.client!.get(key);
    } catch (error) {
      this.logger.error(`Redis GET 失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 设置值
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      if (ttlSeconds) {
        await this.client!.setEx(key, ttlSeconds, value);
      } else {
        await this.client!.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Redis SET 失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 删除键
   */
  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Redis DEL 失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 增加计数
   */
  async incr(key: string): Promise<number | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      return await this.client!.incr(key);
    } catch (error) {
      this.logger.error(`Redis INCR 失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 增加计数并设置过期时间
   */
  async incrWithExpire(key: string, ttlSeconds: number): Promise<number | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const result = await this.client!.incr(key);
      // 如果是第一次设置，设置过期时间
      if (result === 1) {
        await this.client!.expire(key, ttlSeconds);
      }
      return result;
    } catch (error) {
      this.logger.error(`Redis INCR+EXPIRE 失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 限流检查（滑动窗口）
   * @param key 限流键
   * @param limit 限制次数
   * @param windowSeconds 时间窗口（秒）
   * @returns true 表示允许，false 表示限流
   */
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    if (!this.isAvailable()) {
      // Redis 不可用时，降级为允许（避免影响业务）
      this.logger.debug(`Redis 不可用，限流检查通过: ${key}`);
      return true;
    }

    try {
      const now = Date.now();
      const windowStart = now - windowSeconds * 1000;
      const redisKey = `rate_limit:${key}`;

      // 使用滑动窗口算法
      // 1. 移除过期的记录
      await this.client!.zRemRangeByScore(redisKey, '0', windowStart.toString());

      // 2. 获取当前窗口内的请求数
      const count = await this.client!.zCard(redisKey);

      if (count >= limit) {
        this.logger.debug(`限流触发: ${key}, 当前: ${count}, 限制: ${limit}`);
        return false; // 超过限制
      }

      // 3. 添加当前请求
      await this.client!.zAdd(redisKey, {
        score: now,
        value: `${now}-${Math.random()}`,
      });

      // 4. 设置过期时间
      await this.client!.expire(redisKey, windowSeconds);

      return true; // 允许请求
    } catch (error: any) {
      this.logger.error(`Redis 限流检查失败: ${key}`, error);
      return true; // 出错时允许请求，避免影响业务
    }
  }

  /**
   * 获取限流剩余次数
   */
  async getRateLimitRemaining(key: string, limit: number, windowSeconds: number): Promise<number> {
    if (!this.isAvailable()) {
      return limit;
    }

    try {
      const now = Date.now();
      const windowStart = now - windowSeconds * 1000;
      const redisKey = `rate_limit:${key}`;

      await this.client!.zRemRangeByScore(redisKey, '0', windowStart.toString());
      const count = await this.client!.zCard(redisKey);

      return Math.max(0, limit - count);
    } catch (error: any) {
      this.logger.error(`Redis 获取限流剩余次数失败: ${key}`, error);
      return limit;
    }
  }
}
