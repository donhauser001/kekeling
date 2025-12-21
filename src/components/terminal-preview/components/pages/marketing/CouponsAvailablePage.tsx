/**
 * 可领取优惠券页面
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon, Button
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState + useEffect 获取数据
 */

import { useState, useEffect, useMemo } from 'react'
import { Box, Text, Icon, Button } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings, AvailableCouponOverride } from '../../../types'
import { previewApi } from '../../../api'
import type { AvailableCoupon } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface CouponsAvailablePageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  /**
   * 可领取优惠券列表覆盖
   * - undefined: 不覆盖，使用 API 数据
   * - array: 覆盖数据
   */
  availableCouponsOverride?: AvailableCouponOverride[]
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 主组件
// ============================================================================

export function CouponsAvailablePage({
  themeSettings,
  isDarkMode,
  onBack,
  availableCouponsOverride,
}: CouponsAvailablePageProps) {
  const [apiCoupons, setApiCoupons] = useState<AvailableCoupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 是否使用覆盖数据
  const hasOverride = availableCouponsOverride !== undefined

  // 获取可领取优惠券（仅在无覆盖时调用 API）
  const fetchCoupons = () => {
    if (hasOverride) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setIsError(false)
    previewApi
      .getAvailableCoupons()
      .then((data) => setApiCoupons(data ?? []))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchCoupons()
  }, [hasOverride])

  // 合并数据：覆盖优先
  const coupons = useMemo<AvailableCoupon[]>(() => {
    if (hasOverride && availableCouponsOverride) {
      return availableCouponsOverride.map((coupon) => ({
        id: coupon.id,
        name: coupon.name ?? '优惠券',
        description: coupon.description,
        amount: coupon.amount ?? 0,
        minAmount: coupon.minAmount ?? 0,
        remaining: coupon.remaining ?? 0,
        canClaim: coupon.canClaim ?? true,
        claimedCount: coupon.claimedCount ?? 0,
        perUserLimit: coupon.perUserLimit ?? 1,
      }))
    }
    return apiCoupons
  }, [hasOverride, availableCouponsOverride, apiCoupons])

  const isEmpty = !isLoading && coupons.length === 0

  // 领取优惠券
  const handleClaimCoupon = async (couponId: string) => {
    const result = await previewApi.claimCoupon(couponId)
    if (!result.success) {
      // 小程序环境使用 wx.showToast
      if (isWxEnvironment() && typeof wx !== 'undefined') {
        wx.showToast({ title: result.message || '领取失败', icon: 'none' })
      } else {
        alert(result.message || '领取失败')
      }
      throw new Error(result.message)
    }
    // 领取成功提示
    if (isWxEnvironment() && typeof wx !== 'undefined') {
      wx.showToast({ title: '领取成功', icon: 'success' })
    }
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
            领取优惠券
          </Text>
        </Box>
      </Box>

      {/* ========== 内容区 ========== */}
      <Box style={{ flex: 1, padding: 12 * wxScale }}>
        {/* 加载状态 - 骨架屏 */}
        {isLoading && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                style={{
                  display: 'flex',
                  borderRadius: 8 * wxScale,
                  backgroundColor: cardBg,
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    width: 96 * wxScale,
                    height: 80 * wxScale,
                    backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                  }}
                />
                <Box style={{ flex: 1, padding: 12 * wxScale }}>
                  <Box
                    style={{
                      height: 16 * wxScale,
                      width: 80 * wxScale,
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
              onClick={fetchCoupons}
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
            <Icon name="coupon" size={48 * wxScale} color={textSecondary} />
            <Text style={{ marginTop: 12 * wxScale, fontSize: 14 * wxScale, color: textSecondary }}>
              暂无可领取的优惠券
            </Text>
            <Text style={{ marginTop: 4 * wxScale, fontSize: 12 * wxScale, color: textSecondary }}>
              敬请期待更多优惠活动
            </Text>
          </Box>
        )}

        {/* 优惠券列表 */}
        {!isLoading && !isError && coupons.length > 0 && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            {coupons.map((coupon) => (
              <AvailableCouponCard
                key={coupon.id}
                coupon={coupon}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                onClaim={handleClaimCoupon}
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
// 可领取优惠券卡片子组件
// ============================================================================

interface AvailableCouponCardProps {
  coupon: AvailableCoupon
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onClaim: (couponId: string) => Promise<void>
}

function AvailableCouponCard({ coupon, themeSettings, isDarkMode, onClaim }: AvailableCouponCardProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const [justClaimed, setJustClaimed] = useState(false) // 本次会话刚领取的

  const primaryColor = themeSettings.primaryColor
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 判断状态
  const isSoldOut = coupon.remaining === 0  // 总量已领完
  const isUserLimitReached = !coupon.canClaim && coupon.claimedCount >= coupon.perUserLimit  // 用户达到限领上限
  const isAlreadyClaimed = isUserLimitReached || justClaimed  // 已领取（包括本次会话领取的）
  const cannotClaim = isSoldOut || isAlreadyClaimed || isClaiming

  const handleClaim = async () => {
    if (cannotClaim) return
    setIsClaiming(true)
    try {
      await onClaim(coupon.id)
      setJustClaimed(true)
    } finally {
      setIsClaiming(false)
    }
  }

  // 获取按钮文案
  const getButtonText = () => {
    if (justClaimed) return '已领取'
    if (isClaiming) return '领取中...'
    if (isSoldOut) return '已领完'
    if (isUserLimitReached) return '已领取'
    return '立即领取'
  }

  // 获取按钮背景色
  const getButtonBgColor = () => {
    if (justClaimed || isAlreadyClaimed) return '#10b981' // 绿色表示已领取
    return primaryColor
  }

  return (
    <Box
      style={{
        display: 'flex',
        borderRadius: 8 * wxScale,
        backgroundColor: cardBg,
        overflow: 'hidden',
        opacity: isSoldOut ? 0.6 : 1,
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
          backgroundColor: isSoldOut ? '#9ca3af' : (isAlreadyClaimed ? '#10b981' : primaryColor),
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>¥</Text>
          <Text style={{ fontSize: 24 * wxScale, fontWeight: 700, color: '#fff' }}>
            {coupon.amount}
          </Text>
        </Box>
        <Text style={{ marginTop: 4 * wxScale, fontSize: 12 * wxScale, color: 'rgba(255,255,255,0.8)' }}>
          满{coupon.minAmount}可用
        </Text>
      </Box>

      {/* 右侧信息区 */}
      <Box style={{ flex: 1, padding: 12 * wxScale }}>
        <Text style={{ fontSize: 15 * wxScale, fontWeight: 500, color: textPrimary }}>
          {coupon.name}
        </Text>
        <Text
          style={{
            display: 'block',
            marginTop: 4 * wxScale,
            fontSize: 12 * wxScale,
            color: textSecondary,
          }}
        >
          {coupon.description || '全场通用'}
        </Text>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8 * wxScale,
          }}
        >
          <Box>
            <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
              {isAlreadyClaimed 
                ? `已领 ${coupon.claimedCount}/${coupon.perUserLimit} 张`
                : `剩余 ${coupon.remaining} 张`
              }
            </Text>
            {coupon.perUserLimit > 1 && !isAlreadyClaimed && (
              <Text style={{ fontSize: 10 * wxScale, color: textSecondary, marginTop: 2 * wxScale }}>
                每人限领 {coupon.perUserLimit} 张
              </Text>
            )}
          </Box>
          <Button
            disabled={cannotClaim}
            onClick={handleClaim}
            style={{
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 4 * wxScale,
              paddingBottom: 4 * wxScale,
              borderRadius: 9999,
              backgroundColor: getButtonBgColor(),
              opacity: isClaiming || isSoldOut ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 12 * wxScale, color: '#fff' }}>
              {getButtonText()}
            </Text>
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
