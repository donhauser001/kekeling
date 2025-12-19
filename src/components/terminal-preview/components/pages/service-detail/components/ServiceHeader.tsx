/**
 * 服务详情页顶部导航栏
 * 按《小程序页面改造规范》改造
 * 
 * 圆形毛玻璃返回按钮设计
 */

import { Box, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ServiceHeaderProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

// 小程序胶囊按钮位置参数（用于对齐）
const wxStatusBarHeight = 44
const wxCapsuleTop = 6
const wxCapsuleHeight = 32

export function ServiceHeader({
  service,
  serviceId,
  themeSettings,
  colors,
  isDarkMode,
  isFavorite,
  onFavoriteToggle,
  onBack,
}: ServiceHeaderProps) {

  // 按钮尺寸
  const buttonSize = 36 * wxScale

  // 计算返回按钮的 top 值，使其与胶囊按钮垂直居中对齐
  const capsuleCenter = wxStatusBarHeight + wxCapsuleTop + wxCapsuleHeight / 2
  const buttonTop = isWxEnvironment() ? capsuleCenter - buttonSize / 2 : 12

  return (
    <Box
      className='fixed top-0 left-0 z-50'
      style={{
        position: 'fixed',
        top: buttonTop,
        left: 12 * wxScale,
        zIndex: 50,
      }}
    >
      {/* 圆形半透明返回按钮 */}
      <Box
        onClick={onBack}
        className='flex items-center justify-center rounded-full cursor-pointer'
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.7)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Icon
          name="left"
          size={20 * wxScale}
          color={isDarkMode ? '#ffffff' : '#333333'}
        />
      </Box>
    </Box>
  )
}
