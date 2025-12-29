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

export const ProfilePage = lazy(() =>
  import('./ProfilePage').then(m => ({ default: m.ProfilePage }))
)

export const UserOrdersPage = lazy(() =>
  import('./UserOrdersPage').then(m => ({ default: m.UserOrdersPage }))
)

export const UserOrderDetailPage = lazy(() =>
  import('./UserOrderDetailPage').then(m => ({ default: m.UserOrderDetailPage }))
)

export const OrderComplaintPage = lazy(() =>
  import('./OrderComplaintPage').then(m => ({ default: m.OrderComplaintPage }))
)

export const PatientsPage = lazy(() =>
  import('./PatientsPage').then(m => ({ default: m.PatientsPage }))
)

export const PatientEditPage = lazy(() =>
  import('./PatientEditPage').then(m => ({ default: m.PatientEditPage }))
)

export const CreateOrderPage = lazy(() =>
  import('./CreateOrderPage').then(m => ({ default: m.CreateOrderPage }))
)

export const CmsPageDetailPage = lazy(() =>
  import('./CmsPageDetailPage').then(m => ({ default: m.CmsPageDetailPage }))
)

export const HelpCenterPage = lazy(() =>
  import('./HelpCenterPage').then(m => ({ default: m.HelpCenterPage }))
)

export const ArticleDetailPage = lazy(() =>
  import('./ArticleDetailPage').then(m => ({ default: m.ArticleDetailPage }))
)

export const AddressListPage = lazy(() =>
  import('./AddressListPage').then(m => ({ default: m.AddressListPage }))
)

export const AddressEditPage = lazy(() =>
  import('./AddressEditPage').then(m => ({ default: m.AddressEditPage }))
)

export const UserProfileEditPage = lazy(() =>
  import('./UserProfileEditPage').then(m => ({ default: m.UserProfileEditPage }))
)

export const FeedbackPage = lazy(() =>
  import('./feedback').then(m => ({ default: m.FeedbackPage }))
)

export const SearchPage = lazy(() =>
  import('./SearchPage').then(m => ({ default: m.SearchPage }))
)

// ============================================================================
// 营销中心页面（9 个）
// ============================================================================

export const CouponsPage = lazy(() =>
  import('./marketing').then(m => ({ default: m.CouponsPage }))
)

export const MembershipPage = lazy(() =>
  import('./membership').then(m => ({ default: m.MembershipPage }))
)

export const MembershipPlansPage = lazy(() =>
  import('./marketing').then(m => ({ default: m.MembershipPlansPage }))
)

export const PointsPage = lazy(() =>
  import('./points').then(m => ({ default: m.PointsPage }))
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

export const EscortDetailPage = lazy(() =>
  import('./escort').then(m => ({ default: m.EscortDetailPage }))
)

export const EscortApplyPage = lazy(() =>
  import('./escort-apply').then(m => ({ default: m.EscortApplyPage }))
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

export const PoolOrderDetailPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.PoolOrderDetailPage }))
)

export const EscortOrderDetailPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.EscortOrderDetailPage }))
)

export const WorkbenchSettingsPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.WorkbenchSettingsPage }))
)

export const ServiceTypesPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.ServiceTypesPage }))
)

export const HospitalsSelectPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.HospitalsSelectPage }))
)

export const DepartmentsSelectPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.DepartmentsSelectPage }))
)

export const WorkingHoursPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.WorkingHoursPage }))
)

export const MyOrdersPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.MyOrdersPage }))
)

export const EscortProfileEditPage = lazy(() =>
  import('./workbench').then(m => ({ default: m.EscortProfileEditPage }))
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
