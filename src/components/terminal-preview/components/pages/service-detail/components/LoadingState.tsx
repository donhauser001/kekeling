/**
 * 加载状态组件
 * 按《小程序页面改造规范》改造
 */

import { Stethoscope } from '../../../../ui/lucide-compat'
import { Box, Text, Button } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ThemeSettings } from '../../../../types'
import type { ThemeColors } from '../types'

const wxScale = isWxEnvironment() ? 1.15 : 1

interface LoadingStateProps {
  themeSettings: ThemeSettings
  colors: ThemeColors
}

export function LoadingState({ themeSettings, colors }: LoadingStateProps) {
  const { bgColor, textMuted } = colors

  return (
    <Box
      className='min-h-full flex items-center justify-center'
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
      }}
    >
      <Box
        className='flex flex-col items-center'
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          className='h-8 w-8 animate-spin rounded-full border-2 border-t-transparent'
          style={{
            width: 32 * wxScale,
            height: 32 * wxScale,
            borderRadius: 9999,
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: themeSettings.primaryColor,
            borderTopColor: 'transparent',
          }}
        />
        <Text
          className='mt-3 text-sm'
          style={{
            marginTop: 12 * wxScale,
            fontSize: 14 * wxScale,
            color: textMuted,
          }}
        >
          加载中...
        </Text>
      </Box>
    </Box>
  )
}

interface EmptyStateProps {
  themeSettings: ThemeSettings
  colors: ThemeColors
  onBack?: () => void
}

export function EmptyState({ themeSettings, colors, onBack }: EmptyStateProps) {
  const { bgColor, textMuted } = colors

  return (
    <Box
      className='min-h-full flex items-center justify-center'
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
      }}
    >
      <Box
        className='flex flex-col items-center'
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Stethoscope size={48 * wxScale} color={textMuted} />
        <Text
          className='mt-3 text-sm'
          style={{
            marginTop: 12 * wxScale,
            fontSize: 14 * wxScale,
            color: textMuted,
          }}
        >
          服务不存在
        </Text>
        <Button
          className='mt-4 px-4 py-2 rounded-full text-sm'
          style={{
            marginTop: 16 * wxScale,
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 8 * wxScale,
            paddingBottom: 8 * wxScale,
            borderRadius: 9999,
            fontSize: 14 * wxScale,
            backgroundColor: themeSettings.primaryColor,
            color: '#fff',
          }}
          onClick={onBack}
        >
          返回
        </Button>
      </Box>
    </Box>
  )
}
