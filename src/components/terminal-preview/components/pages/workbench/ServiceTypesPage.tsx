/**
 * 服务项目选择页面（预览器版本）
 *
 * 用于陪诊员选择可接单的服务项目
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { getSecondaryTextClass } from '../../../utils'
import { previewApi } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'

// ============================================================================
// 类型定义
// ============================================================================

export interface ServiceTypesPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function ServiceTypesPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLogin,
}: ServiceTypesPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 获取服务列表（⚠️ 非 escort 视角时不发请求）
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['preview', 'servicesList', 'all'],
    queryFn: () => previewApi.getServices({ pageSize: 50 }),
    staleTime: 60 * 1000,
    enabled: isEscort,
  })

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <div
        className="min-h-full"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
        }}
      >
        {/* 页面标题 */}
        <div
          className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
          style={{
            backgroundColor: themeSettings.primaryColor,
          }}
        >
          <button
            onClick={() => onNavigate?.('workbench-settings')}
            className="text-white p-1 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">服务项目</h1>
          <div className="w-10" />
        </div>

        <div className="px-4 py-8">
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号管理服务项目"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    )
  }

  const services = servicesData?.data || []

  // 已选择的服务项目（默认选择前3个）
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return new Set()
  })

  // 当服务数据加载完成后，默认选中前3个
  const [initialized, setInitialized] = useState(false)
  if (services.length > 0 && !initialized) {
    const defaultSelected = services.slice(0, 3).map(s => s.id)
    setSelectedIds(new Set(defaultSelected))
    setInitialized(true)
  }

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSave = () => {
    // 预览器模式，直接返回
    onNavigate?.('workbench-settings')
  }

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 页面标题 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{
          backgroundColor: themeSettings.primaryColor,
        }}
      >
        <button
          onClick={() => onNavigate?.('workbench-settings')}
          className="text-white p-1 -ml-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">服务项目</h1>
        <button
          onClick={handleSave}
          className="text-white text-sm font-medium"
        >
          保存
        </button>
      </div>

      {/* 提示文字 */}
      <div className="px-4 py-3">
        <p className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
          选择您可以提供的服务项目，系统将根据您的选择推送相关订单
        </p>
      </div>

      {/* 服务项目列表 */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: themeSettings.primaryColor }} />
          </div>
        ) : services.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>暂无服务项目</p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            }}
          >
            {services.map((service, index) => {
              const isSelected = selectedIds.has(service.id)
              const isLast = index === services.length - 1
              return (
                <button
                  key={service.id}
                  onClick={() => handleToggle(service.id)}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-black/5 active:bg-black/10 transition-colors"
                  style={{
                    borderBottom: isLast
                      ? 'none'
                      : `1px solid ${isDarkMode ? '#3a3a3a' : '#f0f0f0'}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {service.name}
                      </span>
                      {service.category && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${themeSettings.primaryColor}15`,
                            color: themeSettings.primaryColor,
                          }}
                        >
                          {service.category.name}
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <div
                        className={`text-xs mt-0.5 truncate ${getSecondaryTextClass(isDarkMode)}`}
                      >
                        {service.description}
                      </div>
                    )}
                    <div className={`text-xs mt-1 ${getSecondaryTextClass(isDarkMode)}`}>
                      ¥{service.price}{service.unit ? `/${service.unit}` : ''} · 已售{service.orderCount}单
                    </div>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center ml-3 flex-shrink-0 transition-colors"
                    style={{
                      backgroundColor: isSelected
                        ? themeSettings.primaryColor
                        : isDarkMode
                          ? '#3a3a3a'
                          : '#e5e7eb',
                    }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 已选择数量提示 */}
      <div className="px-4 py-4">
        <p className={`text-sm text-center ${getSecondaryTextClass(isDarkMode)}`}>
          已选择 {selectedIds.size} 项服务
        </p>
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}
