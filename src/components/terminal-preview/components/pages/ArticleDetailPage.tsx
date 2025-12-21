/**
 * 文章详情页面
 *
 * 显示单篇文章内容
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

interface ArticleDetailPageProps {
  articleId: string
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
}

interface Article {
  id: string
  title: string
  content: string
  coverImage?: string
  excerpt?: string
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

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
      title="文章内容"
      style={{ width: '100%', border: 'none', minHeight: 200 }}
      sandbox="allow-same-origin"
    />
  )
}

// ============================================================================
// 主组件
// ============================================================================

export function ArticleDetailPage({
  articleId,
  themeSettings,
  isDarkMode = false,
  onBack,
}: ArticleDetailPageProps) {
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  // 获取文章数据
  useEffect(() => {
    if (!articleId) return
    setIsLoading(true)
    previewApi
      .getArticleById(articleId)
      .then(setArticle)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [articleId])

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
        {/* 导航栏 */}
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
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>加载中...</Text>
          </Box>
        </Box>

        {/* 骨架屏 */}
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

  // 文章不存在
  if (!article) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: bgColor,
        }}
      >
        {/* 导航栏 */}
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
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>文章详情</Text>
          </Box>
        </Box>

        {/* 空状态 */}
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
            文章不存在
          </Text>
          <Text style={{ fontSize: 14 * wxScale, color: textSecondary, textAlign: 'center' }}>
            该文章可能已被删除或未发布
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
      {/* 导航栏 */}
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
          <Text
            style={{
              fontSize: 17 * wxScale,
              fontWeight: 600,
              color: '#fff',
              maxWidth: '60%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {article.title}
          </Text>
        </Box>
      </Box>

      {/* 文章内容 */}
      <Box style={{ flex: 1 }}>
        {isBrowserEnvironment() ? (
          // Web 端：使用 iframe 隔离样式
          <IsolatedContent
            html={article.content}
            coverImage={article.coverImage}
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
          />
        ) : (
          // 小程序端：使用 RichText + 封面图
          <Box style={{ backgroundColor: cardBg }}>
            {article.coverImage && (
              <Image
                src={article.coverImage}
                mode="aspectFill"
                style={{
                  width: '100%',
                  height: 160 * wxScale,
                }}
              />
            )}
            <Box style={{ padding: 16 * wxScale }}>
              <RichText
                nodes={article.content}
                style={{
                  fontSize: 14 * wxScale,
                  lineHeight: 1.6,
                  color: textPrimary,
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ArticleDetailPage
