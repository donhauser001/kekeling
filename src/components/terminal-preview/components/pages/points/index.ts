/**
 * 积分模块 - 导出
 */

// 主页面
export { PointsPage } from './PointsPage'

// 子组件
export { PointsCard } from './PointsCard'
export { CheckInCard } from './CheckInCard'
export { TaskItem } from './TaskItem'
export { RuleItem } from './RuleItem'
export { ErrorState } from './ErrorState'
export { PointsPageSkeleton } from './PointsPageSkeleton'

// 类型
export type {
  PointsPageProps,
  PointsCardProps,
  CheckInCardProps,
  TaskItemProps,
  RuleItemProps,
  ErrorStateProps,
  PointsPageSkeletonProps,
  PointsTask,
  PointsTaskStatus,
} from './types'

// 常量
export { wxScale, wxSafeAreaTop, adjustColor, getSourceLabel } from './constants'

