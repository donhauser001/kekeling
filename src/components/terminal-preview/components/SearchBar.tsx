/**
 * 搜索框组件
 */

import { Box, Button, Text } from '../ui/primitives'
import { isWxEnvironment } from '../platform/env'

// 小程序环境的缩放比例
const wxScale = isWxEnvironment() ? 1.15 : 1

interface SearchBarProps {
  isDarkMode?: boolean
}

export function SearchBar({ isDarkMode = false }: SearchBarProps) {
  return (
    <Box
      className='relative z-10 px-3'
      style={{ position: 'relative', zIndex: 10, paddingLeft: 12 * wxScale, paddingRight: 12 * wxScale }}
    >
      <Button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10 * wxScale,
          borderRadius: 24,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
        }}
        aria-label="搜索"
      >
        <Text style={{ fontSize: 14 * wxScale, color: isDarkMode ? '#6b7280' : '#9ca3af' }}>🔍</Text>
        <Text style={{ fontSize: 14 * wxScale, color: isDarkMode ? '#6b7280' : '#9ca3af' }}>
          搜索服务、医院、医生
        </Text>
      </Button>
    </Box>
  )
}
