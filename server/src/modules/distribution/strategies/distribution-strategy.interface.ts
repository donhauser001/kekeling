/**
 * 分润策略接口
 *
 * 策略模式：将分润规则抽象为可配置的策略
 * 支持动态切换分润模型，无需修改核心代码
 */

/**
 * 分润计算上下文
 */
export interface DistributionContext {
  /** 订单金额（分） */
  orderAmountCents: number;
  /** 受益人等级（1=城市合伙人, 2=团队长, 3=普通陪诊员） */
  beneficiaryLevel: number;
  /** 与订单来源的关系层级（1=直接上级, 2=二级, 3=三级） */
  relationLevel: number;
  /** 分润配置 */
  config: DistributionRateConfig;
}

/**
 * 分润费率配置（从数据库读取）
 */
export interface DistributionRateConfig {
  l1CommissionRate: number; // 城市合伙人费率 (%)
  l2CommissionRate: number; // 团队长费率 (%)
  l3CommissionRate: number; // 普通陪诊员费率 (%)
}

/**
 * 分润计算结果
 */
export interface DistributionRateResult {
  /** 分润比例 (%) */
  rate: number;
  /** 是否应该分润 */
  shouldDistribute: boolean;
  /** 跳过原因（如果不分润） */
  skipReason?: string;
}

/**
 * 分润策略接口
 */
export interface IDistributionStrategy {
  /** 策略名称 */
  readonly name: string;

  /** 策略描述 */
  readonly description: string;

  /**
   * 计算分润比例
   * @param context 分润上下文
   * @returns 分润结果
   */
  calculateRate(context: DistributionContext): DistributionRateResult;
}

/**
 * 策略类型枚举
 */
export enum DistributionStrategyType {
  /** 标准三级分销（默认） */
  STANDARD = 'standard',
  /** 扁平化分销（所有层级统一费率） */
  FLAT = 'flat',
  /** 仅直推分销（只有直接上级获得分润） */
  DIRECT_ONLY = 'direct_only',
  /** 自定义规则（从数据库读取完整规则矩阵） */
  CUSTOM = 'custom',
}

