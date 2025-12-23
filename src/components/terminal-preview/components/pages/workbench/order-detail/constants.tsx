/**
 * 订单详情页常量定义
 */

import { CheckCircle, MapPinned, Play, Flag } from '../../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../../platform/env'
import type { WorkbenchOrderDetail } from '../../../../api'
import type { ServiceStep } from './types'

// ============================================================================
// 缩放常量
// ============================================================================

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 状态颜色映射
// ============================================================================

export const STATUS_COLORS: Record<WorkbenchOrderDetail['status'], { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  accepted: { bg: '#dbeafe', text: '#2563eb' },
  ongoing: { bg: '#d1fae5', text: '#059669' },
  completed: { bg: '#e5e7eb', text: '#6b7280' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
}

// ============================================================================
// 服务流程步骤生成
// ============================================================================

export const getServiceSteps = (
  orderStatus: WorkbenchOrderDetail['status'],
  wxScale: number,
  primaryColor: string
): ServiceStep[] => {
  const iconSize = 18 * wxScale

  const steps: ServiceStep[] = [
    {
      key: 'accepted',
      title: '已接单',
      description: '订单已确认，请准时到达',
      status: 'pending',
      icon: <CheckCircle size={iconSize} color="#10b981" />,
    },
    {
      key: 'arrived',
      title: '确认到达',
      description: '到达医院后点击确认',
      status: 'pending',
      icon: <MapPinned size={iconSize} color={primaryColor} />,
    },
    {
      key: 'started',
      title: '开始服务',
      description: '见到客户后开始服务',
      status: 'pending',
      icon: <Play size={iconSize} color={primaryColor} />,
    },
    {
      key: 'completed',
      title: '完成服务',
      description: '服务结束后确认完成',
      status: 'pending',
      icon: <Flag size={iconSize} color={primaryColor} />,
    },
  ]

  // 根据订单状态更新步骤状态
  switch (orderStatus) {
    case 'accepted':
      steps[0].status = 'completed'
      steps[1].status = 'current'
      break
    case 'ongoing':
      steps[0].status = 'completed'
      steps[1].status = 'completed'
      steps[2].status = 'completed'
      steps[3].status = 'current'
      break
    case 'completed':
      steps.forEach(s => s.status = 'completed')
      break
    default:
      break
  }

  return steps
}

// ============================================================================
// 操作指引内容
// ============================================================================

export const getGuideContent = (orderStatus: WorkbenchOrderDetail['status']) => {
  switch (orderStatus) {
    case 'pending':
      return {
        title: '等待接单',
        tips: ['订单尚未被接单，请在订单池中抢单'],
      }
    case 'accepted':
      return {
        title: '服务准备',
        tips: [
          '请提前30分钟到达医院',
          '到达后点击"确认到达"按钮',
          '主动联系客户确认见面地点',
          '准备好工牌和相关证件',
        ],
      }
    case 'ongoing':
      return {
        title: '服务进行中',
        tips: [
          '全程陪同客户就诊',
          '协助客户挂号、缴费、取药等',
          '及时解答客户疑问',
          '服务结束后点击"完成服务"',
        ],
      }
    default:
      return null
  }
}

