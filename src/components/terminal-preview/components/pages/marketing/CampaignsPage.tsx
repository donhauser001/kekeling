/**
 * 活动列表页面
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon, Image
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState + useEffect 获取数据
 * - Image 组件显式指定 mode 属性
 */

import { useState, useEffect, useMemo } from 'react'
import { Box, Text, Icon, Image } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings, CampaignsDataOverride, CampaignOverride } from '../../../types'
import { previewApi } from '../../../api'
import type { Campaign } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface CampaignsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: { id: string }) => void
  /** 活动数据覆盖（管理后台实时预览用） */
  campaignsOverride?: CampaignsDataOverride
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 主组件
// ============================================================================

export function CampaignsPage({
  themeSettings,
  isDarkMode,
  onBack,
  onNavigate,
  campaignsOverride,
}: CampaignsPageProps) {
  const [apiCampaigns, setApiCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 是否使用覆盖数据
  const hasOverride = campaignsOverride !== undefined

  // 获取活动列表
  const fetchCampaigns = () => {
    if (hasOverride) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setIsError(false)
    previewApi
      .getCampaigns()
      .then((data) => setApiCampaigns(data ?? []))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchCampaigns()
  }, [hasOverride])

  // 合并数据：覆盖优先
  const campaigns = useMemo<Campaign[]>(() => {
    if (campaignsOverride?.items) {
      return campaignsOverride.items.map(mapOverrideToCampaign)
    }
    return apiCampaigns
  }, [campaignsOverride, apiCampaigns])

  const isEmpty = !isLoading && campaigns.length === 0

  const handleCampaignClick = (campaign: Campaign) => {
    onNavigate?.('campaigns-detail', { id: campaign.id })
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      {/* ========== 导航栏 ========== */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
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
          {onBack && (
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
          )}
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>活动中心</Text>
        </Box>
      </Box>

      {/* ========== 内容区 ========== */}
      <Box style={{ flex: 1, padding: 12 * wxScale }}>
        {/* 加载状态 - 骨架屏 */}
        {isLoading && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 * wxScale }}>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                style={{
                  borderRadius: 12 * wxScale,
                  backgroundColor: cardBg,
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    height: 128 * wxScale,
                    backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                  }}
                />
                <Box style={{ padding: 12 * wxScale }}>
                  <Box
                    style={{
                      height: 16 * wxScale,
                      width: 160 * wxScale,
                      borderRadius: 4 * wxScale,
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                      marginBottom: 8 * wxScale,
                    }}
                  />
                  <Box
                    style={{
                      height: 12 * wxScale,
                      width: 120 * wxScale,
                      borderRadius: 4 * wxScale,
                      backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* 请求失败 */}
        {isError && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 48 * wxScale,
            }}
          >
            <Icon name="close" size={48 * wxScale} color={textSecondary} />
            <Text style={{ marginTop: 12 * wxScale, fontSize: 14 * wxScale, color: textSecondary }}>
              加载失败
            </Text>
            <Box
              onClick={fetchCampaigns}
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 8 * wxScale,
                paddingBottom: 8 * wxScale,
                borderRadius: 8 * wxScale,
                backgroundColor: primaryColor,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>点击重试</Text>
            </Box>
          </Box>
        )}

        {/* 空状态 */}
        {isEmpty && !isError && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 48 * wxScale,
            }}
          >
            <Icon name="gift" size={48 * wxScale} color={textSecondary} />
            <Text style={{ marginTop: 12 * wxScale, fontSize: 14 * wxScale, color: textSecondary }}>
              暂无进行中的活动
            </Text>
            <Text style={{ marginTop: 4 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
              敬请期待更多精彩活动
            </Text>
            <Box
              onClick={fetchCampaigns}
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 8 * wxScale,
                paddingBottom: 8 * wxScale,
                borderRadius: 8 * wxScale,
                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
              }}
            >
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  fontWeight: 500,
                  color: isDarkMode ? '#d1d5db' : '#4b5563',
                }}
              >
                刷新查看
              </Text>
            </Box>
          </Box>
        )}

        {/* 活动列表 */}
        {!isLoading && !isError && campaigns.length > 0 && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 * wxScale }}>
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                onClick={() => handleCampaignClick(campaign)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
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
  const primaryColor = themeSettings.primaryColor
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 活动状态配置
  const statusConfig: Record<string, { label: string; bgColor: string }> = {
    ended: { label: '已结束', bgColor: '#6b7280' },
    upcoming: { label: '即将开始', bgColor: '#3b82f6' },
    pending: { label: '即将开始', bgColor: '#3b82f6' },
    ongoing: { label: '进行中', bgColor: '#22c55e' },
    active: { label: '进行中', bgColor: '#22c55e' },
    default: { label: '进行中', bgColor: '#22c55e' },
  }

  const status = statusConfig[campaign.status] ?? statusConfig.default
  const isExpired = campaign.status === 'ended'

  return (
    <Box
      onClick={onClick}
      style={{
        borderRadius: 12 * wxScale,
        backgroundColor: cardBg,
        overflow: 'hidden',
        opacity: isExpired ? 0.6 : 1,
        cursor: 'pointer',
      }}
    >
      {/* 活动封面 */}
      <Box
        style={{
          position: 'relative',
          height: 128 * wxScale,
          backgroundColor: primaryColor,
        }}
      >
        {campaign.coverImage ? (
          <Image
            src={campaign.coverImage}
            mode="aspectFill"
            style={{
              width: '100%',
              height: 128 * wxScale,
            }}
          />
        ) : (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 128 * wxScale,
            }}
          >
            <Icon name="gift" size={48 * wxScale} color="rgba(255,255,255,0.5)" />
          </Box>
        )}

        {/* 状态标签 */}
        <Box
          style={{
            position: 'absolute',
            top: 8 * wxScale,
            right: 8 * wxScale,
            paddingLeft: 8 * wxScale,
            paddingRight: 8 * wxScale,
            paddingTop: 2 * wxScale,
            paddingBottom: 2 * wxScale,
            borderRadius: 4 * wxScale,
            backgroundColor: status.bgColor,
          }}
        >
          <Text style={{ fontSize: 12 * wxScale, color: '#fff' }}>{status.label}</Text>
        </Box>
      </Box>

      {/* 活动信息 */}
      <Box style={{ padding: 12 * wxScale }}>
        <Text style={{ fontSize: 15 * wxScale, fontWeight: 500, color: textPrimary }}>
          {campaign.title}
        </Text>
        <Text
          style={{
            display: 'block',
            marginTop: 4 * wxScale,
            fontSize: 12 * wxScale,
            color: textSecondary,
          }}
        >
          {campaign.description}
        </Text>
        <Text
          style={{
            display: 'block',
            marginTop: 8 * wxScale,
            fontSize: 12 * wxScale,
            color: textSecondary,
          }}
        >
          {campaign.startTime} ~ {campaign.endTime}
        </Text>
      </Box>
    </Box>
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
