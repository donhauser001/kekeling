/**
 * 陪诊员收入明细页面
 *
 * page key: 'workbench-earnings-list'
 * API: previewApi.getWorkbenchEarnings()
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text } from '../../../ui/primitives'
import {
  TrendingUp,
  TrendingDown,
  Gift,
  RefreshCw,
  ChevronLeft,
} from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'
import type { EarningsItem } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { formatMoney, safeNumber } from '../../../utils'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 类型定义
// ============================================================================

interface EarningsData {
  balance: number
  totalEarned: number
  totalWithdrawn: number
  pendingSettlement: number
  items: EarningsItem[]
  hasMore?: boolean
}

export interface EarningsPageProps {
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

export function EarningsPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onBack,
  onNavigate,
  onLogin,
}: EarningsPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  // 数据状态
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
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
      const data = await previewApi.getWorkbenchEarnings()
      setEarnings(data)
    } catch (err) {
      console.error('[EarningsPage] 加载失败:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [isEscort])

  const items = earnings?.items ?? []
  const isEmpty = !loading && items.length === 0

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

      {/* 收入概览卡片 */}
      {!loading && !error && earnings && (
        <Box style={{ padding: 16 * wxScale }}>
          <Box
            style={{
              borderRadius: 12 * wxScale,
              padding: 16 * wxScale,
              backgroundColor: primaryColor,
            }}
          >
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
                fontSize: 30 * wxScale,
                fontWeight: 700,
                color: '#fff',
                marginTop: 4 * wxScale,
              }}
            >
              ¥{formatMoney(earnings.balance)}
            </Text>

            {/* 统计指标 */}
            <Box
              style={{
                display: 'flex',
                gap: 16 * wxScale,
                marginTop: 16 * wxScale,
              }}
            >
              <Box style={{ flex: 1 }}>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 12 * wxScale,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  累计收入
                </Text>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 14 * wxScale,
                    fontWeight: 500,
                    color: '#fff',
                    marginTop: 2 * wxScale,
                  }}
                >
                  ¥{formatMoney(earnings.totalEarned)}
                </Text>
              </Box>
              <Box style={{ flex: 1 }}>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 12 * wxScale,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  累计提现
                </Text>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 14 * wxScale,
                    fontWeight: 500,
                    color: '#fff',
                    marginTop: 2 * wxScale,
                  }}
                >
                  ¥{formatMoney(earnings.totalWithdrawn)}
                </Text>
              </Box>
              <Box style={{ flex: 1 }}>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 12 * wxScale,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  待结算
                </Text>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 14 * wxScale,
                    fontWeight: 500,
                    color: '#fff',
                    marginTop: 2 * wxScale,
                  }}
                >
                  ¥{formatMoney(earnings.pendingSettlement)}
                </Text>
              </Box>
            </Box>

            {/* 提现按钮 */}
            <Box
              onClick={() => onNavigate?.('workbench-withdraw')}
              style={{
                marginTop: 16 * wxScale,
                width: '100%',
                paddingTop: 10 * wxScale,
                paddingBottom: 10 * wxScale,
                borderRadius: 9999,
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  fontWeight: 500,
                  color: primaryColor,
                }}
              >
                去提现
              </Text>
            </Box>
          </Box>
        </Box>
      )}

      {/* 内容区 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale }}>
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            fontWeight: 500,
            color: textPrimary,
            marginBottom: 12 * wxScale,
          }}
        >
          收支明细
        </Text>

        {/* 加载中 */}
        {loading && (
          <ListSkeleton count={5} variant="row" isDarkMode={isDarkMode} />
        )}

        {/* 请求失败 */}
        {error && !earnings && (
          <ErrorRetry
            onRetry={() => loadData()}
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
          />
        )}

        {/* 空态 */}
        {isEmpty && !error && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 48 * wxScale,
              paddingBottom: 48 * wxScale,
            }}
          >
            <Text style={{ fontSize: 48 * wxScale }}>📊</Text>
            <Text
              style={{
                display: 'block',
                fontSize: 14 * wxScale,
                color: textSecondary,
                marginTop: 12 * wxScale,
              }}
            >
              暂无收支记录
            </Text>
          </Box>
        )}

        {/* 收支列表 */}
        {!loading && !error && items.length > 0 && (
          <Box
            style={{
              borderRadius: 12 * wxScale,
              overflow: 'hidden',
              backgroundColor: cardBg,
            }}
          >
            {items.map((item, index) => (
              <EarningsItemRow
                key={item.id}
                item={item}
                themeSettings={themeSettings}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                borderColor={borderColor}
                isDarkMode={isDarkMode}
                isLast={index === items.length - 1}
              />
            ))}

            {/* 加载更多 */}
            {earnings?.hasMore && (
              <Box
                style={{
                  paddingTop: 12 * wxScale,
                  paddingBottom: 12 * wxScale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    color: primaryColor,
                  }}
                >
                  加载更多
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Box>

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
// 收支项子组件
// ============================================================================

interface EarningsItemRowProps {
  item: EarningsItem
  themeSettings: ThemeSettings
  textPrimary: string
  textSecondary: string
  borderColor: string
  isDarkMode: boolean
  isLast: boolean
}

function EarningsItemRow({
  item,
  themeSettings,
  textPrimary,
  textSecondary,
  borderColor,
  isDarkMode,
  isLast,
}: EarningsItemRowProps) {
  const isIncome = safeNumber(item.amount) > 0
  const IconComponent = getItemIcon(item.type)
  const iconColor = isIncome ? themeSettings.primaryColor : textSecondary
  const iconBg = isIncome
    ? `${themeSettings.primaryColor}20`
    : isDarkMode ? '#3a3a3a' : '#f3f4f6'

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale,
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
        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            color: textPrimary,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: textSecondary,
            marginTop: 2 * wxScale,
          }}
        >
          {item.createdAt}
          {item.orderNo && ` · ${item.orderNo}`}
        </Text>
      </Box>

      {/* 金额 */}
      <Text
        style={{
          fontSize: 14 * wxScale,
          fontWeight: 500,
          color: isIncome ? '#10b981' : textSecondary,
          flexShrink: 0,
        }}
      >
        {isIncome ? '+' : ''}{formatMoney(item.amount)}
      </Text>
    </Box>
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
