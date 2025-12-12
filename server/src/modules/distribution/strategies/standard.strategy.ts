import {
  IDistributionStrategy,
  DistributionContext,
  DistributionRateResult,
} from './distribution-strategy.interface';

/**
 * 标准三级分销策略
 *
 * 规则：
 * - L1（城市合伙人）：可获得 1-3 级下线的分润
 * - L2（团队长）：可获得 1-3 级下线的分润
 * - L3（普通陪诊员）：仅可获得直推奖励（relationLevel=1）
 */
export class StandardDistributionStrategy implements IDistributionStrategy {
  readonly name = 'standard';
  readonly description = '标准三级分销：L1/L2 全层级，L3 仅直推';

  calculateRate(context: DistributionContext): DistributionRateResult {
    const { beneficiaryLevel, relationLevel, config } = context;

    switch (beneficiaryLevel) {
      case 1: // 城市合伙人 - 所有层级都可获得
        return {
          rate: config.l1CommissionRate,
          shouldDistribute: true,
        };

      case 2: // 团队长 - 所有层级都可获得
        return {
          rate: config.l2CommissionRate,
          shouldDistribute: true,
        };

      case 3: // 普通陪诊员 - 仅直推
        if (relationLevel === 1) {
          return {
            rate: config.l3CommissionRate,
            shouldDistribute: true,
          };
        }
        return {
          rate: 0,
          shouldDistribute: false,
          skipReason: 'L3 级别仅可获得直推奖励',
        };

      default:
        return {
          rate: 0,
          shouldDistribute: false,
          skipReason: `未知的受益人等级: ${beneficiaryLevel}`,
        };
    }
  }
}

