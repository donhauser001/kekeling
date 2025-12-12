/**
 * 陪诊员列表页面（预览器版本）
 *
 * Step 10 批次 E: escort-list
 * - page key: 'escort-list'
 * - API: previewApi.getEscorts()
 * - 数据通道: userRequest（公开信息）
 */

import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings } from '../../../types'
import { previewApi, type EscortListItem } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface EscortListPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function EscortListPage({ themeSettings, isDarkMode, onNavigate }: EscortListPageProps) {
  // 获取陪诊员列表
  const {
    data: escorts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'escorts'],
    queryFn: () => previewApi.getEscorts(),
    staleTime: 60 * 1000,
  })

  const isEmpty = !isLoading && (!escorts || escorts.length === 0)

  // 点击陪诊员
  const handleEscortClick = (escort: EscortListItem) => {
    onNavigate?.('escort-detail', { id: escort.id })
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
        className="sticky top-0 z-10 px-4 py-3"
        style={{
          backgroundColor: themeSettings.primaryColor,
        }}
      >
        <h1 className="text-lg font-semibold text-white text-center">
          陪诊员
        </h1>
      </div>

      {/* 内容区 */}
      <div className="px-4 py-4">
        {/* 加载中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 text-sm">加载中...</div>
          </div>
        )}

        {/* 请求失败 */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-2">😔</div>
            <div className="text-gray-400 text-sm">加载失败，请稍后重试</div>
          </div>
        )}

        {/* 空态 */}
        {isEmpty && !isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-5xl mb-3">👩‍⚕️</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无可用陪诊员
            </div>
          </div>
        )}

        {/* 陪诊员列表 */}
        {!isLoading && !isError && escorts && escorts.length > 0 && (
          <div className="space-y-3">
            {escorts.map((escort) => (
              <EscortCard
                key={escort.id}
                escort={escort}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                onClick={() => handleEscortClick(escort)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}

// ============================================================================
// 陪诊员卡片子组件
// ============================================================================

interface EscortCardProps {
  escort: EscortListItem
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onClick: () => void
}

function EscortCard({ escort, themeSettings, isDarkMode, onClick }: EscortCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex gap-3 p-3 rounded-xl cursor-pointer transition-transform active:scale-[0.98]"
      style={{
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
    >
      {/* 头像 */}
      <div
        className="w-16 h-16 rounded-full bg-cover bg-center flex-shrink-0"
        style={{
          backgroundColor: themeSettings.primaryColor,
          backgroundImage: escort.avatar ? `url(${escort.avatar})` : undefined,
        }}
      >
        {!escort.avatar && (
          <div className="w-full h-full flex items-center justify-center text-2xl text-white">
            👤
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {escort.name}
          </span>
          {escort.level && (
            <span
              className="px-1.5 py-0.5 rounded text-xs text-white"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              {escort.level}
            </span>
          )}
        </div>
        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {escort.serviceCount}次服务 · 好评率{escort.rating}%
        </div>
        {escort.tags && escort.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {escort.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-0.5 rounded text-xs ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 状态 */}
      <div className="flex-shrink-0 text-right">
        <span
          className={`text-xs ${
            escort.status === 'available' ? 'text-green-500' : 'text-gray-400'
          }`}
        >
          {escort.status === 'available' ? '● 在线' : '○ 离线'}
        </span>
      </div>
    </div>
  )
}

