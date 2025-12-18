/**
 * 跨宿主原语组件 - Web 实现
 *
 * 使用标准 HTML 元素渲染，用于 Web/H5 环境
 * 这是主仓的默认实现
 *
 * @see docs/终端预览器审计/小程序组件适配改造计划.md
 */

import { forwardRef } from 'react'
import type {
  BoxProps,
  TextProps,
  ButtonProps,
  ImageProps,
  InputProps,
  TextareaProps,
  ScrollViewProps,
} from './types'

// ============================================================================
// Box 组件（容器）
// ============================================================================

/**
 * Box - 通用容器组件
 * Web 端渲染为 div
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box(
  {
    children,
    className,
    style,
    onClick,
    onKeyDown,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onScroll,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onScroll={onScroll}
      {...rest}
    >
      {children}
    </div>
  )
})

// ============================================================================
// Text 组件（文本）
// ============================================================================

/**
 * Text - 文本组件
 * Web 端渲染为 span
 */
export const Text = forwardRef<HTMLSpanElement, TextProps>(function Text(
  { children, className, style, ...rest },
  ref
) {
  return (
    <span ref={ref} className={className} style={style} {...rest}>
      {children}
    </span>
  )
})

// ============================================================================
// Button 组件
// ============================================================================

/**
 * Button - 按钮组件
 * Web 端渲染为 button
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className, style, onClick, onKeyDown, disabled, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={className}
      style={style}
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {children}
    </button>
  )
})

// ============================================================================
// Image 组件
// ============================================================================

/**
 * 将小程序 mode 转换为 CSS object-fit
 */
function modeToObjectFit(mode?: ImageProps['mode']): React.CSSProperties['objectFit'] {
  switch (mode) {
    case 'aspectFit':
      return 'contain'
    case 'aspectFill':
      return 'cover'
    case 'scaleToFill':
      return 'fill'
    case 'widthFix':
    case 'heightFix':
      // 这两种模式需要特殊处理，暂时用 contain
      return 'contain'
    default:
      return undefined
  }
}

/**
 * Image - 图片组件
 * Web 端渲染为 img
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  { src, alt = '', className, style, mode, onLoad, onError, lazyLoad, ...rest },
  ref
) {
  const objectFit = modeToObjectFit(mode)
  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(objectFit ? { objectFit } : {}),
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={combinedStyle}
      onLoad={onLoad}
      onError={onError}
      loading={lazyLoad ? 'lazy' : undefined}
      {...rest}
    />
  )
})

// ============================================================================
// Input 组件
// ============================================================================

/**
 * Input - 输入框组件
 * Web 端渲染为 input
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    value,
    placeholder,
    className,
    style,
    type = 'text',
    disabled,
    maxLength,
    onChange,
    onFocus,
    onBlur,
    autoFocus,
    ...rest
  },
  ref
) {
  return (
    <input
      ref={ref}
      value={value}
      placeholder={placeholder}
      className={className}
      style={style}
      type={type}
      disabled={disabled}
      maxLength={maxLength}
      onChange={(e) => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      autoFocus={autoFocus}
      {...rest}
    />
  )
})

// ============================================================================
// Textarea 组件
// ============================================================================

/**
 * Textarea - 多行文本输入组件
 * Web 端渲染为 textarea
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    value,
    placeholder,
    className,
    style,
    disabled,
    maxLength,
    onChange,
    onFocus,
    onBlur,
    autoFocus,
    rows,
    ...rest
  },
  ref
) {
  return (
    <textarea
      ref={ref}
      value={value}
      placeholder={placeholder}
      className={className}
      style={style}
      disabled={disabled}
      maxLength={maxLength}
      onChange={(e) => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      autoFocus={autoFocus}
      rows={rows}
      {...rest}
    />
  )
})

// ============================================================================
// ScrollView 组件
// ============================================================================

/**
 * ScrollView - 可滚动容器组件
 * Web 端渲染为带 overflow 样式的 div
 */
export const ScrollView = forwardRef<HTMLDivElement, ScrollViewProps>(function ScrollView(
  { children, className, style, scrollX, scrollY, onScroll, onScrollToUpper, onScrollToLower, ...rest },
  ref
) {
  const scrollStyle: React.CSSProperties = {
    ...style,
    overflowX: scrollX ? 'auto' : 'hidden',
    overflowY: scrollY ? 'auto' : 'hidden',
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = target

    // 触发滚动事件
    onScroll?.({ scrollTop, scrollLeft })

    // 检测是否滚动到边缘
    if (scrollY) {
      if (scrollTop <= 0) {
        onScrollToUpper?.()
      }
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        onScrollToLower?.()
      }
    }

    if (scrollX) {
      if (scrollLeft <= 0) {
        onScrollToUpper?.()
      }
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        onScrollToLower?.()
      }
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={scrollStyle}
      onScroll={handleScroll}
      {...rest}
    >
      {children}
    </div>
  )
})

// ============================================================================
// Icon 组件 - 重新导出
// ============================================================================

export { Icon } from './Icon'
export type { IconName, IconProps } from './Icon'
