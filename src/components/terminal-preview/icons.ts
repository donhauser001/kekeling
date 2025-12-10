/**
 * 终端全局预览器图标映射
 */

import {
  Grid3X3,
  ClipboardList,
  Stethoscope,
  UserCheck,
  FileText,
  Hospital,
  Rocket,
  BedDouble,
  FileStack,
  Truck,
  MessageSquare,
  Building,
  Sparkles,
  Heart,
  Pill,
  Syringe,
  Baby,
  Eye,
  Bone,
  Brain,
  FlaskConical,
  Bus,
  Hotel,
  Star,
  ShoppingBag,
  Utensils,
  Car,
} from 'lucide-react'
import type { ServiceCategory } from './types'

// 图标映射 - 包含后台所有可选图标
export const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  // 中文名称映射
  '陪诊服务': UserCheck,
  '陪诊': UserCheck,
  '代办服务': Truck,
  '代办': Truck,
  '全程陪诊': Stethoscope,
  '检查陪同': FlaskConical,
  '住院陪护': BedDouble,
  '代办挂号': ClipboardList,
  '代取报告': FileText,
  '代办病历': FileStack,
  '诊断服务': MessageSquare,
  '酒店服务': Hotel,
  '特色服务': Sparkles,
  // 英文图标名称映射（与后台图标选项对应）
  'stethoscope': Stethoscope,
  'truck': Truck,
  'message-square': MessageSquare,
  'building': Building,
  'sparkles': Sparkles,
  'hospital': Hospital,
  'heart': Heart,
  'pill': Pill,
  'syringe': Syringe,
  'baby': Baby,
  'eye': Eye,
  'bone': Bone,
  'brain': Brain,
  'file-text': FileText,
  'user-check': UserCheck,
  'rocket': Rocket,
  'bed': BedDouble,
  'bed-double': BedDouble,
  'clipboard-list': ClipboardList,
  'file-stack': FileStack,
  'flask-conical': FlaskConical,
  'bus': Bus,
  'hotel': Hotel,
  'star': Star,
  'shopping-bag': ShoppingBag,
  'utensils': Utensils,
  'car': Car,
  'grid': Grid3X3,
}

// 获取分类图标组件
export function getCategoryIcon(category: ServiceCategory): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  const iconName = category.icon || category.name
  return iconMap[iconName] || Grid3X3
}
