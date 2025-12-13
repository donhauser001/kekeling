/**
 * 我的优惠券页面（预览器版本）
 *
 * Step 5: 路由扩展样板 - 跑通最小闭环
 * - page key: 'coupons'
 * - API: previewApi.getMyCoupons()
 * - 数据通道: userRequest
 *
 * 支持 marketingData.coupons 覆盖：
 * - 优先使用覆盖数据（即时预览）
 * - 覆盖数据不存在时，调用 previewApi
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings, CouponItemOverride } from '../../../types'
import { previewApi } from '../../../api'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { getRefreshingClass } from '../../PageTransition'
import { getSecondaryTextClass, getTertiaryTextClass } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface CouponsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
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

// ============================================================================
// 组件实现
// ============================================================================

export function CouponsPage({ themeSettings, isDarkMode, couponsOverride }: CouponsPageProps) {
  // 是否使用覆盖数据
  const hasOverride = couponsOverride !== undefined

  // 获取优惠券数据（仅在无覆盖时调用 API）
  const {
    data: apiCouponsData,
    isLoading: apiLoading,
    isError: apiError,
    isFetching: apiFetching,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'coupons', 'my'],
    queryFn: previewApi.getMyCoupons,
    staleTime: 60 * 1000,
    enabled: !hasOverride, // 有覆盖数据时不请求 API
  })

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

  // 状态计算
  const isLoading = !hasOverride && apiLoading
  const isError = !hasOverride && apiError
  const isFetching = !hasOverride && apiFetching
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
        className="sticky top-0 z-10 px-4 py-3"
        style={{
          backgroundColor: themeSettings.primaryColor,
        }}
      >
        <h1 className="text-lg font-semibold text-white text-center">
          我的优惠券
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
              暂无优惠券
            </div>
            <button
              className="mt-4 px-6 py-2 rounded-full text-white text-sm"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              去领取
            </button>
          </div>
        )}

        {/* 优惠券列表 - Step 14.10-C: 刷新过渡效果 */}
        {!isLoading && !isError && coupons.length > 0 && (
          <div className={`space-y-3 ${getRefreshingClass(isFetching, true)}`}>
            {coupons.map((coupon) => (
              <CouponCard
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

  return (
    <div
      className={`relative rounded-lg overflow-hidden ${isDisabled ? 'opacity-60' : ''
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
            backgroundColor: isDisabled
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
          <div className={`text-xs mt-2 ${getTertiaryTextClass(isDarkMode)}`}>
            有效期至 {coupon.expireAt}
          </div>
        </div>

        {/* 状态标签 */}
        {isDisabled && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded">
              {isUsed ? '已使用' : '已过期'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// 类型导出（与 API 类型保持一致）
// ============================================================================

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

/**
 * 优惠券列表响应
 */
export interface CouponsResponse {
  items: CouponItem[]
  total: number
}

