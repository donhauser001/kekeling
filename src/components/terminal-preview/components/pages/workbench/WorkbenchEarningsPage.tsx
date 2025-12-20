/**
 * 陪诊员收入统计页面
 *
 * page key: 'workbench-earnings'
 * API: previewApi.getEarningsStats()
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * 指标卡片：总收入、本月收入、可提现、提现中、订单数
 * 列表：最近 5 笔收入记录
 *
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text } from '../../../ui/primitives'
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Clock,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  RefreshCw,
  ChevronLeft,
} from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'
import type { EarningsStats, EarningsStatsRecord } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import {
  formatMoney,
  formatMoneyWithComma,
  formatCount,
  safeNumber,
  safeArray,
} from '../../../utils'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 类型定义
// ============================================================================

export interface WorkbenchEarningsPageProps {
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

export function WorkbenchEarningsPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onBack,
  onNavigate,
  onLogin,
}: WorkbenchEarningsPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  // 数据状态
  const [earningsStats, setEarningsStats] = useState<EarningsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // 加载数据
  const loadData = async () => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)

    try {
      const data = await previewApi.getEarningsStats()
      // 数据安全处理
      setEarningsStats({
        ...data,
        totalEarnings: safeNumber(data?.totalEarnings),
        monthlyEarnings: safeNumber(data?.monthlyEarnings),
        withdrawable: safeNumber(data?.withdrawable),
        pendingWithdraw: safeNumber(data?.pendingWithdraw),
        totalOrders: safeNumber(data?.totalOrders),
        monthlyOrders: safeNumber(data?.monthlyOrders),
        monthlyOrdersGrowth: data?.monthlyOrdersGrowth !== undefined
          ? safeNumber(data.monthlyOrdersGrowth)
          : undefined,
        recentRecords: safeArray<EarningsStatsRecord>(data?.recentRecords),
      })
    } catch (err) {
      console.error('[WorkbenchEarningsPage] 加载失败:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [isEscort])

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          backgroundColor: bgColor,
        }}
      >
        <PageHeader
          title="收入明细"
          themeSettings={themeSettings}
          onBack={onBack}
        />
        <Box style={{ flex: 1 }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号查看收入明细"
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
        title="收入明细"
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
      {error && !earningsStats && (
        <ErrorRetry
          onRetry={() => loadData()}
          isDarkMode={isDarkMode}
          primaryColor={primaryColor}
        />
      )}

      {/* 数据内容 */}
      {!loading && earningsStats && (
        <EarningsContent
          stats={earningsStats}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
          onNavigate={onNavigate}
        />
      )}

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
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

interface EarningsContentProps {
  stats: EarningsStats
  themeSettings: ThemeSettings
  isDarkMode: boolean
  cardBg: string
  textPrimary: string
  textSecondary: string
  borderColor: string
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

function EarningsContent({
  stats,
  themeSettings,
  isDarkMode,
  cardBg,
  textPrimary,
  textSecondary,
  borderColor,
  onNavigate,
}: EarningsContentProps) {
  const records = stats.recentRecords ?? []
  const monthlyGrowth = stats.monthlyOrdersGrowth ?? 0
  const primaryColor = themeSettings.primaryColor

  return (
    <>
      {/* 收入概览卡片 */}
      <Box style={{ padding: 16 * wxScale }}>
        <Box
          style={{
            borderRadius: 16 * wxScale,
            padding: 20 * wxScale,
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)`,
          }}
        >
          {/* 装饰图案 */}
          <Box
            style={{
              position: 'absolute',
              right: -16 * wxScale,
              top: -16 * wxScale,
              width: 96 * wxScale,
              height: 96 * wxScale,
              borderRadius: 48 * wxScale,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <Box
            style={{
              position: 'absolute',
              right: -32 * wxScale,
              top: 48 * wxScale,
              width: 64 * wxScale,
              height: 64 * wxScale,
              borderRadius: 32 * wxScale,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />

          <Box style={{ position: 'relative', zIndex: 10 }}>
            <Text
              style={{
                display: 'block',
                fontSize: 14 * wxScale,
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500,
              }}
            >
              可提现余额
            </Text>
            <Text
              style={{
                display: 'block',
                fontSize: 36 * wxScale,
                fontWeight: 700,
                color: '#fff',
                marginTop: 8 * wxScale,
                letterSpacing: -1,
              }}
            >
              ¥{formatMoneyWithComma(stats.withdrawable)}
            </Text>

            {/* 提现中金额 */}
            {stats.pendingWithdraw > 0 && (
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
                  提现中 ¥{formatMoney(stats.pendingWithdraw)}
                </Text>
              </Box>
            )}

            {/* 提现按钮 */}
            <Box
              onClick={() => onNavigate?.('workbench-withdraw')}
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 24 * wxScale,
                paddingRight: 24 * wxScale,
                paddingTop: 10 * wxScale,
                paddingBottom: 10 * wxScale,
                borderRadius: 9999,
                backgroundColor: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  fontWeight: 600,
                  color: primaryColor,
                }}
              >
                立即提现
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 指标卡片网格 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale, paddingBottom: 16 * wxScale }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12 * wxScale,
          }}
        >
          <StatCard
            icon={<Wallet size={20 * wxScale} color="#10b981" />}
            label="总收入"
            value={stats.totalEarnings}
            prefix="¥"
            cardBg={cardBg}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            accentColor="#10b981"
          />
          <StatCard
            icon={<TrendingUp size={20 * wxScale} color={primaryColor} />}
            label="本月收入"
            value={stats.monthlyEarnings}
            prefix="¥"
            cardBg={cardBg}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            accentColor={primaryColor}
          />
          <StatCard
            icon={<CreditCard size={20 * wxScale} color="#f59e0b" />}
            label="提现中"
            value={stats.pendingWithdraw}
            prefix="¥"
            cardBg={cardBg}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            accentColor="#f59e0b"
          />
          <StatCard
            icon={<FileText size={20 * wxScale} color="#6366f1" />}
            label="累计订单"
            value={stats.totalOrders}
            suffix="单"
            cardBg={cardBg}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            accentColor="#6366f1"
          />
        </Box>

        {/* 本月订单数（单独一行） */}
        <Box
          style={{
            marginTop: 12 * wxScale,
            borderRadius: 12 * wxScale,
            padding: 16 * wxScale,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: cardBg,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12 * wxScale,
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
              <FileText size={20 * wxScale} color={primaryColor} />
            </Box>
            <Box>
              <Text
                style={{
                  display: 'block',
                  fontSize: 14 * wxScale,
                  color: textSecondary,
                }}
              >
                本月完成订单
              </Text>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4 * wxScale,
                  marginTop: 2 * wxScale,
                }}
              >
                <Text
                  style={{
                    fontSize: 18 * wxScale,
                    fontWeight: 700,
                    color: textPrimary,
                  }}
                >
                  {stats.monthlyOrders}
                </Text>
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    color: textSecondary,
                  }}
                >
                  单
                </Text>
              </Box>
            </Box>
          </Box>
          {monthlyGrowth !== 0 && (
            <Box
              style={{
                paddingLeft: 12 * wxScale,
                paddingRight: 12 * wxScale,
                paddingTop: 4 * wxScale,
                paddingBottom: 4 * wxScale,
                borderRadius: 9999,
                backgroundColor: monthlyGrowth > 0 ? `${primaryColor}15` : '#ef444415',
              }}
            >
              <Text
                style={{
                  fontSize: 12 * wxScale,
                  fontWeight: 500,
                  color: monthlyGrowth > 0 ? primaryColor : '#ef4444',
                }}
              >
                较上月 {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth}%
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* 收支明细列表 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale, paddingBottom: 24 * wxScale }}>
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
            最近收支
          </Text>
          <Box
            onClick={() => onNavigate?.('workbench-earnings-list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2 * wxScale,
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                fontWeight: 500,
                color: primaryColor,
              }}
            >
              全部记录
            </Text>
            <ArrowUpRight size={14 * wxScale} color={primaryColor} />
          </Box>
        </Box>

        {/* 空态 */}
        {records.length === 0 ? (
          <Box
            style={{
              borderRadius: 12 * wxScale,
              paddingTop: 48 * wxScale,
              paddingBottom: 48 * wxScale,
              backgroundColor: cardBg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              style={{
                width: 64 * wxScale,
                height: 64 * wxScale,
                borderRadius: 32 * wxScale,
                backgroundColor: `${primaryColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={32 * wxScale} color={primaryColor} />
            </Box>
            <Text
              style={{
                display: 'block',
                fontSize: 14 * wxScale,
                color: textSecondary,
                marginTop: 8 * wxScale,
              }}
            >
              暂无收支记录
            </Text>
            {onNavigate && (
              <Box
                onClick={() => onNavigate('workbench-orders-pool')}
                style={{
                  marginTop: 16 * wxScale,
                  paddingLeft: 16 * wxScale,
                  paddingRight: 16 * wxScale,
                  paddingTop: 8 * wxScale,
                  paddingBottom: 8 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: primaryColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    fontWeight: 500,
                    color: '#fff',
                  }}
                >
                  去接单
                </Text>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            style={{
              borderRadius: 12 * wxScale,
              overflow: 'hidden',
              backgroundColor: cardBg,
            }}
          >
            {records.map((record, index) => (
              <EarningsRecordRow
                key={record.id}
                record={record}
                themeSettings={themeSettings}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                borderColor={borderColor}
                isDarkMode={isDarkMode}
                isLast={index === records.length - 1}
              />
            ))}
          </Box>
        )}
      </Box>
    </>
  )
}

// ============================================================================
// 统计卡片组件
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  prefix?: string
  suffix?: string
  cardBg: string
  textPrimary: string
  textSecondary: string
  accentColor: string
}

function StatCard({
  icon,
  label,
  value,
  prefix = '',
  suffix = '',
  cardBg,
  textPrimary,
  textSecondary,
  accentColor,
}: StatCardProps) {
  const formattedValue = prefix === '¥'
    ? formatMoneyWithComma(value)
    : formatCount(value)

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8 * wxScale,
          marginBottom: 8 * wxScale,
        }}
      >
        <Box
          style={{
            width: 32 * wxScale,
            height: 32 * wxScale,
            borderRadius: 16 * wxScale,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${accentColor}15`,
          }}
        >
          {icon}
        </Box>
        <Text
          style={{
            fontSize: 12 * wxScale,
            color: textSecondary,
          }}
        >
          {label}
        </Text>
      </Box>
      <Text
        style={{
          display: 'block',
          fontSize: 20 * wxScale,
          fontWeight: 700,
          color: textPrimary,
        }}
      >
        {prefix}{formattedValue}{suffix}
      </Text>
    </Box>
  )
}

// ============================================================================
// 收支记录行组件
// ============================================================================

interface EarningsRecordRowProps {
  record: EarningsStatsRecord
  themeSettings: ThemeSettings
  textPrimary: string
  textSecondary: string
  borderColor: string
  isDarkMode: boolean
  isLast: boolean
}

function EarningsRecordRow({
  record,
  themeSettings,
  textPrimary,
  textSecondary,
  borderColor,
  isDarkMode,
  isLast,
}: EarningsRecordRowProps) {
  const isIncome = safeNumber(record.amount) > 0
  const isFrozen = record.isFrozen === true
  const iconColor = isFrozen ? '#f59e0b' : (isIncome ? '#10b981' : textSecondary)
  const iconBg = isFrozen
    ? '#f59e0b15'
    : isIncome
      ? `${themeSettings.primaryColor}15`
      : isDarkMode ? '#3a3a3a' : '#f3f4f6'

  // 状态标签配置
  const statusConfig: Record<string, { text: string; color: string }> = {
    completed: { text: '已完成', color: '#10b981' },
    pending: { text: '冻结中', color: '#f59e0b' },
    failed: { text: '失败', color: '#ef4444' },
  }
  const status = statusConfig[record.status]

  // 计算剩余解冻时间
  const unfreezeText = isFrozen ? formatUnfreezeCountdown(record.unfreezeCountdown) : null

  // 图标组件
  const IconComponent = isFrozen ? Clock : getRecordIcon(record.type)

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
          backgroundColor: iconBg,
          flexShrink: 0,
        }}
      >
        <IconComponent size={20 * wxScale} color={iconColor} />
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
            gap: 8 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: textPrimary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {record.title}
          </Text>
          {record.status !== 'completed' && (
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
          )}
        </Box>
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: textSecondary,
            marginTop: 2 * wxScale,
          }}
        >
          {record.createdAt}
          {record.orderNo && ` · ${record.orderNo}`}
        </Text>
        {/* 冻结中显示解冻倒计时 */}
        {unfreezeText && (
          <Text
            style={{
              display: 'block',
              fontSize: 11 * wxScale,
              color: '#f59e0b',
              marginTop: 2 * wxScale,
            }}
          >
            {unfreezeText}后解冻
          </Text>
        )}
      </Box>

      {/* 金额 */}
      <Text
        style={{
          fontSize: 14 * wxScale,
          fontWeight: 600,
          color: isIncome ? '#10b981' : textSecondary,
          flexShrink: 0,
        }}
      >
        {isIncome ? '+' : ''}{formatMoney(record.amount)}
      </Text>
    </Box>
  )
}

// ============================================================================
// 辅助函数
// ============================================================================

function getRecordIcon(type: EarningsStatsRecord['type']) {
  switch (type) {
    case 'order':
      return ArrowUpRight
    case 'bonus':
      return Gift
    case 'withdraw':
      return ArrowDownRight
    case 'refund':
      return RefreshCw
    default:
      return ArrowUpRight
  }
}

/**
 * 格式化解冻倒计时
 * @param countdown 距离解冻的毫秒数
 * @returns 格式化后的字符串，如 "6天23小时" 或 "2小时30分钟"
 */
function formatUnfreezeCountdown(countdown?: number | null): string | null {
  if (!countdown || countdown <= 0) return null

  const days = Math.floor(countdown / (24 * 60 * 60 * 1000))
  const hours = Math.floor((countdown % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((countdown % (60 * 60 * 1000)) / (60 * 1000))

  if (days > 0) {
    return hours > 0 ? `${days}天${hours}小时` : `${days}天`
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
  }
  if (minutes > 0) {
    return `${minutes}分钟`
  }
  return '即将解冻'
}

/**
 * 调整颜色明暗度
 * @param color 原始颜色（hex格式）
 * @param amount 调整量（正数变亮，负数变暗）
 */
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
