/**
 * 陪诊员详情页面（预览器版本）
 *
 * Step 10 批次 E: escort-detail
 * - page key: 'escort-detail'
 * - API: previewApi.getEscortDetail(id)
 * - 数据通道: userRequest（公开信息）
 */

import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings } from '../../../types'
import { previewApi } from '../../../api'
import type { EscortDetail } from '../../../api'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { getSecondaryTextClass } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface EscortDetailPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  /** 陪诊员 ID（从路由参数传入） */
  escortId?: string
  onBack?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function EscortDetailPage({
  themeSettings,
  isDarkMode,
  escortId,
  onBack,
}: EscortDetailPageProps) {
  // 无 ID 时显示友好提示
  if (!escortId) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
        }}
      >
        {/* 页面标题 */}
        <div
          className="px-4 py-3 flex items-center"
          style={{
            backgroundColor: themeSettings.primaryColor,
          }}
        >
          {onBack && (
            <button onClick={onBack} className="text-white mr-3">
              ←
            </button>
          )}
          <h1 className="text-lg font-semibold text-white flex-1 text-center pr-6">
            陪诊员详情
          </h1>
        </div>

        {/* 无 ID 提示 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">❓</div>
          <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
            未指定陪诊员
          </div>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 rounded-full text-white text-sm"
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  // 获取陪诊员详情
  const {
    data: escort,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'escorts', escortId],
    queryFn: () => previewApi.getEscortDetail(escortId),
    staleTime: 60 * 1000,
  })

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 页面标题 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center"
        style={{
          backgroundColor: themeSettings.primaryColor,
        }}
      >
        {onBack && (
          <button onClick={onBack} className="text-white mr-3">
            ←
          </button>
        )}
        <h1 className="text-lg font-semibold text-white flex-1 text-center pr-6">
          陪诊员详情
        </h1>
      </div>

      {/* 内容区 */}
      <div className="px-4 py-4">
        {/* 加载中 - 骨架屏 */}
        {isLoading && (
          <ListSkeleton count={1} variant="detail" isDarkMode={isDarkMode} />
        )}

        {/* 请求失败 - 带重试按钮 */}
        {isError && (
          <ErrorRetry
            onRetry={() => refetch()}
            isDarkMode={isDarkMode}
            primaryColor={themeSettings.primaryColor}
          />
        )}

        {/* 陪诊员详情 */}
        {!isLoading && !isError && escort && (
          <EscortContent
            escort={escort}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// 陪诊员内容子组件
// ============================================================================

interface EscortContentProps {
  escort: EscortDetail
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function EscortContent({ escort, themeSettings, isDarkMode }: EscortContentProps) {
  return (
    <>
      {/* 头部信息 */}
      <div
        className="px-4 py-6 text-center"
        style={{
          background: `linear-gradient(180deg, ${themeSettings.primaryColor} 0%, transparent 100%)`,
        }}
      >
        {/* 头像 */}
        <div
          className="w-24 h-24 rounded-full mx-auto bg-cover bg-center border-4 border-white"
          style={{
            backgroundColor: themeSettings.primaryColor,
            backgroundImage: escort.avatar ? `url(${escort.avatar})` : undefined,
          }}
        >
          {!escort.avatar && (
            <div className="w-full h-full flex items-center justify-center text-4xl text-white">
              👤
            </div>
          )}
        </div>

        {/* 名称和等级 */}
        <div className="mt-3">
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {escort.name}
          </span>
          {escort.level && (
            <span
              className="ml-2 px-2 py-0.5 rounded text-xs text-white"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              {escort.level}
            </span>
          )}
        </div>

        {/* 状态 */}
        <div className="mt-2">
          <span
            className={`text-sm ${escort.status === 'available' ? 'text-green-500' : 'text-gray-400'
              }`}
          >
            {escort.status === 'available' ? '● 在线可预约' : '○ 暂时离线'}
          </span>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="px-4 -mt-2">
        <div
          className="flex justify-around p-4 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
          }}
        >
          <StatItem label="服务次数" value={escort.serviceCount} isDarkMode={isDarkMode} />
          <StatItem label="好评率" value={`${escort.rating}%`} isDarkMode={isDarkMode} />
          <StatItem label="从业年限" value={`${escort.experience}年`} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* 个人简介 */}
      <div className="px-4 mt-4">
        <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          个人简介
        </div>
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
          }}
        >
          <p className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
            {escort.bio || '这位陪诊员还没有填写个人简介。'}
          </p>
        </div>
      </div>

      {/* 服务标签 */}
      {escort.tags && escort.tags.length > 0 && (
        <div className="px-4 mt-4">
          <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            擅长服务
          </div>
          <div className="flex flex-wrap gap-2">
            {escort.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: `${themeSettings.primaryColor}20`,
                  color: themeSettings.primaryColor,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 服务区域 */}
      {escort.serviceAreas && escort.serviceAreas.length > 0 && (
        <div className="px-4 mt-4">
          <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            服务区域
          </div>
          <div
            className="p-4 rounded-xl"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            }}
          >
            <p className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
              {escort.serviceAreas.join('、')}
            </p>
          </div>
        </div>
      )}

      {/* 底部按钮 */}
      <div className="px-4 py-4 mt-4">
        <button
          className="w-full py-3 rounded-full text-white font-medium"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          立即预约
        </button>
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </>
  )
}

// ============================================================================
// 统计项子组件
// ============================================================================

interface StatItemProps {
  label: string
  value: string | number
  isDarkMode: boolean
}

function StatItem({ label, value, isDarkMode }: StatItemProps) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
      <div className={`text-xs mt-1 ${getSecondaryTextClass(isDarkMode)}`}>{label}</div>
    </div>
  )
}

