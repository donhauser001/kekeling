import {
  Clock,
  CheckCircle,
  Loader2,
  XCircle,
  AlertCircle,
  Stethoscope,
  MessageSquare,
  Truck,
  Building,
} from 'lucide-react'
import { type OrderStatus } from './schema'

export const orderStatusTypes = new Map<OrderStatus, string>([
  ['pending', 'bg-yellow-100/50 text-yellow-700 dark:text-yellow-300 border-yellow-200'],
  ['accepted', 'bg-blue-100/50 text-blue-700 dark:text-blue-300 border-blue-200'],
  ['in_progress', 'bg-purple-100/50 text-purple-700 dark:text-purple-300 border-purple-200'],
  ['completed', 'bg-green-100/50 text-green-700 dark:text-green-300 border-green-200'],
  ['cancelled', 'bg-neutral-200/50 text-neutral-600 dark:text-neutral-400 border-neutral-300'],
  ['refunded', 'bg-red-100/50 text-red-700 dark:text-red-300 border-red-200'],
])

export const orderStatuses = [
  { label: '待接单', value: 'pending', icon: Clock },
  { label: '已接单', value: 'accepted', icon: CheckCircle },
  { label: '服务中', value: 'in_progress', icon: Loader2 },
  { label: '已完成', value: 'completed', icon: CheckCircle },
  { label: '已取消', value: 'cancelled', icon: XCircle },
  { label: '已退款', value: 'refunded', icon: AlertCircle },
] as const

export const serviceCategories = [
  { label: '陪诊服务', value: '陪诊服务', icon: Stethoscope },
  { label: '诊断服务', value: '诊断服务', icon: MessageSquare },
  { label: '跑腿服务', value: '跑腿服务', icon: Truck },
  { label: '酒店服务', value: '酒店服务', icon: Building },
] as const

