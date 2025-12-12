/**
 * Mock 数据统一导出
 * 
 * 终端预览器所有 mock 数据的入口
 * 按模块组织：营销中心、工作台、分销中心
 */

// 辅助函数
export {
  getMockEmpty,
  getMockWithAmount,
  generateMockId,
  getMaskedPhone,
  getRelativeTime,
} from './_helpers'

// 营销中心 Mock
export {
  // 会员
  getMockMembershipData,
  getMockMembershipPlans,
  // 积分
  getMockPointsData,
  getMockPointsRecords,
  getMockPointsRecordsEmpty,
  // 邀请奖励
  getMockReferralInfo,
  // 活动
  getMockCampaigns,
  getMockCampaignDetail,
  // 优惠券
  getMockAvailableCoupons,
  getMockCouponsData,
  getMockCouponsEmpty,
  // 陪诊员列表
  getMockEscorts,
  getMockEscortDetail,
  // 类型
  type MembershipInfo,
  type MembershipPlan,
} from './marketing'

// 工作台 Mock
export {
  // 统计
  getMockWorkbenchStats,
  getMockWorkbenchSummary,
  // 订单池
  getMockOrdersPool,
  getMockOrdersPoolEmpty,
  // 收入
  getMockEarnings,
  getMockEarningsStats,
  getMockEarningsEmpty,
  // 提现
  getMockWithdrawInfo,
  getMockWithdrawStats,
  getMockWithdrawLargeAmount,
  getMockWithdrawZeroBalance,
  // 订单详情
  getMockWorkbenchOrderDetail,
  // 设置
  getMockWorkbenchSettings,
} from './workbench'

// 分销中心 Mock
export {
  // 统计
  getMockDistributionStats,
  getMockDistributionStatsZeroProgress,
  getMockDistributionStatsMaxLevel,
  // 团队成员
  getMockDistributionMembers,
  getMockDistributionMembersEmpty,
  // 分润记录
  getMockDistributionRecords,
  getMockDistributionRecordsEmpty,
  // 邀请
  getMockDistributionInvite,
  // 晋升
  getMockDistributionPromotion,
  getMockDistributionPromotionMaxLevel,
  getMockDistributionPromotionZeroProgress,
} from './distribution'

