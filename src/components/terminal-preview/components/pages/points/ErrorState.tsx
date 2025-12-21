/**
 * 错误状态组件
 */

import { Box, Text, Button, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { wxScale } from './constants'
import type { ErrorStateProps } from './types'

export function ErrorState({ isDarkMode, primaryColor, onRetry }: ErrorStateProps) {
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

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
        }}
      >
        <Text style={{ fontSize: 14 * wxScale, color: '#ffffff' }}>
          重新加载
        </Text>
      </Button>
    </Box>
  )
}

