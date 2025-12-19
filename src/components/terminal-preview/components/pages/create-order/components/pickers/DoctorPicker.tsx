/**
 * 医生选择器
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import { PickerModal } from '../PickerModal'
import type { Doctor, ThemeColors } from '../../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface DoctorPickerProps {
  doctors: Doctor[]
  selectedDoctor?: Doctor
  onSelect: (doctor: Doctor) => void
  onClose: () => void
  colors: ThemeColors
  primaryColor: string
}

export function DoctorPicker({
  doctors,
  selectedDoctor,
  onSelect,
  onClose,
  colors,
  primaryColor,
}: DoctorPickerProps) {
  const { textPrimary, textSecondary, borderColor, inputBg } = colors

  return (
    <PickerModal
      title="选择医生"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
        {doctors.map((doctor) => (
          <Box
            key={doctor.id}
            onClick={() => {
              onSelect(doctor)
              onClose()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12 * wxScale,
              borderRadius: 8 * wxScale,
              borderWidth: selectedDoctor?.id === doctor.id ? 2 : 1,
              borderStyle: 'solid',
              borderColor: selectedDoctor?.id === doctor.id ? primaryColor : borderColor,
              backgroundColor: selectedDoctor?.id === doctor.id ? `${primaryColor}10` : inputBg,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
              {/* 头像占位 */}
              <Box
                style={{
                  width: 40 * wxScale,
                  height: 40 * wxScale,
                  borderRadius: 20 * wxScale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${primaryColor}20`,
                }}
              >
                <Icon name="peoples" size={20 * wxScale} color={primaryColor} />
              </Box>
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
                  <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                    {doctor.name}
                  </Text>
                  <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
                    {doctor.title}
                  </Text>
                </Box>
                <Text
                  style={{
                    display: 'block',
                    marginTop: 2 * wxScale,
                    fontSize: 12 * wxScale,
                    color: textSecondary,
                  }}
                >
                  {doctor.department}
                </Text>
              </Box>
            </Box>
            {selectedDoctor?.id === doctor.id && (
              <Icon name="check" size={18 * wxScale} color={primaryColor} />
            )}
          </Box>
        ))}
      </Box>
    </PickerModal>
  )
}
