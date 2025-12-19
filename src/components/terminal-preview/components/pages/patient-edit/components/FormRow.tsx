/**
 * 表单行组件
 *
 * 统一的表单行布局，包含图标、标签和内容区域
 *
 * @see docs/小程序页面改造规范.md
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { wxScale } from '../constants'

export interface FormRowProps {
  /** 图标名称 */
  icon: string
  /** 标签文本 */
  label: string
  /** 是否必填 */
  required?: boolean
  /** 内容区域 */
  children: React.ReactNode
  /** 边框颜色 */
  borderColor: string
  /** 弱化文本颜色 */
  textMuted: string
  /** 次要文本颜色 */
  textSecondary: string
  /** 是否显示底部边框 */
  showBorder?: boolean
  /** 点击回调 */
  onClick?: () => void
}

export function FormRow({
  icon,
  label,
  required,
  children,
  borderColor,
  textMuted,
  textSecondary,
  showBorder = true,
  onClick,
}: FormRowProps) {
  return (
    <Box
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale,
        borderBottomWidth: showBorder ? 1 : 0,
        borderBottomColor: borderColor,
        borderBottomStyle: 'solid',
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12 * wxScale,
          width: 96 * wxScale,
        }}
      >
        <Icon name={icon} size={16 * wxScale} color={textMuted} />
        <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>{label}</Text>
        {required && <Text style={{ fontSize: 14 * wxScale, color: '#ef4444' }}>*</Text>}
      </Box>
      {children}
    </Box>
  )
}
