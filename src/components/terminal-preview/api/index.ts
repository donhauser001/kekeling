/**
 * 终端全局预览器 API
 *
 * ⚠️ 重要声明：
 * 本文件的 API 封装仅用于管理后台预览器。
 *
 * 双通道规范（Step 2 实现）：
 * - userRequest: 用户通道，携带 userToken，用于用户端功能
 * - escortRequest: 陪诊员通道，携带 escortToken，用于陪诊员工作台
 *
 * 强制规则：
 * - 陪诊员 API（/escort-app/**）禁止走 userRequest
 * - 用户 API 禁止走 escortRequest
 * - mock token（以 'mock-' 开头）不允许调真实后端
 *
 * 平台适配（Task 3）：
 * - 使用 platformRequest 替代 fetch，支持小程序环境
 * - 业务层代码无需感知运行环境差异
 *
 * @see src/components/terminal-preview/DEV_NOTES.md
 * @see docs/终端预览器集成/02-双身份会话与视角切换规格.md
 */

// Re-export types from api/types.ts
export * from './types'

// Re-export request utilities
export {
  userRequest,
  escortRequest,
  request,
  ApiError,
  ChannelMismatchError,
  getUserToken,
  getEscortToken,
  clearEscortToken,
  getApiUrl,
  type RequestOptions,
} from './request'

// Import all user API functions
import * as userApi from './user-api'

// Import all escort API functions
import * as escortApi from './escort-api'

// ============================================================================
// 预览器 API 集合
// ============================================================================

/**
 * 预览器 API 集合
 *
 * 通道划分规则：
 * - User Channel (userRequest): 用户端功能，包括首页、服务、营销中心、陪诊员公开信息
 * - Escort Channel (escortRequest): 陪诊员工作台功能，必须 escortToken
 *
 * ⚠️ 强制约束：
 * - /escort-app/** 接口必须走 escortRequest
 * - 其他接口走 userRequest
 */
export const previewApi = {
  // ==========================================================================
  // User Channel（用户通道）
  // ==========================================================================

  // 主题与首页
  getThemeSettings: userApi.getThemeSettings,
  getHomePageSettings: userApi.getHomePageSettings,
  getBanners: userApi.getBanners,
  getStats: userApi.getStats,

  // 用户资料
  getUserProfile: userApi.getUserProfile,
  updateUserProfile: userApi.updateUserProfile,

  // CMS 页面
  getCmsPageBySlug: userApi.getCmsPageBySlug,
  getArticlesByCategory: userApi.getArticlesByCategory,
  getArticleBySlug: userApi.getArticleBySlug,
  getArticleById: userApi.getArticleById,

  // 地址管理
  getAddresses: userApi.getAddresses,
  getDefaultAddress: userApi.getDefaultAddress,
  createAddress: userApi.createAddress,
  updateAddress: userApi.updateAddress,
  deleteAddress: userApi.deleteAddress,
  setDefaultAddress: userApi.setDefaultAddress,

  // 服务
  getCategories: userApi.getCategories,
  getRecommendedServices: userApi.getRecommendedServices,
  getServices: userApi.getServices,
  getServiceDetail: userApi.getServiceDetail,

  // 营销中心
  getMyCoupons: userApi.getMyCoupons,
  getMyMembership: userApi.getMyMembership,
  getMembershipPlans: userApi.getMembershipPlans,
  getMyPoints: userApi.getMyPoints,
  getPointsRecords: userApi.getPointsRecords,
  getReferralInfo: userApi.getReferralInfo,
  getCampaigns: userApi.getCampaigns,
  getCampaignDetail: userApi.getCampaignDetail,
  getAvailableCoupons: userApi.getAvailableCoupons,

  // 陪诊员公开信息
  getEscorts: userApi.getEscorts,
  getEscortDetail: userApi.getEscortDetail,

  // 订单投诉
  submitComplaint: userApi.submitComplaint,

  // 陪诊员申请
  sendEscortApplyVerifyCode: userApi.sendEscortApplyVerifyCode,
  verifyEscortApplySmsCode: userApi.verifyEscortApplySmsCode,
  getMyEscortApplication: userApi.getMyEscortApplication,
  submitEscortApplication: userApi.submitEscortApplication,
  validateEscortInviteCode: userApi.validateEscortInviteCode,

  // 小程序设置
  getMiniappSettings: userApi.getMiniappSettings,
  devModeAutoLogin: userApi.devModeAutoLogin,

  // ==========================================================================
  // Escort Channel（陪诊员通道）
  // ⚠️ 以下接口必须走 escortRequest，禁止走 userRequest
  // ==========================================================================

  // Token 验证
  verifyEscortToken: escortApi.verifyEscortToken,

  // 工作台统计
  getWorkbenchStats: escortApi.getWorkbenchStats,
  getWorkbenchSummary: escortApi.getWorkbenchSummary,

  // 订单
  getWorkbenchOrdersPool: escortApi.getWorkbenchOrdersPool,
  getMyOrders: escortApi.getMyOrders,
  getWorkbenchOrderDetail: escortApi.getWorkbenchOrderDetail,

  // 收入
  getWorkbenchEarnings: escortApi.getWorkbenchEarnings,
  getEarningsStats: escortApi.getEarningsStats,

  // 提现
  getWorkbenchWithdrawInfo: escortApi.getWorkbenchWithdrawInfo,
  getWithdrawStats: escortApi.getWithdrawStats,

  // 设置与资料
  getWorkbenchSettings: escortApi.getWorkbenchSettings,
  updateWorkbenchSettings: escortApi.updateWorkbenchSettings,
  getEscortProfile: escortApi.getEscortProfile,
  updateEscortProfile: escortApi.updateEscortProfile,

  // 分销中心
  getDistributionStats: escortApi.getDistributionStats,
  getDistributionMembers: escortApi.getDistributionMembers,
  getDistributionRecords: escortApi.getDistributionRecords,
  getDistributionInviteCode: escortApi.getDistributionInviteCode,
  getDistributionPromotion: escortApi.getDistributionPromotion,
}
