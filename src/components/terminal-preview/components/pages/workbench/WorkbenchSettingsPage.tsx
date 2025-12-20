/**
 * 工作台设置页面（预览器版本）
 *
 * Step 13: workbench-settings
 * - page key: 'workbench-settings'
 * - API: previewApi.getWorkbenchSettings()
 * - 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * ⚠️ 重要：本页面需要 escortSession/escortToken 才能预览
 * 在 effectiveViewerRole !== 'escort' 时应拒绝渲染并提示
 */

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Clock,
  User,
  Settings,
  Zap,
  Loader2,
  Building2,
  Stethoscope,
} from '../../../ui/lucide-compat'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { getSecondaryTextClass, getTertiaryTextClass } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface WorkbenchSettingsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  /** 当前有效视角（必须为 escort 才能预览） */
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 退出陪诊员视角回调 */
  onExitEscortMode?: () => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function WorkbenchSettingsPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLogin,
}: WorkbenchSettingsPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const queryClient = useQueryClient()

  // ⚠️ 非 escort 视角时不发请求，直接显示提示
  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'workbench', 'settings'],
    queryFn: () => previewApi.getWorkbenchSettings(),
    staleTime: 60 * 1000,
    enabled: isEscort, // 只有 escort 视角才发请求
  })

  // 本地状态（乐观更新）
  const [autoAccept, setAutoAccept] = useState(false)

  // 同步服务器数据到本地状态
  useEffect(() => {
    if (settings) {
      setAutoAccept(settings.autoAcceptOrders)
    }
  }, [settings])

  // 更新设置的 mutation
  const updateMutation = useMutation({
    mutationFn: (updates: { autoAcceptOrders?: boolean }) =>
      previewApi.updateWorkbenchSettings(updates),
    onSuccess: () => {
      // 刷新设置数据
      queryClient.invalidateQueries({ queryKey: ['preview', 'workbench', 'settings'] })
    },
  })

  // 切换自动接单
  const handleToggleAutoAccept = () => {
    const newValue = !autoAccept
    setAutoAccept(newValue)
    updateMutation.mutate({ autoAcceptOrders: newValue })
  }

  // 非 escort 视角：显示权限提示
  if (!isEscort) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
        }}
      >
        {/* 页面标题 */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{
            backgroundColor: themeSettings.primaryColor,
          }}
        >
          <button
            onClick={() => onNavigate?.('workbench')}
            className="text-white p-1 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">设置</h1>
        </div>

        {/* 权限提示 */}
        <div className="flex-1">
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号访问设置页面"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
          />
        </div>
      </div>
    )
  }

  // 加载中状态
  if (isLoading) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
        }}
      >
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{
            backgroundColor: themeSettings.primaryColor,
          }}
        >
          <button
            onClick={() => onNavigate?.('workbench')}
            className="text-white p-1 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">设置</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: themeSettings.primaryColor }}
            />
            <p
              className={`mt-2 text-sm ${getSecondaryTextClass(isDarkMode)}`}
            >
              加载中...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (isError || !settings) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
        }}
      >
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{
            backgroundColor: themeSettings.primaryColor,
          }}
        >
          <button
            onClick={() => onNavigate?.('workbench')}
            className="text-white p-1 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">设置</h1>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-4xl mb-2">😢</div>
            <p className={`${getSecondaryTextClass(isDarkMode)}`}>
              加载失败，请稍后重试
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 主界面
  return (
    <div
      className="min-h-full flex flex-col"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 页面标题 */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{
          backgroundColor: themeSettings.primaryColor,
        }}
      >
        <button
          onClick={() => onNavigate?.('workbench')}
          className="text-white p-1 -ml-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">设置</h1>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* 个人资料卡片 - 可点击跳转到资料编辑页 */}
        <div
          className="mx-4 mt-4 rounded-xl p-4 cursor-pointer hover:opacity-90 active:opacity-80 transition-opacity"
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
          }}
          onClick={() => onNavigate?.('escort-profile-edit')}
        >
          <div className="flex items-center gap-3">
            {settings.profile.avatar ? (
              <img
                src={settings.profile.avatar}
                alt="头像"
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: `${themeSettings.primaryColor}20`,
                }}
              >
                <User
                  className="w-7 h-7"
                  style={{ color: themeSettings.primaryColor }}
                />
              </div>
            )}
            <div className="flex-1">
              <div
                className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {settings.profile.name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${themeSettings.primaryColor}20`,
                    color: themeSettings.primaryColor,
                  }}
                >
                  {settings.profile.level}
                </span>
                <span
                  className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}
                >
                  评分 {settings.profile.rating}
                </span>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 ${getTertiaryTextClass(isDarkMode)}`}
            />
          </div>
        </div>

        {/* 接单设置 */}
        <div className="px-4 mt-4">
          <h2
            className={`text-sm font-medium mb-2 ${getSecondaryTextClass(isDarkMode)}`}
          >
            接单设置
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            }}
          >
            <SwitchItem
              icon={<Zap className="w-5 h-5" />}
              iconColor="#8b5cf6"
              label="自动接单"
              description="系统将自动接受符合条件的订单"
              checked={autoAccept}
              loading={updateMutation.isPending}
              onChange={handleToggleAutoAccept}
              isDarkMode={isDarkMode}
              primaryColor={themeSettings.primaryColor}
              showBorder={false}
            />
          </div>
        </div>

        {/* 接单偏好 */}
        <div className="px-4 mt-4">
          <h2
            className={`text-sm font-medium mb-2 ${getSecondaryTextClass(isDarkMode)}`}
          >
            接单偏好
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            }}
          >
            <SettingItem
              icon={<Settings className="w-5 h-5" />}
              iconColor="#3b82f6"
              label="服务项目"
              value={`已选 ${settings.preferences.serviceTypes.length} 项`}
              isDarkMode={isDarkMode}
              onClick={() => onNavigate?.('workbench-service-types')}
            />
            <SettingItem
              icon={<Building2 className="w-5 h-5" />}
              iconColor="#f59e0b"
              label="服务医院"
              value={`已选 ${settings.preferences.serviceAreas.length} 家`}
              isDarkMode={isDarkMode}
            />
            <SettingItem
              icon={<Stethoscope className="w-5 h-5" />}
              iconColor="#ec4899"
              label="擅长科室"
              value={`已选 ${settings.preferences.departments?.length || 0} 个`}
              isDarkMode={isDarkMode}
            />
            {settings.preferences.workingHours && (
              <SettingItem
                icon={<Clock className="w-5 h-5" />}
                iconColor="#14b8a6"
                label="工作时间"
                value={`${settings.preferences.workingHours.start} - ${settings.preferences.workingHours.end}`}
                isDarkMode={isDarkMode}
                showBorder={false}
              />
            )}
          </div>
        </div>

        {/* 通知设置 */}
        <div className="px-4 mt-4">
          <h2
            className={`text-sm font-medium mb-2 ${getSecondaryTextClass(isDarkMode)}`}
          >
            通知设置
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            }}
          >
            <SettingItem
              icon={<Bell className="w-5 h-5" />}
              iconColor="#10b981"
              label="新订单通知"
              value={settings.notifications.newOrder ? '已开启' : '已关闭'}
              isDarkMode={isDarkMode}
            />
            <SettingItem
              icon={<Bell className="w-5 h-5" />}
              iconColor="#3b82f6"
              label="订单状态变更"
              value={settings.notifications.orderStatus ? '已开启' : '已关闭'}
              isDarkMode={isDarkMode}
            />
            <SettingItem
              icon={<Bell className="w-5 h-5" />}
              iconColor="#8b5cf6"
              label="系统通知"
              value={settings.notifications.system ? '已开启' : '已关闭'}
              isDarkMode={isDarkMode}
            />
            <SettingItem
              icon={<Bell className="w-5 h-5" />}
              iconColor="#f59e0b"
              label="营销通知"
              value={settings.notifications.marketing ? '已开启' : '已关闭'}
              isDarkMode={isDarkMode}
              showBorder={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 子组件
// ============================================================================

interface SettingItemProps {
  icon: React.ReactNode
  iconColor: string
  label: string
  value: string
  isDarkMode: boolean
  showBorder?: boolean
  onClick?: () => void
}

function SettingItem({
  icon,
  iconColor,
  label,
  value,
  isDarkMode,
  showBorder = true,
  onClick,
}: SettingItemProps) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      onClick={onClick}
      className={`flex items-center px-4 py-3 w-full text-left ${onClick ? 'hover:bg-black/5 active:bg-black/10 transition-colors' : ''}`}
      style={{
        borderBottom: showBorder
          ? `1px solid ${isDarkMode ? '#3a3a3a' : '#f0f0f0'}`
          : 'none',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <span
        className={`flex-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}
      >
        {value}
      </span>
      <ChevronRight
        className={`w-4 h-4 ml-1 ${getTertiaryTextClass(isDarkMode)}`}
      />
    </Wrapper>
  )
}

// 开关设置项
interface SwitchItemProps {
  icon: React.ReactNode
  iconColor: string
  label: string
  description?: string
  checked: boolean
  loading?: boolean
  onChange: () => void
  isDarkMode: boolean
  primaryColor: string
  showBorder?: boolean
}

function SwitchItem({
  icon,
  iconColor,
  label,
  description,
  checked,
  loading,
  onChange,
  isDarkMode,
  primaryColor,
  showBorder = true,
}: SwitchItemProps) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className="flex items-center px-4 py-3 w-full text-left hover:bg-black/5 active:bg-black/10 transition-colors disabled:opacity-50"
      style={{
        borderBottom: showBorder
          ? `1px solid ${isDarkMode ? '#3a3a3a' : '#f0f0f0'}`
          : 'none',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
        >
          {label}
        </div>
        {description && (
          <div
            className={`text-xs mt-0.5 ${getSecondaryTextClass(isDarkMode)}`}
          >
            {description}
          </div>
        )}
      </div>
      {/* Switch 开关 */}
      <div className="ml-3 relative">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: primaryColor }} />
        ) : (
          <div
            className="w-11 h-6 rounded-full p-0.5 transition-colors duration-200"
            style={{
              backgroundColor: checked ? primaryColor : isDarkMode ? '#4a4a4a' : '#d1d5db',
            }}
          >
            <div
              className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{
                transform: checked ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </div>
        )}
      </div>
    </button>
  )
}
