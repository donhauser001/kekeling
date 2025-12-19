/**
 * 跨宿主原语组件 - 类型定义
 *
 * 统一定义 Web 和小程序环境下的组件 Props 接口
 * 业务层通过这些类型使用原语组件，无需关心底层实现
 *
 * @see docs/终端预览器审计/小程序组件适配改造计划.md
 */

import type { CSSProperties, ReactNode, MouseEvent, KeyboardEvent, UIEvent, TouchEvent } from 'react'

// ============================================================================
// Box 组件（容器）
// ============================================================================

/** Box 组件 Props - 对应 div/View */
export interface BoxProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: (e: MouseEvent) => void
  onKeyDown?: (e: KeyboardEvent) => void
  /** 鼠标事件（Web 端支持，小程序端忽略） */
  onMouseDown?: (e: MouseEvent) => void
  onMouseMove?: (e: MouseEvent) => void
  onMouseUp?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
  /** 触摸事件（Web 和小程序均支持） */
  onTouchStart?: (e: TouchEvent) => void
  onTouchMove?: (e: TouchEvent) => void
  onTouchEnd?: (e: TouchEvent) => void
  onTouchCancel?: (e: TouchEvent) => void
  /** 滚动事件 */
  onScroll?: (e: UIEvent<HTMLDivElement>) => void
  /** 无障碍角色 */
  role?: string
  'aria-label'?: string
  'aria-selected'?: boolean
  'aria-hidden'?: boolean
  tabIndex?: number
  /** 数据属性 */
  'data-testid'?: string
}

// ============================================================================
// Text 组件（文本）
// ============================================================================

/** Text 组件 Props - 对应 span/Text */
export interface TextProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  'aria-hidden'?: boolean
  /** 数据属性 */
  'data-testid'?: string
}

// ============================================================================
// Button 组件
// ============================================================================

/** Button 组件 Props - 对应 button/Button */
export interface ButtonProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: (e: MouseEvent) => void
  onKeyDown?: (e: KeyboardEvent) => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  /** 无障碍属性 */
  role?: string
  'aria-label'?: string
  'aria-selected'?: boolean
  tabIndex?: number
  /** 数据属性 */
  'data-testid'?: string
}

// ============================================================================
// Image 组件
// ============================================================================

/** Image 组件 Props - 对应 img/Image */
export interface ImageProps {
  src: string
  alt?: string
  className?: string
  style?: CSSProperties
  /**
   * 图片裁剪模式（小程序特有，Web 端转换为 object-fit）
   * - aspectFit: 保持宽高比缩放，完整显示
   * - aspectFill: 保持宽高比缩放，填充容器
   * - widthFix: 宽度不变，高度自动
   * - heightFix: 高度不变，宽度自动
   */
  mode?: 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'scaleToFill'
  onLoad?: () => void
  onError?: () => void
  /** 懒加载 */
  lazyLoad?: boolean
  /** 数据属性 */
  'data-testid'?: string
}

// ============================================================================
// Input 组件
// ============================================================================

/** Input 组件 Props - 对应 input/Input */
export interface InputProps {
  value?: string
  placeholder?: string
  className?: string
  style?: CSSProperties
  type?: 'text' | 'number' | 'password' | 'tel'
  disabled?: boolean
  maxLength?: number
  /** 输入变化回调（统一为 value 字符串） */
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  /** 自动聚焦 */
  autoFocus?: boolean
  /** 数据属性 */
  'data-testid'?: string
}

// ============================================================================
// Textarea 组件
// ============================================================================

/** Textarea 组件 Props - 对应 textarea/Textarea */
export interface TextareaProps {
  value?: string
  placeholder?: string
  className?: string
  style?: CSSProperties
  disabled?: boolean
  maxLength?: number
  /** 输入变化回调（统一为 value 字符串） */
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  /** 自动聚焦 */
  autoFocus?: boolean
  /** 行数 */
  rows?: number
  /** 数据属性 */
  'data-testid'?: string
}

// ============================================================================
// ScrollView 组件
// ============================================================================

/** ScrollView 组件 Props - 对应 div(overflow)/ScrollView */
export interface ScrollViewProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** 允许横向滚动 */
  scrollX?: boolean
  /** 允许纵向滚动 */
  scrollY?: boolean
  /** 滚动事件 */
  onScroll?: (e: { scrollTop: number; scrollLeft: number }) => void
  /** 滚动到顶部/左边时触发 */
  onScrollToUpper?: () => void
  /** 滚动到底部/右边时触发 */
  onScrollToLower?: () => void
  /** 数据属性 */
  'data-testid'?: string
}
