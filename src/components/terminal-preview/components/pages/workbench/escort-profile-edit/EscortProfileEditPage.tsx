/**
 * 陪诊员资料编辑页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/功能模块改造指南/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery/useMutation → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Icon/Image/Input/Textarea
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: HTML 元素 → 跨平台原语
 * - 规则 4.1: 添加骨架屏
 * - 规则 11: 导航栏预留安全区域
 * - 规则 12: 已拆分为模块化结构
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon, Image, Input, Textarea } from '../../../../ui/primitives'
import { isWxEnvironment, isBrowserEnvironment } from '../../../../platform/env'
import { previewApi } from '../../../../api'
import { PermissionPrompt } from '../../../PermissionPrompt'
import { wxScale, wxSafeAreaTop, genderOptions } from './constants'
import type { EscortProfileEditPageProps, EscortProfile } from './types'
import { EscortProfileEditSkeleton, GenderPickerModal } from './components'

// ============================================================================
// 组件实现
// ============================================================================

export function EscortProfileEditPage({
  themeSettings,
  isDarkMode = false,
  effectiveViewerRole = 'escort',
  onBack,
  onLogin,
  onSyncFromUser,
}: EscortProfileEditPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor

  // 颜色变量
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f0f0f0'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  // 数据状态
  const [profile, setProfile] = useState<EscortProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // 表单状态
  const [name, setName] = useState('')
  const [gender, setGender] = useState<string>('')
  const [introduction, setIntroduction] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // UI 状态
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // 获取陪诊员资料
  useEffect(() => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    previewApi
      .getEscortProfile()
      .then((data) => {
        if (data) {
          setProfile(data)
          setName(data.name || '')
          setGender(data.gender || '')
          setIntroduction(data.introduction || '')
          setAvatarPreview(data.avatar || null)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isEscort])

  // 从关联用户同步资料
  const handleSyncFromUser = async () => {
    if (!onSyncFromUser) return

    setIsSyncing(true)
    try {
      const syncedProfile = await onSyncFromUser()
      if (syncedProfile) {
        // 更新本地状态
        setProfile(syncedProfile)
        if (syncedProfile.name) {
          setName(syncedProfile.name)
        }
        if (syncedProfile.avatar) {
          setAvatarPreview(syncedProfile.avatar)
        }
      }
    } catch (error) {
      console.error('同步资料失败:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  // 保存资料
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await previewApi.updateEscortProfile({
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

  // 头像上传
  const handleAvatarClick = () => {
    if (isWxEnvironment()) {
      // 小程序环境使用 wx.chooseMedia
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wx = (window as any).wx
      if (wx?.chooseMedia) {
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          success: (res: { tempFiles: Array<{ tempFilePath: string }> }) => {
            if (res.tempFiles?.[0]) {
              setAvatarPreview(res.tempFiles[0].tempFilePath)
            }
          },
        })
      }
    } else if (isBrowserEnvironment()) {
      // Web 环境使用 file input
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (ev) => {
            setAvatarPreview(ev.target?.result as string)
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    }
  }

  // 非陪诊员视角：显示权限提示
  if (!isEscort) {
    return (
      <Box
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: bgColor,
        }}
      >
        {/* 导航栏 */}
        <Box
          style={{
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
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
              编辑资料
            </Text>
          </Box>
        </Box>

        <Box style={{ flex: 1, padding: 16 * wxScale }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号编辑资料"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={primaryColor}
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>
    )
  }

  // 加载中
  if (loading) {
    return <EscortProfileEditSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bgColor,
      }}
    >
      {/* 导航栏 */}
      <Box
        style={{
          backgroundColor: primaryColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          {/* 返回按钮 */}
          <Box
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 50 * wxScale,
              height: 36 * wxScale,
            }}
          >
            <Icon name="left" size={22 * wxScale} color="#fff" />
          </Box>
          {/* 标题 */}
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff', textAlign: 'center' }}>
            编辑资料
          </Text>
          {/* 保存按钮 */}
          <Box
            onClick={isSaving ? undefined : handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 50 * wxScale,
              height: 36 * wxScale,
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: '#fff' }}>
              {isSaving ? '保存中...' : '保存'}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* 内容区 */}
      <Box style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 * wxScale }}>
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
          <Box
            onClick={handleAvatarClick}
            style={{
              position: 'relative',
              width: 80 * wxScale,
              height: 80 * wxScale,
              borderRadius: 40 * wxScale,
              overflow: 'hidden',
            }}
          >
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                mode="aspectFill"
                style={{
                  width: 80 * wxScale,
                  height: 80 * wxScale,
                }}
              />
            ) : (
              <Box
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${primaryColor}20`,
                }}
              >
                <Icon name="user" size={40 * wxScale} color={primaryColor} />
              </Box>
            )}
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

          {/* 头像操作按钮 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 12 * wxScale,
              gap: 12 * wxScale,
            }}
          >
            {/* 从账号同步按钮 - 只要有同步回调就显示 */}
            {onSyncFromUser && (
              <Box
                onClick={isSyncing ? undefined : handleSyncFromUser}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingTop: 6 * wxScale,
                  paddingBottom: 6 * wxScale,
                  paddingLeft: 12 * wxScale,
                  paddingRight: 12 * wxScale,
                  borderRadius: 16 * wxScale,
                  backgroundColor: `${primaryColor}15`,
                  opacity: isSyncing ? 0.6 : 1,
                }}
              >
                <Icon
                  name={isSyncing ? 'loading-four' : 'user-to-user-transmission'}
                  size={16 * wxScale}
                  color={primaryColor}
                />
                <Text
                  style={{
                    marginLeft: 4 * wxScale,
                    fontSize: 12 * wxScale,
                    color: primaryColor,
                    fontWeight: 500,
                  }}
                >
                  {isSyncing ? '同步中...' : '从账号同步'}
                </Text>
              </Box>
            )}

            {/* 手动选择按钮 */}
            <Box
              onClick={handleAvatarClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingTop: 6 * wxScale,
                paddingBottom: 6 * wxScale,
                paddingLeft: 12 * wxScale,
                paddingRight: 12 * wxScale,
                borderRadius: 16 * wxScale,
                backgroundColor: isDarkMode ? '#3a3a3a' : '#f0f0f0',
              }}
            >
              <Icon name="picture" size={16 * wxScale} color={textSecondary} />
              <Text
                style={{
                  marginLeft: 4 * wxScale,
                  fontSize: 12 * wxScale,
                  color: textSecondary,
                }}
              >
                从相册选择
              </Text>
            </Box>
          </Box>
        </Box>

        {/* 基本信息 */}
        <Box style={{ marginTop: 12 * wxScale, marginLeft: 12 * wxScale, marginRight: 12 * wxScale }}>
          <Box
            style={{
              backgroundColor: cardBg,
              borderRadius: 12 * wxScale,
              overflow: 'hidden',
            }}
          >
            {/* 姓名 */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12 * wxScale,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, width: 80 * wxScale, color: textSecondary }}>
                姓名
              </Text>
              <Box style={{ flex: 1 }}>
                <Input
                  value={name}
                  onChange={setName}
                  placeholder="请输入姓名"
                  maxLength={20}
                  style={{
                    width: '100%',
                    fontSize: 14 * wxScale,
                    textAlign: 'right',
                    color: textPrimary,
                    backgroundColor: 'transparent',
                  }}
                />
              </Box>
            </Box>

            {/* 手机号 */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12 * wxScale,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, width: 80 * wxScale, color: textSecondary }}>
                手机号
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14 * wxScale,
                  textAlign: 'right',
                  color: textMuted,
                }}
              >
                {profile?.phone || '未绑定'}
              </Text>
            </Box>

            {/* 性别 */}
            <Box
              onClick={() => setShowGenderPicker(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12 * wxScale,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, width: 80 * wxScale, color: textSecondary }}>
                性别
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14 * wxScale,
                  textAlign: 'right',
                  color: gender ? textPrimary : textMuted,
                }}
              >
                {gender ? genderOptions.find((g) => g.value === gender)?.label : '未设置'}
              </Text>
              <Icon name="right" size={16 * wxScale} color={textMuted} />
            </Box>

            {/* 评分 */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12 * wxScale,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, width: 80 * wxScale, color: textSecondary }}>
                服务评分
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14 * wxScale,
                  textAlign: 'right',
                  color: textPrimary,
                }}
              >
                {profile?.rating?.toFixed(1) || '-'} 分
              </Text>
            </Box>

            {/* 订单数 */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12 * wxScale,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, width: 80 * wxScale, color: textSecondary }}>
                服务订单
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14 * wxScale,
                  textAlign: 'right',
                  color: textPrimary,
                }}
              >
                {profile?.orderCount || 0} 单
              </Text>
            </Box>
          </Box>
        </Box>

        {/* 个人简介 */}
        <Box style={{ marginTop: 12 * wxScale, marginLeft: 12 * wxScale, marginRight: 12 * wxScale }}>
          <Box
            style={{
              backgroundColor: cardBg,
              borderRadius: 12 * wxScale,
              overflow: 'hidden',
            }}
          >
            <Box style={{ padding: 12 * wxScale }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8 * wxScale,
                }}
              >
                <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
                  个人简介
                </Text>
                <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>
                  {introduction.length}/200
                </Text>
              </Box>
              <Textarea
                value={introduction}
                onChange={(val) => setIntroduction(val.slice(0, 200))}
                placeholder="介绍一下自己，让用户更了解你..."
                style={{
                  width: '100%',
                  minHeight: 80 * wxScale,
                  fontSize: 14 * wxScale,
                  color: textPrimary,
                  backgroundColor: 'transparent',
                  resize: 'none',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 性别选择弹窗 */}
      <GenderPickerModal
        visible={showGenderPicker}
        currentGender={gender}
        onSelect={setGender}
        onClose={() => setShowGenderPicker(false)}
        primaryColor={primaryColor}
        isDarkMode={isDarkMode}
      />
    </Box>
  )
}

