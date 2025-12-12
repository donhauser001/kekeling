/**
 * 陪诊员收入明细页面（预览器版本）
 *
 * page key: 'workbench-earnings'
 * API: previewApi.getWorkbenchEarnings()
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 */

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Gift, RefreshCw } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi, type EarningsItem } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface EarningsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function EarningsPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onBack,
  onNavigate,
}: EarningsPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // ⚠️ 非 escort 视角时不发请求
  const {
    data: earnings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'workbench', 'earnings'],
    queryFn: () => previewApi.getWorkbenchEarnings(),
    staleTime: 60 * 1000,
    enabled: isEscort,
  })

  // 非 escort 视角：显示提示
  if (!isEscort) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
        }}
      >
        <div
          className="px-4 py-3 flex items-center"
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
            收入明细
          </h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-5xl mb-4">🔒</div>
          <div className={`text-base font-medium text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            需要陪诊员身份
          </div>
          <div className={`text-sm text-center mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            请先登录陪诊员账号后再查看收入明细。
          </div>
        </div>
      </div>
    )
  }

  const items = earnings?.items ?? []
  const isEmpty = !isLoading && items.length === 0

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
          收入明细
        </h1>
      </div>

      {/* 收入概览卡片 */}
      {!isLoading && !isError && earnings && (
        <div className="px-4 py-4">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: themeSettings.primaryColor,
            }}
          >
            <div className="text-white/80 text-sm">可提现余额</div>
            <div className="text-white text-3xl font-bold mt-1">
              ¥{earnings.balance.toFixed(2)}
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <div className="text-white/60 text-xs">累计收入</div>
                <div className="text-white text-sm font-medium">
                  ¥{earnings.totalEarned.toFixed(2)}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-white/60 text-xs">累计提现</div>
                <div className="text-white text-sm font-medium">
                  ¥{earnings.totalWithdrawn.toFixed(2)}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-white/60 text-xs">待结算</div>
                <div className="text-white text-sm font-medium">
                  ¥{earnings.pendingSettlement.toFixed(2)}
                </div>
              </div>
            </div>
            {/* 提现按钮 */}
            <button
              onClick={() => onNavigate?.('workbench-withdraw')}
              className="mt-4 w-full py-2 rounded-full bg-white text-sm font-medium"
              style={{ color: themeSettings.primaryColor }}
            >
              去提现
            </button>
          </div>
        </div>
      )}

      {/* 内容区 */}
      <div className="px-4">
        <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          收支明细
        </div>

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
            <div className="text-5xl mb-3">📊</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无收支记录
            </div>
          </div>
        )}

        {/* 收支列表 */}
        {!isLoading && !isError && items.length > 0 && (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            }}
          >
            {items.map((item, index) => (
              <EarningsItemRow
                key={item.id}
                item={item}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                isLast={index === items.length - 1}
              />
            ))}

            {/* 加载更多 */}
            {earnings?.hasMore && (
              <div className="py-3 text-center">
                <button
                  className="text-sm"
                  style={{ color: themeSettings.primaryColor }}
                >
                  加载更多
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}

// ============================================================================
// 收支项子组件
// ============================================================================

interface EarningsItemRowProps {
  item: EarningsItem
  themeSettings: ThemeSettings
  isDarkMode: boolean
  isLast: boolean
}

function EarningsItemRow({ item, themeSettings, isDarkMode, isLast }: EarningsItemRowProps) {
  const isIncome = item.amount > 0
  const IconComponent = getItemIcon(item.type)

  return (
    <div
      className="flex items-center px-4 py-3"
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${isDarkMode ? '#3a3a3a' : '#f3f4f6'}`,
      }}
    >
      {/* 图标 */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: isIncome
            ? `${themeSettings.primaryColor}20`
            : isDarkMode ? '#3a3a3a' : '#f3f4f6',
        }}
      >
        <IconComponent
          className="w-5 h-5"
          style={{
            color: isIncome ? themeSettings.primaryColor : isDarkMode ? '#9ca3af' : '#6b7280',
          }}
        />
      </div>

      {/* 信息 */}
      <div className="flex-1 ml-3">
        <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {item.title}
        </div>
        <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {item.createdAt}
          {item.orderNo && ` · ${item.orderNo}`}
        </div>
      </div>

      {/* 金额 */}
      <div
        className={`text-sm font-medium ${
          isIncome ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}
      >
        {isIncome ? '+' : ''}{item.amount.toFixed(2)}
      </div>
    </div>
  )
}

// ============================================================================
// 辅助函数
// ============================================================================

function getItemIcon(type: EarningsItem['type']) {
  switch (type) {
    case 'order':
      return TrendingUp
    case 'bonus':
      return Gift
    case 'withdraw':
      return TrendingDown
    case 'refund':
      return RefreshCw
    default:
      return TrendingUp
  }
}

