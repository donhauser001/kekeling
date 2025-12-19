/**
 * 收入概览组件
 *
 * 按小程序页面改造规范实现：
 * - 使用跨平台原语 Box, Text
 * - 使用 lucide-compat 图标
 * - 布局属性在 style 中定义
 * - wxScale 用于视觉尺寸
 */

import { Box, Text } from '../../../../ui/primitives'
import { CreditCard } from '../../../../ui/lucide-compat'
import type { IncomeOverviewProps } from '../types'

/**
 * 格式化金额显示
 */
function formatMoney(amount: number): string {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + 'w'
  }
  return amount.toFixed(2)
}

export function IncomeOverview({
  stats,
  themeSettings,
  isDarkMode,
  wxScale,
  onWithdraw,
}: IncomeOverviewProps) {
  return (
    <Box
      style={{
        padding: 16 * wxScale,
        borderRadius: 12 * wxScale,
        marginTop: 16 * wxScale,
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
    >
      {/* 标题和今日收入 */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16 * wxScale,
        }}
      >
        <Box>
          <Text
            style={{
              display: 'block',
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: isDarkMode ? '#fff' : '#111827',
            }}
          >
            收入概览
          </Text>
          <Box
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 4 * wxScale,
              marginTop: 4 * wxScale,
            }}
          >
            <Text
              style={{
                fontSize: 28 * wxScale,
                fontWeight: 700,
                color: isDarkMode ? '#fff' : '#111827',
              }}
            >
              ¥{formatMoney(stats.monthEarnings)}
            </Text>
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: isDarkMode ? '#9ca3af' : '#6b7280',
              }}
            >
              本月
            </Text>
          </Box>
        </Box>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: isDarkMode ? '#9ca3af' : '#6b7280',
            }}
          >
            总服务单
          </Text>
          <Text
            style={{
              marginTop: 2 * wxScale,
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: isDarkMode ? '#fff' : '#111827',
            }}
          >
            {stats.totalOrders}
          </Text>
        </Box>
      </Box>

      {/* 可提现金额 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 12 * wxScale,
          borderRadius: 8 * wxScale,
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb',
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
          }}
        >
          <CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: isDarkMode ? '#d1d5db' : '#4b5563',
            }}
          >
            可提现余额
          </Text>
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: isDarkMode ? '#fff' : '#111827',
            }}
          >
            ¥{formatMoney(stats.balance)}
          </Text>
          <Box
            onClick={onWithdraw}
            style={{
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
              paddingTop: 4 * wxScale,
              paddingBottom: 4 * wxScale,
              borderRadius: 9999,
              backgroundColor: themeSettings.primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                fontWeight: 500,
                color: '#fff',
              }}
            >
              提现
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
