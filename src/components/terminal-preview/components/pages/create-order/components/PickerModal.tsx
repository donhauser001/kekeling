/**
 * 选择器弹窗组件
 * 按《小程序页面改造规范》改造
 */

import { useState } from 'react'
import { Box, Text, Input } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ThemeColors } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface PickerModalProps {
  title: string
  colors: ThemeColors
  primaryColor: string
  onClose: () => void
  children: React.ReactNode
}

export function PickerModal({
  title,
  colors,
  primaryColor,
  onClose,
  children,
}: PickerModalProps) {
  const { cardBg, textPrimary, borderColor } = colors

  return (
    <Box
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* 遮罩 */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      {/* 弹窗内容 */}
      <Box
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 448,
          maxHeight: '70vh',
          borderTopLeftRadius: 16 * wxScale,
          borderTopRightRadius: 16 * wxScale,
          overflow: 'hidden',
          backgroundColor: cardBg,
        }}
      >
        {/* 顶部 */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            backgroundColor: cardBg,
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: borderColor,
          }}
        >
          <Box style={{ width: 40 * wxScale }} />
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: textPrimary }}>
            {title}
          </Text>
          <Box
            onClick={onClose}
            style={{ width: 40 * wxScale, textAlign: 'right' }}
          >
            <Text style={{ fontSize: 14 * wxScale, color: primaryColor }}>取消</Text>
          </Box>
        </Box>
        {/* 内容 */}
        <Box
          style={{
            padding: 16 * wxScale,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

interface InputModalProps {
  title: string
  colors: ThemeColors
  primaryColor: string
  value: string
  placeholder: string
  onClose: () => void
  onConfirm: (value: string) => void
}

export function InputModal({
  title,
  colors,
  primaryColor,
  value,
  placeholder,
  onClose,
  onConfirm,
}: InputModalProps) {
  const [inputValue, setInputValue] = useState(value)
  const { cardBg, textPrimary, textMuted, borderColor, inputBg } = colors

  return (
    <Box
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* 遮罩 */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      {/* 弹窗内容 */}
      <Box
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 448,
          borderTopLeftRadius: 16 * wxScale,
          borderTopRightRadius: 16 * wxScale,
          overflow: 'hidden',
          backgroundColor: cardBg,
        }}
      >
        {/* 顶部 */}
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
            borderBottomStyle: 'solid',
            borderBottomColor: borderColor,
          }}
        >
          <Box onClick={onClose}>
            <Text style={{ fontSize: 14 * wxScale, color: textMuted }}>取消</Text>
          </Box>
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: textPrimary }}>
            {title}
          </Text>
          <Box onClick={() => onConfirm(inputValue)}>
            <Text style={{ fontSize: 14 * wxScale, color: primaryColor }}>确定</Text>
          </Box>
        </Box>
        {/* 输入框 */}
        <Box style={{ padding: 16 * wxScale }}>
          <Input
            value={inputValue}
            onChange={(value) => setInputValue(value)}
            placeholder={placeholder}
            style={{
              width: '100%',
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
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
