/**
 * 分润记录页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/功能模块改造指南/小程序页面改造规范.md
 *
 * 功能特性：
 * - 完整分页支持（page, pageSize, total, hasMore）
 * - 时间范围筛选（全部/7天/30天）
 * - 状态筛选（全部/待结算/已结算）
 * - 下拉刷新
 * - 加载更多
 * - 骨架屏
 * - 空态
 * - 错误重试
 */

import { useState, useEffect, useCallback } from 'react'
import { Box, Text, Icon } from '../../../../ui/primitives'
import { previewApi } from '../../../../api'
import { formatMoney } from '../../../../utils'
import { PermissionPrompt } from '../../../PermissionPrompt'
import { 
  wxScale, 
  wxSafeAreaTop, 
  rangeOptions, 
  statusOptions,
  DEFAULT_PAGE_SIZE,
} from './constants'
import type { 
  DistributionRecordsPageProps, 
  DistributionRecord, 
  RangeFilter, 
  StatusFilter,
  PaginationState,
} from './types'
import { RecordsPageSkeleton, RecordCard } from './components'

// ============================================================================
// 组件实现
// ============================================================================

export function DistributionRecordsPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLogin,
  onBack,
}: DistributionRecordsPageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor

  // 颜色变量
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 数据状态
  const [records, setRecords] = useState<DistributionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // 筛选状态
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // 分页状态
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    hasMore: false,
  })

  // 统计数据
  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    settledAmount: 0,
  })

  // 获取分润记录数据
  const fetchRecords = useCallback(async (isLoadMore = false) => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const page = isLoadMore ? pagination.page + 1 : 1
      const data = await previewApi.getDistributionRecords({
        range: rangeFilter === 'all' ? undefined : rangeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        pageSize: pagination.pageSize,
      })

      const newRecords = data.items || []

      if (isLoadMore) {
        setRecords(prev => [...prev, ...newRecords])
      } else {
        setRecords(newRecords)
        // 计算统计数据
        calculateStats(newRecords)
      }

      setPagination({
        page,
        pageSize: pagination.pageSize,
        total: data.total || 0,
        hasMore: data.hasMore || false,
      })
      
      setError(false)
    } catch (err) {
      console.error('[DistributionRecordsPage] 加载失败:', err)
      if (!isLoadMore) {
        setError(true)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [isEscort, rangeFilter, statusFilter, pagination.page, pagination.pageSize])

  // 计算统计数据
  const calculateStats = (items: DistributionRecord[]) => {
    let totalAmount = 0
    let pendingAmount = 0
    let settledAmount = 0

    items.forEach(item => {
      totalAmount += item.amount
      if (item.status === 'pending') {
        pendingAmount += item.amount
      } else if (item.status === 'settled') {
        settledAmount += item.amount
      }
    })

    setStats({ totalAmount, pendingAmount, settledAmount })
  }

  // 初始加载和筛选变化时重新获取
  useEffect(() => {
    fetchRecords(false)
  }, [isEscort, rangeFilter, statusFilter])

  // 处理筛选变化
  const handleRangeChange = (filter: RangeFilter) => {
    if (filter !== rangeFilter) {
      setRangeFilter(filter)
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }

  const handleStatusChange = (filter: StatusFilter) => {
    if (filter !== statusFilter) {
      setStatusFilter(filter)
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }

  // 加载更多
  const handleLoadMore = () => {
    if (!loadingMore && pagination.hasMore) {
      fetchRecords(true)
    }
  }

  // 刷新
  const handleRefresh = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchRecords(false)
  }

  // 返回
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      onNavigate?.('distribution')
    }
  }

  // 非 escort 视角
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
          primaryColor={primaryColor} 
          onBack={handleBack} 
        />
        <Box style={{ flex: 1, padding: 16 * wxScale }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号查看分润记录"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={primaryColor}
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>
    )
  }

  // 加载中
  if (loading && records.length === 0) {
    return <RecordsPageSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
  }

  // 错误状态
  if (error && records.length === 0) {
    return (
      <Box style={{ minHeight: '100%', backgroundColor: bgColor }}>
        <PageHeader primaryColor={primaryColor} onBack={handleBack} />
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 80 * wxScale,
          }}
        >
          <Icon name="caution" size={56 * wxScale} color={textSecondary} />
          <Text
            style={{
              display: 'block',
              marginTop: 16 * wxScale,
              fontSize: 15 * wxScale,
              color: textSecondary,
            }}
          >
            加载失败
          </Text>
          <Box
            onClick={handleRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6 * wxScale,
              marginTop: 16 * wxScale,
              paddingLeft: 20 * wxScale,
              paddingRight: 20 * wxScale,
              paddingTop: 10 * wxScale,
              paddingBottom: 10 * wxScale,
              borderRadius: 20 * wxScale,
              backgroundColor: primaryColor,
            }}
          >
            <Icon name="refresh" size={16 * wxScale} color="#fff" />
            <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>重试</Text>
          </Box>
        </Box>
      </Box>
    )
  }

  // 主界面
  return (
    <Box style={{ minHeight: '100%', backgroundColor: bgColor }}>
      {/* 导航栏 */}
      <PageHeader primaryColor={primaryColor} onBack={handleBack} />

      {/* 统计卡片 */}
      <Box style={{ padding: 16 * wxScale, paddingBottom: 8 * wxScale }}>
        <Box
          style={{
            display: 'flex',
            borderRadius: 12 * wxScale,
            padding: 16 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <StatItem 
            label="总分润" 
            value={stats.totalAmount} 
            color={primaryColor}
            isDarkMode={isDarkMode}
          />
          <StatItem 
            label="待结算" 
            value={stats.pendingAmount} 
            color="#f59e0b"
            isDarkMode={isDarkMode}
          />
          <StatItem 
            label="已结算" 
            value={stats.settledAmount} 
            color="#10b981"
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>

      {/* 筛选器 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 8 * wxScale,
          paddingBottom: 12 * wxScale,
        }}
      >
        {/* 时间范围筛选 */}
        <Box style={{ display: 'flex', gap: 8 * wxScale, marginBottom: 10 * wxScale }}>
          {rangeOptions.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              selected={rangeFilter === option.value}
              onClick={() => handleRangeChange(option.value as RangeFilter)}
              primaryColor={primaryColor}
              isDarkMode={isDarkMode}
            />
          ))}
        </Box>

        {/* 状态筛选 */}
        <Box style={{ display: 'flex', gap: 8 * wxScale }}>
          {statusOptions.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              selected={statusFilter === option.value}
              onClick={() => handleStatusChange(option.value as StatusFilter)}
              primaryColor={primaryColor}
              isDarkMode={isDarkMode}
            />
          ))}
        </Box>
      </Box>

      {/* 记录数量提示 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingBottom: 8 * wxScale,
        }}
      >
        <Text style={{ fontSize: 13 * wxScale, color: textSecondary }}>
          共 {pagination.total} 条记录
        </Text>
      </Box>

      {/* 记录列表 */}
      <Box style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale }}>
        {records.length === 0 ? (
          <EmptyState 
            onNavigate={onNavigate} 
            primaryColor={primaryColor}
            textSecondary={textSecondary}
          />
        ) : (
          <Box
            style={{
              borderRadius: 12 * wxScale,
              overflow: 'hidden',
              backgroundColor: cardBg,
            }}
          >
            {records.map((record, index) => (
              <RecordCard
                key={record.id}
                record={record}
                primaryColor={primaryColor}
                isDarkMode={isDarkMode}
                showDivider={index < records.length - 1}
              />
            ))}
          </Box>
        )}

        {/* 加载更多 */}
        {records.length > 0 && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 16 * wxScale,
              paddingBottom: 16 * wxScale,
            }}
          >
            {loadingMore ? (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
                <Icon name="loading-four" size={16 * wxScale} color={textSecondary} />
                <Text style={{ fontSize: 13 * wxScale, color: textSecondary }}>
                  加载中...
                </Text>
              </Box>
            ) : pagination.hasMore ? (
              <Box
                onClick={handleLoadMore}
                style={{
                  paddingLeft: 24 * wxScale,
                  paddingRight: 24 * wxScale,
                  paddingTop: 10 * wxScale,
                  paddingBottom: 10 * wxScale,
                  borderRadius: 20 * wxScale,
                  backgroundColor: `${primaryColor}10`,
                }}
              >
                <Text style={{ fontSize: 14 * wxScale, color: primaryColor, fontWeight: 500 }}>
                  加载更多
                </Text>
              </Box>
            ) : records.length > 0 ? (
              <Text style={{ fontSize: 13 * wxScale, color: textSecondary }}>
                — 已加载全部 —
              </Text>
            ) : null}
          </Box>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 32 * wxScale }} />
    </Box>
  )
}

// ============================================================================
// 子组件：页面头部
// ============================================================================

interface PageHeaderProps {
  primaryColor: string
  onBack: () => void
}

function PageHeader({ primaryColor, onBack }: PageHeaderProps) {
  return (
    <Box
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: primaryColor,
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
          <Icon name="left" size={22 * wxScale} color="#fff" />
        </Box>
        <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
          分润记录
        </Text>
      </Box>
    </Box>
  )
}

// ============================================================================
// 子组件：统计项
// ============================================================================

interface StatItemProps {
  label: string
  value: number
  color: string
  isDarkMode: boolean
}

function StatItem({ label, value, color, isDarkMode }: StatItemProps) {
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  return (
    <Box style={{ flex: 1, textAlign: 'center' }}>
      <Text
        style={{
          display: 'block',
          fontSize: 12 * wxScale,
          color: textSecondary,
          marginBottom: 4 * wxScale,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          display: 'block',
          fontSize: 18 * wxScale,
          fontWeight: 600,
          color: color,
        }}
      >
        ¥{formatMoney(value)}
      </Text>
    </Box>
  )
}

// ============================================================================
// 子组件：筛选标签
// ============================================================================

interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
  primaryColor: string
  isDarkMode: boolean
}

function FilterChip({ label, selected, onClick, primaryColor, isDarkMode }: FilterChipProps) {
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const chipBg = isDarkMode ? '#2a2a2a' : '#fff'

  return (
    <Box
      onClick={onClick}
      style={{
        paddingLeft: 14 * wxScale,
        paddingRight: 14 * wxScale,
        paddingTop: 7 * wxScale,
        paddingBottom: 7 * wxScale,
        borderRadius: 18 * wxScale,
        backgroundColor: selected ? primaryColor : chipBg,
        transition: 'all 0.2s',
      }}
    >
      <Text
        style={{
          fontSize: 13 * wxScale,
          fontWeight: selected ? 500 : 400,
          color: selected ? '#fff' : textSecondary,
        }}
      >
        {label}
      </Text>
    </Box>
  )
}

// ============================================================================
// 子组件：空状态
// ============================================================================

interface EmptyStateProps {
  onNavigate?: (page: string, params?: Record<string, string>) => void
  primaryColor: string
  textSecondary: string
}

function EmptyState({ onNavigate, primaryColor, textSecondary }: EmptyStateProps) {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64 * wxScale,
        paddingBottom: 64 * wxScale,
      }}
    >
      <Icon name="transaction-order" size={56 * wxScale} color={textSecondary} />
      <Text
        style={{
          display: 'block',
          marginTop: 16 * wxScale,
          fontSize: 15 * wxScale,
          color: textSecondary,
        }}
      >
        暂无分润记录
      </Text>
      <Text
        style={{
          display: 'block',
          marginTop: 8 * wxScale,
          fontSize: 13 * wxScale,
          color: textSecondary,
        }}
      >
        邀请团队成员开始赚取分润
      </Text>
      <Box
        onClick={() => onNavigate?.('distribution-invite')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6 * wxScale,
          marginTop: 20 * wxScale,
          paddingLeft: 20 * wxScale,
          paddingRight: 20 * wxScale,
          paddingTop: 10 * wxScale,
          paddingBottom: 10 * wxScale,
          borderRadius: 20 * wxScale,
          backgroundColor: primaryColor,
        }}
      >
        <Icon name="peoples" size={16 * wxScale} color="#fff" />
        <Text style={{ fontSize: 14 * wxScale, color: '#fff', fontWeight: 500 }}>
          邀请好友
        </Text>
      </Box>
    </Box>
  )
}
