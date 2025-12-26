/**
 * 搜索框组件
 * 
 * 首页使用的精美搜索框，点击跳转到搜索页面
 * 遵循《小程序页面改造规范》
 */

import { Box, Button, Text, Icon } from '../ui/primitives'
import { isWxEnvironment } from '../platform/env'
import type { ThemeSettings } from '../types'

// 小程序环境的缩放比例
const wxScale = isWxEnvironment() ? 1.1 : 1

interface SearchBarProps {
  isDarkMode?: boolean
  /** 主题设置 */
  themeSettings?: ThemeSettings
  /** 点击搜索框时的回调 */
  onSearchClick?: () => void
}

export function SearchBar({ isDarkMode = false, themeSettings, onSearchClick }: SearchBarProps) {
  const primaryColor = themeSettings?.primaryColor || '#22c55e'
  
  // 颜色配置
  const cardBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)'
  const placeholderColor = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#9ca3af'
  const iconBgColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : `${primaryColor}15`
  const iconColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : primaryColor
  
  return (
    <Box
      style={{
        position: 'relative',
        zIndex: 10,
        marginLeft: 16 * wxScale,
        marginRight: 16 * wxScale,
        marginBottom: 4 * wxScale,
      }}
    >
      <Button
        onClick={onSearchClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 24 * wxScale,
          paddingLeft: 6 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 6 * wxScale,
          paddingBottom: 6 * wxScale,
          boxShadow: isDarkMode 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 12px rgba(0,0,0,0.08)',
          backgroundColor: cardBg,
        }}
        aria-label="搜索"
      >
        {/* 搜索图标容器 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32 * wxScale,
            height: 32 * wxScale,
            borderRadius: 16 * wxScale,
            backgroundColor: iconBgColor,
            marginRight: 10 * wxScale,
            flexShrink: 0,
          }}
        >
          <Icon name="search" size={16 * wxScale} color={iconColor} />
        </Box>
        
        {/* 搜索提示文字区域 */}
        <Text style={{ 
          flex: 1,
          fontSize: 14 * wxScale, 
          color: placeholderColor,
        }}>
          搜索服务、医院、医生
        </Text>

        {/* 右侧语音图标 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26 * wxScale,
            height: 26 * wxScale,
            borderRadius: 13 * wxScale,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0',
            flexShrink: 0,
          }}
        >
          <Icon name="voice" size={13 * wxScale} color={placeholderColor} />
        </Box>
      </Button>
    </Box>
  )
}
