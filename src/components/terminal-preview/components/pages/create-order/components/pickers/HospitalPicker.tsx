/**
 * 医院选择器
 * 按《小程序页面改造规范》改造
 */

import { useMemo, useState } from 'react'
import { Box, Text, Icon, Input } from '../../../../../ui/primitives'
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
  const { textPrimary, textSecondary, textMuted, borderColor, inputBg } = colors
  const [keyword, setKeyword] = useState('')

  const filteredHospitals = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return hospitals
    return hospitals.filter((hospital) => {
      const name = hospital.name?.toLowerCase() || ''
      const shortName = hospital.shortName?.toLowerCase() || ''
      const address = hospital.address?.toLowerCase() || ''
      return name.includes(q) || shortName.includes(q) || address.includes(q)
    })
  }, [hospitals, keyword])

  return (
    <PickerModal
      title="选择就诊医院"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 * wxScale }}>
        <Input
          value={keyword}
          onChange={setKeyword}
          placeholder="搜索医院名称或简称"
          style={{
            width: '100%',
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 10 * wxScale,
            paddingBottom: 10 * wxScale,
            borderRadius: 8 * wxScale,
            fontSize: 14 * wxScale,
            backgroundColor: inputBg,
            color: textPrimary,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor,
          }}
        />

        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
          {filteredHospitals.map((hospital) => (
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

          {filteredHospitals.length === 0 && (
            <Box
              style={{
                paddingTop: 20 * wxScale,
                paddingBottom: 20 * wxScale,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 13 * wxScale, color: textMuted }}>未找到相关医院</Text>
            </Box>
          )}
        </Box>
      </Box>
    </PickerModal>
  )
}
