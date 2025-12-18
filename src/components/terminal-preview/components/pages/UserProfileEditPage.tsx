/**
 * 用户资料编辑页面
 *
 * 功能：
 * - 头像上传
 * - 昵称编辑
 * - 手机号显示（仅展示）
 * - 性别选择
 * - 生日选择
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
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'
import type { UserProfile } from '../../api'

interface UserProfileEditPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

// 性别选项
const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '保密' },
]

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 解析日期字符串
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

// 格式化显示日期
function formatDisplayDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '未设置'
  const date = parseDate(dateStr)
  if (!date) return '未设置'
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export function UserProfileEditPage({
  themeSettings,
  isDarkMode = false,
  onBack,
}: UserProfileEditPageProps) {
  const queryClient = useQueryClient()

  // 表单状态
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState<string>('')
  const [birthday, setBirthday] = useState<string>('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // UI 状态
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 获取用户资料
  const { data: profile, isLoading } = useQuery({
    queryKey: ['preview', 'user', 'profile'],
    queryFn: () => previewApi.getUserProfile(),
  })

  // 初始化表单数据
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '')
      setGender(profile.gender || '')
      setBirthday(profile.birthday || '')
      setAvatarPreview(profile.avatar || null)
    }
  }, [profile])

  // 更新资料 mutation
  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof previewApi.updateUserProfile>[0]) =>
      previewApi.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preview', 'user', 'profile'] })
    },
  })

  // 保存资料
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync({
        nickname: nickname || undefined,
        gender: gender || undefined,
        birthday: birthday || undefined,
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
    // 预览器模式下模拟选择图片
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
            {/* 昵称 */}
            <div
              className="flex items-center px-4 py-3"
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <span className="text-sm w-20" style={{ color: textSecondary }}>
                昵称
              </span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称"
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

            {/* 生日 */}
            <div
              className="flex items-center px-4 py-3 cursor-pointer"
              onClick={() => setShowDatePicker(true)}
            >
              <span className="text-sm w-20" style={{ color: textSecondary }}>
                生日
              </span>
              <span className="flex-1 text-sm text-right" style={{ color: birthday ? textPrimary : textMuted }}>
                {formatDisplayDate(birthday)}
              </span>
              <ChevronRight className="w-4 h-4 ml-1" style={{ color: textMuted }} />
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

      {/* 日期选择弹窗（简化版） */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          onClick={() => setShowDatePicker(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full rounded-t-2xl overflow-hidden"
            style={{ backgroundColor: cardBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor }}
            >
              <button
                className="text-sm"
                style={{ color: textMuted }}
                onClick={() => setShowDatePicker(false)}
              >
                取消
              </button>
              <span className="font-medium" style={{ color: textPrimary }}>
                选择生日
              </span>
              <button
                className="text-sm font-medium"
                style={{ color: themeSettings.primaryColor }}
                onClick={() => setShowDatePicker(false)}
              >
                确定
              </button>
            </div>
            <div className="p-4">
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                max={formatDate(new Date())}
                min="1900-01-01"
                className="w-full p-3 rounded-lg border text-center text-base"
                style={{
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb',
                  borderColor,
                  color: textPrimary,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
