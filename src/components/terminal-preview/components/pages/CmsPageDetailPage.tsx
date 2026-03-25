/**
 * CMS 页面详情
 *
 * 用于预览"关于我们"、"隐私政策"、"用户协议"等静态页面
 * Web 端使用 iframe 隔离样式，小程序端使用 RichText 组件
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon, RichText
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState + useEffect 获取数据
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { Box, Text, Icon, RichText, Image } from '../../ui/primitives'
import { isWxEnvironment, isBrowserEnvironment } from '../../platform/env'
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'

// ============================================================================
// 类型定义
// ============================================================================

interface CmsPageDetailPageProps {
  slug: string
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
}

interface CmsPage {
  id: string
  title: string
  content: string
  coverImage?: string
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

const slugTitles: Record<string, string> = {
  about: '关于我们',
  privacy: '隐私政策',
  terms: '用户协议',
  'escort-terms': '陪诊员服务协议',
  help: '帮助中心',
  contact: '联系我们',
}

// ============================================================================
// 工具函数：处理 HTML 内容以适配小程序 RichText
// ============================================================================

/**
 * 从完整 HTML 文档中提取 body 内容
 * 小程序 RichText 不支持完整 HTML 文档（如 <!DOCTYPE>, <html>, <head>, <style>）
 * 需要提取 <body> 标签内的内容，并清理不支持的标签
 */
function extractBodyContent(html: string): string {
  if (!html) return ''

  // 如果不是完整 HTML 文档，直接返回
  if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
    return html
  }

  let content = html

  // 1. 提取 body 内容
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    content = bodyMatch[1]
  } else {
    // 没有 body 标签，尝试移除 head 部分
    content = content.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    content = content.replace(/<!DOCTYPE[^>]*>/gi, '')
    content = content.replace(/<html[^>]*>/gi, '')
    content = content.replace(/<\/html>/gi, '')
  }

  // 2. 移除 script 和 style 标签
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // 3. 移除注释
  content = content.replace(/<!--[\s\S]*?-->/g, '')

  // 4. 清理多余空白
  content = content.trim()

  return content
}

// ============================================================================
// 子组件：Web 端 iframe 内容渲染
// ============================================================================

function IsolatedContent({
  html,
  coverImage,
  isDarkMode,
  primaryColor,
}: {
  html: string
  coverImage?: string
  isDarkMode: boolean
  primaryColor: string
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const fullDocument = useMemo(() => {
    const bgColor = isDarkMode ? '#2a2a2a' : '#ffffff'
    const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
    const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
    const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: ${textPrimary};
      background-color: ${bgColor};
      padding: 16px;
      word-wrap: break-word;
    }
    .cover-image {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.3;
      color: ${textPrimary};
    }
    h1 { font-size: 1.5em; }
    h2 { font-size: 1.25em; }
    h3 { font-size: 1.125em; }
    h1:first-child, h2:first-child, h3:first-child { margin-top: 0; }
    p { margin-bottom: 1em; }
    a { color: ${primaryColor}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul, ol { margin-bottom: 1em; padding-left: 1.5em; }
    li { margin-bottom: 0.25em; }
    img { max-width: 100%; height: auto; border-radius: 4px; }
    blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      border-left: 3px solid ${primaryColor};
      background-color: ${isDarkMode ? '#3a3a3a' : '#f9fafb'};
      color: ${textSecondary};
    }
    pre {
      margin: 1em 0;
      padding: 1em;
      background-color: ${isDarkMode ? '#1a1a1a' : '#f3f4f6'};
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 0.875em;
      padding: 0.125em 0.25em;
      background-color: ${isDarkMode ? '#3a3a3a' : '#f3f4f6'};
      border-radius: 2px;
    }
    pre code { padding: 0; background: none; }
    table { width: 100%; margin: 1em 0; border-collapse: collapse; }
    th, td { padding: 0.5em; border: 1px solid ${borderColor}; text-align: left; }
    th { background-color: ${isDarkMode ? '#3a3a3a' : '#f9fafb'}; font-weight: 600; }
    hr { margin: 1.5em 0; border: none; border-top: 1px solid ${borderColor}; }
  </style>
</head>
<body>
  ${coverImage ? `<img src="${coverImage}" alt="封面" class="cover-image">` : ''}
  ${html}
</body>
</html>`
  }, [html, coverImage, isDarkMode, primaryColor])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    doc.open()
    doc.write(fullDocument)
    doc.close()

    const adjustHeight = () => {
      if (doc.body) {
        iframe.style.height = `${doc.body.scrollHeight}px`
      }
    }

    const timer = setTimeout(adjustHeight, 100)
    const images = doc.querySelectorAll('img')
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', adjustHeight)
      }
    })

    return () => clearTimeout(timer)
  }, [fullDocument])

  return (
    <iframe
      ref={iframeRef}
      title="页面内容"
      style={{ width: '100%', border: 'none', minHeight: 200 }}
      sandbox="allow-same-origin"
    />
  )
}

// ============================================================================
// 主组件
// ============================================================================

export function CmsPageDetailPage({
  slug,
  themeSettings,
  isDarkMode = false,
  onBack,
}: CmsPageDetailPageProps) {
  const [page, setPage] = useState<CmsPage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  // 获取页面数据
  useEffect(() => {
    if (!slug) return
    setIsLoading(true)
    previewApi
      .getCmsPageBySlug(slug)
      .then(setPage)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [slug])

  const pageTitle = slugTitles[slug] || slug

  // 加载状态 - 骨架屏
  if (isLoading) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: bgColor,
        }}
      >
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: primaryColor,
            paddingTop: wxSafeAreaTop,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: 44 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
            }}
          >
            <Box
              onClick={onBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36 * wxScale,
                height: 36 * wxScale,
              }}
            >
              <Icon name="left" size={22 * wxScale} color="#fff" />
            </Box>
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>{pageTitle}</Text>
          </Box>
        </Box>

        <Box style={{ padding: 16 * wxScale }}>
          <Box
            style={{
              height: 32 * wxScale,
              width: 192 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: borderColor,
              marginBottom: 16 * wxScale,
            }}
          />
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              style={{
                height: 16 * wxScale,
                width: i === 3 ? '66%' : '100%',
                borderRadius: 4 * wxScale,
                backgroundColor: borderColor,
                marginBottom: 8 * wxScale,
              }}
            />
          ))}
        </Box>
      </Box>
    )
  }

  // 页面不存在
  if (!page) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: bgColor,
        }}
      >
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: primaryColor,
            paddingTop: wxSafeAreaTop,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: 44 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
            }}
          >
            <Box
              onClick={onBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36 * wxScale,
                height: 36 * wxScale,
              }}
            >
              <Icon name="left" size={22 * wxScale} color="#fff" />
            </Box>
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>{pageTitle}</Text>
          </Box>
        </Box>

        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 64 * wxScale,
            paddingBottom: 64 * wxScale,
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
          }}
        >
          <Box
            style={{
              width: 64 * wxScale,
              height: 64 * wxScale,
              borderRadius: 32 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16 * wxScale,
              backgroundColor: borderColor,
            }}
          >
            <Icon name="caution" size={32 * wxScale} color={textSecondary} />
          </Box>
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 500,
              color: textPrimary,
              marginBottom: 8 * wxScale,
              textAlign: 'center',
            }}
          >
            页面未配置
          </Text>
          <Text style={{ fontSize: 14 * wxScale, color: textSecondary, textAlign: 'center', lineHeight: 1.5 }}>
            请在后台 CMS 页面管理中创建「{pageTitle}」页面
          </Text>
        </Box>
      </Box>
    )
  }

  // 正常渲染
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: primaryColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          <Box
            onClick={onBack}
            style={{
              position: 'absolute',
              left: 12 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36 * wxScale,
              height: 36 * wxScale,
            }}
          >
            <Icon name="left" size={22 * wxScale} color="#fff" />
          </Box>
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>{page.title}</Text>
        </Box>
      </Box>

      <Box style={{ flex: 1 }}>
        {isBrowserEnvironment() ? (
          <IsolatedContent
            html={page.content}
            coverImage={page.coverImage}
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
          />
        ) : (
          <Box style={{ backgroundColor: cardBg }}>
            {page.coverImage && (
              <Image
                src={page.coverImage}
                mode="aspectFill"
                style={{ width: '100%', height: 160 * wxScale }}
              />
            )}
            <Box style={{ padding: 16 * wxScale }}>
              <RichText
                nodes={extractBodyContent(page.content)}
                style={{ fontSize: 14 * wxScale, lineHeight: 1.6, color: textPrimary }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CmsPageDetailPage
