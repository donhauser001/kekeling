/**
 * 性别选择弹窗组件
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { wxScale, genderOptions } from '../constants'
import type { GenderPickerProps } from '../types'

export function GenderPicker({
  visible,
  onClose,
  value,
  onChange,
  colors,
}: GenderPickerProps) {
  if (!visible) return null

  const { cardBg, borderColor, textPrimary, textMuted, primaryColor } = colors

  return (
    <Box
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      {/* 遮罩层 */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* 弹窗内容 */}
      <Box
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          borderTopLeftRadius: 16 * wxScale,
          borderTopRightRadius: 16 * wxScale,
          overflow: 'hidden',
          backgroundColor: cardBg,
        }}
      >
        {/* 标题 */}
        <Box
          style={{
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            textAlign: 'center',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 500,
              color: textPrimary,
            }}
          >
            选择性别
          </Text>
        </Box>

        {/* 选项列表 */}
        {genderOptions.map((option) => (
          <Box
            key={option.value}
            onClick={() => {
              onChange(option.value)
              onClose()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 14 * wxScale,
              paddingBottom: 14 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: textPrimary,
              }}
            >
              {option.label}
            </Text>
            {value === option.value && (
              <Icon name="check" size={20 * wxScale} color={primaryColor} />
            )}
          </Box>
        ))}

        {/* 取消按钮 */}
        <Box
          onClick={onClose}
          style={{
            paddingTop: 14 * wxScale,
            paddingBottom: 14 * wxScale,
            textAlign: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: textMuted,
            }}
          >
            取消
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

