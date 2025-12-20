/**
 * 日期和时间选择器
 * 按《小程序页面改造规范》改造
 */

import { Box, Text } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import { PickerModal } from '../PickerModal'
import type { DateOption, TimeOption, ThemeColors } from '../../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

// ============================================================================
// 日期选择器
// ============================================================================

interface DatePickerProps {
  dateOptions: DateOption[]
  selectedDate?: string
  onSelect: (date: string) => void
  onClose: () => void
  colors: ThemeColors
  primaryColor: string
}

export function DatePicker({
  dateOptions,
  selectedDate,
  onSelect,
  onClose,
  colors,
  primaryColor,
}: DatePickerProps) {
  const { textPrimary, textSecondary, borderColor, inputBg } = colors

  return (
    <PickerModal
      title="选择日期"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8 * wxScale,
        }}
      >
        {dateOptions.map((option) => (
          <Box
            key={option.value}
            onClick={() => {
              onSelect(option.value)
              onClose()
            }}
            style={{
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
              borderRadius: 8 * wxScale,
              textAlign: 'center',
              borderWidth: selectedDate === option.value ? 2 : 1,
              borderStyle: 'solid',
              borderColor: selectedDate === option.value ? primaryColor : borderColor,
              backgroundColor: selectedDate === option.value ? `${primaryColor}10` : inputBg,
            }}
          >
            <Text
              style={{
                display: 'block',
                fontSize: 14 * wxScale,
                fontWeight: 500,
                color: selectedDate === option.value ? primaryColor : textPrimary,
              }}
            >
              {option.label}
            </Text>
            <Text
              style={{
                display: 'block',
                marginTop: 4 * wxScale,
                fontSize: 12 * wxScale,
                color: textSecondary,
              }}
            >
              {option.date}
            </Text>
          </Box>
        ))}
      </Box>
    </PickerModal>
  )
}

// ============================================================================
// 时间选择器
// ============================================================================

interface TimePickerProps {
  timeOptions: TimeOption[]
  selectedTime?: string
  onSelect: (time: string) => void
  onClose: () => void
  colors: ThemeColors
  primaryColor: string
}

export function TimePicker({
  timeOptions,
  selectedTime,
  onSelect,
  onClose,
  colors,
  primaryColor,
}: TimePickerProps) {
  const { textPrimary, borderColor, inputBg } = colors

  return (
    <PickerModal
      title="选择时间"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8 * wxScale,
        }}
      >
        {timeOptions.map((option) => (
          <Box
            key={option.value}
            onClick={() => {
              onSelect(option.value)
              onClose()
            }}
            style={{
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
              borderRadius: 8 * wxScale,
              textAlign: 'center',
              borderWidth: selectedTime === option.value ? 2 : 1,
              borderStyle: 'solid',
              borderColor: selectedTime === option.value ? primaryColor : borderColor,
              backgroundColor: selectedTime === option.value ? `${primaryColor}10` : inputBg,
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: selectedTime === option.value ? primaryColor : textPrimary,
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
