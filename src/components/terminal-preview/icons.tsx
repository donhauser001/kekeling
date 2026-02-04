/**
 * 终端全局预览器图标映射
 *
 * 跨平台兼容：
 * - Web：使用 Icon primitive (iconfont)
 * - 小程序：使用 Icon primitive (iconfont)
 *
 * 统一使用 775 个 iconfont 图标
 */

import { Icon } from './ui/primitives'
import type { IconName } from '@/shared/types/icon'
import type { ServiceCategory } from './types'

/**
 * 图标名称映射（业务名称 / lucide 名称 -> iconfont 名称）
 *
 * 这个映射表用于：
 * 1. 将后台设置的图标名称转换为 iconfont 名称
 * 2. 将旧的 lucide 风格名称转换为 iconfont 名称
 */
const iconNameMap: Record<string, IconName> = {
  // === 中文业务名称映射 ===
  '陪诊服务': 'peoples',
  '陪诊': 'peoples',
  '代办服务': 'workbench',
  '代办': 'workbench',
  '全程陪诊': 'love-and-help',
  '检查陪同': 'detection',
  '住院陪护': 'hospital-bed',
  '代办挂号': 'appointment',
  '代取报告': 'checklist',
  '代办病历': 'medical-files',
  '特色服务': 'lightning',

  // === Lucide 图标名称映射 ===
  // 导航
  'home': 'home',
  'grid': 'grid-four',
  'file': 'file-text',
  'user': 'user',
  'users': 'peoples',

  // 操作
  'search': 'search',
  'plus': 'plus',
  'minus': 'reduce',
  'check': 'check',
  'x': 'close',

  // 方向
  'chevron-right': 'right',
  'chevron-left': 'left',
  'chevron-down': 'down',
  'chevron-up': 'up',
  'arrow-left': 'back',
  'arrow-right': 'arrow-circle-right',

  // 状态
  'alert': 'caution',
  'info': 'info',
  'star': 'stopwatch-start',
  'heart': 'heart',

  // 通讯
  'phone': 'phone-telephone',
  'map-pin': 'map-draw',
  'clock': 'time',
  'calendar': 'date-comes-back',
  'message-square': 'comment-one',

  // 设置
  'settings': 'setting',
  'logout': 'power',
  'edit': 'edit',
  'trash': 'delete',

  // 媒体
  'camera': 'camera',
  'image': 'pic',
  'upload': 'upload-one',
  'download': 'download',

  // 其他
  'refresh': 'refresh',
  'loader': 'loading-one',
  'eye': 'preview-open',
  'eye-off': 'preview-close-one',
  'lock': 'lock',
  'briefcase': 'workbench',
  'share': 'share-three',
  'more': 'more',

  // === 医疗图标映射 ===
  'stethoscope': 'stethoscope',
  'hospital': 'hospital',
  'pill': 'pill',
  'syringe': 'injection',
  'baby': 'baby',
  'bone': 'orthopedic',
  'brain': 'brain',
  'heart-pulse': 'heartbeat',
  'activity': 'ecg',
  'thermometer': 'thermometer-one',
  'clipboard': 'checklist',
  'ambulance': 'ambulance',
  'bed': 'hospital-bed',
  'bed-double': 'hospital-bed',
  'clipboard-list': 'checklist',
  'file-stack': 'file-collection',
  'flask-conical': 'experiment',

  // === 商业图标映射 ===
  'truck': 'ambulance',
  'building': 'bank',
  'sparkles': 'lightning',
  'file-text': 'file-text',
  'user-check': 'people-safe',
  'rocket': 'send',
  'bus': 'ambulance',
  'hotel': 'home',
  'shopping-bag': 'shopping-bag',
  'utensils': 'gift',
  'car': 'ambulance',

  // === 金融图标映射 ===
  'wallet': 'wallet',
  'credit-card': 'bank-card-one',
  'banknote': 'paper-money',
  'gift': 'gift',
  'coupon': 'coupon',

  // === 状态图标映射 ===
  'shield': 'shield',
  'check-circle': 'check-one',
  'thumbs-up': 'like',
  'award': 'medal-one',
  'crown': 'vip-one',
}

/**
 * 获取图标名称（转换为 iconfont 支持的名称）
 */
export function getIconName(name: string): IconName {
  // 先从映射表查找
  if (iconNameMap[name]) {
    return iconNameMap[name]
  }

  // 如果名称本身就是有效的 iconfont 名称，直接返回
  // 这里我们假设传入的名称可能已经是 iconfont 名称
  return name as IconName
}

type IconComponentType = React.ComponentType<{
  className?: string
  style?: React.CSSProperties
  size?: number
  color?: string
}>

function createIconComponent(iconName: IconName): IconComponentType {
  return function IconWrapper(props: {
    className?: string
    style?: React.CSSProperties
    size?: number
    color?: string
  }) {
    const { className, style, size = 24, color } = props
    return (
      <Icon
        name={iconName}
        size={size}
        color={color || (style?.color as string)}
        className={className}
        style={style}
      />
    )
  }
}

const iconComponentCache = new Map<string, IconComponentType>()

function getOrCreateIconComponent(name: string): IconComponentType {
  if (!iconComponentCache.has(name)) {
    const iconName = getIconName(name)
    iconComponentCache.set(name, createIconComponent(iconName))
  }
  return iconComponentCache.get(name)!
}

/**
 * 图标组件映射对象
 *
 * 使用 Proxy 实现动态获取图标组件
 *
 * 使用方式：
 * const IconComponent = iconMap['home']
 * <IconComponent size={24} color="#333" />
 */
export const iconMap: Record<string, IconComponentType> = new Proxy(
  {} as Record<string, IconComponentType>,
  {
    get(_target, prop: string) {
      return getOrCreateIconComponent(prop)
    },
  }
)

/**
 * 获取服务分类的图标组件
 */
export function getCategoryIcon(category: ServiceCategory): IconComponentType {
  const iconName = category.icon || category.name
  return getOrCreateIconComponent(iconName)
}
