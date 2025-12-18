/**
 * 陪诊员资料编辑页面
 *
 * 功能：
 * - 头像上传
 * - 姓名编辑
 * - 手机号显示（仅展示）
 * - 性别选择
 * - 个人简介编辑
 */

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  User,
  Camera,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'
import type { EscortProfile } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'

export interface EscortProfileEditPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  effectiveViewerRole?: PreviewViewerRole
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
}

// 性别选项
const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
]

export function EscortProfileEditPage({
  themeSettings,
  isDarkMode = false,
  effectiveViewerRole = 'escort',
  onBack,
  onLogin,
}: EscortProfileEditPageProps) {
  const queryClient = useQueryClient()
  const isEscort = effectiveViewerRole === 'escort'

  // 表单状态
  const [name, setName] = useState('')
  const [gender, setGender] = useState<string>('')
  const [introduction, setIntroduction] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // UI 状态
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 获取陪诊员资料
  const { data: profile, isLoading } = useQuery({
    queryKey: ['preview', 'escort', 'profile'],
    queryFn: () => previewApi.getEscortProfile(),
    enabled: isEscort,
  })

  // 初始化表单数据
  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setGender(profile.gender || '')
      setIntroduction(profile.introduction || '')
      setAvatarPreview(profile.avatar || null)
    }
  }, [profile])

  // 更新资料 mutation
  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof previewApi.updateEscortProfile>[0]) =>
      previewApi.updateEscortProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preview', 'escort', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['preview', 'workbench', 'settings'] })
    },
  })

  // 保存资料
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync({
        name: name || undefined,
        gender: gender || undefined,
        introduction: introduction || undefined,
        avatar: avatarPreview || undefined,
      })
      onBack?.()
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // 头像上传（模拟）
  const handleAvatarClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setAvatarPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  // 颜色
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f0f0f0'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  // 非陪诊员视角：显示权限提示
  if (!isEscort) {
    return (
      <div className="min-h-full flex flex-col" style={{ backgroundColor: bgColor }}>
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          <button onClick={onBack} className="text-white p-1 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">编辑资料</h1>
        </div>
        <div className="flex-1">
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号编辑资料"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
          />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className="min-h-full flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <div className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin mx-auto"
            style={{ color: themeSettings.primaryColor }}
          />
          <p className="mt-2 text-sm" style={{ color: textSecondary }}>
            加载中...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: bgColor }}>
      {/* 顶部导航 */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <button onClick={onBack} className="text-white p-1 -ml-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white flex-1">编辑资料</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-white text-sm font-medium disabled:opacity-50"
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* 头像区域 */}
        <div
          className="flex flex-col items-center py-6"
          style={{ backgroundColor: cardBg }}
        >
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer"
            onClick={handleAvatarClick}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="头像"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${themeSettings.primaryColor}20` }}
              >
                <User
                  className="w-10 h-10"
                  style={{ color: themeSettings.primaryColor }}
                />
              </div>
            )}
            <div
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="mt-2 text-xs" style={{ color: textMuted }}>
            点击更换头像
          </p>
        </div>

        {/* 基本信息 */}
        <div className="mt-3">
          <div className="rounded-xl mx-3 overflow-hidden" style={{ backgroundColor: cardBg }}>
            {/* 姓名 */}
            <div
              className="flex items-center px-4 py-3"
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <span className="text-sm w-20" style={{ color: textSecondary }}>
                姓名
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
                maxLength={20}
                className="flex-1 text-sm text-right bg-transparent outline-none"
                style={{ color: textPrimary }}
              />
            </div>

            {/* 手机号（仅显示） */}
            <div
              className="flex items-center px-4 py-3"
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <span className="text-sm w-20" style={{ color: textSecondary }}>
                手机号
              </span>
              <span className="flex-1 text-sm text-right" style={{ color: textMuted }}>
                {profile?.phone || '未绑定'}
              </span>
            </div>

            {/* 性别 */}
            <div
              className="flex items-center px-4 py-3 cursor-pointer"
              style={{ borderBottom: `1px solid ${borderColor}` }}
              onClick={() => setShowGenderPicker(true)}
            >
              <span className="text-sm w-20" style={{ color: textSecondary }}>
                性别
              </span>
              <span className="flex-1 text-sm text-right" style={{ color: gender ? textPrimary : textMuted }}>
                {gender ? genderOptions.find((g) => g.value === gender)?.label : '未设置'}
              </span>
              <ChevronRight className="w-4 h-4 ml-1" style={{ color: textMuted }} />
            </div>

            {/* 评分（仅显示） */}
            <div
              className="flex items-center px-4 py-3"
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <span className="text-sm w-20" style={{ color: textSecondary }}>
                服务评分
              </span>
              <span className="flex-1 text-sm text-right" style={{ color: textPrimary }}>
                {profile?.rating?.toFixed(1) || '-'} 分
              </span>
            </div>

            {/* 订单数（仅显示） */}
            <div className="flex items-center px-4 py-3">
              <span className="text-sm w-20" style={{ color: textSecondary }}>
                服务订单
              </span>
              <span className="flex-1 text-sm text-right" style={{ color: textPrimary }}>
                {profile?.orderCount || 0} 单
              </span>
            </div>
          </div>
        </div>

        {/* 个人简介 */}
        <div className="mt-3">
          <div className="rounded-xl mx-3 overflow-hidden" style={{ backgroundColor: cardBg }}>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: textSecondary }}>
                  个人简介
                </span>
                <span className="text-xs" style={{ color: textMuted }}>
                  {introduction.length}/200
                </span>
              </div>
              <textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value.slice(0, 200))}
                placeholder="介绍一下自己，让用户更了解你..."
                rows={4}
                className="w-full text-sm bg-transparent outline-none resize-none"
                style={{ color: textPrimary }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 性别选择弹窗 */}
      {showGenderPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={() => setShowGenderPicker(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full rounded-t-2xl overflow-hidden"
            style={{ backgroundColor: cardBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-4 py-3 text-center font-medium border-b"
              style={{ color: textPrimary, borderColor }}
            >
              选择性别
            </div>
            {genderOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center justify-between px-4 py-3 cursor-pointer active:opacity-70"
                style={{ borderBottom: `1px solid ${borderColor}` }}
                onClick={() => {
                  setGender(option.value)
                  setShowGenderPicker(false)
                }}
              >
                <span className="text-sm" style={{ color: textPrimary }}>
                  {option.label}
                </span>
                {gender === option.value && (
                  <Check className="w-5 h-5" style={{ color: themeSettings.primaryColor }} />
                )}
              </div>
            ))}
            <div
              className="px-4 py-3 text-center cursor-pointer"
              onClick={() => setShowGenderPicker(false)}
            >
              <span className="text-sm" style={{ color: textMuted }}>
                取消
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
