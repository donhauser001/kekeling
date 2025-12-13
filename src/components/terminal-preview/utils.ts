/**
 * 终端全局预览器工具函数
 */

// ============================================================================
// 数值安全处理函数
// ============================================================================

/**
 * 安全地将任意值转换为数字
 * 用于防止 null/undefined/string 调用 .toFixed() 等方法导致崩溃
 *
 * @param value - 任意值
 * @param fallback - 转换失败时的回退值，默认 0
 * @returns 有效数字或回退值
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed
    }
  }
  return fallback
}

/**
 * 安全地格式化金额
 * 确保即使传入 null/undefined 也不会崩溃
 *
 * @param value - 金额数值
 * @param decimals - 小数位数，默认 2
 * @returns 格式化后的金额字符串
 */
export function formatMoney(value: unknown, decimals = 2): string {
  return safeNumber(value).toFixed(decimals)
}

/**
 * 安全地格式化带千分位的金额
 *
 * @param value - 金额数值
 * @param decimals - 小数位数，默认 2
 * @returns 格式化后的金额字符串（带千分位）
 */
export function formatMoneyWithComma(value: unknown, decimals = 2): string {
  return safeNumber(value).toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 安全地格式化数量（整数，带千分位）
 *
 * @param value - 数量值
 * @returns 格式化后的数量字符串
 */
export function formatCount(value: unknown): string {
  return safeNumber(value).toLocaleString('zh-CN')
}

/**
 * 安全地格式化百分比
 *
 * @param value - 百分比值（0-1 或 0-100）
 * @param decimals - 小数位数，默认 0
 * @param isDecimal - 是否为小数形式（0-1），默认 true
 * @returns 格式化后的百分比字符串（不含%符号）
 */
export function formatPercent(value: unknown, decimals = 0, isDecimal = true): string {
  const num = safeNumber(value)
  const percent = isDecimal ? num * 100 : num
  return percent.toFixed(decimals)
}

// ============================================================================
// 数据类型安全转换函数（Step 14.14 异常数据防护增强）
// ============================================================================

/**
 * 安全地将任意值转换为数组
 * 用于防止 null/undefined/object 调用 .map() 等方法导致崩溃
 *
 * @param value - 任意值
 * @param fallback - 转换失败时的回退值，默认 []
 * @returns 有效数组或回退值
 *
 * @example
 * safeArray(null)           // []
 * safeArray([1, 2, 3])      // [1, 2, 3]
 * safeArray({})             // []
 * safeArray('abc')          // []
 * safeArray(undefined, [0]) // [0]
 */
export function safeArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }
  return fallback
}

/**
 * 安全地将任意值转换为字符串
 * 用于防止 null/undefined 调用字符串方法导致崩溃
 *
 * @param value - 任意值
 * @param fallback - 转换失败时的回退值，默认 ''
 * @returns 有效字符串或回退值
 *
 * @example
 * safeString(null)          // ''
 * safeString('hello')       // 'hello'
 * safeString(123)           // '123'
 * safeString(undefined, '-') // '-'
 */
export function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' && !isNaN(value)) {
    return String(value)
  }
  if (typeof value === 'boolean') {
    return String(value)
  }
  return fallback
}

/**
 * 安全地将任意值转换为对象
 * 用于防止 null/undefined/array 访问对象属性导致崩溃
 *
 * @param value - 任意值
 * @param fallback - 转换失败时的回退值，默认 {} as T
 * @returns 有效对象或回退值
 *
 * @example
 * safeObject(null)              // {}
 * safeObject({ a: 1 })          // { a: 1 }
 * safeObject([1, 2])            // {}（数组不是普通对象）
 * safeObject(undefined, { x: 0 }) // { x: 0 }
 */
export function safeObject<T extends Record<string, unknown>>(
  value: unknown,
  fallback: T = {} as T
): T {
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as T
  }
  return fallback
}

/**
 * 安全地校验枚举值
 * 用于防止后端返回未知枚举值导致 UI 渲染异常
 *
 * @param value - 任意值
 * @param validValues - 有效枚举值数组
 * @param fallback - 不在有效值中时的回退值
 * @returns 有效枚举值或回退值
 *
 * @example
 * safeEnum('pending', ['pending', 'completed'], 'pending')  // 'pending'
 * safeEnum('unknown', ['pending', 'completed'], 'pending')  // 'pending'
 * safeEnum(null, ['a', 'b'], 'a')                           // 'a'
 */
export function safeEnum<T extends string | number>(
  value: unknown,
  validValues: readonly T[],
  fallback: T
): T {
  if (validValues.includes(value as T)) {
    return value as T
  }
  return fallback
}

// ============================================================================
// 暗色模式对比度优化函数（Step 14.16）
// ============================================================================

/**
 * 获取次要文案的 CSS 类名
 * 暗色模式下使用更亮的颜色以提升对比度（WCAG AA 标准：3:1）
 *
 * @param isDarkMode - 是否暗色模式
 * @returns Tailwind CSS 类名
 *
 * @example
 * <span className={getSecondaryTextClass(isDarkMode)}>次要文案</span>
 */
export function getSecondaryTextClass(isDarkMode: boolean): string {
  return isDarkMode ? 'text-gray-300' : 'text-gray-500'
}

/**
 * 获取三级文案（更弱）的 CSS 类名
 *
 * @param isDarkMode - 是否暗色模式
 * @returns Tailwind CSS 类名
 */
export function getTertiaryTextClass(isDarkMode: boolean): string {
  return isDarkMode ? 'text-gray-400' : 'text-gray-400'
}

/**
 * 获取次要文案的内联样式颜色值
 * 用于需要 style={{ color: xxx }} 的场景
 *
 * @param isDarkMode - 是否暗色模式
 * @returns 颜色值字符串
 */
export function getSecondaryTextColor(isDarkMode: boolean): string {
  return isDarkMode ? '#d1d5db' : '#6b7280' // gray-300 vs gray-500
}

/**
 * 获取三级文案的内联样式颜色值
 *
 * @param isDarkMode - 是否暗色模式
 * @returns 颜色值字符串
 */
export function getTertiaryTextColor(isDarkMode: boolean): string {
  return isDarkMode ? '#9ca3af' : '#9ca3af' // gray-400
}

// ============================================================================
// 暗色模式边框/分割线优化函数（Step 14.20 Batch 2）
// ============================================================================

/**
 * 获取边框的 CSS 类名
 * 暗色模式下使用更亮的边框以提升可见性
 *
 * @param isDarkMode - 是否暗色模式
 * @returns Tailwind CSS 类名
 *
 * @example
 * <div className={`border ${getBorderClass(isDarkMode)}`}>...</div>
 */
export function getBorderClass(isDarkMode: boolean): string {
  return isDarkMode ? 'border-gray-600' : 'border-gray-200'
}

/**
 * 获取边框的内联样式颜色值
 * 用于需要 style={{ borderColor: xxx }} 的场景
 *
 * @param isDarkMode - 是否暗色模式
 * @returns 颜色值字符串
 */
export function getBorderColor(isDarkMode: boolean): string {
  return isDarkMode ? '#4b5563' : '#e5e7eb' // gray-600 vs gray-200
}

/**
 * 获取分割线的内联样式颜色值
 * 略深于边框，用于明确分隔内容区域
 *
 * @param isDarkMode - 是否暗色模式
 * @returns 颜色值字符串
 */
export function getDividerColor(isDarkMode: boolean): string {
  return isDarkMode ? '#4b5563' : '#e5e7eb' // gray-600 vs gray-200
}

/**
 * 获取禁用态按钮的背景颜色
 * 暗色模式下使用更亮的颜色以提升可见性
 *
 * @param isDarkMode - 是否暗色模式
 * @returns 颜色值字符串
 */
export function getDisabledButtonBgColor(isDarkMode: boolean): string {
  return isDarkMode ? '#4b5563' : '#e5e7eb' // gray-600 vs gray-200
}

/**
 * 获取禁用态按钮的文字颜色
 *
 * @param isDarkMode - 是否暗色模式
 * @returns 颜色值字符串
 */
export function getDisabledButtonTextColor(isDarkMode: boolean): string {
  return isDarkMode ? '#9ca3af' : '#9ca3af' // gray-400
}

// ============================================================================
// 资源 URL 处理函数
// ============================================================================

// 获取资源 URL
export function getResourceUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 上传的文件直接访问，不需要 /api 前缀
  if (path.startsWith('/uploads/')) {
    return path
  }
  return path.startsWith('/') ? path : `/${path}`
}

// 提取颜色（如果是渐变取第一个颜色）
export function extractBaseColor(color: string | undefined, fallback: string): string {
  if (!color) return fallback
  if (color.includes('gradient')) {
    return color.match(/#[a-fA-F0-9]{6}/)?.[0] || fallback
  }
  return color
}

// ============================================================================
// 开发环境校验函数
// ============================================================================

import type { PreviewPage } from './types'
import { PAGES_REQUIRING_PARAMS, PAGE_METADATA } from './types'

/**
 * 校验页面参数是否符合要求（仅开发环境）
 * 
 * @param page - 目标页面
 * @param params - 传递的参数
 * @returns void（仅输出警告，不阻断执行）
 */
export function validatePageParams(
  page: string,
  params?: Record<string, string>
): void {
  if (process.env.NODE_ENV !== 'development') return

  const requiredParams = PAGES_REQUIRING_PARAMS[page as PreviewPage]
  if (!requiredParams || requiredParams.length === 0) return

  const missingParams = requiredParams.filter(
    (param) => !params || !params[param]
  )

  if (missingParams.length > 0) {
    console.warn(
      `[TerminalPreview] Page "${page}" requires params: [${requiredParams.join(', ')}]. ` +
      `Missing: [${missingParams.join(', ')}]. ` +
      `Current params: ${JSON.stringify(params ?? {})}`
    )
  }
}

/**
 * 校验初始页面是否允许作为入口（仅开发环境）
 * 
 * @param page - 初始页面
 * @returns void（仅输出警告，不阻断执行）
 */
export function validateInitialPage(page: string): void {
  if (process.env.NODE_ENV !== 'development') return

  const metadata = PAGE_METADATA[page as PreviewPage]
  if (!metadata) {
    // 未知页面已有 VALID_PAGE_KEYS 校验，这里不重复
    return
  }

  if (!metadata.entryAllowed) {
    console.warn(
      `[TerminalPreview] Page "${page}" is not allowed as initial entry. ` +
      `This page should only be accessed via navigateToPage(). ` +
      `Description: ${metadata.description ?? 'N/A'}. ` +
      `Required params: ${metadata.requiredParams?.join(', ') ?? 'none'}`
    )
  }
}
