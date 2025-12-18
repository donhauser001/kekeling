/**
 * 跨平台图标组件
 *
 * 混合方案：
 * - 基础图标：Material Icons（Google CDN）
 * - 医疗图标：iconfont（本地字体）
 *
 * ⚠️ 重要约束：
 * - 业务组件只允许通过 <Icon name="xxx"> 使用
 * - 禁止直接使用 iconfont class
 * - 禁止直接使用 lucide-react（小程序构建会报错）
 *
 * @see docs/终端预览器审计/跨平台图标系统技术方案.md
 */

import { forwardRef } from 'react'
import type { IconName } from '@/shared/types/icon'
import '@/shared/assets/iconfont/iconfont.css'

// 重新导出类型供外部使用
export type { IconName }

export interface IconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

// Material Icons 名称映射（IconName -> Material Icon 名称）
// 只有在这个 map 中的图标才会使用 Material Icons，其他都用 iconfont
const materialIconMap: Record<string, string> = {
  // 导航类
  'home': 'home',
  'grid': 'grid_view',
  'file': 'description',
  'user': 'person',

  // 操作类
  'search': 'search',
  'plus': 'add',
  'minus': 'remove',
  'check': 'check',
  'x': 'close',

  // 方向类
  'chevron-right': 'chevron_right',
  'chevron-left': 'chevron_left',
  'chevron-down': 'expand_more',
  'chevron-up': 'expand_less',
  'arrow-left': 'arrow_back',
  'arrow-right': 'arrow_forward',

  // 状态类
  'alert': 'warning',
  'info': 'info',
  'star': 'star',
  'heart': 'favorite',

  // 通讯类
  'phone': 'phone',
  'map-pin': 'location_on',
  'clock': 'schedule',
  'calendar': 'calendar_today',

  // 设置类
  'settings': 'settings',
  'logout': 'logout',
  'edit': 'edit',
  'trash': 'delete',

  // 媒体类
  'camera': 'photo_camera',
  'image': 'image',
  'upload': 'upload',
  'download': 'download',

  // 其他基础
  'refresh': 'refresh',
  'loader': 'sync',
  'eye': 'visibility',
  'eye-off': 'visibility_off',
  'lock': 'lock',
  'briefcase': 'work',
  'share': 'share',
  'more': 'more_horiz',

  // 医疗相关基础（也用 Material Icons）
  'favorite': 'favorite',
  'local_hospital': 'local_hospital',
  'medical_services': 'medical_services',
}

/**
 * Web 端图标组件 - 混合实现
 * 基础图标用 Material Icons，医疗图标用 iconfont
 */
export const Icon = forwardRef<HTMLElement, IconProps>(function Icon(
  { name, size = 24, color = 'currentColor', className = '', style },
  ref
) {
  const materialIconName = materialIconMap[name]

  // 如果是 Material Icons 中的基础图标
  if (materialIconName) {
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={`material-icons-outlined ${className}`.trim()}
        style={{
          fontSize: size,
          color,
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        aria-hidden="true"
      >
        {materialIconName}
      </span>
    )
  }

  // 否则使用 iconfont（医疗图标）
  return (
    <i
      ref={ref}
      className={`iconfont icon-${name} ${className}`.trim()}
      style={{
        fontSize: size,
        color,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      aria-hidden="true"
    />
  )
})
