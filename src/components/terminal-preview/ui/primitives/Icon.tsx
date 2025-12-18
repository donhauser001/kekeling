/**
 * 统一图标组件 - Web 实现
 *
 * 使用 iconfont 字体实现所有图标
 * 775 个图标，统一的图标系统
 *
 * ⚠️ 重要约束：
 * - 业务组件只允许通过 <Icon name="xxx"> 使用
 * - 禁止直接使用 iconfont class
 * - 图标名称必须使用 IconName 类型
 *
 * 使用方式：
 * import { Icon } from './primitives'
 * <Icon name="home" size={24} color="#333" />
 */

import { forwardRef } from 'react'
import type { IconName } from '@/shared/types/icon'
import { iconUnicodeMap } from '@/shared/constants/icon-unicode'
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

/**
 * Web 端图标组件 - 纯 iconfont 实现
 *
 * 所有图标均使用 iconfont 字体渲染
 * 支持 775 个图标
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { name, size = 24, color = 'currentColor', className = '', style },
  ref
) {
  const unicode = iconUnicodeMap[name]

  if (!unicode) {
    // 图标未定义，显示警告
    console.warn(`[Icon] 图标 "${name}" 未在 iconfont 中定义`)
    // 返回一个空的占位符
    return (
      <span
        ref={ref}
        className={className}
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        aria-hidden="true"
      />
    )
  }

  // 使用 span + iconfont CSS class 方式渲染（避免 <i> 标签在小程序中的问题）
  return (
    <span
      ref={ref}
      className={`iconfont icon-${name} ${className}`.trim()}
      style={{
        fontSize: size,
        color,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontStyle: 'normal',
        ...style,
      }}
      aria-hidden="true"
    />
  )
})
