/**
 * 陪诊员提现页面
 *
 * page key: 'workbench-withdraw'
 * API: previewApi.getWithdrawStats()
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * 功能：
 * - 可提现余额展示
 * - 提现账户信息（银行卡/对公账户/支付宝）
 * - 提现表单（金额输入、提交按钮、禁用状态）
 * - 最近提现记录列表（5 条）
 *
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text, Button, Input } from '../../../ui/primitives'
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowDownRight,
  Smartphone,
  Building2,
  ChevronLeft,
} from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'
import type { WithdrawStats, WithdrawAccount, WithdrawRecord } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import {
  formatMoney,
  formatMoneyWithComma,
  formatCount,
  formatPercent,
  safeNumber,
} from '../../../utils'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 类型定义
// ============================================================================

export interface WorkbenchWithdrawPageProps {
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

export function WorkbenchWithdrawPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onBack,
  onNavigate,
  onLogin,
}: WorkbenchWithdrawPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  // 提现金额输入
  const [amount, setAmount] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')

  // 数据状态（规则4：使用 useState + useEffect）
  const [withdrawStats, setWithdrawStats] = useState<WithdrawStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const refreshData = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await previewApi.getWithdrawStats()
      setWithdrawStats(data)
      if (data.accounts && data.accounts.length > 0) {
        const defaultAccount = data.accounts.find(a => a.isDefault) || data.accounts[0]
        setSelectedAccountId(defaultAccount.id)
      }
    } catch (err) {
      console.error('[WorkbenchWithdrawPage] 加载提现数据失败:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // 加载数据
  useEffect(() => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    void refreshData()
  }, [isEscort])

  // 刷新数据
  const handleRefresh = () => {
    void refreshData()
  }

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <Box
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: bgColor,
        }}
      >
        <PageHeader
          title="提现"
          themeSettings={themeSettings}
          onBack={onBack}
        />
        <Box style={{ flex: 1 }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号进行提现操作"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={primaryColor}
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>
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
      <PageHeader
        title="提现"
        themeSettings={themeSettings}
        onBack={onBack}
      />

      {/* 加载中 - 骨架屏 */}
      {loading && (
        <Box style={{ padding: 16 * wxScale }}>
          <ListSkeleton count={1} variant="detail" isDarkMode={isDarkMode} />
        </Box>
      )}

      {/* 请求失败 - 带重试按钮 */}
      {error && !withdrawStats && (
        <ErrorRetry
          onRetry={handleRefresh}
          isDarkMode={isDarkMode}
          primaryColor={primaryColor}
        />
      )}

      {/* 内容区 */}
      {!loading && withdrawStats && (
        <WithdrawContent
          stats={withdrawStats}
          amount={amount}
          setAmount={setAmount}
          selectedAccountId={selectedAccountId}
          setSelectedAccountId={setSelectedAccountId}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
          onNavigate={onNavigate}
          onRefresh={refreshData}
        />
      )}

      {/* 底部留白 */}
      <Box style={{ height: 80 * wxScale }} />
    </Box>
  )
}

// ============================================================================
// 页面头部
// ============================================================================

interface PageHeaderProps {
  title: string
  themeSettings: ThemeSettings
  onBack?: () => void
}

function PageHeader({ title, themeSettings, onBack }: PageHeaderProps) {
  return (
    <Box
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: themeSettings.primaryColor,
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
        {/* 返回按钮 */}
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
            <ChevronLeft size={22 * wxScale} color="#fff" />
          </Box>
        )}

        {/* 标题 */}
        <Text
          style={{
            fontSize: 17 * wxScale,
            fontWeight: 600,
            color: '#fff',
          }}
        >
          {title}
        </Text>
      </Box>
    </Box>
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
  cardBg: string
  textPrimary: string
  textSecondary: string
  borderColor: string
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onRefresh?: () => Promise<void> | void
}

function WithdrawContent({
  stats,
  amount,
  setAmount,
  selectedAccountId,
  setSelectedAccountId,
  themeSettings,
  isDarkMode,
  cardBg,
  textPrimary,
  textSecondary,
  borderColor,
  onNavigate,
  onRefresh,
}: WithdrawContentProps) {
  const primaryColor = themeSettings.primaryColor
  const [savingAccount, setSavingAccount] = useState(false)
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)
  const [showAddAccountForm, setShowAddAccountForm] = useState(false)
  const [newAccountType, setNewAccountType] = useState<'bank' | 'alipay' | 'wechat'>('bank')
  const [newAccountName, setNewAccountName] = useState('')
  const [newBankName, setNewBankName] = useState('')
  const [newAccountNo, setNewAccountNo] = useState('')
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // 根据金额大小计算自适应字号（#32）
  const getAmountFontSize = (value: number): number => {
    if (value >= 100000) return 22 * wxScale  // 10万+：小字号
    if (value >= 10000) return 28 * wxScale   // 1万+：中字号
    return 36 * wxScale                        // 默认：大字号
  }
  const amountFontSize = getAmountFontSize(stats.withdrawable)

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
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId)

  const handleAddAccount = async () => {
    const account = newAccountNo.trim()
    if (!account) {
      setActionError('请输入提现账户')
      setActionMessage(null)
      return
    }
    const accountName = newAccountName.trim()
    const bankName = newBankName.trim()
    if (newAccountType === 'bank' && !accountName) {
      setActionError('请输入开户名称（个人或公司）')
      setActionMessage(null)
      return
    }
    if (newAccountType === 'bank' && !bankName) {
      setActionError('请输入开户行')
      setActionMessage(null)
      return
    }

    try {
      setSavingAccount(true)
      setActionError(null)
      setActionMessage(null)
      await previewApi.updateWithdrawAccount({
        method: newAccountType,
        account,
        accountName: accountName || undefined,
        bankName: bankName || undefined,
      })
      setActionMessage('提现账户已保存')
      setNewAccountNo('')
      setNewAccountName('')
      setNewBankName('')
      setShowAddAccountForm(false)
      await onRefresh?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存提现账户失败'
      setActionError(message)
      setActionMessage(null)
    } finally {
      setSavingAccount(false)
    }
  }

  const handleSubmitWithdrawal = async () => {
    if (!canWithdraw || !selectedAccount) return

    try {
      setSubmittingWithdraw(true)
      setActionError(null)
      setActionMessage(null)
      await previewApi.requestWithdrawal({
        amount: inputAmount,
      })
      setActionMessage('提现申请已提交')
      setAmount('')
      await onRefresh?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : '提现申请提交失败'
      setActionError(message)
      setActionMessage(null)
    } finally {
      setSubmittingWithdraw(false)
    }
  }

  return (
    <Box style={{ padding: 16 * wxScale }}>
      {/* 可提现余额卡片 */}
      <Box
        style={{
          borderRadius: 16 * wxScale,
          padding: 20 * wxScale,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)`,
        }}
      >
        {/* 装饰 */}
        <Box
          style={{
            position: 'absolute',
            right: -16 * wxScale,
            top: -16 * wxScale,
            width: 80 * wxScale,
            height: 80 * wxScale,
            borderRadius: 40 * wxScale,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        <Box style={{ position: 'relative', zIndex: 10 }}>
          <Text
            style={{
              display: 'block',
              fontSize: 14 * wxScale,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            可提现余额
          </Text>
          <Text
            style={{
              display: 'block',
              fontSize: amountFontSize,
              fontWeight: 700,
              color: '#fff',
              marginTop: 8 * wxScale,
            }}
          >
            ¥{formatMoneyWithComma(stats.withdrawable)}
          </Text>
          {safeNumber(stats.pendingAmount) > 0 && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4 * wxScale,
                marginTop: 8 * wxScale,
              }}
            >
              <Clock size={14 * wxScale} color="rgba(255, 255, 255, 0.6)" />
              <Text
                style={{
                  fontSize: 12 * wxScale,
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                处理中 ¥{formatMoney(stats.pendingAmount)}
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* 提现金额输入 */}
      <Box
        style={{
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginTop: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            color: textSecondary,
            marginBottom: 12 * wxScale,
          }}
        >
          提现金额
        </Text>
        <Box
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 4 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 24 * wxScale,
              color: textPrimary,
            }}
          >
            ¥
          </Text>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(value) => setAmount(value)}
            style={{
              flex: 1,
              fontSize: 28 * wxScale,
              fontWeight: 700,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: textPrimary,
            }}
          />
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12 * wxScale,
          }}
        >
          <Box
            onClick={() => setAmount(stats.withdrawable.toString())}
            style={{ cursor: 'pointer' }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                fontWeight: 500,
                color: primaryColor,
              }}
            >
              全部提现
            </Text>
          </Box>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: textSecondary,
            }}
          >
            今日剩余 {stats.remainingTimes} 次
          </Text>
        </Box>
      </Box>

      {/* 提现规则 */}
      <Box
        style={{
          marginTop: 12 * wxScale,
          paddingLeft: 4 * wxScale,
          paddingRight: 4 * wxScale,
        }}
      >
        <RuleItem
          text={`最低提现 ¥${safeNumber(stats.minAmount)}，单笔最高 ¥${formatCount(stats.maxAmount)}`}
          primaryColor={primaryColor}
          textSecondary={textSecondary}
        />
        {safeNumber(stats.feeRate) > 0 && (
          <RuleItem
            text={`手续费 ${formatPercent(stats.feeRate, 1)}%`}
            primaryColor={primaryColor}
            textSecondary={textSecondary}
          />
        )}
        <RuleItem
          text={`预计 ${stats.estimatedHours} 小时内到账`}
          primaryColor={primaryColor}
          textSecondary={textSecondary}
        />
      </Box>

      {/* 提现账户选择 */}
      <Box
        style={{
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginTop: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            color: textSecondary,
            marginBottom: 12 * wxScale,
          }}
        >
          提现至
        </Text>

        {accounts.length === 0 ? (
          <Box
            style={{
              paddingTop: 16 * wxScale,
              paddingBottom: 16 * wxScale,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: textSecondary,
              }}
            >
              暂无绑定账户
            </Text>
            <Box
              onClick={() => {
                setShowAddAccountForm((prev) => !prev)
                setActionError(null)
                setActionMessage(null)
              }}
              style={{
                marginTop: 8 * wxScale,
                cursor: 'pointer',
              }}
            >
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  fontWeight: 500,
                  color: primaryColor,
                }}
              >
                + 添加提现账户
              </Text>
            </Box>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
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
          </Box>
        )}

        {accounts.length > 0 && (
          <Box
            onClick={() => {
              setShowAddAccountForm((prev) => !prev)
              setActionError(null)
              setActionMessage(null)
            }}
            style={{
              marginTop: 12 * wxScale,
              paddingTop: 10 * wxScale,
              paddingBottom: 10 * wxScale,
              borderRadius: 8 * wxScale,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                fontWeight: 500,
                color: primaryColor,
              }}
            >
              + 添加提现账户
            </Text>
          </Box>
        )}

        {showAddAccountForm && (
          <Box
            style={{
              marginTop: 12 * wxScale,
              padding: 12 * wxScale,
              borderRadius: 8 * wxScale,
              border: `1px solid ${borderColor}`,
              backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
            }}
          >
            <Text
              style={{
                display: 'block',
                fontSize: 13 * wxScale,
                color: textSecondary,
                marginBottom: 8 * wxScale,
              }}
            >
              账户类型
            </Text>
            <Box style={{ display: 'flex', gap: 8 * wxScale, marginBottom: 10 * wxScale }}>
              {(['bank', 'alipay', 'wechat'] as const).map((type) => {
                const selected = newAccountType === type
                const label = type === 'bank' ? '银行卡/对公账户' : type === 'alipay' ? '支付宝' : '微信'
                return (
                  <Box
                    key={type}
                    onClick={() => setNewAccountType(type)}
                    style={{
                      paddingLeft: 10 * wxScale,
                      paddingRight: 10 * wxScale,
                      paddingTop: 6 * wxScale,
                      paddingBottom: 6 * wxScale,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: selected ? primaryColor : borderColor,
                      backgroundColor: selected ? `${primaryColor}15` : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <Text style={{ fontSize: 12 * wxScale, color: selected ? primaryColor : textSecondary }}>
                      {label}
                    </Text>
                  </Box>
                )
              })}
            </Box>

            <Input
              value={newAccountNo}
              onChange={setNewAccountNo}
              placeholder={newAccountType === 'bank' ? '请输入银行卡号或对公账户号' : newAccountType === 'alipay' ? '请输入支付宝账号' : '请输入微信账号'}
              style={{
                width: '100%',
                paddingTop: 10 * wxScale,
                paddingBottom: 10 * wxScale,
                paddingLeft: 10 * wxScale,
                paddingRight: 10 * wxScale,
                borderRadius: 8 * wxScale,
                border: `1px solid ${borderColor}`,
                backgroundColor: cardBg,
                color: textPrimary,
              }}
            />

            {newAccountType === 'bank' && (
              <Box style={{ marginTop: 10 * wxScale, display: 'flex', flexDirection: 'column', gap: 10 * wxScale }}>
                <Input
                  value={newAccountName}
                  onChange={setNewAccountName}
                  placeholder='请输入开户名称（个人或公司）'
                  style={{
                    width: '100%',
                    paddingTop: 10 * wxScale,
                    paddingBottom: 10 * wxScale,
                    paddingLeft: 10 * wxScale,
                    paddingRight: 10 * wxScale,
                    borderRadius: 8 * wxScale,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: cardBg,
                    color: textPrimary,
                  }}
                />
                <Input
                  value={newBankName}
                  onChange={setNewBankName}
                  placeholder='请输入开户行'
                  style={{
                    width: '100%',
                    paddingTop: 10 * wxScale,
                    paddingBottom: 10 * wxScale,
                    paddingLeft: 10 * wxScale,
                    paddingRight: 10 * wxScale,
                    borderRadius: 8 * wxScale,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: cardBg,
                    color: textPrimary,
                  }}
                />
              </Box>
            )}

            <Button
              disabled={savingAccount}
              onClick={handleAddAccount}
              style={{
                marginTop: 10 * wxScale,
                width: '100%',
                borderRadius: 8 * wxScale,
                paddingTop: 10 * wxScale,
                paddingBottom: 10 * wxScale,
                backgroundColor: savingAccount ? (isDarkMode ? '#4b5563' : '#d1d5db') : primaryColor,
                color: '#fff',
                fontSize: 14 * wxScale,
                fontWeight: 600,
              }}
            >
              {savingAccount ? '保存中...' : '保存提现账户'}
            </Button>
          </Box>
        )}
      </Box>

      {(actionError || actionMessage) && (
        <Box
          style={{
            marginTop: 12 * wxScale,
            padding: 10 * wxScale,
            borderRadius: 8 * wxScale,
            backgroundColor: actionError
              ? (isDarkMode ? '#451a1a' : '#fef2f2')
              : (isDarkMode ? '#052e16' : '#f0fdf4'),
          }}
        >
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: actionError
                ? (isDarkMode ? '#fca5a5' : '#dc2626')
                : (isDarkMode ? '#86efac' : '#16a34a'),
            }}
          >
            {actionError || actionMessage}
          </Text>
        </Box>
      )}

      {/* 到账金额预览 */}
      {inputAmount > 0 && (
        <Box
          style={{
            borderRadius: 12 * wxScale,
            padding: 16 * wxScale,
            marginTop: 16 * wxScale,
            backgroundColor: cardBg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: textSecondary,
            }}
          >
            实际到账
          </Text>
          <Text
            style={{
              display: 'block',
              fontSize: 24 * wxScale,
              fontWeight: 700,
              color: primaryColor,
              marginTop: 4 * wxScale,
            }}
          >
            ¥{formatMoney(actualAmount)}
          </Text>
          {fee > 0 && (
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: textSecondary,
                marginTop: 4 * wxScale,
              }}
            >
              (手续费 ¥{formatMoney(fee)})
            </Text>
          )}
        </Box>
      )}

      {/* 提现按钮 */}
      <Button
        disabled={!canWithdraw || submittingWithdraw}
        onClick={handleSubmitWithdrawal}
        style={{
          width: '100%',
          marginTop: 16 * wxScale,
          paddingTop: isWxEnvironment() ? 14 * wxScale : 12,
          paddingBottom: isWxEnvironment() ? 14 * wxScale : 12,
          borderRadius: 9999,
          fontSize: 16 * wxScale,
          fontWeight: 600,
          backgroundColor: canWithdraw && !submittingWithdraw
            ? primaryColor
            : (isDarkMode ? '#4b5563' : '#e5e7eb'),
          color: canWithdraw && !submittingWithdraw
            ? '#ffffff'
            : (isDarkMode ? '#9ca3af' : '#6b7280'),
        }}
      >
        {submittingWithdraw ? '提交中...' : (disabledReason || '确认提现')}
      </Button>

      {/* 最近提现记录 */}
      {records.length > 0 && (
        <Box style={{ marginTop: 24 * wxScale }}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12 * wxScale,
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                fontWeight: 600,
                color: textPrimary,
              }}
            >
              提现记录
            </Text>
            <Box
              onClick={() => onNavigate?.('workbench-withdraw-records')}
              style={{ cursor: 'pointer' }}
            >
              <Text
                style={{
                  fontSize: 12 * wxScale,
                  fontWeight: 500,
                  color: primaryColor,
                }}
              >
                查看全部
              </Text>
            </Box>
          </Box>

          <Box
            style={{
              borderRadius: 12 * wxScale,
              overflow: 'hidden',
              backgroundColor: cardBg,
            }}
          >
            {records.map((record, index) => (
              <WithdrawRecordRow
                key={record.id}
                record={record}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                borderColor={borderColor}
                isLast={index === records.length - 1}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ============================================================================
// 子组件
// ============================================================================

interface RuleItemProps {
  text: string
  primaryColor: string
  textSecondary: string
}

function RuleItem({ text, primaryColor, textSecondary }: RuleItemProps) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8 * wxScale,
        marginTop: 8 * wxScale,
      }}
    >
      <AlertCircle size={14 * wxScale} color={primaryColor} />
      <Text
        style={{
          fontSize: 12 * wxScale,
          color: textSecondary,
        }}
      >
        {text}
      </Text>
    </Box>
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
  const primaryColor = themeSettings.primaryColor
  const IconComponent = getAccountIcon(account.type)
  const tail4 = account.accountNo.slice(-4)

  return (
    <Box
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12 * wxScale,
        padding: 12 * wxScale,
        borderRadius: 8 * wxScale,
        backgroundColor: isDarkMode ? '#3a3a3a' : '#f5f7fa',
        borderWidth: isSelected ? 2 : 0,
        borderStyle: 'solid',
        borderColor: isSelected ? primaryColor : 'transparent',
        cursor: 'pointer',
      }}
    >
      <Box
        style={{
          width: 40 * wxScale,
          height: 40 * wxScale,
          borderRadius: 20 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${primaryColor}15`,
        }}
      >
        <IconComponent size={20 * wxScale} color={primaryColor} />
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: isDarkMode ? '#fff' : '#111827',
            }}
          >
            {account.bankName || account.name}
          </Text>
          {account.isDefault && (
            <Box
              style={{
                paddingLeft: 6 * wxScale,
                paddingRight: 6 * wxScale,
                paddingTop: 2 * wxScale,
                paddingBottom: 2 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: `${primaryColor}15`,
              }}
            >
              <Text
                style={{
                  fontSize: 10 * wxScale,
                  fontWeight: 500,
                  color: primaryColor,
                }}
              >
                默认
              </Text>
            </Box>
          )}
        </Box>
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            marginTop: 2 * wxScale,
          }}
        >
          {account.type === 'bank' ? `尾号 ${tail4}` : account.accountNo}
        </Text>
      </Box>
      {isSelected && (
        <CheckCircle size={20 * wxScale} color={primaryColor} />
      )}
    </Box>
  )
}

interface WithdrawRecordRowProps {
  record: WithdrawRecord
  themeSettings: ThemeSettings
  isDarkMode: boolean
  textPrimary: string
  textSecondary: string
  borderColor: string
  isLast: boolean
}

function WithdrawRecordRow({
  record,
  isDarkMode,
  textPrimary,
  textSecondary,
  borderColor,
  isLast,
}: WithdrawRecordRowProps) {
  const statusConfig: Record<string, { text: string; color: string }> = {
    pending: { text: '待处理', color: '#f59e0b' },
    processing: { text: '处理中', color: '#3b82f6' },
    completed: { text: '已到账', color: '#10b981' },
    failed: { text: '失败', color: '#ef4444' },
  }
  const status = statusConfig[record.status] || { text: '未知', color: '#6b7280' }

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 14 * wxScale,
        paddingBottom: 14 * wxScale,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: borderColor,
        borderBottomStyle: 'solid',
      }}
    >
      {/* 图标 */}
      <Box
        style={{
          width: 40 * wxScale,
          height: 40 * wxScale,
          borderRadius: 20 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
          flexShrink: 0,
        }}
      >
        <ArrowDownRight
          size={20 * wxScale}
          color={isDarkMode ? '#9ca3af' : '#6b7280'}
        />
      </Box>

      {/* 信息 */}
      <Box
        style={{
          flex: 1,
          marginLeft: 12 * wxScale,
          minWidth: 0,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* 左侧：标题+状态 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                fontWeight: 500,
                color: textPrimary,
                whiteSpace: 'nowrap',
              }}
            >
              提现至 {record.accountName?.split(' ')[0] || '账户'}
            </Text>
            <Box
              style={{
                paddingLeft: 6 * wxScale,
                paddingRight: 6 * wxScale,
                paddingTop: 2 * wxScale,
                paddingBottom: 2 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: `${status.color}15`,
                flexShrink: 0,
              }}
            >
              <Text
                style={{
                  fontSize: 10 * wxScale,
                  fontWeight: 500,
                  color: status.color,
                }}
              >
                {status.text}
              </Text>
            </Box>
          </Box>

          {/* 右侧：金额 */}
          <Text
            style={{
              fontSize: 15 * wxScale,
              fontWeight: 600,
              color: textPrimary,
              flexShrink: 0,
              marginLeft: 12 * wxScale,
            }}
          >
            -¥{formatMoney(record.amount)}
          </Text>
        </Box>

        {/* 时间 */}
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: textSecondary,
            marginTop: 4 * wxScale,
          }}
        >
          {record.createdAt}
        </Text>
      </Box>
    </Box>
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
