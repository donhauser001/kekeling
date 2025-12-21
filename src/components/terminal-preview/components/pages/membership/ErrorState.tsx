/**
 * 错误状态组件
 *
 * 加载失败时展示，提供重试功能
 */

import { Box, Text, Button, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { wxScale, getColorConfig } from './constants'
import type { ErrorStateProps } from './types'

export function ErrorState({ isDarkMode, primaryColor, onRetry }: ErrorStateProps) {
  const { textMuted } = getColorConfig(isDarkMode, primaryColor)

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 48 * wxScale,
        paddingBottom: 48 * wxScale,
      }}
    >
      <Icon name="close-one" size={48 * wxScale} color="#ef4444" />
      <Text
        style={{
          display: 'block',
          fontSize: 14 * wxScale,
          color: textMuted,
          marginTop: 12 * wxScale,
        }}
      >
        加载失败，请重试
      </Text>
      <Button
        onClick={onRetry}
        style={{
          marginTop: 16 * wxScale,
          paddingLeft: 24 * wxScale,
          paddingRight: 24 * wxScale,
          paddingTop: isWxEnvironment() ? 8 * wxScale : 6,
          paddingBottom: isWxEnvironment() ? 8 * wxScale : 6,
          borderRadius: 9999,
          backgroundColor: primaryColor,
          border: 'none',
        }}
      >
        <Text style={{ fontSize: 14 * wxScale, color: '#ffffff' }}>重新加载</Text>
      </Button>
    </Box>
  )
}

