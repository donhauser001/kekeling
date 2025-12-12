import {
  IDistributionStrategy,
  DistributionContext,
  DistributionRateResult,
} from './distribution-strategy.interface';

/**
 * 扁平化分销策略
 *
 * 规则：
 * - 所有等级使用相同的费率（L2 费率）
 * - 所有等级都可以获得 1-3 级下线的分润
 * - 适用于简单的分销模型
 */
export class FlatDistributionStrategy implements IDistributionStrategy {
  readonly name = 'flat';
  readonly description = '扁平化分销：所有等级统一费率，全层级可分润';

  calculateRate(context: DistributionContext): DistributionRateResult {
    const { config } = context;

    // 使用 L2 费率作为统一费率
    return {
      rate: config.l2CommissionRate,
      shouldDistribute: true,
    };
  }
}

