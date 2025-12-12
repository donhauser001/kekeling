# Admin 资金域组件 Props 契约

> **版本**: v1.0  
> **适用范围**: 陪诊员提现审核/打款（P2）  
> **代码位置**: `src/features/withdrawals/contracts.ts`  
> **关联文档**: [05-前端组件规范.md](./05-前端组件规范.md) · [03-任务卡拆解.md](./03-任务卡拆解.md)

---

## 设计原则

| 原则 | 说明 |
|------|------|
| **无权限/状态不允许** | 不渲染按钮（不要用 disabled 模拟无权限） |
| **disabled 仅限** | "提交中"或"表单不满足约束" |
| **成功回调** | 任何提交成功必须触发 `onActionSuccess`，外部负责 `invalidateQueries` |

---

## 1. 基础类型定义

### 状态枚举

```typescript
export type WithdrawStatus =
  | 'pending'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'failed'

export type WithdrawPayoutMethod = 'manual' | 'channel'

export type WithdrawActionType = 'review' | 'payout'

export type ReviewDecision = 'approve' | 'reject'
```

### 失败码枚举

```typescript
export type WithdrawFailureCode =
  | 'RISK_REJECTED'      // 风控拒绝
  | 'ACCOUNT_MISMATCH'   // 账户信息不匹配
  | 'DUPLICATE_REQUEST'  // 重复提现
  | 'INFO_INCOMPLETE'    // 资料不完整
  | 'CHANNEL_ERROR'      // 渠道错误
  | 'MANUAL_FAILED'      // 人工拒绝
  | 'OTHER'              // 其他
```

### 操作人简略信息

```typescript
export interface AdminOperatorLite {
  id: string
  name: string
}
```

---

## 2. 核心数据结构

### WithdrawRecord（提现记录）

```typescript
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
```

### WithdrawOperationLog（操作日志）

```typescript
export type WithdrawLogAction =
  | 'CREATE'          // 创建
  | 'REVIEW_APPROVE'  // 审核通过
  | 'REVIEW_REJECT'   // 审核驳回
  | 'PAYOUT_SUBMIT'   // 提交打款
  | 'PAYOUT_COMPLETE' // 打款完成
  | 'PAYOUT_FAIL'     // 打款失败
  | 'STATUS_CHANGE'   // 状态变更
  | 'NOTE'            // 备注

export interface WithdrawOperationLog {
  id: string
  withdrawId: string
  action: WithdrawLogAction
  message: string
  operator?: AdminOperatorLite
  createdAt: string
  meta?: Record<string, unknown>
}
```

---

## 3. 权限与回调

### AdminWithdrawPermissions

```typescript
export interface AdminWithdrawPermissions {
  view: boolean    // 查看列表/详情
  review: boolean  // 审核通过/驳回
  payout: boolean  // 执行打款
  export?: boolean // 导出
  audit?: boolean  // 查看完整审计信息
}
```

### WithdrawActionSuccessPayload

```typescript
/** 成功回调的 payload：便于外层精准刷新与 toast */
export interface WithdrawActionSuccessPayload {
  action: WithdrawActionType
  withdrawId: string
  nextStatus: WithdrawStatus
  message?: string
}
```

### AdminActionError

```typescript
/** 通用错误结构（可与 ApiError 映射） */
export interface AdminActionError {
  code?: string    // e.g. 'FORBIDDEN' | 'CONFLICT' | 'VALIDATION'
  status?: number  // http status
  message: string
  detail?: unknown
}
```

---

## 4. API 能力契约

```typescript
export interface WithdrawActionsApi {
  /**
   * 审核通过/驳回
   * - approve: pending -> approved
   * - reject: pending -> failed
   */
  reviewWithdraw: (args: {
    withdrawId: string
    decision: ReviewDecision
    reason?: string // reject 必填；approve 可选备注
  }) => Promise<WithdrawRecord>

  /**
   * 提交打款
   * - approved -> processing/completed（由后端决定）
   * - method=channel 时，transactionId 建议必填
   */
  payoutWithdraw: (args: {
    withdrawId: string
    method: WithdrawPayoutMethod
    transactionId?: string
    note?: string
  }) => Promise<WithdrawRecord>

  /** 获取详情 */
  getWithdrawRecord?: (withdrawId: string) => Promise<WithdrawRecord>

  /** 获取操作日志 */
  getWithdrawLogs?: (withdrawId: string) => Promise<WithdrawOperationLog[]>
}
```

---

## 5. UI 组件 Props

### WithdrawActionBar（操作区）

```typescript
export interface WithdrawActionBarProps {
  record: WithdrawRecord
  permissions: AdminWithdrawPermissions
  actionsApi: WithdrawActionsApi

  onOpenReview?: (withdrawId: string) => void
  onOpenPayout?: (withdrawId: string) => void

  onActionSuccess: (payload: WithdrawActionSuccessPayload) => void
  onActionError?: (error: AdminActionError) => void

  size?: 'sm' | 'md'
  align?: 'left' | 'right'
  className?: string
}
```

### ReviewWithdrawButtonProps（审核按钮）

```typescript
export interface ReviewWithdrawButtonProps {
  record: Pick<WithdrawRecord, 'id' | 'status'>
  permissions: Pick<AdminWithdrawPermissions, 'review'>
  onClick: (withdrawId: string) => void
  disabled?: boolean  // 仅提交中可 disabled
  loading?: boolean
  size?: 'sm' | 'md'
  className?: string
}
```

### PayoutWithdrawButtonProps（打款按钮）

```typescript
export interface PayoutWithdrawButtonProps {
  record: Pick<WithdrawRecord, 'id' | 'status'>
  permissions: Pick<AdminWithdrawPermissions, 'payout'>
  onClick: (withdrawId: string) => void
  disabled?: boolean  // 仅提交中可 disabled
  loading?: boolean
  size?: 'sm' | 'md'
  className?: string
}
```

### ReviewWithdrawDrawerProps（审核抽屉）

```typescript
export interface ReviewWithdrawDrawerProps {
  open: boolean
  withdrawId: string | null
  record?: WithdrawRecord

  permissions: AdminWithdrawPermissions
  actionsApi: WithdrawActionsApi

  defaultDecision?: ReviewDecision
  defaultReason?: string

  onClose: () => void
  onSuccess: (payload: WithdrawActionSuccessPayload) => void
  onError?: (error: AdminActionError) => void

  showReadonlySummaryCard?: boolean // 默认 true
  showReasonPresets?: boolean       // 默认 true
}
```

### PayoutConfirmModalProps（打款 Modal）

```typescript
export interface PayoutConfirmModalProps {
  open: boolean
  withdrawId: string | null
  record?: WithdrawRecord

  permissions: AdminWithdrawPermissions
  actionsApi: WithdrawActionsApi

  requireConfirmText?: boolean  // 默认 true
  confirmText?: string          // 默认 'CONFIRM'
  defaultMethod?: WithdrawPayoutMethod

  onClose: () => void
  onSuccess: (payload: WithdrawActionSuccessPayload) => void
  onError?: (error: AdminActionError) => void

  enableTransactionIdInput?: boolean
}
```

### WithdrawRecordDrawerProps（详情抽屉）

```typescript
export interface WithdrawRecordDrawerProps {
  open: boolean
  withdrawId: string | null

  permissions: AdminWithdrawPermissions
  actionsApi: WithdrawActionsApi

  record?: WithdrawRecord
  logs?: WithdrawOperationLog[]

  renderActions?: (ctx: {
    record: WithdrawRecord
    permissions: AdminWithdrawPermissions
  }) => React.ReactNode

  onClose: () => void
  onActionSuccess: (payload: WithdrawActionSuccessPayload) => void
  onActionError?: (error: AdminActionError) => void
}
```

---

## 6. 列表与导出

### WithdrawRecordsFilters

```typescript
export interface WithdrawRecordsFilters {
  status?: WithdrawStatus
  escortId?: string
  dateFrom?: string
  dateTo?: string
  keyword?: string // withdrawNo / escortName / accountNo
}
```

### WithdrawRecordsTableProps

```typescript
export interface WithdrawRecordsTableProps {
  items: WithdrawRecord[]
  total: number
  loading?: boolean

  permissions: AdminWithdrawPermissions

  onRowClick?: (withdrawId: string) => void
  onOpenReview?: (withdrawId: string) => void
  onOpenPayout?: (withdrawId: string) => void

  filters?: WithdrawRecordsFilters
  onFiltersChange?: (filters: WithdrawRecordsFilters) => void

  page: number
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
}
```

### WithdrawExportButtonProps

```typescript
export interface WithdrawExportButtonProps {
  permissions: Pick<AdminWithdrawPermissions, 'export'>
  filters?: WithdrawRecordsFilters
  onExport: (args: {
    format: 'csv' | 'xlsx'
    filters?: WithdrawRecordsFilters
  }) => Promise<void>
  disabled?: boolean
  loading?: boolean
  className?: string
}
```

### EscortWithdrawRecordsTabProps

```typescript
export interface EscortWithdrawRecordsTabProps {
  escortId: string
  permissions: AdminWithdrawPermissions
  renderTable?: (props: WithdrawRecordsTableProps) => React.ReactNode
}
```

---

## 7. 工具函数

### canShowAction

```typescript
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
```

### 使用示例

```typescript
// 在组件中使用
{canShowAction(record, permissions, 'review') && (
  <ReviewWithdrawButton
    record={record}
    permissions={permissions}
    onClick={handleOpenReview}
  />
)}

{canShowAction(record, permissions, 'payout') && (
  <PayoutWithdrawButton
    record={record}
    permissions={permissions}
    onClick={handleOpenPayout}
  />
)}
```

---

## 8. 表单值类型

### ReviewWithdrawFormValues

```typescript
export interface ReviewWithdrawFormValues {
  decision: ReviewDecision
  reason?: string
}
```

### PayoutWithdrawFormValues

```typescript
export interface PayoutWithdrawFormValues {
  method: WithdrawPayoutMethod
  transactionId?: string
  note?: string
  confirmInput?: string // 用于匹配 CONFIRM
}
```

---

## 附录：组件与 Props 对应表

| 组件 | Props 接口 | 说明 |
|------|------------|------|
| `WithdrawActionBar` | `WithdrawActionBarProps` | 操作区容器 |
| `ReviewWithdrawButton` | `ReviewWithdrawButtonProps` | 审核入口按钮 |
| `PayoutWithdrawButton` | `PayoutWithdrawButtonProps` | 打款入口按钮 |
| `ReviewWithdrawDrawer` | `ReviewWithdrawDrawerProps` | 审核抽屉 |
| `PayoutConfirmModal` | `PayoutConfirmModalProps` | 打款确认 Modal |
| `WithdrawRecordDrawer` | `WithdrawRecordDrawerProps` | 详情抽屉 |
| `WithdrawRecordsTable` | `WithdrawRecordsTableProps` | 提现记录列表 |
| `WithdrawExportButton` | `WithdrawExportButtonProps` | 导出按钮 |
| `EscortWithdrawRecordsTab` | `EscortWithdrawRecordsTabProps` | 陪诊员详情页 Tab |
