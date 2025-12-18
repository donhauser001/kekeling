/**
 * 内容区组件
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 * 注意：SafeHTML 在小程序中不可用，使用 Text 显示提示
 */

import { useState, useEffect } from 'react'
import { Box, Text } from '../ui/primitives'
import { isBrowserEnvironment } from '../platform/env'
import type { HomePageSettings } from '../types'

// SafeHTML 组件类型
type SafeHTMLComponent = React.ComponentType<{ html: string; prose?: boolean; className?: string }>

interface ContentSectionProps {
  homeSettings: HomePageSettings
  isDarkMode?: boolean
}

export function ContentSection({ homeSettings, isDarkMode = false }: ContentSectionProps) {
  const [SafeHTML, setSafeHTML] = useState<SafeHTMLComponent | null>(null)

  // 仅在浏览器环境异步加载 SafeHTML 组件
  useEffect(() => {
    if (isBrowserEnvironment()) {
      import('@/components/ui/safe-html').then((module) => {
        setSafeHTML(() => module.SafeHTML)
      }).catch(() => {
        // 忽略加载失败
      })
    }
  }, [])

  if (!homeSettings.content.enabled || !homeSettings.content.code) {
    return null
  }

  return (
    <Box
      className='relative z-10 px-3 py-3'
      style={{
        position: 'relative',
        zIndex: 10,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
      }}
    >
      {SafeHTML ? (
        <SafeHTML
          html={homeSettings.content.code}
          prose
          className='max-w-none [&_*]:!m-0 [&_*]:!p-0 [&_*]:!text-xs [&_*]:!leading-relaxed [&_h1]:!text-base [&_h2]:!text-sm [&_h3]:!text-xs [&_p]:!my-1'
        />
      ) : (
        <Text style={{ fontSize: 12, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
          [自定义内容区域]
        </Text>
      )}
    </Box>
  )
}
