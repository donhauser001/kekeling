/**
 * 跨宿主原语组件 - 小程序实现
 *
 * 使用 @tarojs/components 渲染，用于微信小程序环境
 * 此文件通过 miniapp-shell 的 alias 配置引入
 *
 * 注意：此文件依赖 @tarojs/components，仅在 miniapp-shell 构建时使用
 *
 * @see docs/终端预览器审计/小程序组件适配改造计划.md
 */

import React, { forwardRef } from 'react'

// 使用 require 绕过 Taro Babel 插件的自动导入修改
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TaroComponents = require('@tarojs/components')
const View = TaroComponents.View
const TaroText = TaroComponents.Text
const TaroImage = TaroComponents.Image
const TaroInput = TaroComponents.Input
const TaroTextarea = TaroComponents.Textarea
const TaroScrollView = TaroComponents.ScrollView
import type {
  BoxProps,
  TextProps,
  ButtonProps,
  ImageProps,
  InputProps,
  TextareaProps,
  ScrollViewProps,
} from './types'
import type { IconName } from '@/shared/types/icon'
import { iconUnicodeMap } from '@/shared/constants/icon-unicode'

// 重新导出类型供外部使用
export type { IconName }

// ============================================================================
// Box 组件（容器）
// ============================================================================

/**
 * Box - 通用容器组件
 * 小程序端渲染为 View
 */
export const Box = forwardRef<any, BoxProps>(function Box(
  {
    children,
    className,
    style,
    onClick,
    onKeyDown,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    role,
    tabIndex,
    ...rest
  },
  _ref
) {
  // 小程序不支持 ref 和部分 HTML 属性，过滤掉
  const filteredProps: Record<string, unknown> = {}
  if (rest['aria-label']) filteredProps['aria-label'] = rest['aria-label']
  if (rest['aria-selected'] !== undefined) filteredProps['aria-selected'] = rest['aria-selected']
  if (rest['aria-hidden'] !== undefined) filteredProps['aria-hidden'] = rest['aria-hidden']
  if (rest['data-testid']) filteredProps['data-testid'] = rest['data-testid']

  return (
    <View
      className={className}
      style={style}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      role={role}
      {...filteredProps}
    >
      {children}
    </View>
  )
})

// ============================================================================
// Text 组件（文本）
// ============================================================================

/**
 * Text - 文本组件
 * 小程序端渲染为 Text
 */
export const Text = forwardRef<any, TextProps>(function Text(
  { children, className, style, ...rest },
  _ref
) {
  const filteredProps: Record<string, unknown> = {}
  if (rest['aria-hidden'] !== undefined) filteredProps['aria-hidden'] = rest['aria-hidden']
  if (rest['data-testid']) filteredProps['data-testid'] = rest['data-testid']

  return (
    <TaroText className={className} style={style} {...filteredProps}>
      {children}
    </TaroText>
  )
})

// ============================================================================
// Button 组件
// ============================================================================

/**
 * Button - 按钮组件
 * 小程序端渲染为 View（因为 Taro Button 样式较难控制）
 * 使用 View 模拟 button 行为，保持样式一致性
 */
export const Button = forwardRef<any, ButtonProps>(function Button(
  { children, className, style, onClick, disabled, ...rest },
  _ref
) {
  const filteredProps: Record<string, unknown> = {}
  if (rest['aria-label']) filteredProps['aria-label'] = rest['aria-label']
  if (rest['aria-selected'] !== undefined) filteredProps['aria-selected'] = rest['aria-selected']
  if (rest['data-testid']) filteredProps['data-testid'] = rest['data-testid']

  // 使用 View 模拟按钮，更容易控制样式
  // 默认文本居中，与 Web 端 button 保持一致
  // 注意：小程序中纯文本需要用 Text 包裹并显式传递样式
  const isTextContent = typeof children === 'string' || typeof children === 'number'

  // 提取文本相关样式传递给 Text 组件（小程序 Text 不继承 View 样式）
  const textStyle = style ? {
    color: style.color,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
  } : {}

  return (
    <View
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        ...style,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      onClick={disabled ? undefined : onClick}
      role="button"
      {...filteredProps}
    >
      {isTextContent ? <TaroText style={textStyle}>{children}</TaroText> : children}
    </View>
  )
})

// ============================================================================
// Image 组件
// ============================================================================

/**
 * Image - 图片组件
 * 小程序端渲染为 Image
 */
export const Image = forwardRef<any, ImageProps>(function Image(
  { src, alt, className, style, mode = 'aspectFill', onLoad, onError, lazyLoad, ...rest },
  _ref
) {
  const filteredProps: Record<string, unknown> = {}
  if (rest['data-testid']) filteredProps['data-testid'] = rest['data-testid']

  // 包装事件处理，确保不传递原生事件参数（与 Web 端对齐）
  const handleLoad = onLoad ? () => onLoad() : undefined
  const handleError = onError ? () => onError() : undefined

  return (
    <TaroImage
      src={src}
      className={className}
      style={style}
      mode={mode}
      onLoad={handleLoad}
      onError={handleError}
      lazyLoad={lazyLoad}
      {...filteredProps}
    />
  )
})

// ============================================================================
// Input 组件
// ============================================================================

/**
 * Input - 输入框组件
 * 小程序端渲染为 Input
 */
export const Input = forwardRef<any, InputProps>(function Input(
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
  _ref
) {
  const filteredProps: Record<string, unknown> = {}
  if (rest['data-testid']) filteredProps['data-testid'] = rest['data-testid']

  // 小程序 Input 类型映射
  const inputType = type === 'tel' ? 'number' : type

  // 小程序事件转换为统一接口
  const handleInput = (e: { detail: { value: string } }) => {
    if (onChange) {
      onChange(e.detail.value)
    }
  }

  return (
    <TaroInput
      value={value}
      placeholder={placeholder}
      className={className}
      style={style}
      type={inputType}
      disabled={disabled}
      maxlength={maxLength}
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={onBlur}
      focus={autoFocus}
      {...filteredProps}
    />
  )
})

// ============================================================================
// Textarea 组件
// ============================================================================

/**
 * Textarea - 多行文本输入组件
 * 小程序端渲染为 Textarea
 */
export const Textarea = forwardRef<any, TextareaProps>(function Textarea(
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
    ...rest
  },
  _ref
) {
  const filteredProps: Record<string, unknown> = {}
  if (rest['data-testid']) filteredProps['data-testid'] = rest['data-testid']

  // 小程序事件转换为统一接口
  const handleInput = (e: { detail: { value: string } }) => {
    if (onChange) {
      onChange(e.detail.value)
    }
  }

  return (
    <TaroTextarea
      value={value}
      placeholder={placeholder}
      className={className}
      style={style}
      disabled={disabled}
      maxlength={maxLength}
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={onBlur}
      focus={autoFocus}
      {...filteredProps}
    />
  )
})

// ============================================================================
// ScrollView 组件
// ============================================================================

/**
 * ScrollView - 可滚动容器组件
 * 小程序端渲染为 ScrollView
 */
export const ScrollView = forwardRef<any, ScrollViewProps>(function ScrollView(
  { children, className, style, scrollX, scrollY, onScroll, onScrollToUpper, onScrollToLower, ...rest },
  _ref
) {
  const filteredProps: Record<string, unknown> = {}
  if (rest['data-testid']) filteredProps['data-testid'] = rest['data-testid']

  return (
    <TaroScrollView
      className={className}
      style={style}
      scrollX={scrollX}
      scrollY={scrollY}
      onScroll={(e: { detail: { scrollTop: number; scrollLeft: number } }) => onScroll?.({ scrollTop: e.detail.scrollTop, scrollLeft: e.detail.scrollLeft })}
      onScrollToUpper={onScrollToUpper}
      onScrollToLower={onScrollToLower}
      {...filteredProps}
    >
      {children}
    </TaroScrollView>
  )
})

// ============================================================================
// Icon 组件 - 小程序端使用 Iconfont 字体
// ============================================================================

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
 * 小程序 Icon 组件 - Iconfont 字体实现
 *
 * 使用 Unicode 方式渲染图标，与 Web 端保持一致
 * 支持 775 个图标
 *
 * 注意：需要在 app.tsx 中调用 wx.loadFontFace 加载 iconfont 字体
 */
export const Icon = forwardRef<any, IconProps>(function Icon(
  { name, size = 24, color = '#000000', className = '', style },
  _ref
) {
  const unicode = iconUnicodeMap[name as IconName]

  if (!unicode) {
    console.warn(`[Icon] 图标 "${name}" 未定义`)
    return null
  }

  return (
    <TaroText
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
        ...style,
      }}
    >
      {unicode}
    </TaroText>
  )
})
