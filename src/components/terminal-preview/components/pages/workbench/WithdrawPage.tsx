/**
 * 陪诊员提现记录页面
 *
 * page key: 'workbench-withdraw-records'
 * API: previewApi.getWithdrawRecords()
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * 功能：
 * - 提现记录列表
 * - 筛选（全部/处理中/已完成/失败）
 * - 空态展示
 *
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text } from '../../../ui/primitives'
import {
  ArrowDownRight,
  ChevronLeft,
  FileText,
} from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'
import type { WithdrawRecord } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { formatMoney } from '../../../utils'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

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

type FilterType = 'all' | 'pending' | 'completed' | 'failed'

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
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  // 筛选状态
  const [filter, setFilter] = useState<FilterType>('all')

  // 数据状态（规则4：使用 useState + useEffect）
  const [records, setRecords] = useState<WithdrawRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // 加载数据
  useEffect(() => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    loadRecords()
  }, [isEscort, filter])

  const loadRecords = () => {
    setLoading(true)
    setError(false)

    previewApi.getWithdrawRecords({ status: filter === 'all' ? undefined : filter })
      .then((data) => {
        setRecords(data.items || [])
      })
      .catch((err) => {
        console.error('[WithdrawPage] 加载提现记录失败:', err)
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
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
          title="提现记录"
          themeSettings={themeSettings}
          onBack={onBack}
        />
        <Box style={{ flex: 1 }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号查看提现记录"
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
        title="提现记录"
        themeSettings={themeSettings}
        onBack={onBack}
      />

      {/* 筛选标签 */}
      <FilterTabs
        filter={filter}
        setFilter={setFilter}
        themeSettings={themeSettings}
        isDarkMode={isDarkMode}
      />

      {/* 加载中 - 骨架屏 */}
      {loading && (
        <Box style={{ padding: 16 * wxScale }}>
          <ListSkeleton count={5} variant="card" isDarkMode={isDarkMode} />
        </Box>
      )}

      {/* 请求失败 - 带重试按钮 */}
      {error && !loading && (
        <ErrorRetry
          onRetry={loadRecords}
          isDarkMode={isDarkMode}
          primaryColor={primaryColor}
        />
      )}

      {/* 内容区 */}
      {!loading && !error && (
        <RecordsList
          records={records}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
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
// 筛选标签
// ============================================================================

interface FilterTabsProps {
  filter: FilterType
  setFilter: (value: FilterType) => void
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function FilterTabs({ filter, setFilter, themeSettings, isDarkMode }: FilterTabsProps) {
  const primaryColor = themeSettings.primaryColor
  const tabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '处理中' },
    { key: 'completed', label: '已完成' },
    { key: 'failed', label: '失败' },
  ]

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12 * wxScale,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale,
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
    >
      {tabs.map((tab) => {
        const isActive = filter === tab.key
        return (
          <Box
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
              paddingTop: 6 * wxScale,
              paddingBottom: 6 * wxScale,
              borderRadius: 16 * wxScale,
              backgroundColor: isActive ? primaryColor : 'transparent',
              cursor: 'pointer',
            }}
          >
            <Text
              style={{
                fontSize: 13 * wxScale,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#fff' : (isDarkMode ? '#9ca3af' : '#6b7280'),
              }}
            >
              {tab.label}
            </Text>
          </Box>
        )
      })}
    </Box>
  )
}

// ============================================================================
// 记录列表
// ============================================================================

interface RecordsListProps {
  records: WithdrawRecord[]
  themeSettings: ThemeSettings
  isDarkMode: boolean
  cardBg: string
  textPrimary: string
  textSecondary: string
  borderColor: string
}

function RecordsList({
  records,
  themeSettings,
  isDarkMode,
  cardBg,
  textPrimary,
  textSecondary,
  borderColor,
}: RecordsListProps) {
  const primaryColor = themeSettings.primaryColor

  if (records.length === 0) {
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 80 * wxScale,
          paddingBottom: 80 * wxScale,
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
            marginTop: 16 * wxScale,
          }}
        >
          暂无提现记录
        </Text>
      </Box>
    )
  }

  return (
    <Box style={{ padding: 16 * wxScale }}>
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
            isDarkMode={isDarkMode}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            borderColor={borderColor}
            isLast={index === records.length - 1}
          />
        ))}
      </Box>
    </Box>
  )
}

// ============================================================================
// 记录行
// ============================================================================

interface WithdrawRecordRowProps {
  record: WithdrawRecord
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
            gap: 8 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: textPrimary,
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
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: textSecondary,
            marginTop: 2 * wxScale,
          }}
        >
          {record.createdAt}
        </Text>
      </Box>

      {/* 金额 */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          flexShrink: 0,
        }}
      >
        <Text
          style={{
            fontSize: 14 * wxScale,
            fontWeight: 600,
            color: textSecondary,
          }}
        >
          -¥{formatMoney(record.amount)}
        </Text>
        {record.actualAmount && record.actualAmount !== record.amount && (
          <Text
            style={{
              fontSize: 11 * wxScale,
              color: textSecondary,
              marginTop: 2 * wxScale,
            }}
          >
            实际 ¥{formatMoney(record.actualAmount)}
          </Text>
        )}
      </Box>
    </Box>
  )
}
