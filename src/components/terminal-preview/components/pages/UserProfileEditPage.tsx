/**
 * 用户资料编辑页面
 *
 * 功能：
 * - 头像上传
 * - 昵称编辑
 * - 手机号显示/绑定
 * - 性别选择
 * - 生日选择
 * - 退出登录
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Image, Icon
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 */

import { useState, useEffect } from 'react'
import { Box, Text, Image, Icon, Button, Input } from '../../ui/primitives'
import { isWxEnvironment, getFullImageUrl } from '../../platform/env'
import { previewApi } from '../../api'
import type { ThemeSettings } from '../../types'
import type { UserProfile } from '../../api'

// ============================================================================
// 类型定义
// ============================================================================

interface UserProfileEditPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 小程序专用：头像选择后回调（传入临时文件路径） */
  onAvatarChoose?: (tempFilePath: string) => void
  /** 小程序专用：绑定手机号回调 */
  onBindPhone?: () => void
  /** 小程序专用：退出登录回调 */
  onLogout?: () => void
  /** 小程序专用：渲染自定义头像按钮 */
  renderAvatarButton?: (props: {
    avatarUrl: string | null
    onClick: () => void
    onAvatarChange: (url: string) => void
  }) => React.ReactNode
  /** 小程序专用：渲染自定义绑定手机号按钮 */
  renderBindPhoneButton?: (props: { onSuccess: () => void }) => React.ReactNode
  /** 小程序专用：渲染自定义日期选择器 */
  renderDatePicker?: (props: { value: string; onChange: (date: string) => void }) => React.ReactNode
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// 性别选项
const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '保密' },
]

// ============================================================================
// 工具函数
// ============================================================================

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化显示日期
function formatDisplayDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '未设置'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '未设置'
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// ============================================================================
// 主组件
// ============================================================================

export function UserProfileEditPage({
  themeSettings,
  isDarkMode = false,
  onBack,
  onLogout,
  renderAvatarButton,
  renderBindPhoneButton,
  renderDatePicker,
}: UserProfileEditPageProps) {
  // 表单状态
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState<string>('')
  const [birthday, setBirthday] = useState<string>('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // UI 状态
  const [isLoading, setIsLoading] = useState(true)
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 颜色（与 profile/constants.ts getThemeColors 保持一致）
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  // 获取用户资料
  useEffect(() => {
    setIsLoading(true)
    previewApi.getUserProfile()
      .then((data) => {
        setProfile(data)
        setNickname(data.nickname || '')
        setGender(data.gender || '')
        setBirthday(data.birthday || '')
        // 使用完整 URL（小程序需要完整 URL 才能加载图片）
        setAvatarPreview(getFullImageUrl(data.avatar) || null)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  // 保存资料
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await previewApi.updateUserProfile({
        nickname: nickname || undefined,
        gender: gender || undefined,
        birthday: birthday || undefined,
        avatar: avatarPreview || undefined,
      })

      if (result) {
        // 保存成功，小程序环境显示提示
        if (isWxEnvironment() && typeof wx !== 'undefined') {
          // @ts-expect-error wx 在小程序环境中存在
          wx.showToast?.({ title: '保存成功', icon: 'success' })
        }
        // 延迟返回，让用户看到提示
        setTimeout(() => onBack?.(), 500)
      } else {
        // 保存失败
        if (isWxEnvironment() && typeof wx !== 'undefined') {
          // @ts-expect-error wx 在小程序环境中存在
          wx.showToast?.({ title: '保存失败', icon: 'none' })
        }
        console.error('保存失败: API 返回 null')
      }
    } catch (error) {
      console.error('保存失败:', error)
      if (isWxEnvironment() && typeof wx !== 'undefined') {
        // @ts-expect-error wx 在小程序环境中存在
        wx.showToast?.({ title: '保存失败', icon: 'none' })
      }
    } finally {
      setIsSaving(false)
    }
  }

  // 头像上传（Web 环境）
  const handleAvatarClick = () => {
    if (isWxEnvironment()) return // 小程序使用 renderAvatarButton

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

  // 更新头像（供小程序调用）
  const handleAvatarChange = (url: string) => {
    setAvatarPreview(url)
  }

  // 刷新用户资料（绑定手机号后调用）
  const handlePhoneBindSuccess = () => {
    previewApi.getUserProfile()
      .then(setProfile)
      .catch(console.error)
  }

  // 加载状态
  if (isLoading) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: bgColor,
        }}
      >
        <Icon name="refresh" size={32 * wxScale} color={primaryColor} />
        <Text
          style={{
            marginTop: 8 * wxScale,
            fontSize: 14 * wxScale,
            color: textSecondary,
          }}
        >
          加载中...
        </Text>
      </Box>
    )
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      {/* ========== 顶部导航栏 ========== */}
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
          {/* 返回按钮 */}
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

          {/* 标题 */}
          <Text
            style={{
              fontSize: 17 * wxScale,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            编辑资料
          </Text>
        </Box>
      </Box>

      {/* ========== 内容区域 ========== */}
      <Box style={{ flex: 1, paddingBottom: 24 * wxScale }}>
        {/* 头像区域 */}
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 24 * wxScale,
            paddingBottom: 24 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          {renderAvatarButton ? (
            // 小程序：使用自定义按钮
            renderAvatarButton({
              avatarUrl: avatarPreview,
              onClick: handleAvatarClick,
              onAvatarChange: (url: string) => setAvatarPreview(url),
            })
          ) : (
            // Web：默认实现
            <Box
              onClick={handleAvatarClick}
              style={{
                position: 'relative',
                width: 80 * wxScale,
                height: 80 * wxScale,
                borderRadius: 40 * wxScale,
                overflow: 'visible',
                cursor: 'pointer',
              }}
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  style={{
                    width: 80 * wxScale,
                    height: 80 * wxScale,
                    borderRadius: 40 * wxScale,
                  }}
                />
              ) : (
                <Box
                  style={{
                    width: 80 * wxScale,
                    height: 80 * wxScale,
                    borderRadius: 40 * wxScale,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${primaryColor}20`,
                  }}
                >
                  <Icon name="user" size={40 * wxScale} color={primaryColor} />
                </Box>
              )}
              {/* 相机图标 */}
              <Box
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 24 * wxScale,
                  height: 24 * wxScale,
                  borderRadius: 12 * wxScale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: primaryColor,
                }}
              >
                <Icon name="camera" size={14 * wxScale} color="#fff" />
              </Box>
            </Box>
          )}
          <Text
            style={{
              marginTop: 8 * wxScale,
              fontSize: 12 * wxScale,
              color: textMuted,
            }}
          >
            点击更换头像
          </Text>
        </Box>

        {/* 基本信息表单 */}
        <Box
          style={{
            marginTop: 12 * wxScale,
            marginLeft: 12 * wxScale,
            marginRight: 12 * wxScale,
            borderRadius: 12 * wxScale,
            overflow: 'hidden',
            backgroundColor: cardBg,
          }}
        >
          {/* 昵称 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: 14 * wxScale,
              paddingBottom: 14 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <Text
              style={{
                width: 70 * wxScale,
                fontSize: 14 * wxScale,
                color: textSecondary,
              }}
            >
              昵称
            </Text>
            <Input
              value={nickname}
              onChange={(val) => setNickname(typeof val === 'string' ? val : val)}
              placeholder="请输入昵称"
              maxLength={20}
              style={{
                flex: 1,
                textAlign: 'right',
                fontSize: 14 * wxScale,
                color: textPrimary,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
              }}
            />
          </Box>

          {/* 手机号 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: 14 * wxScale,
              paddingBottom: 14 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <Text
              style={{
                width: 70 * wxScale,
                fontSize: 14 * wxScale,
                color: textSecondary,
              }}
            >
              手机号
            </Text>
            {profile?.phone ? (
              <Text
                style={{
                  flex: 1,
                  textAlign: 'right',
                  fontSize: 14 * wxScale,
                  color: textPrimary,
                }}
              >
                {profile.phone}
              </Text>
            ) : renderBindPhoneButton ? (
              // 小程序：使用自定义绑定按钮
              renderBindPhoneButton({ onSuccess: handlePhoneBindSuccess })
            ) : (
              // Web：显示未绑定
              <Text
                style={{
                  flex: 1,
                  textAlign: 'right',
                  fontSize: 14 * wxScale,
                  color: textMuted,
                }}
              >
                未绑定
              </Text>
            )}
          </Box>

          {/* 性别 */}
          <Box
            onClick={() => setShowGenderPicker(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: 14 * wxScale,
              paddingBottom: 14 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              borderBottom: `1px solid ${borderColor}`,
              cursor: 'pointer',
            }}
          >
            <Text
              style={{
                width: 70 * wxScale,
                fontSize: 14 * wxScale,
                color: textSecondary,
              }}
            >
              性别
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'right',
                fontSize: 14 * wxScale,
                color: gender ? textPrimary : textMuted,
              }}
            >
              {gender ? genderOptions.find((g) => g.value === gender)?.label : '未设置'}
            </Text>
            <Icon name="right" size={16 * wxScale} color={textMuted} />
          </Box>

          {/* 生日 */}
          <Box
            onClick={() => setShowDatePicker(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: 14 * wxScale,
              paddingBottom: 14 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              cursor: 'pointer',
            }}
          >
            <Text
              style={{
                width: 70 * wxScale,
                fontSize: 14 * wxScale,
                color: textSecondary,
              }}
            >
              生日
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'right',
                fontSize: 14 * wxScale,
                color: birthday ? textPrimary : textMuted,
              }}
            >
              {formatDisplayDate(birthday)}
            </Text>
            <Icon name="right" size={16 * wxScale} color={textMuted} />
          </Box>
        </Box>

        {/* 保存按钮 */}
        <Box
          style={{
            marginTop: 24 * wxScale,
            marginLeft: 12 * wxScale,
            marginRight: 12 * wxScale,
          }}
        >
          <Box
            onClick={isSaving ? undefined : handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48 * wxScale,
              backgroundColor: primaryColor,
              borderRadius: 12 * wxScale,
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 16 * wxScale,
                fontWeight: 500,
                color: '#ffffff',
              }}
            >
              {isSaving ? '保存中...' : '保存修改'}
            </Text>
          </Box>
        </Box>

        {/* 退出登录按钮 */}
        {onLogout && (
          <Box
            style={{
              marginTop: 16 * wxScale,
              marginLeft: 12 * wxScale,
              marginRight: 12 * wxScale,
            }}
          >
            <Box
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8 * wxScale,
                height: 48 * wxScale,
                backgroundColor: cardBg,
                borderRadius: 12 * wxScale,
                border: '1px solid #ffccc7',
              }}
            >
              <Icon name="power" size={18 * wxScale} color="#ff4d4f" />
              <Text
                style={{
                  fontSize: 15 * wxScale,
                  color: '#ff4d4f',
                  fontWeight: 500,
                }}
              >
                退出登录
              </Text>
            </Box>
          </Box>
        )}
      </Box>

      {/* ========== 性别选择弹窗 ========== */}
      {showGenderPicker && (
        <Box
          onClick={() => setShowGenderPicker(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          <Box
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              borderTopLeftRadius: 16 * wxScale,
              borderTopRightRadius: 16 * wxScale,
              overflow: 'hidden',
              backgroundColor: cardBg,
            }}
          >
            <Box
              style={{
                paddingTop: 12 * wxScale,
                paddingBottom: 12 * wxScale,
                textAlign: 'center',
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <Text
                style={{
                  fontSize: 16 * wxScale,
                  fontWeight: 500,
                  color: textPrimary,
                }}
              >
                选择性别
              </Text>
            </Box>
            {genderOptions.map((option) => (
              <Box
                key={option.value}
                onClick={() => {
                  setGender(option.value)
                  setShowGenderPicker(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 14 * wxScale,
                  paddingBottom: 14 * wxScale,
                  paddingLeft: 16 * wxScale,
                  paddingRight: 16 * wxScale,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    color: textPrimary,
                  }}
                >
                  {option.label}
                </Text>
                {gender === option.value && (
                  <Icon name="check" size={20 * wxScale} color={primaryColor} />
                )}
              </Box>
            ))}
            <Box
              onClick={() => setShowGenderPicker(false)}
              style={{
                paddingTop: 14 * wxScale,
                paddingBottom: 14 * wxScale,
                textAlign: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  color: textMuted,
                }}
              >
                取消
              </Text>
            </Box>
          </Box>
        </Box>
      )}

      {/* ========== 日期选择弹窗 ========== */}
      {showDatePicker && (
        <Box
          onClick={() => setShowDatePicker(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          <Box
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              borderTopLeftRadius: 16 * wxScale,
              borderTopRightRadius: 16 * wxScale,
              overflow: 'hidden',
              backgroundColor: cardBg,
            }}
          >
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 12 * wxScale,
                paddingBottom: 12 * wxScale,
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <Box onClick={() => setShowDatePicker(false)}>
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    color: textMuted,
                  }}
                >
                  取消
                </Text>
              </Box>
              <Text
                style={{
                  fontSize: 16 * wxScale,
                  fontWeight: 500,
                  color: textPrimary,
                }}
              >
                选择生日
              </Text>
              <Box onClick={() => setShowDatePicker(false)}>
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    fontWeight: 500,
                    color: primaryColor,
                  }}
                >
                  确定
                </Text>
              </Box>
            </Box>
            <Box
              style={{
                padding: 16 * wxScale,
              }}
            >
              {renderDatePicker ? (
                // 小程序：使用自定义日期选择器
                renderDatePicker({
                  value: birthday,
                  onChange: setBirthday,
                })
              ) : (
                // Web：使用原生日期输入
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  max={formatDate(new Date())}
                  min="1900-01-01"
                  style={{
                    width: '100%',
                    padding: 12 * wxScale,
                    borderRadius: 8 * wxScale,
                    border: `1px solid ${borderColor}`,
                    textAlign: 'center',
                    fontSize: 16 * wxScale,
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb',
                    color: textPrimary,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
