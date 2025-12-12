/**
 * 页面组件导出（懒加载版本）
 * 
 * Step 14.1-B.1: 所有页面组件使用 React.lazy() 实现懒加载
 * 减少首屏加载体积，按需加载页面代码
 */

import { lazy } from 'react'

// ============================================================================
// 基础页面（4 个）
// ============================================================================

export const ServicesPage = lazy(() =>
  import('./ServicesPage').then(m => ({ default: m.ServicesPage }))
)

export const ServiceDetailPage = lazy(() =>
  import('./ServiceDetailPage').then(m => ({ default: m.ServiceDetailPage }))
)

export const CasesPage = lazy(() =>
  import('./CasesPage').then(m => ({ default: m.CasesPage }))
)

export const ProfilePage = lazy(() =>
  import('./ProfilePage').then(m => ({ default: m.ProfilePage }))
)

// ============================================================================
// 营销中心页面（9 个）
// ============================================================================

export const CouponsPage = lazy(() =>
  import('./marketing').then(m => ({ default: m.CouponsPage }))
)

export const MembershipPage = lazy(() =>
  import('./marketing').then(m => ({ default: m.MembershipPage }))
)

export const MembershipPlansPage = lazy(() =>
  import('./marketing').then(m => ({ default: m.MembershipPlansPage }))
)

export const PointsPage = lazy(() =>
  import('./marketing').then(m => ({ default: m.PointsPage }))
)

export const PointsRecordsPage = lazy(() =>
  import('./marketing').then(m => ({ default: m.PointsRecordsPage }))
)

export const ReferralsPage = lazy(() =>
  import('./marketing').then(m => ({ default: m.ReferralsPage }))
)

export const CampaignsPage = lazy(() =>
  import('./marketing').then(m => ({ default: m.CampaignsPage }))
)

export const CampaignDetailPage = lazy(() =>
  import('./marketing').then(m => ({ default: m.CampaignDetailPage }))
)

export const CouponsAvailablePage = lazy(() =>
  import('./marketing').then(m => ({ default: m.CouponsAvailablePage }))
)

// ============================================================================
// 陪诊员页面（2 个）
// ============================================================================

export const EscortListPage = lazy(() =>
  import('./escort').then(m => ({ default: m.EscortListPage }))
)

export const EscortDetailPage = lazy(() =>
  import('./escort').then(m => ({ default: m.EscortDetailPage }))
)

// ============================================================================
// 工作台页面（8 个）
// ============================================================================

export const WorkbenchPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.WorkbenchPage }))
)

export const OrdersPoolPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.OrdersPoolPage }))
)

export const EarningsPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.EarningsPage }))
)

export const WorkbenchEarningsPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.WorkbenchEarningsPage }))
)

export const WithdrawPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.WithdrawPage }))
)

export const WorkbenchWithdrawPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.WorkbenchWithdrawPage }))
)

export const OrderDetailPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.OrderDetailPage }))
)

export const WorkbenchSettingsPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.WorkbenchSettingsPage }))
)

// ============================================================================
// 分销中心页面（5 个）
// ============================================================================

export const DistributionPage = lazy(() =>
  import('./distribution').then(m => ({ default: m.DistributionPage }))
)

export const DistributionMembersPage = lazy(() =>
  import('./distribution').then(m => ({ default: m.DistributionMembersPage }))
)

export const DistributionRecordsPage = lazy(() =>
  import('./distribution').then(m => ({ default: m.DistributionRecordsPage }))
)

export const DistributionInvitePage = lazy(() =>
  import('./distribution').then(m => ({ default: m.DistributionInvitePage }))
)

export const DistributionPromotionPage = lazy(() =>
  import('./distribution').then(m => ({ default: m.DistributionPromotionPage }))
)
