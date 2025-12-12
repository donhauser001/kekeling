/**
 * 活动列表页面（预览器版本）
 *
 * Step 8 批次 C: campaigns
 * - page key: 'campaigns'
 * - API: previewApi.getCampaigns()
 * - 数据通道: userRequest
 */

import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings } from '../../../types'
import { previewApi, type Campaign } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface CampaignsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onNavigate?: (page: string, params?: { id: string }) => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function CampaignsPage({ themeSettings, isDarkMode, onNavigate }: CampaignsPageProps) {
  // 获取活动列表
  const {
    data: campaigns,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'campaigns'],
    queryFn: previewApi.getCampaigns,
    staleTime: 60 * 1000,
  })

  const isEmpty = !isLoading && (!campaigns || campaigns.length === 0)

  // 点击活动条目
  const handleCampaignClick = (campaign: Campaign) => {
    // 预留跳转到详情页
    onNavigate?.('campaigns-detail', { id: campaign.id })
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
          活动中心
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
            <div className="text-5xl mb-3">🎉</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无进行中的活动
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              敬请期待更多精彩活动
            </div>
          </div>
        )}

        {/* 活动列表 */}
        {!isLoading && !isError && campaigns && campaigns.length > 0 && (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                onClick={() => handleCampaignClick(campaign)}
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
// 活动卡片子组件
// ============================================================================

interface CampaignCardProps {
  campaign: Campaign
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onClick: () => void
}

function CampaignCard({ campaign, themeSettings, isDarkMode, onClick }: CampaignCardProps) {
  const isExpired = campaign.status === 'ended'
  const isUpcoming = campaign.status === 'upcoming'

  return (
    <div
      onClick={onClick}
      className={`rounded-xl overflow-hidden cursor-pointer transition-transform active:scale-[0.98] ${
        isExpired ? 'opacity-60' : ''
      }`}
      style={{
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
    >
      {/* 活动封面 */}
      <div
        className="h-32 bg-cover bg-center relative"
        style={{
          backgroundColor: themeSettings.primaryColor,
          backgroundImage: campaign.coverImage ? `url(${campaign.coverImage})` : undefined,
        }}
      >
        {/* 状态标签 */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-0.5 rounded text-xs text-white ${
              isExpired
                ? 'bg-gray-500'
                : isUpcoming
                ? 'bg-blue-500'
                : 'bg-green-500'
            }`}
          >
            {isExpired ? '已结束' : isUpcoming ? '即将开始' : '进行中'}
          </span>
        </div>

        {/* 无封面时显示 emoji */}
        {!campaign.coverImage && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-50">
            🎊
          </div>
        )}
      </div>

      {/* 活动信息 */}
      <div className="p-3">
        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {campaign.title}
        </div>
        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {campaign.description}
        </div>
        <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {campaign.startTime} ~ {campaign.endTime}
        </div>
      </div>
    </div>
  )
}

