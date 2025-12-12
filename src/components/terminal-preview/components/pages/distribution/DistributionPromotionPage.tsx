/**
 * 晋升进度页面（预览器版本）
 *
 * Step 11.5: distribution-promotion
 * - page key: 'distribution-promotion'
 * - API: previewApi.getDistributionPromotion()
 * - 数据通道: escortRequest（⚠️ 需要 escortToken）
 * - 展示字段：currentLevel, nextLevel, requirements, benefits, commissionRate
 * - ⚠️ 进度条必须正确处理：
 *   - promotionProgress = 0：显示 0% 进度条
 *   - promotionProgress = undefined：不显示进度条或显示"不适用"
 */

import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, RefreshCw, Award, TrendingUp, CheckCircle, Target, Crown } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole, DistributionRequirement } from '../../../types'
import { previewApi } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'

// ============================================================================
// 类型定义
// ============================================================================

export interface DistributionPromotionPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLoginClick?: () => void
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取条件类型的中文名称
 */
function getRequirementTypeName(type: DistributionRequirement['type']): string {
  const names: Record<DistributionRequirement['type'], string> = {
    team_size: '团队人数',
    total_orders: '累计订单',
    monthly_orders: '本月订单',
  }
  return names[type] || type
}

/**
 * 计算条件完成进度（0-100）
 * ⚠️ 正确处理 current = 0 的情况
 */
function calculateProgress(current: number, required: number): number {
  if (required <= 0) return 100
  // current 为 0 时返回 0，不返回 undefined
  return Math.min(Math.round((current / required) * 100), 100)
}

// ============================================================================
// 组件实现
// ============================================================================

export function DistributionPromotionPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLoginClick,
}: DistributionPromotionPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // ⚠️ 非 escort 视角时不发请求
  const {
    data: promotionData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'distribution', 'promotion'],
    queryFn: () => previewApi.getDistributionPromotion(),
    staleTime: 60 * 1000,
    enabled: isEscort,
  })

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
      >
        {/* 标题栏 */}
        <div
          className="sticky top-0 z-10 px-4 py-3 flex items-center"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          <button
            onClick={() => onNavigate?.('distribution')}
            className="w-8 h-8 flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-lg font-semibold text-white text-center pr-8">
            晋升进度
          </h1>
        </div>

        {/* 权限提示 */}
        <PermissionPrompt
          title="需要陪诊员身份"
          description="请先登录陪诊员账号查看晋升信息"
          onLogin={onLoginClick}
          showDebugInject={process.env.NODE_ENV === 'development'}
          primaryColor={themeSettings.primaryColor}
          isDarkMode={isDarkMode}
        />
      </div>
    )
  }

  // 加载状态
  if (isLoading) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
      >
        {/* 标题栏 */}
        <div
          className="sticky top-0 z-10 px-4 py-3 flex items-center"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          <button
            onClick={() => onNavigate?.('distribution')}
            className="w-8 h-8 flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-lg font-semibold text-white text-center pr-8">
            晋升进度
          </h1>
        </div>

        {/* 骨架屏 */}
        <div className="flex-1 p-4 space-y-4">
          {/* 当前等级卡片骨架 */}
          <div
            className="rounded-xl p-4 animate-pulse"
            style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
          >
            <div className="h-6 w-24 rounded bg-gray-300 dark:bg-gray-600 mb-3" />
            <div className="h-8 w-32 rounded bg-gray-300 dark:bg-gray-600 mb-2" />
            <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
          {/* 晋升条件骨架 */}
          <div
            className="rounded-xl p-4 animate-pulse"
            style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
          >
            <div className="h-6 w-28 rounded bg-gray-300 dark:bg-gray-600 mb-4" />
            <div className="space-y-3">
              <div className="h-12 rounded bg-gray-300 dark:bg-gray-600" />
              <div className="h-12 rounded bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 错误状态：提示 + 重试按钮
  if (isError || !promotionData) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
      >
        {/* 标题栏 */}
        <div
          className="sticky top-0 z-10 px-4 py-3 flex items-center"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          <button
            onClick={() => onNavigate?.('distribution')}
            className="w-8 h-8 flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-lg font-semibold text-white text-center pr-8">
            晋升进度
          </h1>
        </div>

        {/* 错误提示 */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className={`text-4xl mb-4 ${isDarkMode ? 'opacity-50' : 'opacity-30'}`}>
            😞
          </div>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            加载失败，请稍后重试
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: themeSettings.primaryColor }}
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>
        </div>
      </div>
    )
  }

  const { currentLevel, nextLevel } = promotionData
  const isMaxLevel = !nextLevel

  return (
    <div
      className="min-h-full flex flex-col"
      style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
    >
      {/* 标题栏 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center"
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <button
          onClick={() => onNavigate?.('distribution')}
          className="w-8 h-8 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-white text-center pr-8">
          晋升进度
        </h1>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4 space-y-4">
        {/* 当前等级卡片 */}
        <div
          className="rounded-xl p-4 shadow-sm"
          style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Award
              className="w-5 h-5"
              style={{ color: themeSettings.primaryColor }}
            />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              当前等级
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${themeSettings.primaryColor}15` }}
            >
              <Crown
                className="w-6 h-6"
                style={{ color: themeSettings.primaryColor }}
              />
            </div>
            <div>
              <div
                className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {currentLevel.name}
              </div>
              <div
                className="text-sm"
                style={{ color: themeSettings.primaryColor }}
              >
                佣金比例 {(currentLevel.commissionRate * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* 当前等级权益 */}
          <div className="space-y-2">
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              当前权益
            </div>
            <div className="flex flex-wrap gap-2">
              {currentLevel.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                  }}
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 已达最高级提示 */}
        {isMaxLevel && (
          <div
            className="rounded-xl p-6 text-center shadow-sm"
            style={{
              backgroundColor: `${themeSettings.primaryColor}10`,
              borderColor: themeSettings.primaryColor,
              borderWidth: 1,
            }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${themeSettings.primaryColor}20` }}
            >
              <Crown
                className="w-8 h-8"
                style={{ color: themeSettings.primaryColor }}
              />
            </div>
            <div
              className="text-lg font-semibold mb-2"
              style={{ color: themeSettings.primaryColor }}
            >
              🎉 恭喜！已达最高等级
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              您已经是{currentLevel.name}，继续保持优秀表现！
            </p>
          </div>
        )}

        {/* 下一等级信息（非最高级时显示） */}
        {nextLevel && (
          <>
            {/* 下一等级卡片 */}
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: themeSettings.primaryColor }}
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  下一等级
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                    borderColor: themeSettings.primaryColor,
                    borderWidth: 2,
                    borderStyle: 'dashed',
                  }}
                >
                  <Crown
                    className="w-6 h-6"
                    style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}
                  />
                </div>
                <div>
                  <div
                    className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {nextLevel.name}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    佣金比例 {(nextLevel.commissionRate * 100).toFixed(0)}%
                    <span className="ml-1 text-xs" style={{ color: themeSettings.primaryColor }}>
                      (+{((nextLevel.commissionRate - currentLevel.commissionRate) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* 下一等级权益 */}
              <div className="space-y-2">
                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  升级后权益
                </div>
                <div className="flex flex-wrap gap-2">
                  {nextLevel.benefits.map((benefit, index) => {
                    const isNew = !currentLevel.benefits.includes(benefit)
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: isNew
                            ? `${themeSettings.primaryColor}15`
                            : isDarkMode
                              ? '#3a3a3a'
                              : '#f3f4f6',
                          color: isNew
                            ? themeSettings.primaryColor
                            : isDarkMode
                              ? '#9ca3af'
                              : '#6b7280',
                        }}
                      >
                        {isNew && '✨ '}{benefit}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 晋升条件 */}
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target
                  className="w-5 h-5"
                  style={{ color: themeSettings.primaryColor }}
                />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  晋升条件
                </span>
              </div>

              <div className="space-y-4">
                {nextLevel.requirements.map((req, index) => {
                  // ⚠️ 正确处理 current = 0 的情况
                  const progress = calculateProgress(req.current, req.required)
                  const isCompleted = req.current >= req.required

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle
                              className="w-4 h-4"
                              style={{ color: '#10b981' }}
                            />
                          ) : (
                            <div
                              className="w-4 h-4 rounded-full border-2"
                              style={{
                                borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                              }}
                            />
                          )}
                          <span
                            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {getRequirementTypeName(req.type)}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isCompleted
                              ? 'text-green-500'
                              : isDarkMode
                                ? 'text-gray-400'
                                : 'text-gray-500'
                          }`}
                        >
                          {req.current} / {req.required}
                        </span>
                      </div>

                      {/* 进度条
                        * ⚠️ 进度为 0 时仍然显示进度条（只是宽度为 0）
                        * 这是为了正确处理 promotionProgress = 0 的场景
                        */}
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: isCompleted
                              ? '#10b981'
                              : themeSettings.primaryColor,
                          }}
                        />
                      </div>

                      {/* 进度百分比提示 */}
                      <div
                        className={`text-xs text-right ${
                          isCompleted
                            ? 'text-green-500'
                            : isDarkMode
                              ? 'text-gray-500'
                              : 'text-gray-400'
                        }`}
                      >
                        {isCompleted ? '已完成' : `${progress}%`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* 底部提示 */}
        <div className={`text-xs text-center py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {isMaxLevel
            ? '感谢您的支持与信任'
            : '完成所有条件后将自动晋升'}
        </div>
      </div>
    </div>
  )
}
