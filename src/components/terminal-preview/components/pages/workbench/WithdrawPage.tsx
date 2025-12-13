/**
 * 陪诊员提现页面（预览器版本）
 *
 * page key: 'workbench-withdraw'
 * API: previewApi.getWorkbenchWithdrawInfo()
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi, type WithdrawInfo } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { formatMoney, formatPercent, safeNumber, getSecondaryTextClass, getTertiaryTextClass } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface WithdrawPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function WithdrawPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onBack,
  onLogin,
}: WithdrawPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 提现金额输入
  const [amount, setAmount] = useState('')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  // ⚠️ 非 escort 视角时不发请求
  const {
    data: withdrawInfo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'workbench', 'withdraw-info'],
    queryFn: () => previewApi.getWorkbenchWithdrawInfo(),
    staleTime: 60 * 1000,
    enabled: isEscort,
  })

  // 非 escort 视角：显示统一的 PermissionPrompt
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
            提现
          </h1>
        </div>

        {/* 权限提示 */}
        <div className="flex-1">
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号进行提现操作"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    )
  }

  const bankCards = withdrawInfo?.bankCards ?? []
  const hasNoBankCard = !isLoading && bankCards.length === 0

  // 自动选择默认银行卡
  if (withdrawInfo && !selectedCardId && bankCards.length > 0) {
    const defaultCard = bankCards.find((c) => c.isDefault) || bankCards[0]
    setSelectedCardId(defaultCard.id)
  }

  // 计算实际到账金额
  const inputAmount = parseFloat(amount) || 0
  const feeRate = withdrawInfo?.feeRate ?? 0
  const fee = inputAmount * feeRate
  const actualAmount = inputAmount - fee

  // 是否可提现
  const canWithdraw =
    inputAmount >= (withdrawInfo?.minWithdrawAmount ?? 0) &&
    inputAmount <= (withdrawInfo?.withdrawable ?? 0) &&
    selectedCardId !== null

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
          提现
        </h1>
      </div>

      {/* 内容区 */}
      <div className="px-4 py-4">
        {/* 加载中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>加载中...</div>
          </div>
        )}

        {/* 请求失败 */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-2">😔</div>
            <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>加载失败，请稍后重试</div>
          </div>
        )}

        {/* 提现表单 */}
        {!isLoading && !isError && withdrawInfo && (
          <>
            {/* 可提现金额 */}
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
              }}
            >
              <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
                可提现金额
              </div>
              <div
                className="text-3xl font-bold mt-1"
                style={{ color: themeSettings.primaryColor }}
              >
                ¥{formatMoney(withdrawInfo.withdrawable)}
              </div>
            </div>

            {/* 提现金额输入 */}
            <div
              className="rounded-xl p-4 mt-4"
              style={{
                backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
              }}
            >
              <div className={`text-sm mb-3 ${getSecondaryTextClass(isDarkMode)}`}>
                提现金额
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>¥</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`flex-1 text-3xl font-bold bg-transparent outline-none ${isDarkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-300'
                    }`}
                />
              </div>
              <button
                onClick={() => setAmount(withdrawInfo.withdrawable.toString())}
                className="mt-2 text-sm"
                style={{ color: themeSettings.primaryColor }}
              >
                全部提现
              </button>
            </div>

            {/* 提现规则 */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" style={{ color: themeSettings.primaryColor }} />
                <span className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
                  最低提现金额：¥{withdrawInfo.minWithdrawAmount}
                </span>
              </div>
              {safeNumber(withdrawInfo.feeRate) > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" style={{ color: themeSettings.primaryColor }} />
                  <span className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
                    手续费：{formatPercent(withdrawInfo.feeRate, 1)}%
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" style={{ color: themeSettings.primaryColor }} />
                <span className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
                  预计 {withdrawInfo.estimatedHours} 小时内到账
                </span>
              </div>
            </div>

            {/* 银行卡选择 */}
            <div
              className="rounded-xl p-4 mt-4"
              style={{
                backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
              }}
            >
              <div className={`text-sm mb-3 ${getSecondaryTextClass(isDarkMode)}`}>
                提现至
              </div>

              {hasNoBankCard ? (
                <div className="text-center py-4">
                  <div className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
                    暂无绑定银行卡
                  </div>
                  <button
                    className="mt-2 text-sm"
                    style={{ color: themeSettings.primaryColor }}
                  >
                    + 添加银行卡
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {bankCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedCardId === card.id
                        ? 'ring-2'
                        : ''
                        }`}
                      style={{
                        backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f7fa',
                        ringColor: selectedCardId === card.id ? themeSettings.primaryColor : 'transparent',
                      }}
                    >
                      <CreditCard
                        className="w-6 h-6"
                        style={{ color: themeSettings.primaryColor }}
                      />
                      <div className="flex-1">
                        <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {card.bankName}
                        </div>
                        <div className={`text-xs ${getSecondaryTextClass(isDarkMode)}`}>
                          尾号 {card.cardNo}
                        </div>
                      </div>
                      {selectedCardId === card.id && (
                        <CheckCircle
                          className="w-5 h-5"
                          style={{ color: themeSettings.primaryColor }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 到账金额预览 */}
            {inputAmount > 0 && (
              <div className="mt-4 text-center">
                <span className={`text-sm ${getSecondaryTextClass(isDarkMode)}`}>
                  实际到账：
                </span>
                <span
                  className="text-lg font-bold ml-1"
                  style={{ color: themeSettings.primaryColor }}
                >
                  ¥{formatMoney(actualAmount)}
                </span>
                {fee > 0 && (
                  <span className={`text-xs ml-2 ${getTertiaryTextClass(isDarkMode)}`}>
                    (手续费 ¥{formatMoney(fee)})
                  </span>
                )}
              </div>
            )}

            {/* 提现按钮 */}
            <button
              disabled={!canWithdraw}
              onClick={() => {
                // TODO: 提现逻辑
                console.log('[WithdrawPage] 提现:', { amount: inputAmount, cardId: selectedCardId })
              }}
              className="mt-6 w-full py-3 rounded-full text-white font-medium disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              确认提现
            </button>
          </>
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}

