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
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
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
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
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
  { children, className, style, numberOfLines, ...rest },
  ref
) {
  const lineClampStyle: React.CSSProperties | undefined = numberOfLines
    ? {
        display: '-webkit-box',
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }
    : undefined

  return (
    <span ref={ref} className={className} style={{ ...style, ...lineClampStyle }} {...rest}>
      {children}
    </span>
  )
})

// ============================================================================
// Button 组件
// ============================================================================

/**
 * Button - 按钮组件
 * Web 端渲染为 button，重置默认样式以与小程序 View 模拟保持一致
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className, style, onClick, onKeyDown, disabled, type = 'button', ...rest },
  ref
) {
  // 重置按钮默认样式，使其表现与小程序 View 模拟一致
  const resetStyle: React.CSSProperties = {
    // 重置边框和背景
    border: 'none',
    background: 'none',
    // 重置内边距
    padding: 0,
    margin: 0,
    // 重置字体
    font: 'inherit',
    color: 'inherit',
    // 重置光标
    cursor: disabled ? 'not-allowed' : 'pointer',
    // 透明度（与小程序端一致）
    opacity: disabled ? 0.5 : 1,
    // 默认 flex 布局居中（与小程序端一致）
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    // 移除默认轮廓
    outline: 'none',
    // 合并自定义样式
    ...style,
  }

  return (
    <button
      ref={ref}
      className={className}
      style={resetStyle}
      onClick={disabled ? undefined : onClick}
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

  // 包装事件处理，确保不传递原生事件参数（与小程序端对齐）
  const handleLoad = onLoad ? () => onLoad() : undefined
  const handleError = onError ? () => onError() : undefined

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={combinedStyle}
      onLoad={handleLoad}
      onError={handleError}
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
// RichText 组件
// ============================================================================

/**
 * RichText - 富文本组件
 * Web 端使用 dangerouslySetInnerHTML 渲染 HTML 内容
 */
export interface RichTextProps {
  /** HTML 内容（nodes 为字符串时直接使用） */
  nodes?: string
  className?: string
  style?: React.CSSProperties
}

export const RichText = forwardRef<HTMLDivElement, RichTextProps>(function RichText(
  { nodes, className, style, ...rest },
  ref
) {
  if (!nodes) {
    return null
  }

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: nodes }}
      {...rest}
    />
  )
})

// ============================================================================
// Icon 组件 - 重新导出
// ============================================================================

export { Icon } from './Icon'
export type { IconName, IconProps } from './Icon'
