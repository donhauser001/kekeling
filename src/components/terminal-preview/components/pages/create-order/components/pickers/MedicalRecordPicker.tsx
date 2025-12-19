/**
 * 病历本选择器
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import { PickerModal } from '../PickerModal'
import type { MedicalRecord, ThemeColors } from '../../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface MedicalRecordPickerProps {
  medicalRecords: MedicalRecord[]
  selectedMedicalRecord?: MedicalRecord
  onSelect: (record: MedicalRecord) => void
  onClose: () => void
  colors: ThemeColors
  primaryColor: string
}

export function MedicalRecordPicker({
  medicalRecords,
  selectedMedicalRecord,
  onSelect,
  onClose,
  colors,
  primaryColor,
}: MedicalRecordPickerProps) {
  const { textPrimary, textSecondary, textMuted, borderColor, inputBg } = colors

  return (
    <PickerModal
      title="选择病历本"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
        {medicalRecords.map((record) => (
          <Box
            key={record.id}
            onClick={() => {
              onSelect(record)
              onClose()
            }}
            style={{
              padding: 12 * wxScale,
              borderRadius: 8 * wxScale,
              borderWidth: selectedMedicalRecord?.id === record.id ? 2 : 1,
              borderStyle: 'solid',
              borderColor: selectedMedicalRecord?.id === record.id ? primaryColor : borderColor,
              backgroundColor: selectedMedicalRecord?.id === record.id ? `${primaryColor}10` : inputBg,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box style={{ flex: 1 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
                  <Icon name="file-text" size={16 * wxScale} color={primaryColor} />
                  <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                    {record.title}
                  </Text>
                </Box>
                <Text
                  style={{
                    display: 'block',
                    marginTop: 8 * wxScale,
                    fontSize: 12 * wxScale,
                    color: textSecondary,
                  }}
                >
                  {record.hospital} · {record.department}
                </Text>
                <Text
                  style={{
                    display: 'block',
                    marginTop: 4 * wxScale,
                    fontSize: 12 * wxScale,
                    color: textSecondary,
                  }}
                >
                  诊断：{record.diagnosis}
                </Text>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8 * wxScale,
                  }}
                >
                  <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>
                    就诊人：{record.patientName}
                  </Text>
                  <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>
                    {record.date}
                  </Text>
                </Box>
              </Box>
              {selectedMedicalRecord?.id === record.id && (
                <Icon name="check" size={18 * wxScale} color={primaryColor} />
              )}
            </Box>
          </Box>
        ))}
        {/* 添加病历本 */}
        <Box
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
          <Text style={{ fontSize: 14 * wxScale, color: primaryColor }}>添加病历本</Text>
        </Box>
      </Box>
    </PickerModal>
  )
}
