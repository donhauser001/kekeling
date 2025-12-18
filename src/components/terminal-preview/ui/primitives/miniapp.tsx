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

import { forwardRef } from 'react'

// 使用 require 绕过 Taro Babel 插件的自动导入修改
// eslint-disable-next-line @typescript-eslint/no-require-imports
const TaroComponents = require('@tarojs/components')
const View = TaroComponents.View
const TaroText = TaroComponents.Text
const TaroButton = TaroComponents.Button
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
  { children, className, style, onClick, onKeyDown, role, tabIndex, ...rest },
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
  return (
    <View
      className={className}
      style={{
        ...style,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      onClick={disabled ? undefined : onClick}
      role="button"
      {...filteredProps}
    >
      {children}
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

  return (
    <TaroImage
      src={src}
      className={className}
      style={style}
      mode={mode}
      onLoad={onLoad}
      onError={onError}
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

  return (
    <TaroInput
      value={value}
      placeholder={placeholder}
      className={className}
      style={style}
      type={inputType}
      disabled={disabled}
      maxlength={maxLength}
      onInput={(e) => onChange?.(e.detail.value)}
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

  return (
    <TaroTextarea
      value={value}
      placeholder={placeholder}
      className={className}
      style={style}
      disabled={disabled}
      maxlength={maxLength}
      onInput={(e) => onChange?.(e.detail.value)}
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
      onScroll={(e) => onScroll?.({ scrollTop: e.detail.scrollTop, scrollLeft: e.detail.scrollLeft })}
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

/**
 * Iconfont Unicode 映射
 * 来源：src/shared/assets/iconfont/iconfont.json
 *
 * 使用 Unicode 方式渲染图标，与 Web 端保持一致
 */
const iconfontUnicodeMap: Record<IconName, string> = {
  // === 基础图标 ===
  'home': '\ue600',
  'search': '\ue615',

  // === 导航类（使用 Material Icons 备用）===
  'grid': '\ue6e6',       // 使用医疗图标代替
  'file': '\ue657',       // 使用病历图标代替
  'user': '\ue611',       // 使用 user-folder 代替

  // === 操作类（使用通用符号）===
  'plus': '+',
  'minus': '-',
  'check': '✓',
  'x': '×',

  // === 方向类（使用箭头符号）===
  'chevron-right': '›',
  'chevron-left': '‹',
  'chevron-down': '∨',
  'chevron-up': '∧',
  'arrow-left': '←',
  'arrow-right': '→',

  // === 状态类 ===
  'alert': '⚠',
  'info': 'ℹ',
  'star': '★',
  'heart': '\ue68b',      // Heart

  // === 通讯类 ===
  'phone': '\ue711',      // 医疗咨询图标
  'map-pin': '\ue812',    // first-aid-kit-line
  'clock': '\ue700',      // tubiao_-2
  'calendar': '\ue6fe',   // tubiao_-

  // === 设置类 ===
  'settings': '⚙',
  'logout': '↪',
  'edit': '✎',
  'trash': '🗑',

  // === 媒体类 ===
  'camera': '📷',
  'image': '🖼',
  'upload': '↑',
  'download': '↓',

  // === 其他基础 ===
  'refresh': '↻',
  'loader': '⟳',
  'eye': '👁',
  'eye-off': '🙈',
  'lock': '🔒',
  'briefcase': '\ue7b4',  // filesync
  'share': '↗',
  'more': '⋯',

  // === 医疗专业图标（Iconfont）===
  // 医疗通用
  'yiliao': '\ue6e6',
  'yiliao1': '\ue74c',
  'jiankangyuyiliao-yiliao': '\uea2e',

  // 听诊器/问诊
  'wenyisheng': '\ue608',
  'yiliaozixun': '\ue711',

  // 医院/急救
  'sharpicons_ambulance': '\ue80b',
  'sharpicons_medical-sign': '\ue810',
  'first-aid-kit-line': '\ue812',
  'yaoxiangyiliao': '\ue62e',

  // 药品/注射
  'yiliaoyongpin': '\ue630',
  '-yiliao-zhushe': '\ue62b',
  'mazuike--': '\ue6d1',

  // 病历/处方
  'bingli': '\ue657',
  'bingan': '\ue610',
  'tubiao_-': '\ue6fe',

  // 儿科
  'ertongyule': '\ue60c',
  'ertongpiao': '\ue60a',
  'kefangyongrenfangertongfang': '\ue6b2',

  // 心电图/体检
  'xindiantu': '\ue7a6',
  'xindiantu1': '\ue61c',
  '-yiliao-xieyang': '\ue62d',

  // 体温
  'tiwenji': '\ue707',
  'thermometer-line': '\ue82f',

  // CT/检查
  '-yiliao-ct': '\ue62a',
  '-yiliao': '\ue62c',

  // 医疗器械
  'icon_yiliaoqixie': '\ue602',

  // 病毒/病菌
  'bingdu': '\ue6a0',
  'tubiao_-1': '\ue6ff',

  // 医疗险/卡片
  'yiliaoxian': '\ue65d',
  'tubiao_-2': '\ue700',

  // 爱心/关怀
  'Heart': '\ue68b',
  'Hearts': '\ue68c',
  'empathize-line': '\ue811',

  // 创可贴
  'Patch': '\ue68d',

  // 其他医疗
  '20-a': '\ue607',
  'filesync': '\ue7b4',
  'user-folder': '\ue611',
  'nanxing': '\uee2c',
  'yiliaofeiwulajitong_2': '\ue65e',
}

// 判断是否是 iconfont 图标（Unicode 私有区域）
function isIconfontIcon(unicode: string): boolean {
  const code = unicode.charCodeAt(0)
  return code >= 0xe000 && code <= 0xf8ff
}

export interface IconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * 小程序 Icon 组件 - Iconfont 字体实现
 *
 * 使用 Unicode 方式渲染图标，与 Web 端保持一致
 * 注意：需要在 app.tsx 中调用 wx.loadFontFace 加载 iconfont 字体
 */
export const Icon = forwardRef<any, IconProps>(function Icon(
  { name, size = 24, color = '#000000', className = '', style },
  _ref
) {
  const unicode = iconfontUnicodeMap[name]

  if (!unicode) {
    console.warn(`[Icon] 图标 "${name}" 未定义`)
    return null
  }

  // 判断是否使用 iconfont 字体（Unicode 字符）
  const useIconfont = unicode.charCodeAt(0) >= 0xe000 && unicode.charCodeAt(0) <= 0xf8ff

  return (
    <TaroText
      className={className}
      style={{
        fontFamily: useIconfont ? 'iconfont' : 'inherit',
        fontSize: size,
        color,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {unicode}
    </TaroText>
  )
})
