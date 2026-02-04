/**
 * 就诊人选择器
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import { PickerModal } from '../PickerModal'
import type { Patient, ThemeColors } from '../../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface PatientPickerProps {
  patients: Patient[]
  selectedPatient?: Patient
  onSelect: (patient: Patient) => void
  onClose: () => void
  onAddPatient?: () => void
  colors: ThemeColors
  primaryColor: string
}

function getRelationLabel(relation: string) {
  const map: Record<string, string> = {
    self: '本人',
    parent: '父母',
    child: '子女',
    spouse: '配偶',
    other: '其他',
  }
  return map[relation] || relation
}

export function PatientPicker({
  patients,
  selectedPatient,
  onSelect,
  onClose,
  onAddPatient,
  colors,
  primaryColor,
}: PatientPickerProps) {
  const { textPrimary, textSecondary, borderColor, inputBg } = colors

  return (
    <PickerModal
      title="选择就诊人"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
        {patients.map((patient) => (
          <Box
            key={patient.id}
            onClick={() => {
              onSelect(patient)
              onClose()
            }}
            style={{
              padding: 12 * wxScale,
              borderRadius: 8 * wxScale,
              borderWidth: selectedPatient?.id === patient.id ? 2 : 1,
              borderStyle: 'solid',
              borderColor: selectedPatient?.id === patient.id ? primaryColor : borderColor,
              backgroundColor: selectedPatient?.id === patient.id ? `${primaryColor}10` : inputBg,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
                <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                  {patient.name}
                </Text>
                <Box
                  style={{
                    paddingLeft: 6 * wxScale,
                    paddingRight: 6 * wxScale,
                    paddingTop: 2 * wxScale,
                    paddingBottom: 2 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: `${primaryColor}20`,
                  }}
                >
                  <Text style={{ fontSize: 10 * wxScale, color: primaryColor }}>
                    {getRelationLabel(patient.relation)}
                  </Text>
                </Box>
              </Box>
              {selectedPatient?.id === patient.id && (
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
              {patient.phone} · {patient.idCard}
            </Text>
          </Box>
        ))}
        {/* 添加就诊人 */}
        <Box
          onClick={onAddPatient}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            borderRadius: 8 * wxScale,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: borderColor,
          }}
        >
          <Icon name="plus" size={16 * wxScale} color={primaryColor} />
          <Text style={{ fontSize: 14 * wxScale, color: primaryColor }}>添加就诊人</Text>
        </Box>
      </Box>
    </PickerModal>
  )
}
