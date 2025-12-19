/**
 * 科室选择器
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import { PickerModal } from '../PickerModal'
import type { Department, ThemeColors } from '../../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface DepartmentPickerProps {
  departments: Department[]
  selectedDepartment?: Department
  onSelect: (department: Department) => void
  onClose: () => void
  colors: ThemeColors
  primaryColor: string
}

export function DepartmentPicker({
  departments,
  selectedDepartment,
  onSelect,
  onClose,
  colors,
  primaryColor,
}: DepartmentPickerProps) {
  const { textPrimary, borderColor, inputBg } = colors

  return (
    <PickerModal
      title="选择就诊科室"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8 * wxScale,
        }}
      >
        {departments.map((department) => (
          <Box
            key={department.id}
            onClick={() => {
              onSelect(department)
              onClose()
            }}
            style={{
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 8 * wxScale,
              paddingBottom: 8 * wxScale,
              borderRadius: 8 * wxScale,
              borderWidth: selectedDepartment?.id === department.id ? 2 : 1,
              borderStyle: 'solid',
              borderColor: selectedDepartment?.id === department.id ? primaryColor : borderColor,
              backgroundColor: selectedDepartment?.id === department.id ? `${primaryColor}10` : inputBg,
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: selectedDepartment?.id === department.id ? primaryColor : textPrimary,
              }}
            >
              {department.name}
            </Text>
          </Box>
        ))}
      </Box>
    </PickerModal>
  )
}
