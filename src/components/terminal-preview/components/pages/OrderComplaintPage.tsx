/**
 * 订单投诉页面
 *
 * 用户针对订单提交投诉
 * - page key: 'order-complaint'
 * - API: POST /orders/:id/complaint
 */

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  ArrowLeft,
  AlertCircle,
  Camera,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react'
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

// 投诉类型选项
const complaintTypes = [
  { value: 'service_quality', label: '服务质量问题', desc: '陪诊员服务态度差、不专业等' },
  { value: 'late_arrival', label: '迟到/爽约', desc: '陪诊员未按时到达或未提供服务' },
  { value: 'price_dispute', label: '收费问题', desc: '存在额外收费或收费不合理' },
  { value: 'privacy_leak', label: '隐私泄露', desc: '个人信息被泄露或滥用' },
  { value: 'verbal_abuse', label: '言语不当', desc: '存在辱骂、歧视等不当言行' },
  { value: 'other', label: '其他问题', desc: '以上类型未涵盖的其他问题' },
]

// ============================================================================
// 组件实现
// ============================================================================

export function OrderComplaintPage({
  themeSettings,
  isDarkMode,
  orderId,
  onBack,
}: OrderComplaintPageProps) {
  // 颜色定义
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

  // 提交投诉 mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!orderId) throw new Error('订单 ID 不存在')
      return previewApi.submitComplaint(orderId, {
        type: selectedType,
        content,
        evidence,
      })
    },
    onSuccess: () => {
      setIsSubmitted(true)
    },
  })

  // 选择图片
  const handleChooseImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return

      Array.from(files).slice(0, 6 - evidence.length).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
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
  const handleSubmit = () => {
    if (!selectedType) {
      alert('请选择投诉类型')
      return
    }
    if (!content.trim()) {
      alert('请填写投诉内容')
      return
    }
    if (content.length < 10) {
      alert('投诉内容至少需要10个字')
      return
    }

    submitMutation.mutate()
  }

  // 表单有效性检查
  const isFormValid = selectedType && content.trim().length >= 10

  // 提交成功页面
  if (isSubmitted) {
    return (
      <div style={{ backgroundColor: bgColor }} className='min-h-full'>
        {/* 顶部导航栏 */}
        <div
          className='sticky top-0 z-20 flex items-center justify-between px-3 py-3'
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          <button
            onClick={onBack}
            className='w-8 h-8 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <h1 className='text-base font-semibold text-white'>投诉反馈</h1>
          <div className='w-8' />
        </div>

        {/* 成功提示 */}
        <div className='flex flex-col items-center justify-center pt-20 px-6'>
          <div
            className='w-20 h-20 rounded-full flex items-center justify-center mb-4'
            style={{ backgroundColor: `${themeSettings.primaryColor}20` }}
          >
            <CheckCircle
              className='w-10 h-10'
              style={{ color: themeSettings.primaryColor }}
            />
          </div>
          <h2 className='text-lg font-semibold mb-2' style={{ color: textPrimary }}>
            投诉已提交
          </h2>
          <p className='text-sm text-center mb-8' style={{ color: textSecondary }}>
            我们已收到您的投诉，将在1-3个工作日内进行处理，
            <br />
            处理结果将通过系统消息通知您。
          </p>
          <button
            onClick={onBack}
            className='px-8 py-2.5 rounded-full text-sm text-white'
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            返回订单
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full pb-24'>
      {/* 顶部导航栏 */}
      <div
        className='sticky top-0 z-20 flex items-center justify-between px-3 py-3'
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <button
          onClick={onBack}
          className='w-8 h-8 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
        </button>
        <h1 className='text-base font-semibold text-white'>投诉反馈</h1>
        <div className='w-8' />
      </div>

      {/* 提示信息 */}
      <div
        className='mx-3 mt-3 rounded-xl p-3 flex items-start gap-2'
        style={{ backgroundColor: '#fff7e6' }}
      >
        <AlertCircle className='w-4 h-4 mt-0.5 flex-shrink-0' style={{ color: '#fa8c16' }} />
        <p className='text-xs' style={{ color: '#ad6800' }}>
          请如实填写投诉内容，我们将在1-3个工作日内进行核实处理。
          恶意投诉可能会影响您的账号信用。
        </p>
      </div>

      {/* 投诉类型 */}
      <div className='mx-3 mt-3 rounded-xl p-4' style={{ backgroundColor: cardBg }}>
        <h3 className='text-sm font-semibold mb-3' style={{ color: textPrimary }}>
          投诉类型 <span style={{ color: '#ff4d4f' }}>*</span>
        </h3>
        <div className='space-y-2'>
          {complaintTypes.map((type) => (
            <div
              key={type.value}
              className='flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors'
              style={{
                backgroundColor:
                  selectedType === type.value
                    ? `${themeSettings.primaryColor}10`
                    : inputBg,
                border:
                  selectedType === type.value
                    ? `1px solid ${themeSettings.primaryColor}`
                    : `1px solid ${borderColor}`,
              }}
              onClick={() => setSelectedType(type.value)}
            >
              <div
                className='w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0'
                style={{
                  borderColor:
                    selectedType === type.value
                      ? themeSettings.primaryColor
                      : borderColor,
                }}
              >
                {selectedType === type.value && (
                  <div
                    className='w-2.5 h-2.5 rounded-full'
                    style={{ backgroundColor: themeSettings.primaryColor }}
                  />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium' style={{ color: textPrimary }}>
                  {type.label}
                </p>
                <p className='text-xs mt-0.5' style={{ color: textMuted }}>
                  {type.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 投诉内容 */}
      <div className='mx-3 mt-3 rounded-xl p-4' style={{ backgroundColor: cardBg }}>
        <h3 className='text-sm font-semibold mb-3' style={{ color: textPrimary }}>
          投诉内容 <span style={{ color: '#ff4d4f' }}>*</span>
        </h3>
        <div
          className='rounded-lg p-3'
          style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}` }}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='请详细描述您遇到的问题，包括时间、地点、具体情况等（至少10个字）'
            className='w-full h-32 bg-transparent resize-none text-sm outline-none'
            style={{ color: textPrimary }}
            maxLength={500}
          />
          <div className='flex justify-end mt-2'>
            <span className='text-xs' style={{ color: textMuted }}>
              {content.length}/500
            </span>
          </div>
        </div>
      </div>

      {/* 证据上传 */}
      <div className='mx-3 mt-3 rounded-xl p-4' style={{ backgroundColor: cardBg }}>
        <h3 className='text-sm font-semibold mb-1' style={{ color: textPrimary }}>
          上传凭证
        </h3>
        <p className='text-xs mb-3' style={{ color: textMuted }}>
          可上传聊天记录、订单截图等相关凭证（最多6张）
        </p>
        <div className='grid grid-cols-4 gap-2'>
          {evidence.map((url, index) => (
            <div key={index} className='relative aspect-square'>
              <img
                src={url}
                alt={`证据${index + 1}`}
                className='w-full h-full object-cover rounded-lg'
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center'
              >
                <X className='w-3 h-3 text-white' />
              </button>
            </div>
          ))}
          {evidence.length < 6 && (
            <button
              onClick={handleChooseImage}
              className='aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1'
              style={{ borderColor }}
            >
              <Camera className='w-5 h-5' style={{ color: textMuted }} />
              <span className='text-xs' style={{ color: textMuted }}>
                添加图片
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 底部提交按钮 */}
      <div
        className='fixed bottom-0 left-0 right-0 px-4 py-3 border-t'
        style={{ backgroundColor: cardBg, borderColor }}
      >
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || submitMutation.isPending}
          className='w-full py-3 rounded-full text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50'
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className='w-4 h-4 animate-spin' />
              提交中...
            </>
          ) : (
            '提交投诉'
          )}
        </button>
        <p className='text-xs text-center mt-2' style={{ color: textMuted }}>
          提交后无法撤回，请确认信息无误
        </p>
      </div>
    </div>
  )
}
