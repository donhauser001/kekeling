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

import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  MapPin,
  Clock,
  User,
  Power,
  Settings,
  Zap,
} from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi, type WorkbenchSettings } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'

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
  onShowLoginDialog?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function WorkbenchSettingsPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onShowLoginDialog,
}: WorkbenchSettingsPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

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
            description="请先登录陪诊员账号后再访问设置页面"
            onLogin={onShowLoginDialog}
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
              className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
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
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
        {/* 个人资料卡片 */}
        <div
          className="mx-4 mt-4 rounded-xl p-4"
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
          }}
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
                  className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  评分 {settings.profile.rating}
                </span>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
            />
          </div>
        </div>

        {/* 接单状态 */}
        <div className="px-4 mt-4">
          <h2
            className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            接单状态
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            }}
          >
            <SettingItem
              icon={<Power className="w-5 h-5" />}
              iconColor={settings.isOnline ? '#10b981' : '#ef4444'}
              label="在线接单"
              value={settings.isOnline ? '已开启' : '已关闭'}
              isDarkMode={isDarkMode}
            />
            <SettingItem
              icon={<Zap className="w-5 h-5" />}
              iconColor="#8b5cf6"
              label="自动接单"
              value={settings.autoAcceptOrders ? '已开启' : '已关闭'}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* 接单偏好 */}
        <div className="px-4 mt-4">
          <h2
            className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
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
              label="服务类型偏好"
              value={`${settings.preferences.serviceTypes.length} 项`}
              isDarkMode={isDarkMode}
            />
            <SettingItem
              icon={<MapPin className="w-5 h-5" />}
              iconColor="#f59e0b"
              label="服务区域"
              value={settings.preferences.serviceAreas.join('、')}
              isDarkMode={isDarkMode}
            />
            <SettingItem
              icon={<MapPin className="w-5 h-5" />}
              iconColor="#6366f1"
              label="最大接单距离"
              value={
                settings.preferences.maxDistance
                  ? `${settings.preferences.maxDistance} km`
                  : '不限'
              }
              isDarkMode={isDarkMode}
            />
            {settings.preferences.workingHours && (
              <SettingItem
                icon={<Clock className="w-5 h-5" />}
                iconColor="#14b8a6"
                label="工作时间"
                value={`${settings.preferences.workingHours.start} - ${settings.preferences.workingHours.end}`}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>

        {/* 通知设置 */}
        <div className="px-4 mt-4">
          <h2
            className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
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
}

function SettingItem({
  icon,
  iconColor,
  label,
  value,
  isDarkMode,
  showBorder = true,
}: SettingItemProps) {
  return (
    <div
      className="flex items-center px-4 py-3"
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
        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
      >
        {value}
      </span>
      <ChevronRight
        className={`w-4 h-4 ml-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
      />
    </div>
  )
}

