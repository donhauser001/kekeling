import {
  IDistributionStrategy,
  DistributionContext,
  DistributionRateResult,
} from './distribution-strategy.interface';

/**
 * 仅直推分销策略
 *
 * 规则：
 * - 只有直接上级（relationLevel=1）可以获得分润
 * - 不考虑受益人等级，统一使用 L2 费率
 * - 适用于单级分销模型
 */
export class DirectOnlyDistributionStrategy implements IDistributionStrategy {
  readonly name = 'direct_only';
  readonly description = '仅直推分销：只有直接上级可获得分润';

  calculateRate(context: DistributionContext): DistributionRateResult {
    const { relationLevel, config } = context;

    if (relationLevel === 1) {
      return {
        rate: config.l2CommissionRate,
        shouldDistribute: true,
      };
    }

    return {
      rate: 0,
      shouldDistribute: false,
      skipReason: '仅直推模式：非直接上级不参与分润',
    };
  }
}

