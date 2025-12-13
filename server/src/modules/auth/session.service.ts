/**
 * Session 管理服务
 *
 * ⚠️ 安全修复（P1-12）：
 * - 实现会话联动失效机制
 * - 当用户修改密码/被禁用时，使所有会话失效
 *
 * 实现原理：
 * - 在 Redis 中存储会话版本号 session_version:{userId}
 * - JWT 签发时将版本号写入 payload
 * - JWT 验证时检查版本号是否匹配
 * - 修改密码/禁用用户时递增版本号
 *
 * @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P1-12
 */

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

/** Redis Key 前缀 */
const REDIS_KEYS = {
  /** 用户会话版本号 */
  USER_SESSION_VERSION: (userId: string) => `session_version:user:${userId}`,
  /** 管理员会话版本号 */
  ADMIN_SESSION_VERSION: (adminId: string) => `session_version:admin:${adminId}`,
};

/** 会话版本号 TTL（30 天） */
const SESSION_VERSION_TTL = 30 * 24 * 60 * 60;

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  /** 内存降级存储（Redis 不可用时） */
  private memoryStore = new Map<string, number>();

  constructor(private redis: RedisService) { }

  /**
   * 获取用户会话版本号
   */
  async getUserSessionVersion(userId: string): Promise<number> {
    const key = REDIS_KEYS.USER_SESSION_VERSION(userId);

    if (this.redis.isAvailable()) {
      const version = await this.redis.get(key);
      return version ? parseInt(version, 10) : 0;
    }

    // 降级到内存
    return this.memoryStore.get(key) || 0;
  }

  /**
   * 获取管理员会话版本号
   */
  async getAdminSessionVersion(adminId: string): Promise<number> {
    const key = REDIS_KEYS.ADMIN_SESSION_VERSION(adminId);

    if (this.redis.isAvailable()) {
      const version = await this.redis.get(key);
      return version ? parseInt(version, 10) : 0;
    }

    // 降级到内存
    return this.memoryStore.get(key) || 0;
  }

  /**
   * 使用户所有会话失效
   * 场景：修改密码、被禁用
   */
  async invalidateUserSessions(userId: string): Promise<void> {
    const key = REDIS_KEYS.USER_SESSION_VERSION(userId);

    if (this.redis.isAvailable()) {
      const newVersion = await this.redis.incrWithExpire(key, SESSION_VERSION_TTL);
      this.logger.log(
        `用户 ${userId} 会话已失效，新版本号: ${newVersion}`,
      );
    } else {
      // 降级到内存
      const current = this.memoryStore.get(key) || 0;
      this.memoryStore.set(key, current + 1);
      this.logger.warn(
        `Redis 不可用，用户 ${userId} 会话失效仅在当前实例生效`,
      );
    }
  }

  /**
   * 使管理员所有会话失效
   * 场景：修改密码、被禁用
   */
  async invalidateAdminSessions(adminId: string): Promise<void> {
    const key = REDIS_KEYS.ADMIN_SESSION_VERSION(adminId);

    if (this.redis.isAvailable()) {
      const newVersion = await this.redis.incrWithExpire(key, SESSION_VERSION_TTL);
      this.logger.log(
        `管理员 ${adminId} 会话已失效，新版本号: ${newVersion}`,
      );
    } else {
      // 降级到内存
      const current = this.memoryStore.get(key) || 0;
      this.memoryStore.set(key, current + 1);
      this.logger.warn(
        `Redis 不可用，管理员 ${adminId} 会话失效仅在当前实例生效`,
      );
    }
  }

  /**
   * 验证用户会话版本号
   * @returns true 表示有效，false 表示已失效
   */
  async validateUserSessionVersion(
    userId: string,
    tokenVersion: number,
  ): Promise<boolean> {
    const currentVersion = await this.getUserSessionVersion(userId);

    // 如果当前版本号大于 Token 中的版本号，说明会话已失效
    if (currentVersion > tokenVersion) {
      this.logger.debug(
        `用户 ${userId} 会话已失效：token=${tokenVersion}, current=${currentVersion}`,
      );
      return false;
    }

    return true;
  }

  /**
   * 验证管理员会话版本号
   * @returns true 表示有效，false 表示已失效
   */
  async validateAdminSessionVersion(
    adminId: string,
    tokenVersion: number,
  ): Promise<boolean> {
    const currentVersion = await this.getAdminSessionVersion(adminId);

    // 如果当前版本号大于 Token 中的版本号，说明会话已失效
    if (currentVersion > tokenVersion) {
      this.logger.debug(
        `管理员 ${adminId} 会话已失效：token=${tokenVersion}, current=${currentVersion}`,
      );
      return false;
    }

    return true;
  }
}

