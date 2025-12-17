/**
 * HTML 预览组件
 * 
 * 使用 iframe 实现样式隔离，防止用户输入的 HTML/CSS 污染主页面
 */

import { useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface HTMLPreviewProps {
  /** HTML 内容 */
  html: string
  /** 容器类名 */
  className?: string
  /** 最小高度 */
  minHeight?: number
}

export function HTMLPreview({ html, className, minHeight = 400 }: HTMLPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // 构建完整的 HTML 文档
  const fullDocument = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    /* 基础排版样式 */
    h1 { font-size: 1.5em; font-weight: 700; margin: 1em 0 0.5em; }
    h2 { font-size: 1.25em; font-weight: 600; margin: 1em 0 0.5em; }
    h3 { font-size: 1.1em; font-weight: 600; margin: 1em 0 0.5em; }
    p { margin: 0.5em 0; }
    a { color: #0066cc; text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }
    ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
    li { margin: 0.25em 0; }
    blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      border-left: 4px solid #e5e7eb;
      background: #f9fafb;
      color: #6b7280;
    }
    pre {
      background: #f3f4f6;
      padding: 1em;
      border-radius: 8px;
      overflow-x: auto;
      font-family: ui-monospace, monospace;
      font-size: 0.875em;
    }
    code {
      background: #f3f4f6;
      padding: 0.125em 0.25em;
      border-radius: 4px;
      font-family: ui-monospace, monospace;
      font-size: 0.875em;
    }
    pre code {
      background: none;
      padding: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 0.5em;
      text-align: left;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 1.5em 0;
    }
  </style>
</head>
<body>
${html || '<p style="color: #9ca3af;">暂无内容</p>'}
</body>
</html>`
  }, [html])

  // 更新 iframe 内容
  useEffect(() => {
    const iframe = iframeRef.current
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(fullDocument)
        doc.close()

        // 自动调整 iframe 高度
        const resizeObserver = new ResizeObserver(() => {
          if (doc.body) {
            const contentHeight = doc.body.scrollHeight
            iframe.style.height = `${Math.max(contentHeight + 32, minHeight)}px`
          }
        })

        if (doc.body) {
          resizeObserver.observe(doc.body)
        }

        return () => {
          resizeObserver.disconnect()
        }
      }
    }
  }, [fullDocument, minHeight])

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-white', className)}>
      <iframe
        ref={iframeRef}
        title='HTML 预览'
        className='w-full border-0'
        style={{ minHeight }}
        sandbox='allow-same-origin'
      />
    </div>
  )
}

export default HTMLPreview

