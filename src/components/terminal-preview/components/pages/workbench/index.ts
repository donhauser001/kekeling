/**
 * 陪诊员工作台页面组件导出
 *
 * WorkbenchPage 已按小程序页面改造规范重构：
 * - 拆分为多个子组件（ProfileCard, TodayOverview, QuickEntries, IncomeOverview）
 * - 使用跨平台原语（Box, Text, Image）
 * - 使用 useState + useEffect 替代 useQuery
 * - 接入真实后端 API（/escort/stats, /escort/profile）
 *
 * @see docs/小程序页面改造规范.md
 */

// Step 11 - 工作台首页（已改造）
export { WorkbenchPage } from './WorkbenchPage'
export type { WorkbenchPageProps } from './types'

// 类型导出
export type {
  WorkbenchStatsData,
  EscortProfileData,
  EscortWorkStatus,
} from './types'

// Step 7/7 批次 A
export { OrdersPoolPage } from './OrdersPoolPage'
export type { OrdersPoolPageProps } from './OrdersPoolPage'

// 收入明细（API 版本）
export { EarningsPage } from './EarningsPage'
export type { EarningsPageProps } from './EarningsPage'

// 收入明细（Mock 数据版本）
export { WorkbenchEarningsPage } from './WorkbenchEarningsPage'
export type { WorkbenchEarningsPageProps } from './WorkbenchEarningsPage'

// 提现（API 版本）
export { WithdrawPage } from './WithdrawPage'
export type { WithdrawPageProps } from './WithdrawPage'

// 提现（Mock 数据版本）
export { WorkbenchWithdrawPage } from './WorkbenchWithdrawPage'
export type { WorkbenchWithdrawPageProps } from './WorkbenchWithdrawPage'

// 订单详情（旧版，可废弃）
export { OrderDetailPage } from './OrderDetailPage'
export type { OrderDetailPageProps } from './OrderDetailPage'

// 订单池订单详情（新架构）
export { PoolOrderDetailPage } from './PoolOrderDetailPage'
export type { PoolOrderDetailPageProps } from './PoolOrderDetailPage'

// 陪诊员已接订单详情（新架构）
export { EscortOrderDetailPage } from './EscortOrderDetailPage'
export type { EscortOrderDetailPageProps } from './EscortOrderDetailPage'

// 工作台设置（Step 13）
export { WorkbenchSettingsPage } from './WorkbenchSettingsPage'
export type { WorkbenchSettingsPageProps } from './WorkbenchSettingsPage'

// 服务项目选择
export { ServiceTypesPage } from './ServiceTypesPage'
export type { ServiceTypesPageProps } from './ServiceTypesPage'

// 服务医院选择
export { HospitalsSelectPage } from './HospitalsSelectPage'
export type { HospitalsSelectPageProps } from './HospitalsSelectPage'

// 擅长科室选择
export { DepartmentsSelectPage } from './DepartmentsSelectPage'
export type { DepartmentsSelectPageProps } from './DepartmentsSelectPage'

// 工作时间设置
export { WorkingHoursPage } from './WorkingHoursPage'
export type { WorkingHoursPageProps } from './WorkingHoursPage'

// 我的订单（Step 14.13 FIX-P3-01）
export { MyOrdersPage } from './MyOrdersPage'
export type { MyOrdersPageProps } from './MyOrdersPage'

// 陪诊员资料编辑页
export { EscortProfileEditPage } from './EscortProfileEditPage'
export type { EscortProfileEditPageProps, UserProfileForSync } from './escort-profile-edit'
