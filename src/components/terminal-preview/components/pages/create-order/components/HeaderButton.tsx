/**
 * 悬浮返回按钮组件
 * 按《小程序页面改造规范》规则 11 改造
 */

import { Box, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'

const wxScale = isWxEnvironment() ? 1.1 : 1

// 小程序胶囊按钮位置参数（用于对齐）
// 状态栏高度约 44px，胶囊距状态栏顶部约 6px，胶囊高度约 32px
const wxStatusBarHeight = 44
const wxCapsuleTop = 6  // 胶囊距状态栏的距离
const wxCapsuleHeight = 32

interface HeaderButtonProps {
  isDarkMode: boolean
  onBack?: () => void
}

export function HeaderButton({ isDarkMode, onBack }: HeaderButtonProps) {
  const buttonSize = 36 * wxScale

  // 计算返回按钮的 top 值，使其与胶囊按钮垂直居中对齐
  // 胶囊中心 = 状态栏高度 + 胶囊距顶部 + 胶囊高度/2
  // 返回按钮 top = 胶囊中心 - 按钮高度/2
  const capsuleCenter = wxStatusBarHeight + wxCapsuleTop + wxCapsuleHeight / 2
  const buttonTop = isWxEnvironment() ? capsuleCenter - buttonSize / 2 : 12

  return (
    <Box
      style={{
        position: 'fixed',
        top: buttonTop,
        left: 12 * wxScale,
        zIndex: 50,
      }}
    >
      <Box
        onClick={onBack}
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
        <Icon name="left" size={20 * wxScale} color={isDarkMode ? '#fff' : '#333'} />
      </Box>
    </Box>
  )
}
