/**
 * 备注区域组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Textarea } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ThemeColors } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface RemarkSectionProps {
  value: string
  onChange: (value: string) => void
  colors: ThemeColors
}

export function RemarkSection({ value, onChange, colors }: RemarkSectionProps) {
  const { cardBg, textPrimary, inputBg, borderColor } = colors

  return (
    <Box
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <Text
        style={{
          display: 'block',
          fontSize: 14 * wxScale,
          fontWeight: 500,
          marginBottom: 8 * wxScale,
          color: textPrimary,
        }}
      >
        备注
      </Text>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="请输入备注信息（选填）"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          height: 80 * wxScale,
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderRadius: 8 * wxScale,
          fontSize: 14 * wxScale,
          backgroundColor: inputBg,
          color: textPrimary,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: borderColor,
          resize: 'none',
        }}
      />
    </Box>
  )
}
