import { Injectable, Logger } from '@nestjs/common';
import {
  IDistributionStrategy,
  DistributionStrategyType,
} from './distribution-strategy.interface';
import { StandardDistributionStrategy } from './standard.strategy';
import { FlatDistributionStrategy } from './flat.strategy';
import { DirectOnlyDistributionStrategy } from './direct-only.strategy';

/**
 * 分润策略工厂
 *
 * 职责：
 * - 根据策略类型创建对应的策略实例
 * - 缓存策略实例，避免重复创建
 * - 提供策略列表查询
 */
@Injectable()
export class DistributionStrategyFactory {
  private readonly logger = new Logger(DistributionStrategyFactory.name);
  private readonly strategies = new Map<string, IDistributionStrategy>();

  constructor() {
    // 注册内置策略
    this.registerStrategy(new StandardDistributionStrategy());
    this.registerStrategy(new FlatDistributionStrategy());
    this.registerStrategy(new DirectOnlyDistributionStrategy());
  }

  /**
   * 注册策略
   */
  registerStrategy(strategy: IDistributionStrategy): void {
    this.strategies.set(strategy.name, strategy);
    this.logger.log(`已注册分润策略: ${strategy.name}`);
  }

  /**
   * 获取策略
   * @param type 策略类型
   * @returns 策略实例（未找到时返回默认策略）
   */
  getStrategy(type: DistributionStrategyType | string): IDistributionStrategy {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      this.logger.warn(`未找到策略 "${type}"，使用默认策略 "standard"`);
      return this.strategies.get(DistributionStrategyType.STANDARD)!;
    }

    return strategy;
  }

  /**
   * 获取所有可用策略
   */
  getAllStrategies(): Array<{ name: string; description: string }> {
    return Array.from(this.strategies.values()).map((s) => ({
      name: s.name,
      description: s.description,
    }));
  }

  /**
   * 检查策略是否存在
   */
  hasStrategy(type: string): boolean {
    return this.strategies.has(type);
  }
}

