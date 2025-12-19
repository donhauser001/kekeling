/**
 * 服务保障区域组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ThemeColors } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface GuaranteeSectionProps {
  colors: ThemeColors
}

export function GuaranteeSection({ colors }: GuaranteeSectionProps) {
  const { cardBg, textSecondary } = colors

  return (
    <Box
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
        <Icon name="shield" size={16 * wxScale} color="#10b981" />
        <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
          平台担保 · 先服务后付款 · 不满意可退款
        </Text>
      </Box>
    </Box>
  )
}
