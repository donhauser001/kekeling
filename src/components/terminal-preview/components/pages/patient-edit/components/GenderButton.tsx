/**
 * 性别选择按钮组件
 *
 * 胶囊形状的选择按钮，支持选中状态
 *
 * @see docs/小程序页面改造规范.md
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { wxScale } from '../constants'

export interface GenderButtonProps {
  /** 是否选中 */
  selected: boolean
  /** 按钮文本 */
  label: string
  /** 点击回调 */
  onClick: () => void
  /** 主题色 */
  primaryColor: string
  /** 输入框背景色 */
  inputBg: string
  /** 次要文本颜色 */
  textSecondary: string
  /** 边框颜色 */
  borderColor: string
}

export function GenderButton({
  selected,
  label,
  onClick,
  primaryColor,
  inputBg,
  textSecondary,
  borderColor,
}: GenderButtonProps) {
  return (
    <Box
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6 * wxScale,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 6 * wxScale,
        paddingBottom: 6 * wxScale,
        borderRadius: 9999,
        backgroundColor: selected ? `${primaryColor}20` : inputBg,
        borderWidth: 1,
        borderColor: selected ? primaryColor : borderColor,
        borderStyle: 'solid',
      }}
    >
      {selected && <Icon name="check" size={12 * wxScale} color={primaryColor} />}
      <Text style={{ fontSize: 14 * wxScale, color: selected ? primaryColor : textSecondary }}>
        {label}
      </Text>
    </Box>
  )
}
