/**
 * 活动列表页面（预览器版本）
 *
 * Step 8 批次 C: campaigns
 * - page key: 'campaigns'
 * - API: previewApi.getCampaigns()
 * - 数据通道: userRequest
 *
 * Step 14.8 UI-D-2: 支持 marketingData.campaigns 覆盖
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings, CampaignsDataOverride, CampaignOverride } from '../../../types'
import { previewApi, type Campaign } from '../../../api'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { getRefreshingClass } from '../../PageTransition'
import { getSecondaryTextClass, getTertiaryTextClass } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface CampaignsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onNavigate?: (page: string, params?: { id: string }) => void
  /** 活动数据覆盖（管理后台实时预览用） */
  campaignsOverride?: CampaignsDataOverride
}

// ============================================================================
// 组件实现
// ============================================================================

export function CampaignsPage({ themeSettings, isDarkMode, onNavigate, campaignsOverride }: CampaignsPageProps) {
  // 获取活动列表（当有覆盖数据时不发起请求）
  const {
    data: apiCampaigns,
    isLoading: isApiLoading,
    isError: isApiError,
    isFetching: isApiFetching,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'campaigns'],
    queryFn: previewApi.getCampaigns,
    staleTime: 60 * 1000,
    enabled: !campaignsOverride, // 有覆盖数据时禁用 API 请求
  })

  // 合并数据：覆盖优先
  const campaigns = useMemo<Campaign[] | undefined>(() => {
    if (campaignsOverride?.items) {
      return campaignsOverride.items.map(mapOverrideToCampaign)
    }
    return apiCampaigns
  }, [campaignsOverride, apiCampaigns])

  // 加载状态
  const isLoading = !campaignsOverride && isApiLoading
  const isError = !campaignsOverride && isApiError
  const isFetching = !campaignsOverride && isApiFetching

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
        {/* 加载中 - 骨架屏 */}
        {isLoading && (
          <ListSkeleton count={3} variant="card" isDarkMode={isDarkMode} />
        )}

        {/* 请求失败 - 带重试按钮 */}
        {isError && (
          <ErrorRetry
            onRetry={() => refetch()}
            isDarkMode={isDarkMode}
            primaryColor={themeSettings.primaryColor}
          />
        )}

        {/* 空态 - Step 14.21: 添加引导文案 */}
        {isEmpty && !isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-5xl mb-3">🎉</div>
            <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
              暂无进行中的活动
            </div>
            <div className={`text-xs mt-1 ${getTertiaryTextClass(isDarkMode)}`}>
              敬请期待更多精彩活动
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                color: isDarkMode ? '#d1d5db' : '#4b5563',
              }}
            >
              刷新查看
            </button>
          </div>
        )}

        {/* 活动列表 - Step 14.10-C: 刷新过渡效果 */}
        {!isLoading && !isError && campaigns && campaigns.length > 0 && (
          <div className={`space-y-4 ${getRefreshingClass(isFetching, true)}`}>
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
  // Step 14.14: 活动状态配置，添加 default 处理未知枚举值
  const statusConfig: Record<string, { label: string; className: string }> = {
    ended: { label: '已结束', className: 'bg-gray-500' },
    upcoming: { label: '即将开始', className: 'bg-blue-500' },
    pending: { label: '即将开始', className: 'bg-blue-500' },
    ongoing: { label: '进行中', className: 'bg-green-500' },
    active: { label: '进行中', className: 'bg-green-500' },
    // 未知状态降级为进行中
    default: { label: '进行中', className: 'bg-green-500' },
  }

  const status = statusConfig[campaign.status] ?? statusConfig.default
  const isExpired = campaign.status === 'ended'

  return (
    <div
      onClick={onClick}
      className={`rounded-xl overflow-hidden cursor-pointer transition-transform active:scale-[0.98] ${isExpired ? 'opacity-60' : ''
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
        {/* 状态标签 - Step 14.14: 使用 statusConfig 统一处理 */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 rounded text-xs text-white ${status.className}`}>
            {status.label}
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
        <div className={`text-xs mt-1 ${getSecondaryTextClass(isDarkMode)}`}>
          {campaign.description}
        </div>
        <div className={`text-xs mt-2 ${getTertiaryTextClass(isDarkMode)}`}>
          {campaign.startTime} ~ {campaign.endTime}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 将覆盖数据转换为 Campaign 类型
 */
function mapOverrideToCampaign(override: CampaignOverride): Campaign {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN')
    } catch {
      return dateStr
    }
  }

  // 根据 status 映射 - Step 14.14: 未知状态降级为 'ongoing'
  const statusMap: Record<string, Campaign['status']> = {
    pending: 'upcoming',
    active: 'ongoing',
    ended: 'ended',
    cancelled: 'ended',
  }

  return {
    id: override.id,
    title: override.name,
    description: override.description || getDiscountText(override),
    coverImage: override.bannerUrl,
    startTime: formatDate(override.startAt),
    endTime: formatDate(override.endAt),
    // 未知状态降级为 'ongoing'（进行中）
    status: statusMap[override.status] || 'ongoing',
  }
}

/**
 * 生成优惠描述文本
 */
function getDiscountText(override: CampaignOverride): string {
  if (!override.discountType || override.discountValue === undefined) {
    return '限时优惠活动'
  }
  if (override.discountType === 'amount') {
    const minText = override.minAmount ? `满${override.minAmount}元` : ''
    return `${minText}减${override.discountValue}元`
  }
  return `${override.discountValue}折优惠`
}

