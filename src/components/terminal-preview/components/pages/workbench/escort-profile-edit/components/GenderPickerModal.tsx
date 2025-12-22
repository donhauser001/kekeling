/**
 * 陪诊员资料编辑页面 - 性别选择弹窗
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { wxScale, genderOptions } from '../constants'

interface GenderPickerModalProps {
  visible: boolean
  currentGender: string
  onSelect: (gender: string) => void
  onClose: () => void
  primaryColor: string
  isDarkMode: boolean
}

export function GenderPickerModal({
  visible,
  currentGender,
  onSelect,
  onClose,
  primaryColor,
  isDarkMode,
}: GenderPickerModalProps) {
  if (!visible) return null

  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f0f0f0'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  return (
    <Box
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
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
      <Box
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          borderTopLeftRadius: 16 * wxScale,
          borderTopRightRadius: 16 * wxScale,
          overflow: 'hidden',
          backgroundColor: cardBg,
        }}
      >
        <Box
          style={{
            padding: 12 * wxScale,
            textAlign: 'center',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: textPrimary }}>
            选择性别
          </Text>
        </Box>
        {genderOptions.map((option) => (
          <Box
            key={option.value}
            onClick={() => {
              onSelect(option.value)
              onClose()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12 * wxScale,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>
              {option.label}
            </Text>
            {currentGender === option.value && (
              <Icon name="check" size={20 * wxScale} color={primaryColor} />
            )}
          </Box>
        ))}
        <Box
          onClick={onClose}
          style={{
            padding: 12 * wxScale,
            textAlign: 'center',
          }}
        >
          <Text style={{ fontSize: 14 * wxScale, color: textMuted }}>
            取消
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

