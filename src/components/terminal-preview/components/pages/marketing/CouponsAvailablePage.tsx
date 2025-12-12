/**
 * 可领取优惠券页面（预览器版本）
 *
 * Step 9 批次 D: coupons-available
 * - page key: 'coupons-available'
 * - API: previewApi.getAvailableCoupons()
 * - 数据通道: userRequest
 */

import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings } from '../../../types'
import { previewApi, type AvailableCoupon } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface CouponsAvailablePageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function CouponsAvailablePage({ themeSettings, isDarkMode, onBack }: CouponsAvailablePageProps) {
  // 获取可领取优惠券
  const {
    data: coupons,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'coupons', 'available'],
    queryFn: previewApi.getAvailableCoupons,
    staleTime: 60 * 1000,
  })

  const isEmpty = !isLoading && (!coupons || coupons.length === 0)

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
            <div className="text-5xl mb-3">🎫</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无可领取的优惠券
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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
      className={`relative rounded-lg overflow-hidden ${
        isLimitReached ? 'opacity-60' : ''
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
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {coupon.description || '全场通用'}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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

