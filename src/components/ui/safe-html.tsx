/**
 * SafeHTML - 安全的 HTML 渲染组件
 *
 * 使用 DOMPurify 净化 HTML 内容，防止 XSS 攻击。
 * 所有需要渲染 HTML 的地方都应该使用此组件，禁止直接使用 dangerouslySetInnerHTML。
 *
 * @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P0-1 XSS 收敛
 */

import DOMPurify from 'dompurify'
import { cn } from '@/lib/utils'

/**
 * 默认允许的标签白名单
 * 只允许安全的格式化标签，禁止脚本、样式、iframe 等危险标签
 */
const DEFAULT_ALLOWED_TAGS = [
  // 文本格式
  'p', 'br', 'span', 'div',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
  // 标题
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // 列表
  'ul', 'ol', 'li',
  // 链接和图片
  'a', 'img',
  // 表格
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  // 引用和代码
  'blockquote', 'pre', 'code',
  // 分隔线
  'hr',
]

/**
 * 默认允许的属性白名单
 * 禁止所有事件处理器（on*）和 style 属性
 */
const DEFAULT_ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id',
  'target', 'rel',
  'width', 'height',
  'colspan', 'rowspan',
]

/**
 * 强制禁止的标签（即使在自定义配置中也不允许）
 */
const FORBID_TAGS = [
  'script', 'style', 'iframe', 'frame', 'frameset',
  'object', 'embed', 'applet',
  'form', 'input', 'textarea', 'button', 'select',
  'svg', 'math',
  'base', 'meta', 'link',
]

/**
 * 强制禁止的属性（即使在自定义配置中也不允许）
 */
const FORBID_ATTR = [
  // 事件处理器
  'onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur',
  'onsubmit', 'onreset', 'onchange', 'oninput', 'onkeydown', 'onkeyup',
  // 危险属性
  'style', 'formaction', 'action', 'xlink:href',
]

export interface SafeHTMLProps {
  /** 要渲染的 HTML 字符串 */
  html: string
  /** 额外的 CSS 类名 */
  className?: string
  /** 自定义允许的标签（会与默认白名单合并） */
  allowedTags?: string[]
  /** 自定义允许的属性（会与默认白名单合并） */
  allowedAttr?: string[]
  /** 是否使用 prose 样式（适用于富文本内容） */
  prose?: boolean
  /** 容器元素类型 */
  as?: 'div' | 'span' | 'article' | 'section'
}

/**
 * SafeHTML 组件
 *
 * @example
 * // 基本用法
 * <SafeHTML html={content} />
 *
 * @example
 * // 带 prose 样式
 * <SafeHTML html={richTextContent} prose className="max-w-none" />
 *
 * @example
 * // 自定义允许的标签
 * <SafeHTML html={content} allowedTags={['video', 'audio']} />
 */
export function SafeHTML({
  html,
  className,
  allowedTags = [],
  allowedAttr = [],
  prose = false,
  as: Component = 'div',
}: SafeHTMLProps) {
  // 合并默认和自定义的白名单
  const mergedAllowedTags = [...DEFAULT_ALLOWED_TAGS, ...allowedTags]
  const mergedAllowedAttr = [...DEFAULT_ALLOWED_ATTR, ...allowedAttr]

  // 使用 DOMPurify 净化 HTML
  const sanitized = DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS: mergedAllowedTags,
    ALLOWED_ATTR: mergedAllowedAttr,
    FORBID_TAGS: FORBID_TAGS,
    FORBID_ATTR: FORBID_ATTR,
    // 额外安全配置
    ALLOW_DATA_ATTR: false, // 禁止 data-* 属性
    ADD_ATTR: ['target'], // 允许 target 属性用于链接
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  })

  return (
    <Component
      className={cn(
        prose && 'prose prose-sm dark:prose-invert',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

/**
 * 净化 HTML 字符串的工具函数
 * 用于需要直接获取净化后字符串的场景
 *
 * @example
 * const cleanHtml = sanitizeHTML(userInput)
 */
export function sanitizeHTML(
  html: string,
  options?: {
    allowedTags?: string[]
    allowedAttr?: string[]
  }
): string {
  const mergedAllowedTags = [...DEFAULT_ALLOWED_TAGS, ...(options?.allowedTags || [])]
  const mergedAllowedAttr = [...DEFAULT_ALLOWED_ATTR, ...(options?.allowedAttr || [])]

  return DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS: mergedAllowedTags,
    ALLOWED_ATTR: mergedAllowedAttr,
    FORBID_TAGS: FORBID_TAGS,
    FORBID_ATTR: FORBID_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}

export default SafeHTML

