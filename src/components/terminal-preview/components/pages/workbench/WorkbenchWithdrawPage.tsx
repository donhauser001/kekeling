/**
 * 陪诊员提现页面（预览器版本）
 *
 * page key: 'workbench-withdraw'
 * API: previewApi.getWithdrawStats()
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * 功能：
 * - 可提现余额展示
 * - 提现账户信息（银行卡/支付宝）
 * - 提现表单（金额输入、提交按钮、禁用状态）
 * - 最近提现记录列表（5 条）
 *
 * 降级策略：
 * - 有 escortToken 时走真实请求
 * - 无 token 或请求失败时自动降级到 mock 数据
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowDownRight,
  Smartphone,
  Building2,
  type LucideIcon,
} from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi, type WithdrawStats, type WithdrawAccount, type WithdrawRecord } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface WorkbenchWithdrawPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function WorkbenchWithdrawPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onBack,
}: WorkbenchWithdrawPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 提现金额输入
  const [amount, setAmount] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')

  // ⚠️ 非 escort 视角时不发请求
  const {
    data: withdrawStats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'workbench', 'withdraw-stats'],
    queryFn: () => previewApi.getWithdrawStats(),
    staleTime: 60 * 1000,
    enabled: isEscort, // 只有 escort 视角才发请求
  })

  // 自动选择默认账户
  useEffect(() => {
    if (withdrawStats && !selectedAccountId && withdrawStats.accounts.length > 0) {
      const defaultAccount = withdrawStats.accounts.find(a => a.isDefault) || withdrawStats.accounts[0]
      setSelectedAccountId(defaultAccount.id)
    }
  }, [withdrawStats, selectedAccountId])

  // 非 escort 视角：显示提示
  if (!isEscort) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
        }}
      >
        <Header themeSettings={themeSettings} onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-5xl mb-4">🔒</div>
          <div className={`text-base font-medium text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            需要陪诊员身份
          </div>
          <div className={`text-sm text-center mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            请先登录陪诊员账号后再进行提现操作。
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 页面标题 */}
      <Header themeSettings={themeSettings} onBack={onBack} />

      {/* 加载中 */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-400 text-sm">加载中...</div>
        </div>
      )}

      {/* 请求失败 */}
      {isError && !withdrawStats && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-4xl mb-2">😔</div>
          <div className="text-gray-400 text-sm">加载失败，请稍后重试</div>
        </div>
      )}

      {/* 内容区 */}
      {!isLoading && withdrawStats && (
        <WithdrawContent
          stats={withdrawStats}
          amount={amount}
          setAmount={setAmount}
          selectedAccountId={selectedAccountId}
          setSelectedAccountId={setSelectedAccountId}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 底部留白 */}
      <div className="h-20" />
    </div>
  )
}

// ============================================================================
// 内容组件
// ============================================================================

interface WithdrawContentProps {
  stats: WithdrawStats
  amount: string
  setAmount: (value: string) => void
  selectedAccountId: string
  setSelectedAccountId: (id: string) => void
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function WithdrawContent({
  stats,
  amount,
  setAmount,
  selectedAccountId,
  setSelectedAccountId,
  themeSettings,
  isDarkMode,
}: WithdrawContentProps) {
  // 计算实际到账金额
  const inputAmount = parseFloat(amount) || 0
  const fee = inputAmount * stats.feeRate
  const actualAmount = inputAmount - fee

  // 是否可提现
  const canWithdraw =
    inputAmount >= stats.minAmount &&
    inputAmount <= stats.withdrawable &&
    inputAmount <= stats.maxAmount &&
    selectedAccountId !== '' &&
    stats.remainingTimes > 0

  // 提现按钮禁用原因
  const getDisabledReason = (): string | null => {
    if (inputAmount <= 0) return '请输入提现金额'
    if (inputAmount < stats.minAmount) return `最低提现 ¥${stats.minAmount}`
    if (inputAmount > stats.withdrawable) return '超出可提现余额'
    if (inputAmount > stats.maxAmount) return `单笔最高 ¥${stats.maxAmount}`
    if (!selectedAccountId) return '请选择提现账户'
    if (stats.remainingTimes <= 0) return '今日提现次数已用完'
    return null
  }

  const disabledReason = getDisabledReason()
  const accounts = stats.accounts ?? []
  const records = stats.recentRecords ?? []

  return (
    <div className="px-4 py-4 space-y-4">
      {/* 可提现余额卡片 */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${adjustColor(themeSettings.primaryColor, -20)} 100%)`,
        }}
      >
        {/* 装饰 */}
        <div
          className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10"
          style={{ backgroundColor: '#fff' }}
        />

        <div className="relative z-10">
          <div className="text-white/80 text-sm">可提现余额</div>
          <div className="text-white text-4xl font-bold mt-2 tracking-tight">
            ¥{stats.withdrawable.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </div>
          {stats.pendingAmount > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Clock className="w-3.5 h-3.5 text-white/60" />
              <span className="text-white/60 text-xs">
                处理中 ¥{stats.pendingAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 提现金额输入 */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        <div className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          提现金额
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>¥</span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`flex-1 text-3xl font-bold bg-transparent outline-none ${
              isDarkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-300'
            }`}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setAmount(stats.withdrawable.toString())}
            className="text-sm font-medium"
            style={{ color: themeSettings.primaryColor }}
          >
            全部提现
          </button>
          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            今日剩余 {stats.remainingTimes} 次
          </span>
        </div>
      </div>

      {/* 提现规则 */}
      <div className="space-y-2 px-1">
        <RuleItem
          Icon={AlertCircle}
          text={`最低提现 ¥${stats.minAmount}，单笔最高 ¥${stats.maxAmount.toLocaleString()}`}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
        />
        {stats.feeRate > 0 && (
          <RuleItem
            Icon={AlertCircle}
            text={`手续费 ${(stats.feeRate * 100).toFixed(1)}%`}
            themeSettings={themeSettings}
            isDarkMode={isDarkMode}
          />
        )}
        <RuleItem
          Icon={Clock}
          text={`预计 ${stats.estimatedHours} 小时内到账`}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* 提现账户选择 */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
        }}
      >
        <div className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          提现至
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-4">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无绑定账户
            </div>
            <button
              className="mt-2 text-sm font-medium"
              style={{ color: themeSettings.primaryColor }}
            >
              + 添加提现账户
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                isSelected={selectedAccountId === account.id}
                onSelect={() => setSelectedAccountId(account.id)}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}

        {accounts.length > 0 && (
          <button
            className="w-full mt-3 py-2 text-sm font-medium rounded-lg border border-dashed"
            style={{
              borderColor: themeSettings.primaryColor,
              color: themeSettings.primaryColor,
            }}
          >
            + 添加提现账户
          </button>
        )}
      </div>

      {/* 到账金额预览 */}
      {inputAmount > 0 && (
        <div
          className="rounded-xl p-4 text-center"
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
          }}
        >
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            实际到账
          </span>
          <div
            className="text-2xl font-bold mt-1"
            style={{ color: themeSettings.primaryColor }}
          >
            ¥{actualAmount.toFixed(2)}
          </div>
          {fee > 0 && (
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              (手续费 ¥{fee.toFixed(2)})
            </span>
          )}
        </div>
      )}

      {/* 提现按钮 */}
      <button
        disabled={!canWithdraw}
        onClick={() => {
          console.log('[WorkbenchWithdrawPage] 提现:', { amount: inputAmount, accountId: selectedAccountId })
        }}
        className="w-full py-3.5 rounded-full text-white font-semibold disabled:opacity-50 transition-all shadow-lg disabled:shadow-none"
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        {disabledReason || '确认提现'}
      </button>

      {/* 最近提现记录 */}
      {records.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              提现记录
            </div>
            <button
              className="text-xs font-medium"
              style={{ color: themeSettings.primaryColor }}
            >
              查看全部
            </button>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            }}
          >
            {records.map((record, index) => (
              <WithdrawRecordRow
                key={record.id}
                record={record}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                isLast={index === records.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 子组件
// ============================================================================

interface HeaderProps {
  themeSettings: ThemeSettings
  onBack?: () => void
}

function Header({ themeSettings, onBack }: HeaderProps) {
  return (
    <div
      className="sticky top-0 z-10 px-4 py-3 flex items-center"
      style={{
        backgroundColor: themeSettings.primaryColor,
      }}
    >
      {onBack && (
        <button onClick={onBack} className="text-white mr-3 hover:opacity-80 transition-opacity">
          ←
        </button>
      )}
      <h1 className="text-lg font-semibold text-white flex-1 text-center pr-6">
        提现
      </h1>
    </div>
  )
}

interface RuleItemProps {
  Icon: LucideIcon
  text: string
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function RuleItem({ Icon, text, themeSettings, isDarkMode }: RuleItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: themeSettings.primaryColor }} />
      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  )
}

interface AccountCardProps {
  account: WithdrawAccount
  isSelected: boolean
  onSelect: () => void
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function AccountCard({
  account,
  isSelected,
  onSelect,
  themeSettings,
  isDarkMode,
}: AccountCardProps) {
  const IconComponent = getAccountIcon(account.type)

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
      style={{
        backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f7fa',
        boxShadow: isSelected ? `0 0 0 2px ${themeSettings.primaryColor}` : 'none',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: `${themeSettings.primaryColor}15`,
        }}
      >
        <IconComponent
          className="w-5 h-5"
          style={{ color: themeSettings.primaryColor }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {account.bankName || account.name}
          </span>
          {account.isDefault && (
            <span
              className="px-1.5 py-0.5 text-[10px] font-medium rounded"
              style={{
                backgroundColor: `${themeSettings.primaryColor}15`,
                color: themeSettings.primaryColor,
              }}
            >
              默认
            </span>
          )}
        </div>
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {account.type === 'bank' ? `尾号 ${account.accountNo.replace(/\*/g, '')}` : account.accountNo}
        </div>
      </div>
      {isSelected && (
        <CheckCircle
          className="w-5 h-5 flex-shrink-0"
          style={{ color: themeSettings.primaryColor }}
        />
      )}
    </div>
  )
}

interface WithdrawRecordRowProps {
  record: WithdrawRecord
  themeSettings: ThemeSettings
  isDarkMode: boolean
  isLast: boolean
}

function WithdrawRecordRow({
  record,
  isDarkMode,
  isLast,
}: WithdrawRecordRowProps) {
  const statusConfig = {
    pending: { text: '待处理', color: '#f59e0b' },
    processing: { text: '处理中', color: '#3b82f6' },
    completed: { text: '已到账', color: '#10b981' },
    failed: { text: '失败', color: '#ef4444' },
  }
  const status = statusConfig[record.status]

  return (
    <div
      className="flex items-center px-4 py-3.5"
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${isDarkMode ? '#3a3a3a' : '#f3f4f6'}`,
      }}
    >
      {/* 图标 */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
        }}
      >
        <ArrowDownRight
          className="w-5 h-5"
          style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
      </div>

      {/* 信息 */}
      <div className="flex-1 ml-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            提现至 {record.accountName.split(' ')[0]}
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
            style={{
              backgroundColor: `${status.color}15`,
              color: status.color,
            }}
          >
            {status.text}
          </span>
        </div>
        <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {record.createdAt}
        </div>
      </div>

      {/* 金额 */}
      <div className={`text-sm font-semibold flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        -¥{record.amount.toFixed(2)}
      </div>
    </div>
  )
}

// ============================================================================
// 辅助函数
// ============================================================================

function getAccountIcon(type: WithdrawAccount['type']) {
  switch (type) {
    case 'bank':
      return Building2
    case 'alipay':
      return Smartphone
    case 'wechat':
      return Smartphone
    default:
      return CreditCard
  }
}

/**
 * 调整颜色明暗度
 */
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
