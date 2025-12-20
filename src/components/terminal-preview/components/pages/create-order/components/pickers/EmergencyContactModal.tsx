/**
 * 紧急联系人输入弹窗
 * 按《小程序页面改造规范》改造
 */

import { useState } from 'react'
import { Box, Text, Input, Button } from '../../../../../ui/primitives'
import { isWxEnvironment } from '../../../../../platform/env'
import { PickerModal } from '../PickerModal'
import type { EmergencyContact, ThemeColors } from '../../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface EmergencyContactModalProps {
  value: EmergencyContact
  onConfirm: (contact: EmergencyContact) => void
  onClose: () => void
  colors: ThemeColors
  primaryColor: string
}

export function EmergencyContactModal({
  value,
  onConfirm,
  onClose,
  colors,
  primaryColor,
}: EmergencyContactModalProps) {
  const [name, setName] = useState(value.name)
  const [phone, setPhone] = useState(value.phone)
  const { textPrimary, textSecondary, inputBg, borderColor } = colors

  return (
    <PickerModal
      title="紧急联系人"
      colors={colors}
      primaryColor={primaryColor}
      onClose={onClose}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
        <Box>
          <Text
            style={{
              display: 'block',
              fontSize: 12 * wxScale,
              marginBottom: 4 * wxScale,
              color: textSecondary,
            }}
          >
            姓名
          </Text>
          <Input
            value={name}
            onChange={(value) => setName(value)}
            placeholder="请输入联系人姓名"
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
              borderColor: borderColor,
            }}
          />
        </Box>
        <Box>
          <Text
            style={{
              display: 'block',
              fontSize: 12 * wxScale,
              marginBottom: 4 * wxScale,
              color: textSecondary,
            }}
          >
            电话
          </Text>
          <Input
            type="tel"
            value={phone}
            onChange={(value) => setPhone(value)}
            placeholder="请输入联系人电话"
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
              borderColor: borderColor,
            }}
          />
        </Box>
        <Button
          onClick={() => {
            onConfirm({ name, phone })
            onClose()
          }}
          style={{
            width: '100%',
            paddingTop: isWxEnvironment() ? 14 * wxScale : 10,
            paddingBottom: isWxEnvironment() ? 14 * wxScale : 10,
            borderRadius: 8 * wxScale,
            fontSize: 14 * wxScale,
            fontWeight: 500,
            marginTop: 8 * wxScale,
            backgroundColor: primaryColor,
            color: '#fff',
          }}
        >
          确定
        </Button>
      </Box>
    </PickerModal>
  )
}
