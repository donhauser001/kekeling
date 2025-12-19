/**
 * 订单统计组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { OrderSectionProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function OrderSection({
  orderEntries,
  colors,
  onViewAll,
  onOrderClick,
}: OrderSectionProps) {
  const { cardBg, borderColor, textPrimary, textSecondary, textMuted } = colors

  return (
    <Box
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: -16 * wxScale,
        borderRadius: 12 * wxScale,
        overflow: 'hidden',
        backgroundColor: cardBg,
      }}
    >
      {/* 标题栏 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: borderColor,
        }}
      >
        <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
          我的订单
        </Text>
        <Box
          onClick={onViewAll}
          style={{ display: 'flex', alignItems: 'center', gap: 2 * wxScale }}
        >
          <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>全部订单</Text>
          <Icon name="right" size={16 * wxScale} color={textMuted} />
        </Box>
      </Box>

      {/* 订单入口 */}
      <Box
        style={{
          display: 'flex',
          paddingTop: 16 * wxScale,
          paddingBottom: 16 * wxScale,
        }}
      >
        {orderEntries.map((entry) => (
          <Box
            key={entry.key}
            onClick={() => onOrderClick(entry.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6 * wxScale,
            }}
          >
            <Box style={{ position: 'relative' }}>
              <Icon name={entry.icon} size={24 * wxScale} color={textSecondary} />
              {entry.count > 0 && (
                <Box
                  style={{
                    position: 'absolute',
                    top: -6 * wxScale,
                    right: -8 * wxScale,
                    // 使用固定尺寸保证圆形，多位数字时稍微加宽
                    width: entry.count > 9 ? 20 * wxScale : 16 * wxScale,
                    height: 16 * wxScale,
                    borderRadius: 8 * wxScale,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ff4d4f',
                  }}
                >
                  <Text style={{ fontSize: 10 * wxScale, color: '#fff', lineHeight: 1 }}>
                    {entry.count}
                  </Text>
                </Box>
              )}
            </Box>
            <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>{entry.title}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

