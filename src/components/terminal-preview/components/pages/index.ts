/**
 * 页面组件导出
 */

export { ServicesPage } from './ServicesPage'
export { ServiceDetailPage } from './ServiceDetailPage'
export { CasesPage } from './CasesPage'
export { ProfilePage } from './ProfilePage'

// 营销中心页面（Step 5-9 新增）
export {
  CouponsPage,
  MembershipPage,
  MembershipPlansPage,
  PointsPage,
  PointsRecordsPage,
  ReferralsPage,
  CampaignsPage,
  CampaignDetailPage,
  CouponsAvailablePage,
} from './marketing'

// 陪诊员页面（Step 10 新增）
export { EscortListPage, EscortDetailPage } from './escort'

// 工作台页面（Step 11 + Step 7/7 新增）
export { WorkbenchPage, OrdersPoolPage, EarningsPage, WorkbenchEarningsPage, WithdrawPage, WorkbenchWithdrawPage, OrderDetailPage, WorkbenchSettingsPage } from './workbench'

// 分销中心页面（Step 11.3-11.5 新增）
export {
  DistributionPage,
  DistributionMembersPage,
  DistributionRecordsPage,
  DistributionInvitePage,
  DistributionPromotionPage,
} from './distribution'
