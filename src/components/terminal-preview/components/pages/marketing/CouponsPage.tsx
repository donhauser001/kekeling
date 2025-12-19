/**
 * 我的优惠券页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Button/Icon
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: emoji → Icon 组件
 * - 规则 4.1: 添加骨架屏
 */

import { useState, useEffect, useMemo } from 'react'
import { Box, Text, Button, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings, CouponItemOverride } from '../../../types'
import { previewApi } from '../../../api'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 类型定义
// ============================================================================

export interface CouponsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  /**
   * 优惠券数据覆盖
   * - undefined: 不覆盖，使用 API 数据
   * - object: 覆盖数据（包含 items 和 total）
   */
  couponsOverride?: {
    items?: CouponItemOverride[]
    total?: number
  }
}

/**
 * 优惠券项
 * 与后端接口 GET /marketing/coupons/my 返回结构对应
 */
export interface CouponItem {
  id: string
  name: string
  description?: string
  amount: number
  minAmount: number
  expireAt: string
  status: 'available' | 'used' | 'expired'
}

// ============================================================================
// 骨架屏组件
// ============================================================================

function CouponsPageSkeleton({
  primaryColor,
  isDarkMode,
}: {
  primaryColor: string
  isDarkMode: boolean
}) {
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const skeletonBg = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  const skeletonStyle = {
    animation: 'pulse 1.5s ease-in-out infinite',
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 顶部导航栏骨架 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          <Box
            style={{
              width: 100 * wxScale,
              height: 20 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
              ...skeletonStyle,
            }}
          />
        </Box>
      </Box>

      {/* 优惠券卡片骨架 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
        }}
      >
        {[1, 2, 3].map(item => (
          <Box
            key={item}
            style={{
              display: 'flex',
              borderRadius: 8 * wxScale,
              overflow: 'hidden',
              backgroundColor: cardBg,
              marginBottom: 12 * wxScale,
            }}
          >
            {/* 左侧金额区骨架 */}
            <Box
              style={{
                width: 96 * wxScale,
                paddingTop: 16 * wxScale,
                paddingBottom: 16 * wxScale,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: skeletonBg,
                ...skeletonStyle,
              }}
            >
              <Box
                style={{
                  width: 48 * wxScale,
                  height: 24 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
              />
              <Box
                style={{
                  width: 60 * wxScale,
                  height: 12 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  marginTop: 8 * wxScale,
                }}
              />
            </Box>

            {/* 右侧信息区骨架 */}
            <Box
              style={{
                flex: 1,
                padding: 12 * wxScale,
              }}
            >
              <Box
                style={{
                  width: '60%',
                  height: 16 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                  ...skeletonStyle,
                }}
              />
              <Box
                style={{
                  width: '80%',
                  height: 12 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                  marginTop: 8 * wxScale,
                  ...skeletonStyle,
                }}
              />
              <Box
                style={{
                  width: '50%',
                  height: 12 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: skeletonBg,
                  marginTop: 8 * wxScale,
                  ...skeletonStyle,
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// ============================================================================
// 优惠券卡片子组件
// ============================================================================

interface CouponCardProps {
  coupon: CouponItem
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function CouponCard({ coupon, themeSettings, isDarkMode }: CouponCardProps) {
  const isExpired = coupon.status === 'expired'
  const isUsed = coupon.status === 'used'
  const isDisabled = isExpired || isUsed

  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  return (
    <Box
      style={{
        position: 'relative',
        borderRadius: 8 * wxScale,
        overflow: 'hidden',
        backgroundColor: cardBg,
        opacity: isDisabled ? 0.6 : 1,
        marginBottom: 12 * wxScale,
      }}
    >
      <Box
        style={{
          display: 'flex',
        }}
      >
        {/* 左侧金额区 */}
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 96 * wxScale,
            paddingTop: 16 * wxScale,
            paddingBottom: 16 * wxScale,
            backgroundColor: isDisabled ? '#9ca3af' : themeSettings.primaryColor,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: '#ffffff',
              }}
            >
              ¥
            </Text>
            <Text
              style={{
                fontSize: 24 * wxScale,
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {coupon.amount}
            </Text>
          </Box>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 4 * wxScale,
            }}
          >
            满{coupon.minAmount}可用
          </Text>
        </Box>

        {/* 右侧信息区 */}
        <Box
          style={{
            flex: 1,
            padding: 12 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: textPrimary,
            }}
          >
            {coupon.name}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: textSecondary,
              marginTop: 4 * wxScale,
            }}
          >
            {coupon.description || '全场通用'}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: textMuted,
              marginTop: 8 * wxScale,
            }}
          >
            有效期至 {coupon.expireAt}
          </Text>
        </Box>

        {/* 状态标签 */}
        {isDisabled && (
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
              backgroundColor: '#9ca3af',
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: '#ffffff',
              }}
            >
              {isUsed ? '已使用' : '已过期'}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

// ============================================================================
// 主组件
// ============================================================================

export function CouponsPage({
  themeSettings,
  isDarkMode,
  onBack,
  couponsOverride,
}: CouponsPageProps) {
  // 是否使用覆盖数据
  const hasOverride = couponsOverride !== undefined

  // ============================================================================
  // 数据状态（规则 4: useState + useEffect 替代 useQuery）
  // ============================================================================
  const [apiCouponsData, setApiCouponsData] = useState<{ items: CouponItem[]; total: number } | null>(null)
  const [isLoading, setIsLoading] = useState(!hasOverride)
  const [isError, setIsError] = useState(false)

  // 获取优惠券数据
  useEffect(() => {
    if (hasOverride) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)

    previewApi.getMyCoupons()
      .then(data => {
        setApiCouponsData(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[CouponsPage] 加载优惠券失败:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }, [hasOverride])

  // 重试加载
  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)

    previewApi.getMyCoupons()
      .then(data => {
        setApiCouponsData(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[CouponsPage] 重试加载失败:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }

  // 合并数据：覆盖优先
  const coupons = useMemo<CouponItem[]>(() => {
    if (hasOverride && couponsOverride?.items) {
      // 覆盖数据转换为完整类型（提供默认值）
      return couponsOverride.items.map((coupon) => ({
        id: coupon.id,
        name: coupon.name ?? '优惠券',
        description: coupon.description,
        amount: coupon.amount ?? 0,
        minAmount: coupon.minAmount ?? 0,
        expireAt: coupon.expireAt ?? '2099-12-31',
        status: coupon.status ?? 'available',
      }))
    }
    return apiCouponsData?.items ?? []
  }, [hasOverride, couponsOverride, apiCouponsData])

  // 空态判断
  const isEmpty = !isLoading && !isError && coupons.length === 0

  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const primaryColor = themeSettings.primaryColor

  // 加载中显示骨架屏
  if (isLoading) {
    return (
      <CouponsPageSkeleton
        primaryColor={primaryColor}
        isDarkMode={isDarkMode}
      />
    )
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 页面标题 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          {/* 返回按钮 */}
          <Box
            onClick={onBack}
            style={{
              width: 32 * wxScale,
              height: 32 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="left" size={20 * wxScale} color="#fff" />
          </Box>

          {/* 标题 */}
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            我的优惠券
          </Text>

          {/* 占位 */}
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      {/* 内容区 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
        }}
      >
        {/* 请求失败 - 带重试按钮 */}
        {isError && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 48 * wxScale,
              paddingBottom: 48 * wxScale,
            }}
          >
            <Icon name="close-one" size={48 * wxScale} color="#ef4444" />
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: textMuted,
                marginTop: 12 * wxScale,
              }}
            >
              加载失败，请重试
            </Text>
            <Button
              onClick={handleRetry}
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 24 * wxScale,
                paddingRight: 24 * wxScale,
                paddingTop: isWxEnvironment() ? 8 * wxScale : 6,
                paddingBottom: isWxEnvironment() ? 8 * wxScale : 6,
                borderRadius: 9999,
                backgroundColor: primaryColor,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, color: '#ffffff' }}>
                重新加载
              </Text>
            </Button>
          </Box>
        )}

        {/* 空态 */}
        {isEmpty && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 48 * wxScale,
              paddingBottom: 48 * wxScale,
            }}
          >
            <Icon name="coupon" size={48 * wxScale} color={textMuted} />
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: textMuted,
                marginTop: 12 * wxScale,
              }}
            >
              暂无优惠券
            </Text>
            <Button
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 24 * wxScale,
                paddingRight: 24 * wxScale,
                paddingTop: isWxEnvironment() ? 8 * wxScale : 6,
                paddingBottom: isWxEnvironment() ? 8 * wxScale : 6,
                borderRadius: 9999,
                backgroundColor: primaryColor,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, color: '#ffffff' }}>
                去领取
              </Text>
            </Button>
          </Box>
        )}

        {/* 优惠券列表 */}
        {!isError && coupons.length > 0 && (
          <Box>
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
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

/**
 * 优惠券列表响应
 */
export interface CouponsResponse {
  items: CouponItem[]
  total: number
}
