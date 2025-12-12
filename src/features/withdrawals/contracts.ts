// src/features/withdrawals/contracts.ts
// Admin 资金域组件 Props 契约 v1.0
// 范围：陪诊员提现审核 / 打款（P2）
// 说明：
// - 无权限/状态不允许：不渲染按钮（不要用 disabled 模拟无权限）
// - disabled 仅用于"提交中"或"表单不满足约束"
// - 任何提交成功必须触发 onActionSuccess，外部负责 invalidateQueries
//
// 关联文档：docs/资金安全提现体系/05-前端组件规范.md

import type React from 'react'

/* =========================
 * 基础类型定义
 * ========================= */

export type WithdrawStatus =
  | 'pending'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'failed'

export type WithdrawPayoutMethod = 'manual' | 'channel'

export type WithdrawActionType = 'review' | 'payout'

export type ReviewDecision = 'approve' | 'reject'

export type WithdrawFailureCode =
  | 'RISK_REJECTED'
  | 'ACCOUNT_MISMATCH'
  | 'DUPLICATE_REQUEST'
  | 'INFO_INCOMPLETE'
  | 'CHANNEL_ERROR'
  | 'MANUAL_FAILED'
  | 'OTHER'

export interface AdminOperatorLite {
  id: string
  name: string
}

/* =========================
 * 核心数据结构
 * ========================= */

/** 列表项 / 详情基础结构（尽量与后端 DTO 对齐） */
export interface WithdrawRecord {
  id: string
  withdrawNo: string

  escortId: string
  escortName: string

  amount: number
  currency?: 'CNY'

  /** 账户信息：展示需脱敏 */
  account: {
    type: 'bank' | 'alipay' | 'wechat'
    accountName?: string
    accountNoMasked: string // e.g. ****6789 / 138****8888
    bankName?: string
  }

  status: WithdrawStatus

  /** 审核信息（可能为空） */
  reviewedAt?: string
  reviewedBy?: AdminOperatorLite
  reviewDecision?: ReviewDecision
  reviewReason?: string

  /** 打款信息（可能为空） */
  payoutMethod?: WithdrawPayoutMethod
  payoutTransactionId?: string
  payoutSubmittedAt?: string
  payoutCompletedAt?: string
  payoutBy?: AdminOperatorLite

  /** 失败信息（failed 时必须有） */
  failReason?: string
  failCode?: WithdrawFailureCode

  createdAt: string
  updatedAt: string
}

/** 操作日志（P1 详情抽屉 / P2 审计可共用） */
export type WithdrawLogAction =
  | 'CREATE'
  | 'REVIEW_APPROVE'
  | 'REVIEW_REJECT'
  | 'PAYOUT_SUBMIT'
  | 'PAYOUT_COMPLETE'
  | 'PAYOUT_FAIL'
  | 'STATUS_CHANGE'
  | 'NOTE'

export interface WithdrawOperationLog {
  id: string
  withdrawId: string
  action: WithdrawLogAction
  message: string
  operator?: AdminOperatorLite
  createdAt: string
  meta?: Record<string, unknown>
}

/* =========================
 * 权限与回调
 * ========================= */

/** Admin 权限集（你也可以替换为你们现有 RBAC 权限系统） */
export interface AdminWithdrawPermissions {
  view: boolean
  review: boolean
  payout: boolean
  export?: boolean
  audit?: boolean // 是否可查看完整审计信息
}

/** 成功回调的 payload：便于外层精准刷新与 toast */
export interface WithdrawActionSuccessPayload {
  action: WithdrawActionType
  withdrawId: string
  nextStatus: WithdrawStatus
  message?: string
}

/** 通用错误结构（可与 ApiError 映射） */
export interface AdminActionError {
  code?: string // e.g. 'FORBIDDEN' | 'CONFLICT' | 'VALIDATION'
  status?: number // http status
  message: string
  detail?: unknown
}

/* =========================
 * API 能力契约
 * ========================= */

/** 通用：操作函数契约（前端组件不关心请求细节，只调用这些能力） */
export interface WithdrawActionsApi {
  /**
   * 审核通过/驳回
   * - approve: 将 pending -> approved
   * - reject: 将 pending -> failed
   */
  reviewWithdraw: (args: {
    withdrawId: string
    decision: ReviewDecision
    reason?: string // reject 必填；approve 可选备注
  }) => Promise<WithdrawRecord>

  /**
   * 提交打款
   * - approved -> processing/completed（由后端决定）
   * - method=channel 时，transactionId 建议必填（规则由后端校验）
   */
  payoutWithdraw: (args: {
    withdrawId: string
    method: WithdrawPayoutMethod
    transactionId?: string
    note?: string
  }) => Promise<WithdrawRecord>

  /** 获取详情（抽屉打开时拉取最新状态） */
  getWithdrawRecord?: (withdrawId: string) => Promise<WithdrawRecord>

  /** 获取操作日志（P1/P2 均可用） */
  getWithdrawLogs?: (withdrawId: string) => Promise<WithdrawOperationLog[]>
}

/* =========================
 * UI Components Props
 * ========================= */

/** 顶部/底部操作区：根据 status+permissions 渲染按钮 */
export interface WithdrawActionBarProps {
  record: WithdrawRecord
  permissions: AdminWithdrawPermissions

  /** 能力注入：便于单测与替换实现 */
  actionsApi: WithdrawActionsApi

  /** 打开审核抽屉/打款确认框（也可由 ActionBar 内部管理 open 状态） */
  onOpenReview?: (withdrawId: string) => void
  onOpenPayout?: (withdrawId: string) => void

  /** 任意动作成功：外层统一 toast + invalidateQueries */
  onActionSuccess: (payload: WithdrawActionSuccessPayload) => void

  /** 任意动作失败：外层统一错误处理（可选） */
  onActionError?: (error: AdminActionError) => void

  /** UI 配置 */
  size?: 'sm' | 'md'
  align?: 'left' | 'right'
  className?: string
}

/** 审核入口按钮（用于列表行/详情页） */
export interface ReviewWithdrawButtonProps {
  record: Pick<WithdrawRecord, 'id' | 'status'>
  permissions: Pick<AdminWithdrawPermissions, 'review'>
  onClick: (withdrawId: string) => void
  /** 仅提交中可 disabled */
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/** 打款入口按钮（用于列表行/详情页） */
export interface PayoutWithdrawButtonProps {
  record: Pick<WithdrawRecord, 'id' | 'status'>
  permissions: Pick<AdminWithdrawPermissions, 'payout'>
  onClick: (withdrawId: string) => void
  /** 仅提交中可 disabled */
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/** 审核抽屉（approve/reject） */
export interface ReviewWithdrawDrawerProps {
  open: boolean
  withdrawId: string | null

  /** 详情数据可外部传入或内部自行 query（推荐外部传入，避免重复请求） */
  record?: WithdrawRecord

  permissions: AdminWithdrawPermissions
  actionsApi: WithdrawActionsApi

  /** 默认值（可选） */
  defaultDecision?: ReviewDecision
  defaultReason?: string

  onClose: () => void
  onSuccess: (payload: WithdrawActionSuccessPayload) => void
  onError?: (error: AdminActionError) => void

  /** 文案/展示开关 */
  showReadonlySummaryCard?: boolean // 默认 true
  showReasonPresets?: boolean // 默认 true
}

/** 审核表单值 */
export interface ReviewWithdrawFormValues {
  decision: ReviewDecision
  reason?: string
}

/** 打款确认 Modal（高危） */
export interface PayoutConfirmModalProps {
  open: boolean
  withdrawId: string | null
  record?: WithdrawRecord

  permissions: AdminWithdrawPermissions
  actionsApi: WithdrawActionsApi

  /** 高危确认：是否要求输入 CONFIRM（默认 true） */
  requireConfirmText?: boolean
  confirmText?: string // 默认 'CONFIRM'

  /** 打款方式默认值 */
  defaultMethod?: WithdrawPayoutMethod

  onClose: () => void
  onSuccess: (payload: WithdrawActionSuccessPayload) => void
  onError?: (error: AdminActionError) => void

  /** 是否展示交易号输入（P1/P2 可切换） */
  enableTransactionIdInput?: boolean
}

/** 打款表单值 */
export interface PayoutWithdrawFormValues {
  method: WithdrawPayoutMethod
  transactionId?: string
  note?: string
  confirmInput?: string // 用于匹配 CONFIRM
}

/** 详情抽屉（P1）：展示 failReason、交易号、操作日志 */
export interface WithdrawRecordDrawerProps {
  open: boolean
  withdrawId: string | null

  permissions: AdminWithdrawPermissions
  actionsApi: WithdrawActionsApi

  /** 外层若已取到详情，可直接传入 */
  record?: WithdrawRecord
  logs?: WithdrawOperationLog[]

  /** 复用动作条 */
  renderActions?: (ctx: {
    record: WithdrawRecord
    permissions: AdminWithdrawPermissions
  }) => React.ReactNode

  onClose: () => void
  onActionSuccess: (payload: WithdrawActionSuccessPayload) => void
  onActionError?: (error: AdminActionError) => void
}

/* =========================
 * 列表与导出
 * ========================= */

/** 列表筛选条件 */
export interface WithdrawRecordsFilters {
  status?: WithdrawStatus
  escortId?: string
  dateFrom?: string
  dateTo?: string
  keyword?: string // withdrawNo / escortName / accountNo
}

/** 列表页：提现记录列表（P0） */
export interface WithdrawRecordsTableProps {
  /** 数据来源可外部 query，再传入 */
  items: WithdrawRecord[]
  total: number
  loading?: boolean

  permissions: AdminWithdrawPermissions

  /** 行点击打开详情抽屉 */
  onRowClick?: (withdrawId: string) => void

  /** 列表操作：仅显示入口按钮，不在表格里直接提交高危动作 */
  onOpenReview?: (withdrawId: string) => void
  onOpenPayout?: (withdrawId: string) => void

  /** 过滤器（后端分页筛选） */
  filters?: WithdrawRecordsFilters
  onFiltersChange?: (filters: WithdrawRecordsFilters) => void

  /** 分页 */
  page: number
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
}

/** 导出按钮（P1） */
export interface WithdrawExportButtonProps {
  permissions: Pick<AdminWithdrawPermissions, 'export'>
  /** 传入当前过滤条件，后端导出同条件数据 */
  filters?: WithdrawRecordsFilters
  onExport: (args: {
    format: 'csv' | 'xlsx'
    filters?: WithdrawRecordsFilters
  }) => Promise<void>
  disabled?: boolean // 仅导出中
  loading?: boolean
  className?: string
}

/** 陪诊员详情页 Tab（P1）：复用列表 API，追加 escortId filter */
export interface EscortWithdrawRecordsTabProps {
  escortId: string
  permissions: AdminWithdrawPermissions
  /** 可选：复用 table 组件 */
  renderTable?: (props: WithdrawRecordsTableProps) => React.ReactNode
}

/* =========================
 * 工具函数类型
 * ========================= */

/**
 * 判断是否可以显示某个操作按钮
 * 核心规则：
 * - review: pending + review 权限
 * - payout: approved + payout 权限
 */
export function canShowAction(
  record: Pick<WithdrawRecord, 'status'>,
  permissions: AdminWithdrawPermissions,
  action: WithdrawActionType
): boolean {
  if (action === 'review') {
    return record.status === 'pending' && permissions.review
  }
  if (action === 'payout') {
    return record.status === 'approved' && permissions.payout
  }
  return false
}
