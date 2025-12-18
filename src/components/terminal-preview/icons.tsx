/**
 * 终端全局预览器图标映射
 *
 * 跨平台兼容：
 * - Web：使用 Icon primitive (iconfont)
 * - 小程序：使用 Icon primitive (iconfont)
 *
 * 对于 iconfont 中未定义的图标，返回默认图标
 */

import { Icon } from './ui/primitives'
import type { IconName } from './ui/primitives'
import type { ServiceCategory } from './types'

// 可用的图标名称（与 iconfont 同步）
const availableIcons: IconName[] = [
  // 基础图标
  'home', 'grid', 'file', 'user', 'search', 'plus', 'minus', 'check', 'x',
  'chevron-right', 'chevron-left', 'chevron-down', 'chevron-up',
  'alert', 'info', 'star', 'heart', 'phone', 'map-pin', 'clock', 'calendar',
  'settings', 'logout', 'edit', 'trash', 'camera', 'image', 'upload', 'download',
  'refresh', 'loader', 'eye', 'eye-off', 'lock', 'briefcase', 'share', 'more',
  'arrow-left', 'arrow-right',
  // 医疗图标
  'yiliao', 'yiliao1', 'wenyisheng', 'yiliaozixun',
  'sharpicons_ambulance', 'sharpicons_medical-sign', 'first-aid-kit-line', 'yaoxiangyiliao',
  'yiliaoyongpin', '-yiliao-zhushe', 'mazuike--',
  'bingli', 'bingan', 'tubiao_-',
  'ertongyule', 'ertongpiao',
  'xindiantu', 'xindiantu1', '-yiliao-xieyang',
  'tiwenji', 'thermometer-line',
  '-yiliao-ct', '-yiliao',
  'icon_yiliaoqixie',
  'bingdu', 'tubiao_-1',
  'yiliaoxian', 'tubiao_-2',
  'Heart', 'Hearts', 'empathize-line', 'Patch',
]

// 图标名称映射（lucide 名称 / 后台设置名称 -> iconfont 名称）
const iconNameMap: Record<string, IconName> = {
  // 中文名称映射
  '陪诊服务': 'user-folder',
  '陪诊': 'user-folder',
  '代办服务': 'briefcase',
  '代办': 'briefcase',
  '全程陪诊': 'empathize-line',
  '检查陪同': '-yiliao-ct',
  '住院陪护': 'kefangyongrenfangertongfang',
  '代办挂号': 'bingan',
  '代取报告': 'bingli',
  '代办病历': 'bingli',
  '诊断服务': 'wenyisheng',
  '酒店服务': 'star',
  '特色服务': 'star',

  // === 医疗专业图标映射（后台设置 -> iconfont）===
  // 听诊器/问诊
  'stethoscope': 'wenyisheng',       // 听诊器 -> 问医生

  // 医院/急救
  'hospital': 'sharpicons_medical-sign', // 医院 -> 医疗标志
  'ambulance': 'sharpicons_ambulance',   // 急救 -> 救护车

  // 药品/注射
  'pill': 'yiliaoyongpin',           // 药品 -> 医疗用品
  'syringe': '-yiliao-zhushe',       // 针管 -> 注射

  // 儿科
  'baby': 'ertongyule',              // 儿科 -> 儿童

  // 骨科/脑科
  'bone': 'yiliao',                  // 骨科 -> 医疗
  'brain': 'yiliao1',                // 脑科 -> 医疗

  // 眼科
  'eye': 'eye',                      // 眼科 -> 眼睛

  // 心电/体检
  'heart-pulse': 'xindiantu',        // 心电 -> 心电图
  'activity': '-yiliao-xieyang',     // 体检 -> 血氧

  // 体温
  'thermometer': 'tiwenji',          // 体温 -> 体温计

  // 病历
  'clipboard': 'bingli',             // 病历 -> 病历

  // === 通用图标映射 -> 医疗图标 ===
  // 将旧的通用图标名映射到新的医疗图标（向后兼容）
  'heart': 'Heart',              // 爱心 -> iconfont Heart
  'briefcase': 'filesync',       // 公文包 -> iconfont 文件同步
  'star': 'empathize-line',      // 星星 -> iconfont 关怀
  'user': 'user-folder',         // 用户 -> iconfont 用户档案
  'file': 'bingan',              // 文件 -> iconfont 病案
  'phone': 'yiliaozixun',        // 电话 -> iconfont 医疗咨询
  'map-pin': 'first-aid-kit-line', // 位置 -> iconfont 急救箱
  'clock': 'tubiao_-2',          // 时钟 -> iconfont 卡片
  'calendar': 'tubiao_-',        // 日历 -> iconfont 处方
  'grid': 'yiliao',              // 网格 -> iconfont 医疗

  // === 其他图标映射 ===
  'truck': 'briefcase',
  'message-square': 'yiliaozixun',
  'building': 'grid',
  'sparkles': 'star',
  'file-text': 'bingan',
  'user-check': 'user-folder',
  'rocket': 'star',
  'bed': 'kefangyongrenfangertongfang',
  'bed-double': 'kefangyongrenfangertongfang',
  'clipboard-list': 'bingli',
  'file-stack': 'filesync',
  'flask-conical': '-yiliao-ct',
  'bus': 'briefcase',
  'hotel': 'star',
  'shopping-bag': 'briefcase',
  'utensils': 'star',
  'car': 'briefcase',
}

/**
 * 获取图标名称（转换为 iconfont 支持的名称）
 */
export function getIconName(name: string): IconName {
  if (iconNameMap[name]) {
    return iconNameMap[name]
  }
  if (availableIcons.includes(name as IconName)) {
    return name as IconName
  }
  return 'grid'
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

export const iconMap: Record<string, IconComponentType> = new Proxy(
  {} as Record<string, IconComponentType>,
  {
    get(_target, prop: string) {
      return getOrCreateIconComponent(prop)
    },
  }
)

export function getCategoryIcon(category: ServiceCategory): IconComponentType {
  const iconName = category.icon || category.name
  return getOrCreateIconComponent(iconName)
}
