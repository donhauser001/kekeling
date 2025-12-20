/**
 * 会员套餐页面（预览器版本）
 *
 * Step 6 批次 A: membership-plans
 * - page key: 'membership-plans'
 * - API: previewApi.getMembershipPlans()
 * - 数据通道: userRequest
 *
 * 支持 marketingData.membershipPlans 覆盖：
 * - 优先使用覆盖数据（即时预览）
 * - 覆盖数据不存在时，调用 previewApi
 */

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings, MembershipPlanOverride } from '../../../types'
import { previewApi } from '../../../api'
import type { MembershipPlan } from '../../../api'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { getSecondaryTextClass, getTertiaryTextClass } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface MembershipPlansPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  /**
   * 会员套餐列表覆盖
   * - undefined: 不覆盖，使用 API 数据
   * - array: 覆盖数据
   */
  plansOverride?: MembershipPlanOverride[]
}

// ============================================================================
// 组件实现
// ============================================================================

export function MembershipPlansPage({ themeSettings, isDarkMode, onBack, plansOverride }: MembershipPlansPageProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  // 是否使用覆盖数据
  const hasOverride = plansOverride !== undefined

  // 获取会员套餐列表（仅在无覆盖时调用 API）
  const {
    data: apiPlans,
    isLoading: apiLoading,
    isError: apiError,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'membership', 'plans'],
    queryFn: previewApi.getMembershipPlans,
    staleTime: 60 * 1000,
    enabled: !hasOverride, // 有覆盖数据时不请求 API
  })

  // 合并数据：覆盖优先
  const plans = useMemo<MembershipPlan[]>(() => {
    if (hasOverride && plansOverride) {
      // 覆盖数据转换为完整类型（提供默认值）
      return plansOverride.map((plan) => ({
        id: plan.id,
        name: plan.name ?? '套餐',
        description: plan.description ?? '',
        price: plan.price ?? 0,
        originalPrice: plan.originalPrice,
        durationDays: plan.durationDays ?? 30,
        isRecommended: plan.isRecommended,
      }))
    }
    return apiPlans ?? []
  }, [hasOverride, plansOverride, apiPlans])

  // 状态计算
  const isLoading = !hasOverride && apiLoading
  const isError = !hasOverride && apiError
  const isEmpty = !isLoading && plans.length === 0

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
          开通会员
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
            <div className="text-5xl mb-3">📋</div>
            <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
              暂无可用套餐
            </div>
          </div>
        )}

        {/* 套餐列表 */}
        {!isLoading && !isError && plans && plans.length > 0 && (
          <div className="space-y-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlanId === plan.id}
                onSelect={() => setSelectedPlanId(plan.id)}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      {!isLoading && !isError && plans && plans.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4"
          style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
            borderTop: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
          }}
        >
          <button
            disabled={!selectedPlanId}
            className="w-full py-3 rounded-full text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            {selectedPlanId ? '立即开通' : '请选择套餐'}
          </button>
        </div>
      )}

      {/* 底部留白（给操作栏腾出空间） */}
      <div className="h-24" />
    </div>
  )
}

// ============================================================================
// 套餐卡片子组件
// ============================================================================

interface PlanCardProps {
  plan: MembershipPlan
  isSelected: boolean
  onSelect: () => void
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function PlanCard({ plan, isSelected, onSelect, themeSettings, isDarkMode }: PlanCardProps) {
  const hasDiscount = plan.originalPrice && plan.originalPrice > plan.price

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-xl p-4 cursor-pointer transition-all ${isSelected ? 'ring-2' : ''
        }`}
      style={{
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        borderColor: isSelected ? themeSettings.primaryColor : 'transparent',
        borderWidth: isSelected ? 2 : 0,
        borderStyle: 'solid',
      }}
    >
      {/* 推荐标签 */}
      {plan.isRecommended && (
        <div
          className="absolute -top-2 right-4 px-2 py-0.5 rounded text-xs text-white"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          推荐
        </div>
      )}

      {/* 套餐信息 */}
      <div className="flex items-center justify-between">
        <div>
          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {plan.name}
          </div>
          <div className={`text-xs mt-1 ${getSecondaryTextClass(isDarkMode)}`}>
            {plan.description}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-sm" style={{ color: themeSettings.primaryColor }}>¥</span>
            <span className="text-2xl font-bold" style={{ color: themeSettings.primaryColor }}>
              {plan.price}
            </span>
          </div>
          {hasDiscount && (
            <div className={`text-xs line-through ${getTertiaryTextClass(isDarkMode)}`}>
              ¥{plan.originalPrice}
            </div>
          )}
        </div>
      </div>

      {/* 选中指示器 */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? '' : 'border-gray-300'
          }`}
        style={{
          borderColor: isSelected ? themeSettings.primaryColor : undefined,
          backgroundColor: isSelected ? themeSettings.primaryColor : 'transparent',
        }}
      >
        {isSelected && <span className="text-white text-xs">✓</span>}
      </div>

      {/* 左侧留白给选中指示器 */}
      <div className="pl-8" />
    </div>
  )
}

