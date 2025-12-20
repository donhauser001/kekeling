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
  /**
   * 图标名称
   * - 推荐使用 IconName 类型（775 个预定义图标）
   * - 也接受 string 类型以兼容动态场景，无效名称会显示空占位符
   */
  name: IconName | (string & {})
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Web 端图标组件 - Unicode 方式实现
 *
 * 使用 Unicode 字符渲染图标，与小程序端保持一致
 * 支持 775 个图标
 *
 * 渲染方式统一：Web 和小程序都使用 fontFamily + Unicode 字符
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { name, size = 24, color = 'currentColor', className = '', style },
  ref
) {
  const unicode = iconUnicodeMap[name as IconName]

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

  // 使用 Unicode 字符方式渲染（与小程序端保持一致）
  return (
    <span
      ref={ref}
      className={className}
      style={{
        fontFamily: 'iconfont',
        fontSize: size,
        color,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontStyle: 'normal',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        ...style,
      }}
      aria-hidden="true"
    >
      {unicode}
    </span>
  )
})
