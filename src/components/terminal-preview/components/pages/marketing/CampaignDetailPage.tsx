/**
 * 活动详情页面（预览器版本）
 *
 * Step 9 批次 D: campaigns-detail
 * - page key: 'campaigns-detail'
 * - API: previewApi.getCampaignDetail(id)
 * - 数据通道: userRequest
 */

import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings } from '../../../types'
import { previewApi, type CampaignDetail } from '../../../api'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { getSecondaryTextClass } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface CampaignDetailPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  /** 活动 ID（从路由参数传入） */
  campaignId?: string
  onBack?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function CampaignDetailPage({
  themeSettings,
  isDarkMode,
  campaignId,
  onBack,
}: CampaignDetailPageProps) {
  // 无 ID 时显示友好提示
  if (!campaignId) {
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
            活动详情
          </h1>
        </div>

        {/* 无 ID 提示 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">❓</div>
          <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
            未指定活动
          </div>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 rounded-full text-white text-sm"
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            返回活动列表
          </button>
        </div>
      </div>
    )
  }

  // 获取活动详情
  const {
    data: campaign,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'campaigns', campaignId],
    queryFn: () => previewApi.getCampaignDetail(campaignId),
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
          活动详情
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

        {/* 活动详情 */}
        {!isLoading && !isError && campaign && (
          <CampaignContent
            campaign={campaign}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// 活动内容子组件
// ============================================================================

interface CampaignContentProps {
  campaign: CampaignDetail
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function CampaignContent({ campaign, themeSettings, isDarkMode }: CampaignContentProps) {
  const isExpired = campaign.status === 'ended'
  const isUpcoming = campaign.status === 'upcoming'

  return (
    <>
      {/* 封面图 */}
      <div
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundColor: themeSettings.primaryColor,
          backgroundImage: campaign.coverImage ? `url(${campaign.coverImage})` : undefined,
        }}
      >
        {/* 状态标签 */}
        <div className="absolute bottom-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-sm text-white ${isExpired
              ? 'bg-gray-500'
              : isUpcoming
                ? 'bg-blue-500'
                : 'bg-green-500'
              }`}
          >
            {isExpired ? '已结束' : isUpcoming ? '即将开始' : '进行中'}
          </span>
        </div>
      </div>

      {/* 活动信息 */}
      <div className="px-4 py-4">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {campaign.title}
        </h2>
        <div className={`text-sm mt-2 ${getSecondaryTextClass(isDarkMode)}`}>
          {campaign.startTime} ~ {campaign.endTime}
        </div>

        {/* 活动规则 */}
        <div className="mt-4">
          <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            活动规则
          </div>
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            }}
          >
            <div className={`text-sm whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {campaign.rules || campaign.description}
            </div>
          </div>
        </div>

        {/* 活动奖励 */}
        {campaign.rewards && campaign.rewards.length > 0 && (
          <div className="mt-4">
            <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              活动奖励
            </div>
            <div className="space-y-2">
              {campaign.rewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                  }}
                >
                  <span className="text-xl">🎁</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {reward}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      {!isExpired && (
        <div className="px-4 pb-4">
          <button
            className="w-full py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            {isUpcoming ? '活动即将开始' : '立即参与'}
          </button>
        </div>
      )}

      {/* 底部留白 */}
      <div className="h-16" />
    </>
  )
}

