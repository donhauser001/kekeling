/**
 * 关系选择器组件
 *
 * 底部弹出的选择器面板，用于选择与就诊人的关系
 *
 * @see docs/小程序页面改造规范.md
 */

import { Box, Text, ScrollView, Icon } from '../../../../ui/primitives'
import { wxScale, relationOptions } from '../constants'
import type { ThemeColors, PatientRelation } from '../types'

export interface RelationPickerProps {
  /** 是否显示 */
  visible: boolean
  /** 当前选中值 */
  value: PatientRelation
  /** 选择回调 */
  onSelect: (value: PatientRelation) => void
  /** 关闭回调 */
  onClose: () => void
  /** 主题颜色 */
  colors: ThemeColors
}

export function RelationPicker({
  visible,
  value,
  onSelect,
  onClose,
  colors,
}: RelationPickerProps) {
  if (!visible) return null

  const { cardBg, textPrimary, textSecondary, borderColor, primaryColor } = colors

  return (
    <>
      {/* 遮罩层 */}
      <Box
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 40,
        }}
      />

      {/* 选择器面板 */}
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderTopLeftRadius: 16 * wxScale,
          borderTopRightRadius: 16 * wxScale,
          maxHeight: '60vh',
          overflow: 'hidden',
          backgroundColor: cardBg,
        }}
      >
        {/* 头部 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
            borderBottomStyle: 'solid',
          }}
        >
          <Box onClick={onClose}>
            <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>取消</Text>
          </Box>
          <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
            选择关系
          </Text>
          <Box onClick={onClose}>
            <Text style={{ fontSize: 14 * wxScale, color: primaryColor }}>确定</Text>
          </Box>
        </Box>

        {/* 选项列表 */}
        <ScrollView style={{ maxHeight: '50vh' }}>
          {relationOptions.map(option => (
            <Box
              key={option.value}
              onClick={() => {
                onSelect(option.value)
                onClose()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 12 * wxScale,
                paddingBottom: 12 * wxScale,
                borderBottomWidth: 1,
                borderBottomColor: borderColor,
                borderBottomStyle: 'solid',
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>{option.label}</Text>
              {value === option.value && (
                <Icon name="check" size={16 * wxScale} color={primaryColor} />
              )}
            </Box>
          ))}
        </ScrollView>

        {/* 底部安全区 */}
        <Box style={{ height: 32 * wxScale }} />
      </Box>
    </>
  )
}
