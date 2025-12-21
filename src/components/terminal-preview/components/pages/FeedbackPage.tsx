/**
 * 意见反馈页面
 *
 * 用户提交意见反馈、建议、问题等
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon, TextArea, Image
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState 管理状态
 */

import { useState } from 'react'
import { Box, Text, Icon, Textarea, Image, Input } from '../../ui/primitives'
import { isWxEnvironment } from '../../platform/env'
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface FeedbackPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

interface FeedbackType {
  value: string
  label: string
  desc: string
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

const feedbackTypes: FeedbackType[] = [
  { value: 'suggestion', label: '功能建议', desc: '对产品功能的改进建议' },
  { value: 'bug', label: '问题反馈', desc: '使用过程中遇到的问题' },
  { value: 'service', label: '服务相关', desc: '对服务质量的意见或建议' },
  { value: 'experience', label: '体验优化', desc: '使用体验方面的建议' },
  { value: 'other', label: '其他', desc: '以上类型未涵盖的其他反馈' },
]

// ============================================================================
// 骨架屏组件
// ============================================================================

function FeedbackPageSkeleton({
  bgColor,
  cardBg,
}: {
  bgColor: string
  cardBg: string
}) {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
        padding: 16 * wxScale,
        paddingTop: wxSafeAreaTop + 56 * wxScale,
      }}
    >
      {/* 类型选择骨架 */}
      <Box
        style={{
          backgroundColor: cardBg,
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginBottom: 16 * wxScale,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Box
            key={i}
            style={{
              height: 48 * wxScale,
              backgroundColor: '#f3f4f6',
              borderRadius: 8 * wxScale,
              marginBottom: i < 5 ? 8 * wxScale : 0,
            }}
          />
        ))}
      </Box>
      {/* 内容输入骨架 */}
      <Box
        style={{
          backgroundColor: cardBg,
          borderRadius: 12 * wxScale,
          height: 150 * wxScale,
        }}
      />
    </Box>
  )
}

// ============================================================================
// 主组件
// ============================================================================

export function FeedbackPage({
  themeSettings,
  isDarkMode,
  onBack,
}: FeedbackPageProps) {
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
  const [contact, setContact] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 选择图片
  const handleChooseImage = () => {
    if (isWxEnvironment()) {
      // 小程序环境
      wx.chooseMedia({
        count: 9 - images.length,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res: any) => {
          const newImages = res.tempFiles.map((file: any) => file.tempFilePath)
          setImages([...images, ...newImages])
        },
      })
    } else {
      // Web 环境（模拟）
      const mockImages = [
        'https://picsum.photos/200/200?random=' + Math.random(),
      ]
      setImages([...images, ...mockImages])
    }
  }

  // 删除图片
  const handleDeleteImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  // 提交反馈
  const handleSubmit = async () => {
    if (!selectedType) {
      if (isWxEnvironment()) {
        wx.showToast({ title: '请选择反馈类型', icon: 'none' })
      }
      return
    }

    if (!content.trim()) {
      if (isWxEnvironment()) {
        wx.showToast({ title: '请输入反馈内容', icon: 'none' })
      }
      return
    }

    if (content.trim().length < 10) {
      if (isWxEnvironment()) {
        wx.showToast({ title: '反馈内容不能少于10个字', icon: 'none' })
      }
      return
    }

    setIsSubmitting(true)

    try {
      // 调用 API 提交反馈
      await previewApi.submitFeedback({
        type: selectedType,
        content: content.trim(),
        contact: contact.trim(),
        images,
      })

      setIsSubmitted(true)
      if (isWxEnvironment()) {
        wx.showToast({ title: '提交成功', icon: 'success' })
      }
    } catch (error: any) {
      if (isWxEnvironment()) {
        wx.showToast({
          title: error.message || '提交失败，请重试',
          icon: 'none',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 加载状态
  if (isLoading) {
    return <FeedbackPageSkeleton bgColor={bgColor} cardBg={cardBg} />
  }

  // 提交成功后显示
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
            <Text
              style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}
            >
              意见反馈
            </Text>
          </Box>
        </Box>

        {/* 成功状态 */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32 * wxScale,
          }}
        >
          <Box
            style={{
              width: 80 * wxScale,
              height: 80 * wxScale,
              borderRadius: 40 * wxScale,
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24 * wxScale,
            }}
          >
            <Icon name="check" size={40 * wxScale} color="#fff" />
          </Box>

          <Text
            style={{
              display: 'block',
              fontSize: 20 * wxScale,
              fontWeight: 600,
              color: textPrimary,
              marginBottom: 12 * wxScale,
            }}
          >
            提交成功
          </Text>

          <Text
            style={{
              display: 'block',
              fontSize: 14 * wxScale,
              color: textSecondary,
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            感谢您的反馈，我们会认真查看并持续改进
          </Text>

          <Box
            onClick={onBack}
            style={{
              marginTop: 32 * wxScale,
              paddingLeft: 32 * wxScale,
              paddingRight: 32 * wxScale,
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
              backgroundColor: primaryColor,
              borderRadius: 24 * wxScale,
            }}
          >
            <Text style={{ fontSize: 15 * wxScale, color: '#fff' }}>返回</Text>
          </Box>
        </Box>
      </Box>
    )
  }

  // ========== 反馈表单 ==========
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
          <Text
            style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}
          >
            意见反馈
          </Text>
        </Box>
      </Box>

      {/* 提示信息 */}
      <Box
        style={{
          marginLeft: 12 * wxScale,
          marginRight: 12 * wxScale,
          marginTop: 12 * wxScale,
          marginBottom: 12 * wxScale,
          padding: 12 * wxScale,
          backgroundColor: `${primaryColor}15`,
          borderRadius: 8 * wxScale,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8 * wxScale,
        }}
      >
        <Icon name="info" size={18 * wxScale} color={primaryColor} />
        <Text
          style={{
            flex: 1,
            fontSize: 13 * wxScale,
            color: primaryColor,
            lineHeight: 1.5,
          }}
        >
          您的反馈对我们非常重要，我们会认真对待每一条建议。
        </Text>
      </Box>

      {/* 反馈类型选择 */}
      <Box
        style={{
          marginLeft: 12 * wxScale,
          marginRight: 12 * wxScale,
          marginBottom: 12 * wxScale,
          backgroundColor: cardBg,
          borderRadius: 12 * wxScale,
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            padding: 16 * wxScale,
            paddingBottom: 8 * wxScale,
          }}
        >
          <Text
            style={{
              display: 'block',
              fontSize: 15 * wxScale,
              fontWeight: 600,
              color: textPrimary,
            }}
          >
            反馈类型
          </Text>
          <Text
            style={{
              display: 'block',
              fontSize: 12 * wxScale,
              color: textMuted,
              marginTop: 4 * wxScale,
            }}
          >
            请选择与您反馈最相关的类型
          </Text>
        </Box>

        {feedbackTypes.map((type, index) => (
          <Box
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16 * wxScale,
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
              borderTop:
                index > 0 ? `1px solid ${borderColor}` : 'none',
            }}
          >
            <Box
              style={{
                width: 22 * wxScale,
                height: 22 * wxScale,
                borderRadius: 11 * wxScale,
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor:
                  selectedType === type.value ? primaryColor : borderColor,
                backgroundColor:
                  selectedType === type.value ? primaryColor : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12 * wxScale,
              }}
            >
              {selectedType === type.value && (
                <Icon name="check" size={14 * wxScale} color="#fff" />
              )}
            </Box>
            <Box style={{ flex: 1 }}>
              <Text
                style={{
                  display: 'block',
                  fontSize: 14 * wxScale,
                  fontWeight: 500,
                  color: textPrimary,
                }}
              >
                {type.label}
              </Text>
              <Text
                style={{
                  display: 'block',
                  fontSize: 12 * wxScale,
                  color: textMuted,
                  marginTop: 2 * wxScale,
                }}
              >
                {type.desc}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>

      {/* 反馈内容 */}
      <Box
        style={{
          marginLeft: 12 * wxScale,
          marginRight: 12 * wxScale,
          marginBottom: 12 * wxScale,
          backgroundColor: cardBg,
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 15 * wxScale,
            fontWeight: 600,
            color: textPrimary,
            marginBottom: 12 * wxScale,
          }}
        >
          反馈内容
        </Text>

        <Textarea
          value={content}
          onChange={(value) => setContent(value)}
          placeholder="请详细描述您的问题或建议，至少10个字..."
          style={{
            width: '100%',
            height: 120 * wxScale,
            backgroundColor: inputBg,
            borderRadius: 8 * wxScale,
            padding: 12 * wxScale,
            fontSize: 14 * wxScale,
            color: textPrimary,
            lineHeight: 1.5,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: borderColor,
          }}
        />

        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: textMuted,
            marginTop: 8 * wxScale,
            textAlign: 'right',
          }}
        >
          {content.length}/500
        </Text>
      </Box>

      {/* 图片上传 */}
      <Box
        style={{
          marginLeft: 12 * wxScale,
          marginRight: 12 * wxScale,
          marginBottom: 12 * wxScale,
          backgroundColor: cardBg,
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 15 * wxScale,
            fontWeight: 600,
            color: textPrimary,
            marginBottom: 4 * wxScale,
          }}
        >
          上传截图
        </Text>
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: textMuted,
            marginBottom: 12 * wxScale,
          }}
        >
          可选，上传相关截图帮助我们更好地理解问题
        </Text>

        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8 * wxScale,
          }}
        >
          {/* 已上传的图片 */}
          {images.map((img, index) => (
            <Box
              key={index}
              style={{
                position: 'relative',
                width: 80 * wxScale,
                height: 80 * wxScale,
              }}
            >
              <Image
                src={img}
                mode="aspectFill"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 8 * wxScale,
                }}
              />
              <Box
                onClick={() => handleDeleteImage(index)}
                style={{
                  position: 'absolute',
                  top: -8 * wxScale,
                  right: -8 * wxScale,
                  width: 20 * wxScale,
                  height: 20 * wxScale,
                  borderRadius: 10 * wxScale,
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="close" size={12 * wxScale} color="#fff" />
              </Box>
            </Box>
          ))}

          {/* 添加图片按钮 */}
          {images.length < 9 && (
            <Box
              onClick={handleChooseImage}
              style={{
                width: 80 * wxScale,
                height: 80 * wxScale,
                borderRadius: 8 * wxScale,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: borderColor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: inputBg,
              }}
            >
              <Icon name="add" size={24 * wxScale} color={textMuted} />
              <Text
                style={{
                  fontSize: 10 * wxScale,
                  color: textMuted,
                  marginTop: 4 * wxScale,
                }}
              >
                {images.length}/9
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* 联系方式 */}
      <Box
        style={{
          marginLeft: 12 * wxScale,
          marginRight: 12 * wxScale,
          marginBottom: 12 * wxScale,
          backgroundColor: cardBg,
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 15 * wxScale,
            fontWeight: 600,
            color: textPrimary,
            marginBottom: 4 * wxScale,
          }}
        >
          联系方式
        </Text>
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: textMuted,
            marginBottom: 12 * wxScale,
          }}
        >
          可选，留下您的联系方式，方便我们回复您
        </Text>

        <Input
          value={contact}
          onChange={(value) => setContact(value)}
          placeholder="手机号或微信号"
          style={{
            width: '100%',
            height: 44 * wxScale,
            backgroundColor: inputBg,
            borderRadius: 8 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            fontSize: 14 * wxScale,
            color: textPrimary,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: borderColor,
          }}
        />
      </Box>

      {/* 底部固定提交按钮 */}
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16 * wxScale,
          paddingBottom: isWxEnvironment() ? 34 * wxScale : 16 * wxScale,
          backgroundColor: cardBg,
          borderTop: `1px solid ${borderColor}`,
        }}
      >
        <Box
          onClick={handleSubmit}
          style={{
            height: 48 * wxScale,
            borderRadius: 24 * wxScale,
            backgroundColor:
              !selectedType || !content.trim() || isSubmitting
                ? textMuted
                : primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !selectedType || !content.trim() || isSubmitting ? 0.6 : 1,
          }}
        >
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            {isSubmitting ? '提交中...' : '提交反馈'}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

