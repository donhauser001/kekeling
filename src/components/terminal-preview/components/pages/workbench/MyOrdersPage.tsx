/**
 * 我的订单页面（陪诊员端）- 按小程序页面改造规范实现
 *
 * 改造要点：
 * - 规则 1: 布局属性必须在 style 中定义
 * - 规则 2: className 仅作 Web 辅助
 * - 规则 3: wxScale 只用于视觉尺寸
 * - 规则 4: 数据获取用 useState + useEffect（不使用 useQuery）
 * - 规则 5: 图标用 size 和 color props
 * - 规则 9: 统一使用 lucide-compat 图标
 * - 规则 10: 文本块设置 display: block
 * - 规则 11: 小程序头部安全区域
 *
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon } from '../../../ui/primitives'
import { MapPin, Clock, ChevronRight, ChevronLeft, ClipboardList } from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'
import type { MyOrderItem } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { formatMoney } from '../../../utils'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 类型定义
// ============================================================================

export interface MyOrdersPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  pageParams?: Record<string, string>
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
  /** 显示登录弹窗回调 */
  onLogin?: () => void
}

/** 订单状态 Tab */
type OrderStatusTab = 'all' | 'pending' | 'ongoing' | 'completed' | 'cancelled'

const STATUS_TABS: { key: OrderStatusTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待服务' },
  { key: 'ongoing', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]

// ============================================================================
// 主组件
// ============================================================================

export function MyOrdersPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  pageParams,
  onBack,
  onNavigate,
  onLogin,
}: MyOrdersPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 状态管理（规则 4: 使用 useState + useEffect）
  const [orders, setOrders] = useState<MyOrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [activeTab, setActiveTab] = useState<OrderStatusTab>(
    (pageParams?.status as OrderStatusTab) || 'all'
  )

  // 颜色配置
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // ============================================================================
  // 数据加载（规则 4: 使用 useState + useEffect）
  // ============================================================================

  const loadData = async () => {
    if (!isEscort) return

    setLoading(true)
    setError(null)

    try {
      const response = await previewApi.getMyOrders({
        status: activeTab === 'all' ? undefined : activeTab,
      })
      setOrders(response?.items ?? [])
    } catch (err) {
      console.error('[MyOrdersPage] 加载数据失败:', err)
      setError(err instanceof Error ? err : new Error('加载失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [isEscort, activeTab])

  // ============================================================================
  // 非 escort 视角：显示权限提示
  // ============================================================================

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
        {/* 页面标题 */}
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
            我的订单
            </Text>
          </Box>
        </Box>

        {/* 权限提示 */}
        <Box style={{ flex: 1 }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号查看订单"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>
    )
  }

  const isEmpty = !loading && orders.length === 0

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 页面标题（规则 11: 预留安全区域） */}
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
          我的订单
          </Text>
        </Box>
      </Box>

      {/* 状态 Tab */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8 * wxScale,
          paddingRight: 8 * wxScale,
          paddingTop: 8 * wxScale,
          paddingBottom: 8 * wxScale,
          overflowX: 'auto',
          backgroundColor: cardBg,
        }}
      >
        {STATUS_TABS.map((tab) => (
          <Box
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 8 * wxScale,
              paddingBottom: 8 * wxScale,
              borderRadius: 9999,
              backgroundColor:
                activeTab === tab.key ? themeSettings.primaryColor : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 14 * wxScale,
                whiteSpace: 'nowrap',
                color:
                  activeTab === tab.key
                    ? '#fff'
                    : textSecondary,
            }}
          >
            {tab.label}
            </Text>
          </Box>
        ))}
      </Box>

      {/* 内容区 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
          paddingBottom: 16 * wxScale,
        }}
      >
        {/* 加载中骨架屏 */}
        {loading && (
          <ListSkeleton count={3} variant="card" isDarkMode={isDarkMode} />
        )}

        {/* 请求失败 - 带重试按钮 */}
        {error && !loading && (
          <ErrorRetry
            onRetry={loadData}
            isDarkMode={isDarkMode}
            primaryColor={themeSettings.primaryColor}
          />
        )}

        {/* 空态（规则 9: 使用 iconfont 图标，不用 emoji） */}
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
            <ClipboardList size={48 * wxScale} color={textSecondary} />
            <Text
              style={{
                display: 'block',
                marginTop: 12 * wxScale,
                fontSize: 14 * wxScale,
                color: textSecondary,
              }}
            >
              暂无{activeTab === 'all' ? '' : STATUS_TABS.find(t => t.key === activeTab)?.label}订单
            </Text>
          </Box>
        )}

        {/* 订单列表 */}
        {!loading && !error && orders.length > 0 && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12 * wxScale,
            }}
          >
            {orders.map((order) => (
              <MyOrderCard
                key={order.id}
                order={order}
                themeSettings={themeSettings}
                isDarkMode={isDarkMode}
                cardBg={cardBg}
                borderColor={borderColor}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                wxScale={wxScale}
                onViewDetail={() => {
                  onNavigate?.('workbench-my-order-detail', { id: order.id })
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}

// ============================================================================
// 订单卡片子组件
// ============================================================================

interface MyOrderCardProps {
  order: MyOrderItem
  themeSettings: ThemeSettings
  isDarkMode: boolean
  cardBg: string
  borderColor: string
  textPrimary: string
  textSecondary: string
  wxScale: number
  onViewDetail?: () => void
}

function MyOrderCard({
  order,
  themeSettings,
  isDarkMode,
  cardBg,
  borderColor,
  textPrimary,
  textSecondary,
  wxScale,
  onViewDetail,
}: MyOrderCardProps) {
  // 订单状态配置
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: '待服务', color: '#f59e0b' },
    accepted: { label: '已接单', color: '#3b82f6' },
    ongoing: { label: '进行中', color: '#10b981' },
    completed: { label: '已完成', color: '#6b7280' },
    cancelled: { label: '已取消', color: '#ef4444' },
  }

  const status = statusConfig[order.status] || { label: order.status, color: '#6b7280' }

  return (
    <Box
      onClick={onViewDetail}
      style={{
        borderRadius: 12 * wxScale,
        overflow: 'hidden',
        backgroundColor: cardBg,
      }}
    >
      {/* 头部 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: borderColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
          }}
        >
          {/* 服务类型标签 */}
          <Box
            style={{
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: themeSettings.primaryColor,
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: '#fff',
              }}
            >
              {order.serviceType === 'accompany' ? '全程陪诊' : order.serviceName}
            </Text>
          </Box>
          {/* 订单号 */}
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: textSecondary,
            }}
          >
              {order.orderNo}
          </Text>
        </Box>
        {/* 状态标签 */}
        <Box
          style={{
            paddingLeft: 8 * wxScale,
            paddingRight: 8 * wxScale,
            paddingTop: 2 * wxScale,
            paddingBottom: 2 * wxScale,
            borderRadius: 4 * wxScale,
            backgroundColor: `${status.color}20`,
          }}
        >
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: status.color,
            }}
          >
            {status.label}
          </Text>
        </Box>
      </Box>

      {/* 内容 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
        }}
      >
        {/* 服务名称 */}
        <Text
          style={{
            display: 'block',
            fontSize: 15 * wxScale,
            fontWeight: 500,
            color: textPrimary,
          }}
        >
          {order.serviceName}
        </Text>

        {/* 信息列表 */}
        <Box
          style={{
            marginTop: 8 * wxScale,
            display: 'flex',
            flexDirection: 'column',
            gap: 4 * wxScale,
          }}
        >
          {/* 医院信息 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
            }}
          >
            <MapPin size={16 * wxScale} color={themeSettings.primaryColor} />
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: isDarkMode ? '#d1d5db' : '#4b5563',
              }}
            >
              {order.hospitalName}
              {order.department && ` · ${order.department}`}
            </Text>
          </Box>
          {/* 预约时间 */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
            }}
          >
            <Clock size={16 * wxScale} color={themeSettings.primaryColor} />
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: isDarkMode ? '#d1d5db' : '#4b5563',
              }}
            >
              {order.appointmentTime}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* 底部 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderTopWidth: 1,
          borderTopStyle: 'solid',
          borderTopColor: borderColor,
        }}
      >
        {/* 金额 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 4 * wxScale,
          }}
      >
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: textSecondary,
            }}
          >
            订单金额
          </Text>
          <Text
            style={{
              fontSize: 18 * wxScale,
              fontWeight: 700,
              color: themeSettings.primaryColor,
            }}
          >
            ¥{formatMoney(order.amount)}
          </Text>
        </Box>
        {/* 查看详情 */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: themeSettings.primaryColor,
            }}
          >
          查看详情
          </Text>
          <ChevronRight size={16 * wxScale} color={themeSettings.primaryColor} />
        </Box>
      </Box>
    </Box>
  )
}
