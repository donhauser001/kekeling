/**
 * 服务保障详情弹窗
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Button, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { GuaranteeDetailModalProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function GuaranteeDetailModal({
  guarantee,
  isOpen,
  onClose,
  themeSettings,
  colors,
}: GuaranteeDetailModalProps) {
  const { cardBg, textPrimary, textSecondary } = colors

  if (!isOpen || !guarantee) return null

  return (
    <Box
      className='fixed inset-0 z-50 flex items-end justify-center'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* 遮罩 */}
      <Box
        className='absolute inset-0 bg-black/50'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* 弹窗内容 */}
      <Box
        className='relative w-full max-w-md rounded-t-2xl p-4 pb-8'
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 448,
          borderTopLeftRadius: 16 * wxScale,
          borderTopRightRadius: 16 * wxScale,
          padding: 16 * wxScale,
          paddingBottom: 32 * wxScale,
          backgroundColor: cardBg,
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* 顶部把手 */}
        <Box
          className='flex justify-center mb-3'
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 12 * wxScale,
          }}
        >
          <Box
            style={{
              width: 40 * wxScale,
              height: 4 * wxScale,
              borderRadius: 9999,
              backgroundColor: '#d1d5db',
            }}
          />
        </Box>

        {/* 标题 */}
        <Box
          className='flex items-center gap-3 mb-4'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12 * wxScale,
            marginBottom: 16 * wxScale,
          }}
        >
          <Box
            className='w-10 h-10 rounded-full flex items-center justify-center'
            style={{
              width: 40 * wxScale,
              height: 40 * wxScale,
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ecfdf5',
            }}
          >
            <Icon
              name={guarantee.icon || 'check-one'}
              size={20 * wxScale}
              color="#10b981"
            />
          </Box>
          <Text
            className='text-base font-semibold'
            style={{ fontSize: 16 * wxScale, fontWeight: 600, color: textPrimary }}
          >
            {guarantee.name}
          </Text>
        </Box>

        {/* 内容 */}
        <Text
          className='text-sm leading-relaxed'
          style={{ fontSize: 14 * wxScale, lineHeight: 1.6, color: textSecondary }}
        >
          {guarantee.description || '暂无详细说明'}
        </Text>

        {/* 关闭按钮 */}
        <Button
          className='mt-6 w-full py-2.5 rounded-full text-sm font-medium'
          style={{
            marginTop: 24 * wxScale,
            width: '100%',
            paddingTop: isWxEnvironment() ? 14 * wxScale : 10,
            paddingBottom: isWxEnvironment() ? 14 * wxScale : 10,
            borderRadius: 9999,
            fontSize: 14 * wxScale,
            fontWeight: 500,
            backgroundColor: themeSettings.primaryColor,
            color: '#fff',
          }}
          onClick={onClose}
        >
          我知道了
        </Button>
      </Box>
    </Box>
  )
}
