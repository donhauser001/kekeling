/**
 * 陪诊员详情页面
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
import { isWxEnvironment, getFullImageUrl } from '../../../platform/env'
import { makePhoneCall } from '../../../platform/interaction'
import type { ThemeSettings } from '../../../types'
import { previewApi } from '../../../api'
import type { EscortDetail } from '../../../api'

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
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

function getEscortLevelText(level: EscortDetail['level'] | { name?: string; badge?: string; code?: string } | null | undefined): string {
  if (!level) return ''
  if (typeof level === 'string') return level
  if (typeof level === 'object') {
    return level.name || level.badge || level.code || ''
  }
  return ''
}

function formatServiceCount(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return String(value)
}

function formatRating(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  if (value <= 5) return `${value.toFixed(1)}分`
  return `${Math.round(value)}%`
}

function getEscortPhone(escort: EscortDetail): string {
  if (typeof escort.phone === 'string' && escort.phone.trim()) return escort.phone
  return ''
}

function getEscortServiceCount(escort: EscortDetail): string {
  if (typeof escort.orderCount === 'number' && !Number.isNaN(escort.orderCount)) {
    return formatServiceCount(escort.orderCount)
  }
  return formatServiceCount(escort.serviceCount)
}

function getWorkStatusText(status?: string): { text: string; color: string } {
  switch (status) {
    case 'working': return { text: '接单中', color: '#10b981' }
    case 'busy': return { text: '服务中', color: '#3b82f6' }
    case 'resting': return { text: '休息中', color: '#f59e0b' }
    default: return { text: '离线', color: '#9ca3af' }
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}月${day}日`
}

function renderStars(rating: number, wxS: number, color: string): React.ReactNode[] {
  const stars: React.ReactNode[] = []
  const full = Math.floor(rating)
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Icon key={i} name="star-fill" size={12 * wxS} color={i < full ? color : '#e5e7eb'} />
    )
  }
  return stars
}

// ============================================================================
// 主组件
// ============================================================================

export function EscortDetailPage({
  themeSettings,
  isDarkMode,
  escortId,
  onBack,
}: EscortDetailPageProps) {
  const [escort, setEscort] = useState<EscortDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 获取陪诊员详情
  const fetchEscort = () => {
    if (!escortId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setIsError(false)
    previewApi
      .getEscortDetail(escortId)
      .then((data) => setEscort(data))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchEscort()
  }, [escortId])

  // 无 ID 时显示友好提示
  if (!escortId) {
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
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
              陪诊员详情
            </Text>
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
            未指定陪诊员
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
            <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>返回列表</Text>
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
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
            陪诊员详情
          </Text>
        </Box>
      </Box>

      {/* ========== 内容区 ========== */}
      <Box style={{ flex: 1 }}>
        {/* 加载状态 - 骨架屏 */}
        {isLoading && (
          <Box>
            {/* 头部骨架 */}
            <Box
              style={{
                paddingTop: 24 * wxScale,
                paddingBottom: 24 * wxScale,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: `linear-gradient(180deg, ${primaryColor} 0%, transparent 100%)`,
              }}
            >
              <Box
                style={{
                  width: 96 * wxScale,
                  height: 96 * wxScale,
                  borderRadius: 48 * wxScale,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                }}
              />
              <Box
                style={{
                  marginTop: 12 * wxScale,
                  width: 80 * wxScale,
                  height: 20 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                }}
              />
            </Box>
            {/* 统计骨架 */}
            <Box style={{ padding: 16 * wxScale }}>
              <Box
                style={{
                  height: 80 * wxScale,
                  borderRadius: 12 * wxScale,
                  backgroundColor: cardBg,
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
              onClick={fetchEscort}
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

        {/* 陪诊员详情 */}
        {!isLoading && !isError && escort && (
          <EscortContent escort={escort} themeSettings={themeSettings} isDarkMode={isDarkMode} />
        )}
      </Box>
    </Box>
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
  const primaryColor = themeSettings.primaryColor
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'
  const levelText = getEscortLevelText(escort.level as EscortDetail['level'] | { name?: string; badge?: string; code?: string })
  const serviceCountText = getEscortServiceCount(escort)
  const ratingText = formatRating(escort.rating)
  const phoneText = getEscortPhone(escort)
  const workStatus = getWorkStatusText(escort.workStatus)
  const hospitals = escort.hospitals || []
  const reviews = escort.recentReviews || []
  const ratingCount = escort.ratingCount || 0

  return (
    <>
      {/* 头部信息 */}
      <Box
        style={{
          paddingTop: 24 * wxScale,
          paddingBottom: 24 * wxScale,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: `linear-gradient(180deg, ${primaryColor} 0%, transparent 100%)`,
        }}
      >
        {/* 头像 */}
        <Box
          style={{
            width: 96 * wxScale,
            height: 96 * wxScale,
            borderRadius: 48 * wxScale,
            overflow: 'hidden',
            borderWidth: 4,
            borderStyle: 'solid',
            borderColor: '#fff',
            backgroundColor: primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {escort.avatar ? (
            <Image
              src={getFullImageUrl(escort.avatar) || escort.avatar}
              mode="aspectFill"
              style={{
                width: 96 * wxScale,
                height: 96 * wxScale,
              }}
            />
          ) : (
            <Icon name="user" size={48 * wxScale} color="#fff" />
          )}
        </Box>

        {/* 名称和等级 */}
        <Box
          style={{
            marginTop: 12 * wxScale,
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
          }}
        >
          <Text style={{ fontSize: 20 * wxScale, fontWeight: 700, color: textPrimary }}>
            {escort.name}
          </Text>
          {levelText && (
            <Box
              style={{
                paddingLeft: 8 * wxScale,
                paddingRight: 8 * wxScale,
                paddingTop: 2 * wxScale,
                paddingBottom: 2 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: primaryColor,
              }}
            >
              <Text style={{ fontSize: 12 * wxScale, color: '#fff' }}>{levelText}</Text>
            </Box>
          )}
        </Box>

        {/* 工作状态 */}
        <Box
          style={{
            marginTop: 8 * wxScale,
            display: 'flex',
            alignItems: 'center',
            gap: 6 * wxScale,
          }}
        >
          <Box
            style={{
              width: 8 * wxScale,
              height: 8 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: workStatus.color,
            }}
          />
          <Text style={{ fontSize: 13 * wxScale, color: textSecondary }}>{workStatus.text}</Text>
        </Box>
      </Box>

      {/* 统计数据 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale, marginTop: -8 * wxScale }}>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <StatItem label="服务次数" value={serviceCountText} isDarkMode={isDarkMode} />
          <StatItem label="用户评分" value={ratingText} isDarkMode={isDarkMode} />
        </Box>
      </Box>

      {/* 服务标签 */}
      {escort.tags && escort.tags.length > 0 && (
        <Box style={{ padding: 16 * wxScale }}>
          <SectionTitle text="擅长服务" color={textPrimary} />
          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 * wxScale }}>
            {escort.tags.map((tag, index) => (
              <Box
                key={index}
                style={{
                  paddingLeft: 12 * wxScale,
                  paddingRight: 12 * wxScale,
                  paddingTop: 6 * wxScale,
                  paddingBottom: 6 * wxScale,
                  borderRadius: 9999,
                  backgroundColor: `${primaryColor}15`,
                }}
              >
                <Text style={{ fontSize: 13 * wxScale, color: primaryColor }}>{tag}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 服务医院 */}
      <Box style={{ padding: 16 * wxScale }}>
        <SectionTitle text="服务医院" color={textPrimary} />
        {hospitals.length > 0 ? (
          <Box style={{ borderRadius: 12 * wxScale, backgroundColor: cardBg, overflow: 'hidden' }}>
            {hospitals.map((h, index) => (
              <Box
                key={h.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: 14 * wxScale,
                  gap: 10 * wxScale,
                  borderBottomWidth: index < hospitals.length - 1 ? 1 : 0,
                  borderBottomStyle: 'solid',
                  borderBottomColor: borderColor,
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    width: 32 * wxScale,
                    height: 32 * wxScale,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8 * wxScale,
                    backgroundColor: `${primaryColor}15`,
                    flexShrink: 0,
                  }}
                >
                  <Icon name="hospital" size={16 * wxScale} color={primaryColor} />
                </Box>
                <Box style={{ flex: 1 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 6 * wxScale }}>
                    <Text style={{ display: 'block', fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                      {h.name}
                    </Text>
                    {h.isPrimary && (
                      <Box
                        style={{
                          paddingLeft: 6 * wxScale,
                          paddingRight: 6 * wxScale,
                          paddingTop: 1 * wxScale,
                          paddingBottom: 1 * wxScale,
                          borderRadius: 3 * wxScale,
                          backgroundColor: `${primaryColor}20`,
                        }}
                      >
                        <Text style={{ fontSize: 10 * wxScale, color: primaryColor }}>主要</Text>
                      </Box>
                    )}
                  </Box>
                  {h.familiarDepts && h.familiarDepts.length > 0 && (
                    <Text style={{ display: 'block', marginTop: 4 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
                      熟悉科室：{h.familiarDepts.join('、')}
                    </Text>
                  )}
                  {h.address && (
                    <Text style={{ display: 'block', marginTop: 2 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
                      {h.address}
                    </Text>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            style={{
              padding: 24 * wxScale,
              borderRadius: 12 * wxScale,
              backgroundColor: cardBg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Icon name="hospital" size={28 * wxScale} color={isDarkMode ? '#4a4a4a' : '#d1d5db'} />
            <Text style={{ marginTop: 8 * wxScale, fontSize: 13 * wxScale, color: textSecondary }}>
              暂未关联服务医院
            </Text>
          </Box>
        )}
      </Box>

      {/* 服务区域 */}
      {escort.serviceAreas && escort.serviceAreas.length > 0 && (
        <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale }}>
          <SectionTitle text="服务区域" color={textPrimary} />
          <Box
            style={{
              padding: 14 * wxScale,
              borderRadius: 12 * wxScale,
              backgroundColor: cardBg,
              display: 'flex',
              alignItems: 'center',
              gap: 10 * wxScale,
            }}
          >
            <Icon name="location" size={16 * wxScale} color={primaryColor} />
            <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
              {escort.serviceAreas.join('、')}
            </Text>
          </Box>
        </Box>
      )}

      {/* TODO: 用户评价区块 — 等数据充足后取消注释启用 */}

      {/* 底部拨打电话按钮 */}
      <Box style={{ padding: 16 * wxScale }}>
        <Button
          onClick={phoneText ? () => void makePhoneCall(phoneText) : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8 * wxScale,
            paddingTop: isWxEnvironment() ? 14 * wxScale : 10,
            paddingBottom: isWxEnvironment() ? 14 * wxScale : 10,
            borderRadius: 9999,
            backgroundColor: phoneText ? primaryColor : '#9ca3af',
          }}
        >
          <Icon name="phone-telephone" size={18 * wxScale} color="#fff" />
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: '#fff' }}>
            {phoneText ? '拨打电话' : '暂未提供电话'}
          </Text>
        </Button>
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </>
  )
}

// ============================================================================
// 区块标题子组件
// ============================================================================

function SectionTitle({ text, color }: { text: string; color: string }) {
  return (
    <Text
      style={{
        display: 'block',
        fontSize: 15 * wxScale,
        fontWeight: 600,
        color,
        marginBottom: 10 * wxScale,
      }}
    >
      {text}
    </Text>
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
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 * wxScale, fontWeight: 700, color: textPrimary }}>{value}</Text>
      <Text style={{ marginTop: 4 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
        {label}
      </Text>
    </Box>
  )
}
