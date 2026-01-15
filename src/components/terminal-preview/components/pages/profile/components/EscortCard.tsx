/**
 * 陪诊员入口卡片组件
 * 按《小程序页面改造规范》改造
 *
 * 显示逻辑：
 * - hasEscortQualification 为 true: 显示"陪诊员工作台"，点击进入工作台（可能需要登录）
 * - hasEscortQualification 为 false: 显示"成为陪诊员"，点击跳转申请页
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { EscortCardProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function EscortCard({
  hasEscortQualification,
  colors,
  primaryColor,
  onEscortEntryClick,
  onWorkbenchClick,
}: EscortCardProps) {
  const { cardBg, textPrimary, textMuted } = colors

  return (
    <Box
      onClick={hasEscortQualification ? onWorkbenchClick : onEscortEntryClick}
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
        borderWidth: hasEscortQualification ? 1 : 0,
        borderStyle: 'solid',
        borderColor: hasEscortQualification ? `${primaryColor}40` : 'transparent',
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
          backgroundColor: hasEscortQualification ? primaryColor : `${primaryColor}20`,
        }}
      >
        <Icon
          name="workbench"
          size={20 * wxScale}
          color={hasEscortQualification ? '#fff' : primaryColor}
        />
      </Box>

      {/* 文字 */}
      <Box style={{ flex: 1 }}>
        <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
          {hasEscortQualification ? '陪诊员工作台' : '成为陪诊员'}
        </Text>
        <Text
          style={{
            display: 'block',
            marginTop: 2 * wxScale,
            fontSize: 12 * wxScale,
            color: textMuted,
          }}
        >
          {hasEscortQualification ? '管理订单、查看收入' : '加入我们，开启陪诊服务'}
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
          {hasEscortQualification ? '进入工作台' : '立即加入'}
        </Text>
      </Box>
    </Box>
  )
}
