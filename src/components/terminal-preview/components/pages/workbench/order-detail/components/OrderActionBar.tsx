/**
 * 底部操作栏组件
 */

import { Box, Text } from '../../../../../ui/primitives'
import { Phone, MapPinned, Camera, Flag } from '../../../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../../../platform/env'
import type { OrderActionBarProps } from '../types'

export function OrderActionBar({
  order,
  isFromMyOrders,
  actionLoading,
  themeSettings,
  isDarkMode,
  wxScale,
  onGrab,
  onArrive,
  onComplete,
}: OrderActionBarProps) {
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  // 根据订单状态和来源显示不同操作
  const renderActions = () => {
    // 订单池：显示抢单按钮
    if (!isFromMyOrders && order.status === 'pending') {
      return (
        <Box
          onClick={!actionLoading ? onGrab : undefined}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
            paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
            borderRadius: 9999,
            backgroundColor: actionLoading ? '#9ca3af' : themeSettings.primaryColor,
            opacity: actionLoading ? 0.7 : 1,
          }}
        >
          <Text
            style={{
              fontSize: 15 * wxScale,
              fontWeight: 500,
              color: '#fff',
            }}
          >
            {actionLoading ? '抢单中...' : '立即抢单'}
          </Text>
        </Box>
      )
    }

    // 我的订单：根据状态显示不同操作
    if (isFromMyOrders) {
      switch (order.status) {
        case 'accepted':
          return (
            <>
              {/* 联系客户 */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 20 * wxScale,
                  paddingRight: 20 * wxScale,
                  paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
                  paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
                  borderRadius: 9999,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                }}
              >
                <Phone size={16 * wxScale} color={isDarkMode ? '#fff' : '#374151'} />
                <Text
                  style={{
                    fontSize: 15 * wxScale,
                    fontWeight: 500,
                    color: isDarkMode ? '#fff' : '#374151',
                    marginLeft: 6 * wxScale,
                  }}
                >
                  联系客户
                </Text>
              </Box>
              {/* 确认到达 */}
              <Box
                onClick={!actionLoading ? onArrive : undefined}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
                  paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
                  borderRadius: 9999,
                  backgroundColor: actionLoading ? '#9ca3af' : themeSettings.primaryColor,
                }}
              >
                <MapPinned size={16 * wxScale} color="#fff" />
                <Text
                  style={{
                    fontSize: 15 * wxScale,
                    fontWeight: 500,
                    color: '#fff',
                    marginLeft: 6 * wxScale,
                  }}
                >
                  {actionLoading ? '处理中...' : '确认到达'}
                </Text>
              </Box>
            </>
          )
        case 'ongoing':
          return (
            <>
              {/* 拍照记录 */}
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 20 * wxScale,
                  paddingRight: 20 * wxScale,
                  paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
                  paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
                  borderRadius: 9999,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                }}
              >
                <Camera size={16 * wxScale} color={isDarkMode ? '#fff' : '#374151'} />
                <Text
                  style={{
                    fontSize: 15 * wxScale,
                    fontWeight: 500,
                    color: isDarkMode ? '#fff' : '#374151',
                    marginLeft: 6 * wxScale,
                  }}
                >
                  拍照记录
                </Text>
              </Box>
              {/* 完成服务 */}
              <Box
                onClick={!actionLoading ? onComplete : undefined}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
                  paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
                  borderRadius: 9999,
                  backgroundColor: actionLoading ? '#9ca3af' : '#10b981',
                }}
              >
                <Flag size={16 * wxScale} color="#fff" />
                <Text
                  style={{
                    fontSize: 15 * wxScale,
                    fontWeight: 500,
                    color: '#fff',
                    marginLeft: 6 * wxScale,
                  }}
                >
                  {actionLoading ? '处理中...' : '完成服务'}
                </Text>
              </Box>
            </>
          )
        case 'completed':
        case 'cancelled':
          return null
        default:
          return null
      }
    }

    return null
  }

  const actions = renderActions()
  if (!actions) return null

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        gap: 12 * wxScale,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: isWxEnvironment() ? 34 * wxScale : 12 * wxScale,
        backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: borderColor,
      }}
    >
      {actions}
    </Box>
  )
}

