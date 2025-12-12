/**
 * 提现权限判断工具（P2）
 *
 * @see docs/资金安全提现体系/03-任务卡拆解.md - FE-WD-P2-04
 *
 * 权限矩阵：
 * | 权限代码 | 能力 | 建议角色 |
 * |----------|------|----------|
 * | withdraw.read | 查看列表/详情 | 客服、财务、运营 |
 * | withdraw.export | 导出 | 财务、运营 |
 * | withdraw.approve | 审核通过/驳回 | 风控主管、财务 |
 * | withdraw.payout | 执行打款 | 财务主管 |
 *
 * 核心规则：
 * - 无权限不渲染按钮（非 disabled）
 * - review: pending + review 权限
 * - payout: approved + payout 权限
 */

import type { AdminWithdrawStatus } from '@/lib/api'

export interface WithdrawPermissions {
  /** 查看列表/详情 */
  read: boolean
  /** 导出 */
  export: boolean
  /** 审核通过/驳回 */
  approve: boolean
  /** 执行打款 */
  payout: boolean
}

export type WithdrawActionType = 'review' | 'payout'

/**
 * 判断是否可以显示某个操作按钮
 *
 * 核心规则：
 * - review: pending + approve 权限
 * - payout: approved + payout 权限
 *
 * ❌ 禁止：灰色按钮
 * ✅ 正确：无权限直接不渲染
 */
export function canShowAction(
  status: AdminWithdrawStatus,
  permissions: WithdrawPermissions,
  action: WithdrawActionType
): boolean {
  if (action === 'review') {
    return status === 'pending' && permissions.approve
  }
  if (action === 'payout') {
    return status === 'approved' && permissions.payout
  }
  return false
}

/**
 * 从用户角色获取提现权限
 *
 * 角色权限矩阵：
 * | 角色 | read | export | approve | payout |
 * |------|:----:|:------:|:-------:|:------:|
 * | 客服 | ✅ | ❌ | ❌ | ❌ |
 * | 运营 | ✅ | ✅ | ❌ | ❌ |
 * | 财务 | ✅ | ✅ | ✅ | ❌ |
 * | 财务主管 | ✅ | ✅ | ✅ | ✅ |
 * | 超级管理员 | ✅ | ✅ | ✅ | ✅ |
 */
export function getPermissionsFromRole(role: string): WithdrawPermissions {
  switch (role) {
    case 'superadmin':
    case 'admin':
    case 'finance_manager':
      return {
        read: true,
        export: true,
        approve: true,
        payout: true,
      }
    case 'finance':
      return {
        read: true,
        export: true,
        approve: true,
        payout: false,
      }
    case 'ops':
    case 'operation':
      return {
        read: true,
        export: true,
        approve: false,
        payout: false,
      }
    case 'customer_service':
    case 'cs':
      return {
        read: true,
        export: false,
        approve: false,
        payout: false,
      }
    default:
      // 默认只读
      return {
        read: true,
        export: false,
        approve: false,
        payout: false,
      }
  }
}

/**
 * 状态是否为终态（不可再变更）
 */
export function isTerminalStatus(status: AdminWithdrawStatus): boolean {
  return ['completed', 'failed', 'rejected'].includes(status)
}

/**
 * 获取状态的下一步操作
 */
export function getNextAction(
  status: AdminWithdrawStatus,
  permissions: WithdrawPermissions
): WithdrawActionType | null {
  if (status === 'pending' && permissions.approve) {
    return 'review'
  }
  if (status === 'approved' && permissions.payout) {
    return 'payout'
  }
  return null
}
