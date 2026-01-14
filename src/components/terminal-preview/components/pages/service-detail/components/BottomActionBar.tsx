/**
 * 底部操作栏组件
 * 按《小程序页面改造规范》改造
 */

import { MessageCircle, Phone } from '../../../../ui/lucide-compat'
import { Box, Text, Button } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { BottomActionBarProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function BottomActionBar({
  serviceId,
  themeSettings,
  colors,
  servicePhone,
  onNavigate,
  onCustomerService,
  onPhoneCall,
}: BottomActionBarProps) {
  const { cardBg, borderColor, textMuted } = colors
  const phone = String(servicePhone || themeSettings.servicePhone || '400-888-8888')

  return (
    <Box
      className='sticky bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-3 border-t z-30 mt-3'
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 12 * wxScale,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale,
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: borderColor,
        zIndex: 30,
        marginTop: 12 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      {/* 客服按钮 */}
      <Box
        className='flex flex-col items-center cursor-pointer'
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={onCustomerService}
      >
        <MessageCircle size={20 * wxScale} color={textMuted} />
        <Text style={{ fontSize: 10 * wxScale, marginTop: 2 * wxScale, color: textMuted }}>
          客服
        </Text>
      </Box>

      {/* 电话按钮 */}
      <Box
        className='flex flex-col items-center cursor-pointer'
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={() => onPhoneCall?.(phone)}
      >
        <Phone size={20 * wxScale} color={textMuted} />
        <Text style={{ fontSize: 10 * wxScale, marginTop: 2 * wxScale, color: textMuted }}>
          电话
        </Text>
      </Box>

      {/* 立即预约按钮 */}
      <Button
        className='flex-1 py-2.5 rounded-full text-sm font-medium text-white'
        style={{
          flex: 1,
          paddingTop: isWxEnvironment() ? 14 * wxScale : 10,
          paddingBottom: isWxEnvironment() ? 14 * wxScale : 10,
          borderRadius: 9999,
          fontSize: 14 * wxScale,
          fontWeight: 500,
          backgroundColor: themeSettings.primaryColor,
          color: '#fff',
        }}
        onClick={() => onNavigate?.('create-order', { serviceId })}
      >
        立即预约
      </Button>
    </Box>
  )
}
