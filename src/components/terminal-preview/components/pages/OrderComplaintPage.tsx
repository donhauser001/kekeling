/**
 * 订单投诉页面
 *
 * 用户针对订单提交投诉
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon, TextArea, Image
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState 管理状态
 */

import { useState } from 'react'
import { Box, Text, Icon, Textarea, Image } from '../../ui/primitives'
import { isWxEnvironment } from '../../platform/env'
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface OrderComplaintPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  orderId?: string
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

interface ComplaintType {
  value: string
  label: string
  desc: string
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

const complaintTypes: ComplaintType[] = [
  { value: 'service_quality', label: '服务质量问题', desc: '陪诊员服务态度差、不专业等' },
  { value: 'late_arrival', label: '迟到/爽约', desc: '陪诊员未按时到达或未提供服务' },
  { value: 'price_dispute', label: '收费问题', desc: '存在额外收费或收费不合理' },
  { value: 'privacy_leak', label: '隐私泄露', desc: '个人信息被泄露或滥用' },
  { value: 'verbal_abuse', label: '言语不当', desc: '存在辱骂、歧视等不当言行' },
  { value: 'other', label: '其他问题', desc: '以上类型未涵盖的其他问题' },
]

// ============================================================================
// 主组件
// ============================================================================

export function OrderComplaintPage({
  themeSettings,
  isDarkMode,
  orderId,
  onBack,
}: OrderComplaintPageProps) {
  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const inputBg = isDarkMode ? '#1a1a1a' : '#f9fafb'

  // 表单状态
  const [selectedType, setSelectedType] = useState<string>('')
  const [content, setContent] = useState('')
  const [evidence, setEvidence] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 选择图片
  const handleChooseImage = () => {
    const wxApi = typeof wx !== 'undefined' ? (wx as unknown as { chooseMedia?: (...args: unknown[]) => void }) : undefined
    const isWx = typeof wxApi?.chooseMedia === 'function'

    if (isWx) {
      // @ts-ignore wx 在小程序环境中存在
      wx.chooseMedia({
        count: 6 - evidence.length,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res: { tempFiles: Array<{ tempFilePath: string }> }) => {
          const newImages = res.tempFiles.map((f) => f.tempFilePath)
          setEvidence((prev) => [...prev, ...newImages].slice(0, 6))
        },
      })
      return
    }

    // Web 环境
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return

      Array.from(files)
        .slice(0, 6 - evidence.length)
        .forEach((file) => {
          const reader = new FileReader()
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string
            setEvidence((prev) => [...prev, dataUrl].slice(0, 6))
          }
          reader.readAsDataURL(file)
        })
    }

    input.click()
  }

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setEvidence((prev) => prev.filter((_, i) => i !== index))
  }

  // 提交投诉
  const handleSubmit = async () => {
    if (!selectedType) {
      if (isWxEnvironment() && typeof wx !== 'undefined') {
        // @ts-ignore wx
        wx.showToast?.({ title: '请选择投诉类型', icon: 'none' })
      } else {
        alert('请选择投诉类型')
      }
      return
    }
    if (!content.trim()) {
      if (isWxEnvironment() && typeof wx !== 'undefined') {
        // @ts-ignore wx
        wx.showToast?.({ title: '请填写投诉内容', icon: 'none' })
      } else {
        alert('请填写投诉内容')
      }
      return
    }
    if (content.length < 10) {
      if (isWxEnvironment() && typeof wx !== 'undefined') {
        // @ts-ignore wx
        wx.showToast?.({ title: '投诉内容至少需要10个字', icon: 'none' })
      } else {
        alert('投诉内容至少需要10个字')
      }
      return
    }

    if (!orderId) return

    setIsSubmitting(true)
    try {
      await previewApi.submitComplaint(orderId, {
        type: selectedType,
        content,
        evidence,
      })
      setIsSubmitted(true)
    } catch (error) {
      console.error('提交投诉失败:', error)
      if (isWxEnvironment() && typeof wx !== 'undefined') {
        // @ts-ignore wx
        wx.showToast?.({ title: '提交失败，请重试', icon: 'none' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = selectedType && content.trim().length >= 10

  // ========== 提交成功页面 ==========
  if (isSubmitted) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: bgColor,
        }}
      >
        {/* 导航栏 */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: primaryColor,
            paddingTop: wxSafeAreaTop,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: 44 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
            }}
          >
            <Box
              onClick={onBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36 * wxScale,
                height: 36 * wxScale,
              }}
            >
              <Icon name="left" size={22 * wxScale} color="#fff" />
            </Box>
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>投诉反馈</Text>
          </Box>
        </Box>

        {/* 成功提示 */}
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 80 * wxScale,
            paddingLeft: 24 * wxScale,
            paddingRight: 24 * wxScale,
          }}
        >
          <Box
            style={{
              width: 80 * wxScale,
              height: 80 * wxScale,
              borderRadius: 40 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16 * wxScale,
              backgroundColor: `${primaryColor}20`,
            }}
          >
            <Icon name="check-one" size={40 * wxScale} color={primaryColor} />
          </Box>
          <Text
            style={{
              fontSize: 18 * wxScale,
              fontWeight: 600,
              color: textPrimary,
              marginBottom: 8 * wxScale,
            }}
          >
            投诉已提交
          </Text>
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: textSecondary,
              textAlign: 'center',
              lineHeight: 1.6,
              marginBottom: 32 * wxScale,
            }}
          >
            我们已收到您的投诉，将在1-3个工作日内进行处理，处理结果将通过系统消息通知您。
          </Text>
          <Box
            onClick={onBack}
            style={{
              paddingLeft: 32 * wxScale,
              paddingRight: 32 * wxScale,
              paddingTop: 10 * wxScale,
              paddingBottom: 10 * wxScale,
              borderRadius: 9999,
              backgroundColor: primaryColor,
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>返回订单</Text>
          </Box>
        </Box>
      </Box>
    )
  }

  // ========== 投诉表单 ==========
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
        paddingBottom: 100 * wxScale,
      }}
    >
      {/* 导航栏 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: primaryColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          <Box
            onClick={onBack}
            style={{
              position: 'absolute',
              left: 12 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36 * wxScale,
              height: 36 * wxScale,
            }}
          >
            <Icon name="left" size={22 * wxScale} color="#fff" />
          </Box>
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>投诉反馈</Text>
        </Box>
      </Box>

      {/* 提示信息 */}
      <Box
        style={{
          marginLeft: 12 * wxScale,
          marginRight: 12 * wxScale,
          marginTop: 12 * wxScale,
          borderRadius: 12 * wxScale,
          padding: 12 * wxScale,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8 * wxScale,
          backgroundColor: '#fff7e6',
        }}
      >
        <Icon name="caution" size={16 * wxScale} color="#fa8c16" />
        <Text style={{ flex: 1, fontSize: 12 * wxScale, color: '#ad6800', lineHeight: 1.5 }}>
          请如实填写投诉内容，我们将在1-3个工作日内进行核实处理。恶意投诉可能会影响您的账号信用。
        </Text>
      </Box>

      {/* 投诉类型 */}
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
        <Box style={{ display: 'flex', alignItems: 'center', marginBottom: 12 * wxScale }}>
          <Text style={{ fontSize: 14 * wxScale, fontWeight: 600, color: textPrimary }}>
            投诉类型
          </Text>
          <Text style={{ fontSize: 14 * wxScale, color: '#ff4d4f', marginLeft: 4 * wxScale }}>*</Text>
        </Box>

        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
          {complaintTypes.map((type) => (
            <Box
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12 * wxScale,
                padding: 12 * wxScale,
                borderRadius: 8 * wxScale,
                border: `1px solid ${selectedType === type.value ? primaryColor : borderColor}`,
                backgroundColor: selectedType === type.value ? `${primaryColor}10` : inputBg,
                cursor: 'pointer',
              }}
            >
              {/* Radio */}
              <Box
                style={{
                  width: 20 * wxScale,
                  height: 20 * wxScale,
                  borderRadius: 10 * wxScale,
                  border: `2px solid ${selectedType === type.value ? primaryColor : borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {selectedType === type.value && (
                  <Box
                    style={{
                      width: 10 * wxScale,
                      height: 10 * wxScale,
                      borderRadius: 5 * wxScale,
                      backgroundColor: primaryColor,
                    }}
                  />
                )}
              </Box>
              {/* Label */}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                  {type.label}
                </Text>
                <Text style={{ fontSize: 12 * wxScale, color: textMuted, marginTop: 2 * wxScale }}>
                  {type.desc}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 投诉内容 */}
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
        <Box style={{ display: 'flex', alignItems: 'center', marginBottom: 12 * wxScale }}>
          <Text style={{ fontSize: 14 * wxScale, fontWeight: 600, color: textPrimary }}>
            投诉内容
          </Text>
          <Text style={{ fontSize: 14 * wxScale, color: '#ff4d4f', marginLeft: 4 * wxScale }}>*</Text>
        </Box>

        <Box
          style={{
            borderRadius: 8 * wxScale,
            padding: 12 * wxScale,
            backgroundColor: inputBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <Textarea
            value={content}
            onChange={(val) => setContent(val)}
            placeholder="请详细描述您遇到的问题，包括时间、地点、具体情况等（至少10个字）"
            maxLength={500}
            style={{
              width: '100%',
              height: 128 * wxScale,
              fontSize: 14 * wxScale,
              color: textPrimary,
              backgroundColor: 'transparent',
              border: 'none',
              resize: 'none',
              outline: 'none',
            }}
          />
          <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 * wxScale }}>
            <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>{content.length}/500</Text>
          </Box>
        </Box>
      </Box>

      {/* 证据上传 */}
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
            fontSize: 14 * wxScale,
            fontWeight: 600,
            color: textPrimary,
            marginBottom: 4 * wxScale,
          }}
        >
          上传凭证
        </Text>
        <Text style={{ fontSize: 12 * wxScale, color: textMuted, marginBottom: 12 * wxScale }}>
          可上传聊天记录、订单截图等相关凭证（最多6张）
        </Text>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8 * wxScale,
          }}
        >
          {evidence.map((url, index) => (
            <Box
              key={index}
              style={{
                position: 'relative',
                paddingBottom: '100%',
              }}
            >
              <Image
                src={url}
                mode="aspectFill"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 8 * wxScale,
                }}
              />
              <Box
                onClick={() => handleRemoveImage(index)}
                style={{
                  position: 'absolute',
                  top: -4 * wxScale,
                  right: -4 * wxScale,
                  width: 20 * wxScale,
                  height: 20 * wxScale,
                  borderRadius: 10 * wxScale,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="close" size={12 * wxScale} color="#fff" />
              </Box>
            </Box>
          ))}
          {evidence.length < 6 && (
            <Box
              onClick={handleChooseImage}
              style={{
                position: 'relative',
                paddingBottom: '100%',
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 8 * wxScale,
                  border: `2px dashed ${borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4 * wxScale,
                  cursor: 'pointer',
                }}
              >
                <Icon name="camera" size={20 * wxScale} color={textMuted} />
                <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>添加图片</Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* 底部提交按钮 */}
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderTop: `1px solid ${borderColor}`,
          backgroundColor: cardBg,
        }}
      >
        <Box
          onClick={!isFormValid || isSubmitting ? undefined : handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8 * wxScale,
            width: '100%',
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            borderRadius: 9999,
            backgroundColor: primaryColor,
            opacity: !isFormValid || isSubmitting ? 0.5 : 1,
            cursor: isFormValid && !isSubmitting ? 'pointer' : 'not-allowed',
          }}
        >
          {isSubmitting && <Icon name="refresh" size={16 * wxScale} color="#fff" />}
          <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: '#fff' }}>
            {isSubmitting ? '提交中...' : '提交投诉'}
          </Text>
        </Box>
        <Text
          style={{
            fontSize: 12 * wxScale,
            color: textMuted,
            textAlign: 'center',
            marginTop: 8 * wxScale,
          }}
        >
          提交后无法撤回，请确认信息无误
        </Text>
      </Box>
    </Box>
  )
}
