/**
 * 医院选择器
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import { PickerModal } from '../PickerModal'
import type { Hospital, ThemeColors } from '../../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface HospitalPickerProps {
  hospitals: Hospital[]
  selectedHospital?: Hospital
  onSelect: (hospital: Hospital) => void
  onClose: () => void
  colors: ThemeColors
  primaryColor: string
}

export function HospitalPicker({
  hospitals,
  selectedHospital,
  onSelect,
  onClose,
  colors,
  primaryColor,
}: HospitalPickerProps) {
  const { textPrimary, textSecondary, borderColor, inputBg } = colors

  return (
    <PickerModal
      title="选择就诊医院"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
        {hospitals.map((hospital) => (
          <Box
            key={hospital.id}
            onClick={() => {
              onSelect(hospital)
              onClose()
            }}
            style={{
              padding: 12 * wxScale,
              borderRadius: 8 * wxScale,
              borderWidth: selectedHospital?.id === hospital.id ? 2 : 1,
              borderStyle: 'solid',
              borderColor: selectedHospital?.id === hospital.id ? primaryColor : borderColor,
              backgroundColor: selectedHospital?.id === hospital.id ? `${primaryColor}10` : inputBg,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                {hospital.name}
              </Text>
              {selectedHospital?.id === hospital.id && (
                <Icon name="check" size={18 * wxScale} color={primaryColor} />
              )}
            </Box>
            <Text
              style={{
                display: 'block',
                marginTop: 4 * wxScale,
                fontSize: 12 * wxScale,
                color: textSecondary,
              }}
            >
              {hospital.address}
            </Text>
          </Box>
        ))}
      </Box>
    </PickerModal>
  )
}
