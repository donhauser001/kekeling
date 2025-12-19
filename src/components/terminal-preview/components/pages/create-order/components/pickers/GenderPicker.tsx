/**
 * 性别选择器
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import { PickerModal } from '../PickerModal'
import type { ThemeColors } from '../../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface GenderPickerProps {
  selectedGender?: string | null
  onSelect: (gender: string) => void
  onClose: () => void
  colors: ThemeColors
  primaryColor: string
}

const GENDER_OPTIONS = [
  { value: '男', label: '男', icon: 'peoples' },
  { value: '女', label: '女', icon: 'peoples' },
]

export function GenderPicker({
  selectedGender,
  onSelect,
  onClose,
  colors,
  primaryColor,
}: GenderPickerProps) {
  const { textPrimary, borderColor, inputBg } = colors

  return (
    <PickerModal
      title="选择性别"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box
        style={{
          display: 'flex',
          gap: 12 * wxScale,
        }}
      >
        {GENDER_OPTIONS.map((option) => (
          <Box
            key={option.value}
            onClick={() => {
              onSelect(option.value)
              onClose()
            }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8 * wxScale,
              paddingTop: 20 * wxScale,
              paddingBottom: 20 * wxScale,
              borderRadius: 12 * wxScale,
              borderWidth: selectedGender === option.value ? 2 : 1,
              borderStyle: 'solid',
              borderColor: selectedGender === option.value ? primaryColor : borderColor,
              backgroundColor: selectedGender === option.value ? `${primaryColor}10` : inputBg,
            }}
          >
            <Icon
              name={option.icon}
              size={32 * wxScale}
              color={selectedGender === option.value ? primaryColor : textPrimary}
            />
            <Text
              style={{
                fontSize: 14 * wxScale,
                fontWeight: 500,
                color: selectedGender === option.value ? primaryColor : textPrimary,
              }}
            >
              {option.label}
            </Text>
          </Box>
        ))}
      </Box>
    </PickerModal>
  )
}
