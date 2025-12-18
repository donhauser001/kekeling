/**
 * 错误重试组件
 *
 * Step 14.5 UI-B-2: 提供统一的错误 UI + 重试按钮
 * 使用跨宿主原语组件，支持 Web 和小程序
 */

import React from 'react'
import { Box, Text, Button } from '../ui/primitives'

// ============================================================================
// 类型定义
// ============================================================================

export interface ErrorRetryProps {
  /** 重试回调（必填） */
  onRetry: () => void
  /** 错误消息，默认 "加载失败" */
  message?: string
  /** 自定义图标，默认 😔 */
  icon?: string
  /** 是否暗色模式 */
  isDarkMode?: boolean
  /** 主题色（按钮颜色） */
  primaryColor?: string
  /** 自定义类名 */
  className?: string
}

// ============================================================================
// 组件实现
// ============================================================================

export function ErrorRetry({
  onRetry,
  message = '加载失败',
  icon = '😔',
  isDarkMode = false,
  primaryColor = '#3b82f6',
  className = '',
}: ErrorRetryProps) {
  return (
    <Box
      className={`flex flex-col items-center justify-center py-12 ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 48,
        paddingBottom: 48,
      }}
    >
      {/* 图标 */}
      <Text style={{ fontSize: 40, marginBottom: 8 }}>{icon}</Text>

      {/* 错误消息 */}
      <Text
        style={{
          fontSize: 14,
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }}
      >
        {message}
      </Text>

      {/* 重试按钮 */}
      <Button
        onClick={onRetry}
        style={{
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          color: '#ffffff',
          backgroundColor: primaryColor,
        }}
      >
        <Text style={{ fontSize: 14, marginRight: 4 }}>↻</Text>
        <Text style={{ color: '#ffffff' }}>重试</Text>
      </Button>
    </Box>
  )
}





