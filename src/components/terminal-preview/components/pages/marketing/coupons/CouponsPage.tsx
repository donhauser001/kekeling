/**
 * 我的优惠券页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/功能模块改造指南/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Button/Icon
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: emoji → Icon 组件
 * - 规则 4.1: 添加骨架屏
 * - 规则 12: 已拆分为模块化结构
 */

import { useState, useEffect, useMemo } from 'react'
import { Box, Text, Button, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { previewApi } from '../../../../api'
import { wxScale, wxSafeAreaTop } from './constants'
import type { CouponsPageProps, CouponItem } from './types'
import { CouponsPageSkeleton, CouponCard } from './components'

// ============================================================================
// 主组件
// ============================================================================

export function CouponsPage({
  themeSettings,
  isDarkMode,
  onBack,
  onNavigate,
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
      .then((data) => {
        setApiCouponsData(data)
        setIsLoading(false)
      })
      .catch((err) => {
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
      .then((data) => {
        setApiCouponsData(data)
        setIsLoading(false)
      })
      .catch((err) => {
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
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
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

          {/* 占位（避免胶囊遮挡） */}
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      {/* 领券中心入口卡片 */}
      <Box
        onClick={() => onNavigate?.('coupons-available')}
        style={{
          marginLeft: 16 * wxScale,
          marginRight: 16 * wxScale,
          marginTop: 16 * wxScale,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderRadius: 12 * wxScale,
          backgroundColor: `${primaryColor}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
          <Icon name="coupon" size={20 * wxScale} color={primaryColor} />
          <Text style={{ fontSize: 14 * wxScale, color: textPrimary, fontWeight: 500 }}>
            领券中心
          </Text>
          <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>
            更多优惠等你领
          </Text>
        </Box>
        <Icon name="right" size={16 * wxScale} color={textMuted} />
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
              onClick={() => onNavigate?.('coupons-available')}
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

