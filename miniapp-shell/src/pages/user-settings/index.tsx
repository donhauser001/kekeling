/**
 * 用户资料编辑页
 *
 * 小程序独立页面，复用终端预览器的 UserProfileEditPage 组件
 * 通过 render props 传入小程序原生的授权按钮
 */
import { useState, useEffect } from 'react'
import { View, Image, Button, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserProfileEditPage as UserProfileEditPageComponent } from '@terminal-preview/components/pages/UserProfileEditPage'
import { previewApi } from '@terminal-preview/api'
import Icon from '@/components/Icon'
import type { ThemeSettings } from '@terminal-preview/types'
import { defaultThemeSettings } from '@terminal-preview/types'
import { logout, clearToken } from '@/api'
import './index.scss'

// ============================================================================
// QueryClient
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// ============================================================================
// 常量
// ============================================================================

const wxScale = 1.1
const API_BASE_URL = 'https://kkl.top/api'
const SITE_BASE_URL = 'https://kkl.top'

// 工具函数：将相对路径转换为完整 URL
const getFullImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  // 如果已经是完整 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('wxfile://')) {
    return url
  }
  // 相对路径添加域名前缀
  return `${SITE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

// ============================================================================
// 头像按钮组件（独立组件，可以使用 hooks）
// ============================================================================

interface AvatarButtonProps {
  avatarUrl: string | null
  onClick: () => void
  onAvatarChange: (url: string) => void
  primaryColor: string
}

function AvatarButton({ avatarUrl, primaryColor, onAvatarChange }: AvatarButtonProps) {
  // 使用完整 URL 初始化
  const [localAvatar, setLocalAvatar] = useState(() => getFullImageUrl(avatarUrl))

  useEffect(() => {
    setLocalAvatar(getFullImageUrl(avatarUrl))
  }, [avatarUrl])

  // 上传头像到服务器
  const uploadAvatar = async (tempFilePath: string): Promise<string | null> => {
    return new Promise((resolve) => {
      Taro.showLoading({ title: '上传中...' })

      let token = ''
      try {
        token = Taro.getStorageSync('kekeling_user_token') || ''
      } catch (e) {
        console.warn('获取 token 失败:', e)
      }

      Taro.uploadFile({
        url: `${API_BASE_URL}/upload`,
        filePath: tempFilePath,
        name: 'file',
        formData: {
          folder: 'avatar',  // 指定上传到 avatar 目录
        },
        header: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        success: (res) => {
          Taro.hideLoading()
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0 || data.code === 200) {
              resolve(data.data?.url || data.data)
            } else {
              Taro.showToast({ title: data.message || '上传失败', icon: 'none' })
              resolve(null)
            }
          } catch (e) {
            Taro.showToast({ title: '上传失败', icon: 'none' })
            resolve(null)
          }
        },
        fail: () => {
          Taro.hideLoading()
          Taro.showToast({ title: '上传失败', icon: 'none' })
          resolve(null)
        },
      })
    })
  }

  const handleChooseAvatar = async (e: any) => {
    const tempFilePath = e.detail.avatarUrl
    if (!tempFilePath) return

    setLocalAvatar(tempFilePath)

    // 上传到服务器
    const serverUrl = await uploadAvatar(tempFilePath)
    if (serverUrl) {
      // 转换为完整 URL
      const fullUrl = getFullImageUrl(serverUrl) || serverUrl
      // 更新本地显示
      setLocalAvatar(fullUrl)
      // 通知父组件更新头像 URL（传递完整 URL）
      onAvatarChange(fullUrl)
      Taro.showToast({ title: '头像已更新', icon: 'success' })
    }
  }

  return (
    <Button
      openType="chooseAvatar"
      onChooseAvatar={handleChooseAvatar}
      className="avatar-button"
    >
      {localAvatar ? (
        <Image
          src={localAvatar}
          mode="aspectFill"
          className="avatar-image"
        />
      ) : (
        <View
          className="avatar-placeholder"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <Icon name="user" size={56 * wxScale} color={primaryColor} />
        </View>
      )}
      {/* 相机图标 */}
      <View
        className="camera-icon"
        style={{ backgroundColor: primaryColor }}
      >
        <Icon name="camera" size={20 * wxScale} color="#fff" />
      </View>
    </Button>
  )
}

// ============================================================================
// 绑定手机号按钮组件
// ============================================================================

interface BindPhoneButtonProps {
  onSuccess: () => void
  primaryColor: string
}

function BindPhoneButton({ onSuccess, primaryColor }: BindPhoneButtonProps) {
  const [isBinding, setIsBinding] = useState(false)

  const handleGetPhoneNumber = async (e: any) => {
    const { code, errMsg } = e.detail

    if (!code || errMsg?.includes('deny') || errMsg?.includes('cancel')) {
      return
    }

    setIsBinding(true)
    try {
      Taro.showLoading({ title: '绑定中...' })

      let token = ''
      try {
        token = Taro.getStorageSync('kekeling_user_token') || ''
      } catch (err) {
        console.warn('获取 token 失败:', err)
      }

      const res = await Taro.request({
        url: `${API_BASE_URL}/auth/bind-phone`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        data: { code },
      })

      Taro.hideLoading()

      if (res.data?.code === 0 || res.data?.code === 200) {
        Taro.showToast({ title: '绑定成功', icon: 'success' })
        onSuccess()
      } else {
        Taro.showToast({ title: res.data?.message || '绑定失败', icon: 'none' })
      }
    } catch (err) {
      Taro.hideLoading()
      Taro.showToast({ title: '绑定失败', icon: 'none' })
    } finally {
      setIsBinding(false)
    }
  }

  return (
    <Button
      openType="getPhoneNumber"
      onGetPhoneNumber={handleGetPhoneNumber}
      loading={isBinding}
      className="bind-phone-button"
      style={{ backgroundColor: primaryColor }}
    >
      绑定
    </Button>
  )
}

// ============================================================================
// 内容组件
// ============================================================================

function UserSettingsPageContent() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isLoading, setIsLoading] = useState(true)

  // 加载主题设置
  useEffect(() => {
    previewApi.getThemeSettings()
      .then((settings) => {
        if (settings) {
          setThemeSettings({ ...defaultThemeSettings, ...settings })
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack()
  }

  // 获取主色
  const primaryColor = themeSettings.primaryColor

  // 退出登录
  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmColor: primaryColor,
      success: async (res) => {
        if (res.confirm) {
          try {
            await logout()
          } catch (e) {
            console.warn('退出登录 API 失败:', e)
          }
          clearToken()
          Taro.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500,
          })
          // 使用 reLaunch 重新加载主页，确保登录状态刷新
          setTimeout(() => {
            Taro.reLaunch({ url: '/pages/main/index' })
          }, 1500)
        }
      },
    })
  }

  // 渲染头像按钮（返回组件）
  const renderAvatarButton = (props: Omit<AvatarButtonProps, 'primaryColor'>) => {
    return <AvatarButton {...props} primaryColor={primaryColor} onAvatarChange={props.onAvatarChange} />
  }

  // 渲染绑定手机号按钮（返回组件）
  const renderBindPhoneButton = (props: Omit<BindPhoneButtonProps, 'primaryColor'>) => {
    return <BindPhoneButton {...props} primaryColor={primaryColor} />
  }

  // 渲染日期选择器（小程序使用 Picker）
  const renderDatePicker = (props: { value: string; onChange: (date: string) => void }) => {
    return (
      <Picker
        mode="date"
        value={props.value || '2000-01-01'}
        start="1900-01-01"
        end={new Date().toISOString().split('T')[0]}
        onChange={(e) => props.onChange(e.detail.value)}
        style={{ width: '100%' }}
      >
        <View
          style={{
            boxSizing: 'border-box',
            width: '100%',
            padding: `${12 * wxScale}px`,
            borderRadius: `${8 * wxScale}px`,
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            fontSize: `${16 * wxScale}px`,
            backgroundColor: '#f9fafb',
            color: props.value ? '#111827' : '#9ca3af',
          }}
        >
          {props.value || '请选择日期'}
        </View>
      </Picker>
    )
  }

  if (isLoading) {
    return (
      <View className="page-loading">
        <View
          className="loading-spinner"
          style={{ borderTopColor: primaryColor }}
        />
      </View>
    )
  }

  return (
    <View className="page-container">
      <UserProfileEditPageComponent
        themeSettings={themeSettings}
        isDarkMode={false}
        onBack={handleBack}
        onLogout={handleLogout}
        renderAvatarButton={renderAvatarButton}
        renderBindPhoneButton={renderBindPhoneButton}
        renderDatePicker={renderDatePicker}
      />
    </View>
  )
}

// ============================================================================
// 页面组件
// ============================================================================

export default function UserSettingsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserSettingsPageContent />
    </QueryClientProvider>
  )
}
