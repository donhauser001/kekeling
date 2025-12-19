/**
 * 陪诊员入口卡片组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { EscortCardProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function EscortCard({
  isEscort,
  colors,
  primaryColor,
  onEscortEntryClick,
  onWorkbenchClick,
}: EscortCardProps) {
  const { cardBg, textPrimary, textMuted } = colors

  return (
    <Box
      onClick={isEscort ? onWorkbenchClick : onEscortEntryClick}
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        display: 'flex',
        alignItems: 'center',
        gap: 12 * wxScale,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale,
        backgroundColor: cardBg,
        borderWidth: isEscort ? 1 : 0,
        borderStyle: 'solid',
        borderColor: isEscort ? `${primaryColor}40` : 'transparent',
      }}
    >
      {/* 图标 */}
      <Box
        style={{
          width: 40 * wxScale,
          height: 40 * wxScale,
          borderRadius: 20 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isEscort ? primaryColor : `${primaryColor}20`,
        }}
      >
        <Icon
          name="workbench"
          size={20 * wxScale}
          color={isEscort ? '#fff' : primaryColor}
        />
      </Box>

      {/* 文字 */}
      <Box style={{ flex: 1 }}>
        <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
          {isEscort ? '陪诊员工作台' : '成为陪诊员'}
        </Text>
        <Text
          style={{
            display: 'block',
            marginTop: 2 * wxScale,
            fontSize: 12 * wxScale,
            color: textMuted,
          }}
        >
          {isEscort ? '管理订单、查看收入' : '加入我们，开启陪诊服务'}
        </Text>
      </Box>

      {/* 按钮 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 6 * wxScale,
          paddingBottom: 6 * wxScale,
          borderRadius: 9999,
          backgroundColor: primaryColor,
        }}
      >
        <Text style={{ fontSize: 12 * wxScale, color: '#fff' }}>
          {isEscort ? '进入工作台' : '立即加入'}
        </Text>
      </Box>
    </Box>
  )
}

