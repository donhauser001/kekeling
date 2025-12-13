/**
 * 可领取优惠券页面（预览器版本）
 *
 * Step 9 批次 D: coupons-available
 * - page key: 'coupons-available'
 * - API: previewApi.getAvailableCoupons()
 * - 数据通道: userRequest
 *
 * 支持 marketingData.availableCoupons 覆盖：
 * - 优先使用覆盖数据（即时预览）
 * - 覆盖数据不存在时，调用 previewApi
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings, AvailableCouponOverride } from '../../../types'
import { previewApi, type AvailableCoupon } from '../../../api'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { getSecondaryTextClass, getTertiaryTextClass } from '../../../utils'

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
// 组件实现
// ============================================================================

export function CouponsAvailablePage({ themeSettings, isDarkMode, onBack, availableCouponsOverride }: CouponsAvailablePageProps) {
  // 是否使用覆盖数据
  const hasOverride = availableCouponsOverride !== undefined

  // 获取可领取优惠券（仅在无覆盖时调用 API）
  const {
    data: apiCoupons,
    isLoading: apiLoading,
    isError: apiError,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'coupons', 'available'],
    queryFn: previewApi.getAvailableCoupons,
    staleTime: 60 * 1000,
    enabled: !hasOverride, // 有覆盖数据时不请求 API
  })

  // 合并数据：覆盖优先
  const coupons = useMemo<AvailableCoupon[]>(() => {
    if (hasOverride && availableCouponsOverride) {
      // 覆盖数据转换为完整类型（提供默认值）
      return availableCouponsOverride.map((coupon) => ({
        id: coupon.id,
        name: coupon.name ?? '优惠券',
        description: coupon.description,
        amount: coupon.amount ?? 0,
        minAmount: coupon.minAmount ?? 0,
        remaining: coupon.remaining ?? 0,
      }))
    }
    return apiCoupons ?? []
  }, [hasOverride, availableCouponsOverride, apiCoupons])

  // 状态计算
  const isLoading = !hasOverride && apiLoading
  const isError = !hasOverride && apiError
  const isEmpty = !isLoading && coupons.length === 0

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
          领取优惠券
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

        {/* 空态 */}
        {isEmpty && !isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-5xl mb-3">🎫</div>
            <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
              暂无可领取的优惠券
            </div>
            <div className={`text-xs mt-1 ${getTertiaryTextClass(isDarkMode)}`}>
              敬请期待更多优惠活动
            </div>
          </div>
        )}

        {/* 优惠券列表 */}
        {!isLoading && !isError && coupons && coupons.length > 0 && (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <AvailableCouponCard
                key={coupon.id}
                coupon={coupon}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
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
// 可领取优惠券卡片子组件
// ============================================================================

interface AvailableCouponCardProps {
  coupon: AvailableCoupon
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function AvailableCouponCard({ coupon, themeSettings, isDarkMode }: AvailableCouponCardProps) {
  const isLimitReached = coupon.remaining === 0

  return (
    <div
      className={`relative rounded-lg overflow-hidden ${isLimitReached ? 'opacity-60' : ''
        }`}
      style={{
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
    >
      <div className="flex">
        {/* 左侧金额区 */}
        <div
          className="flex flex-col items-center justify-center w-24 py-4"
          style={{
            backgroundColor: isLimitReached
              ? '#9ca3af'
              : themeSettings.primaryColor,
          }}
        >
          <div className="flex items-baseline text-white">
            <span className="text-sm">¥</span>
            <span className="text-2xl font-bold">{coupon.amount}</span>
          </div>
          <div className="text-white/80 text-xs mt-1">
            满{coupon.minAmount}可用
          </div>
        </div>

        {/* 右侧信息区 */}
        <div className="flex-1 p-3">
          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {coupon.name}
          </div>
          <div className={`text-xs mt-1 ${getSecondaryTextClass(isDarkMode)}`}>
            {coupon.description || '全场通用'}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${getTertiaryTextClass(isDarkMode)}`}>
              剩余 {coupon.remaining} 张
            </span>
            <button
              disabled={isLimitReached}
              className="px-4 py-1 rounded-full text-xs text-white disabled:opacity-50"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              {isLimitReached ? '已领完' : '立即领取'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

