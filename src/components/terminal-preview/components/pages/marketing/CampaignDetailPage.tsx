/**
 * 活动详情页面
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon, Image, Button
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState + useEffect 获取数据
 * - Image 组件显式指定 mode 属性
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon, Image, Button } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings } from '../../../types'
import { previewApi } from '../../../api'
import type { CampaignDetail } from '../../../api'

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
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 主组件
// ============================================================================

export function CampaignDetailPage({
  themeSettings,
  isDarkMode,
  campaignId,
  onBack,
}: CampaignDetailPageProps) {
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 获取活动详情
  const fetchCampaign = () => {
    if (!campaignId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setIsError(false)
    previewApi
      .getCampaignDetail(campaignId)
      .then((data) => setCampaign(data))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchCampaign()
  }, [campaignId])

  // 无 ID 时显示友好提示
  if (!campaignId) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: bgColor,
        }}
      >
        {/* 导航栏 */}
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
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>活动详情</Text>
          </Box>
        </Box>

        {/* 无 ID 提示 */}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="info" size={48 * wxScale} color={textSecondary} />
          <Text style={{ marginTop: 12 * wxScale, fontSize: 14 * wxScale, color: textSecondary }}>
            未指定活动
          </Text>
          <Box
            onClick={onBack}
            style={{
              marginTop: 16 * wxScale,
              paddingLeft: 24 * wxScale,
              paddingRight: 24 * wxScale,
              paddingTop: 8 * wxScale,
              paddingBottom: 8 * wxScale,
              borderRadius: 9999,
              backgroundColor: primaryColor,
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>返回活动列表</Text>
          </Box>
        </Box>
      </Box>
    )
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
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>活动详情</Text>
        </Box>
      </Box>

      {/* ========== 内容区 ========== */}
      <Box style={{ flex: 1 }}>
        {/* 加载状态 - 骨架屏 */}
        {isLoading && (
          <Box>
            <Box
              style={{
                height: 192 * wxScale,
                backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
              }}
            />
            <Box style={{ padding: 16 * wxScale }}>
              <Box
                style={{
                  height: 24 * wxScale,
                  width: 200 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                  marginBottom: 12 * wxScale,
                }}
              />
              <Box
                style={{
                  height: 16 * wxScale,
                  width: 150 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                }}
              />
            </Box>
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
              onClick={fetchCampaign}
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

        {/* 活动详情 */}
        {!isLoading && !isError && campaign && (
          <CampaignContent
            campaign={campaign}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
        )}
      </Box>
    </Box>
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
  const primaryColor = themeSettings.primaryColor
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  const isExpired = campaign.status === 'ended'
  const isUpcoming = campaign.status === 'upcoming'

  // 状态颜色
  const statusBgColor = isExpired ? '#6b7280' : isUpcoming ? '#3b82f6' : '#22c55e'
  const statusLabel = isExpired ? '已结束' : isUpcoming ? '即将开始' : '进行中'

  return (
    <>
      {/* 封面图 */}
      <Box
        style={{
          position: 'relative',
          height: 192 * wxScale,
          backgroundColor: primaryColor,
        }}
      >
        {campaign.coverImage ? (
          <Image
            src={campaign.coverImage}
            mode="aspectFill"
            style={{
              width: '100%',
              height: 192 * wxScale,
            }}
          />
        ) : (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 192 * wxScale,
            }}
          >
            <Icon name="gift" size={64 * wxScale} color="rgba(255,255,255,0.5)" />
          </Box>
        )}

        {/* 状态标签 */}
        <Box
          style={{
            position: 'absolute',
            bottom: 16 * wxScale,
            left: 16 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 4 * wxScale,
            paddingBottom: 4 * wxScale,
            borderRadius: 9999,
            backgroundColor: statusBgColor,
          }}
        >
          <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>{statusLabel}</Text>
        </Box>
      </Box>

      {/* 活动信息 */}
      <Box style={{ padding: 16 * wxScale }}>
        <Text
          style={{
            fontSize: 20 * wxScale,
            fontWeight: 700,
            color: textPrimary,
          }}
        >
          {campaign.title}
        </Text>
        <Text
          style={{
            display: 'block',
            marginTop: 8 * wxScale,
            fontSize: 14 * wxScale,
            color: textSecondary,
          }}
        >
          {campaign.startTime} ~ {campaign.endTime}
        </Text>

        {/* 活动规则 */}
        <Box style={{ marginTop: 16 * wxScale }}>
          <Text
            style={{
              fontSize: 15 * wxScale,
              fontWeight: 500,
              color: textPrimary,
              marginBottom: 8 * wxScale,
            }}
          >
            活动规则
          </Text>
          <Box
            style={{
              padding: 16 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: cardBg,
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: isDarkMode ? '#d1d5db' : '#4b5563',
                lineHeight: 1.6,
              }}
            >
              {campaign.rules || campaign.description}
            </Text>
          </Box>
        </Box>

        {/* 活动奖励 */}
        {campaign.rewards && campaign.rewards.length > 0 && (
          <Box style={{ marginTop: 16 * wxScale }}>
            <Text
              style={{
                fontSize: 15 * wxScale,
                fontWeight: 500,
                color: textPrimary,
                marginBottom: 8 * wxScale,
              }}
            >
              活动奖励
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
              {campaign.rewards.map((reward, index) => (
                <Box
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12 * wxScale,
                    padding: 12 * wxScale,
                    borderRadius: 8 * wxScale,
                    backgroundColor: cardBg,
                  }}
                >
                  <Icon name="gift" size={20 * wxScale} color={primaryColor} />
                  <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>{reward}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* 底部按钮 */}
      {!isExpired && (
        <Box style={{ padding: 16 * wxScale }}>
          <Button
            style={{
              width: '100%',
              paddingTop: isWxEnvironment() ? 14 * wxScale : 10,
              paddingBottom: isWxEnvironment() ? 14 * wxScale : 10,
              borderRadius: 9999,
              backgroundColor: primaryColor,
            }}
          >
            <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: '#fff' }}>
              {isUpcoming ? '活动即将开始' : '立即参与'}
            </Text>
          </Button>
        </Box>
      )}

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </>
  )
}
