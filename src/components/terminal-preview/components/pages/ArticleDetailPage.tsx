/**
 * 文章详情页面预览组件
 *
 * 显示单篇文章内容，使用 iframe 隔离样式
 */

import { useRef, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'

interface ArticleDetailPageProps {
  /** 文章 ID */
  articleId: string
  /** 主题设置 */
  themeSettings: ThemeSettings
  /** 是否深色模式 */
  isDarkMode?: boolean
  /** 返回回调 */
  onBack?: () => void
}

/**
 * 内容渲染组件（使用 iframe 隔离样式）
 */
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

  // 生成完整的 HTML 文档
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: ${textPrimary};
      background-color: ${bgColor};
      padding: 16px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .cover-image {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    /* 基础排版样式 */
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
    h1:first-child, h2:first-child, h3:first-child {
      margin-top: 0;
    }
    p {
      margin-bottom: 1em;
    }
    a {
      color: ${primaryColor};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ul, ol {
      margin-bottom: 1em;
      padding-left: 1.5em;
    }
    li {
      margin-bottom: 0.25em;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }
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
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.875em;
      padding: 0.125em 0.25em;
      background-color: ${isDarkMode ? '#3a3a3a' : '#f3f4f6'};
      border-radius: 2px;
    }
    pre code {
      padding: 0;
      background: none;
    }
    table {
      width: 100%;
      margin: 1em 0;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.5em;
      border: 1px solid ${borderColor};
      text-align: left;
    }
    th {
      background-color: ${isDarkMode ? '#3a3a3a' : '#f9fafb'};
      font-weight: 600;
    }
    hr {
      margin: 1.5em 0;
      border: none;
      border-top: 1px solid ${borderColor};
    }
  </style>
</head>
<body>
  ${coverImage ? `<img src="${coverImage}" alt="封面" class="cover-image">` : ''}
  ${html}
</body>
</html>`
  }, [html, coverImage, isDarkMode, primaryColor])

  // 将内容写入 iframe
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    doc.open()
    doc.write(fullDocument)
    doc.close()

    // 自动调整高度
    const adjustHeight = () => {
      if (doc.body) {
        const height = doc.body.scrollHeight
        iframe.style.height = `${height}px`
      }
    }

    // 等待内容加载完成
    const timer = setTimeout(adjustHeight, 100)

    // 监听图片加载完成后重新调整高度
    const images = doc.querySelectorAll('img')
    images.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', adjustHeight)
      }
    })

    return () => {
      clearTimeout(timer)
    }
  }, [fullDocument])

  return (
    <iframe
      ref={iframeRef}
      title='文章内容'
      className='w-full border-0'
      style={{ minHeight: 200 }}
      sandbox='allow-same-origin'
    />
  )
}

export function ArticleDetailPage({
  articleId,
  themeSettings,
  isDarkMode = false,
  onBack,
}: ArticleDetailPageProps) {
  // 获取文章数据
  const { data: article, isLoading } = useQuery({
    queryKey: ['preview', 'article', articleId],
    queryFn: () => previewApi.getArticleById(articleId),
    enabled: !!articleId,
  })

  // 颜色配置
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 加载状态
  if (isLoading) {
    return (
      <div style={{ backgroundColor: bgColor }} className='min-h-full'>
        {/* 顶部导航 */}
        <div
          className='sticky top-0 z-10 flex items-center gap-3 px-4 py-3'
          style={{ backgroundColor: cardBg }}
        >
          <button
            onClick={onBack}
            className='p-1 -ml-1 rounded-full hover:bg-black/5 active:bg-black/10'
          >
            <ArrowLeft className='h-5 w-5' style={{ color: textPrimary }} />
          </button>
          <span className='font-medium' style={{ color: textPrimary }}>
            加载中...
          </span>
        </div>

        {/* 加载骨架屏 */}
        <div className='p-4 space-y-4'>
          <div className='h-8 w-48 rounded animate-pulse' style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb' }} />
          <div className='h-4 w-full rounded animate-pulse' style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb' }} />
          <div className='h-4 w-3/4 rounded animate-pulse' style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb' }} />
          <div className='h-4 w-5/6 rounded animate-pulse' style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb' }} />
        </div>
      </div>
    )
  }

  // 文章不存在
  if (!article) {
    return (
      <div style={{ backgroundColor: bgColor }} className='min-h-full'>
        {/* 顶部导航 */}
        <div
          className='sticky top-0 z-10 flex items-center gap-3 px-4 py-3'
          style={{ backgroundColor: cardBg }}
        >
          <button
            onClick={onBack}
            className='p-1 -ml-1 rounded-full hover:bg-black/5 active:bg-black/10'
          >
            <ArrowLeft className='h-5 w-5' style={{ color: textPrimary }} />
          </button>
          <span className='font-medium' style={{ color: textPrimary }}>
            文章详情
          </span>
        </div>

        {/* 空状态 */}
        <div className='flex flex-col items-center justify-center py-16 px-4'>
          <div
            className='w-16 h-16 rounded-full flex items-center justify-center mb-4'
            style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
          >
            <AlertCircle className='h-8 w-8' style={{ color: textSecondary }} />
          </div>
          <p className='text-center font-medium mb-2' style={{ color: textPrimary }}>
            文章不存在
          </p>
          <p className='text-center text-sm' style={{ color: textSecondary }}>
            该文章可能已被删除或未发布
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full'>
      {/* 顶部导航 */}
      <div
        className='sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b'
        style={{
          backgroundColor: cardBg,
          borderColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
        }}
      >
        <button
          onClick={onBack}
          className='p-1 -ml-1 rounded-full hover:bg-black/5 active:bg-black/10'
        >
          <ArrowLeft className='h-5 w-5' style={{ color: textPrimary }} />
        </button>
        <span className='font-medium truncate flex-1' style={{ color: textPrimary }}>
          {article.title}
        </span>
      </div>

      {/* 文章内容（使用 iframe 隔离样式） */}
      <IsolatedContent
        html={article.content}
        coverImage={article.coverImage}
        isDarkMode={isDarkMode}
        primaryColor={themeSettings.primaryColor}
      />
    </div>
  )
}

export default ArticleDetailPage

