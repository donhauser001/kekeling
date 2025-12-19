/**
 * 陪诊员工作台首页（按小程序页面改造规范实现）
 *
 * 改造要点：
 * - 规则 1: 布局属性必须在 style 中定义
 * - 规则 2: className 仅作 Web 辅助
 * - 规则 3: wxScale 只用于视觉尺寸
 * - 规则 4: 数据获取用 useState + useEffect（不使用 useQuery）
 * - 规则 5: 图标用 size 和 color props
 * - 规则 9: 统一使用 lucide-compat 图标
 * - 规则 12: 大文件拆分为多个子组件
 *
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect } from 'react'
import { Box, Text } from '../../../ui/primitives'
import { LogOut } from '../../../ui/lucide-compat'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { ListSkeleton } from '../../ListSkeleton'
import { ErrorRetry } from '../../ErrorRetry'
import { ProfileCard } from './components/ProfileCard'
import { TodayOverview } from './components/TodayOverview'
import { QuickEntries } from './components/QuickEntries'
import { IncomeOverview } from './components/IncomeOverview'
import type {
  WorkbenchPageProps,
  WorkbenchStatsData,
  EscortProfileData,
  EscortWorkStatus,
} from './types'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 主组件
// ============================================================================

export function WorkbenchPage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onExitEscortMode,
  onLogin,
}: WorkbenchPageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // 状态管理
  const [profile, setProfile] = useState<EscortProfileData | null>(null)
  const [stats, setStats] = useState<WorkbenchStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [workStatus, setWorkStatus] = useState<EscortWorkStatus>('resting')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // 颜色配置
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'

  // ============================================================================
  // 数据加载（规则 4: 使用 useState + useEffect）
  // ============================================================================

  const loadData = async () => {
    if (!isEscort) return

    setLoading(true)
    setError(null)

    try {
      // 并发请求陪诊员资料和统计数据
      const [profileRes, statsRes] = await Promise.all([
        previewApi.getEscortProfile(),
        previewApi.getWorkbenchStats(),
      ])

      if (profileRes) {
        setProfile(profileRes as EscortProfileData)
        // 设置初始工作状态
        const profileData = profileRes as EscortProfileData
        if (profileData.workStatus) {
          setWorkStatus(profileData.workStatus)
        }
      }

      if (statsRes) {
        // 转换后端返回的数据格式
        setStats({
          todayOrders: statsRes.pendingOrders + statsRes.ongoingOrders + statsRes.completedOrders,
          pendingOrders: statsRes.pendingOrders,
          completedOrders: statsRes.completedOrders,
          monthEarnings: statsRes.monthIncome || 0,
          poolOrders: 0, // 后端暂无此字段
          rating: statsRes.rating || 5.0,
          ratingCount: statsRes.orderCount || 0,
          totalOrders: statsRes.orderCount || 0,
          balance: statsRes.withdrawable || 0,
        })
      }
    } catch (err) {
      console.error('[WorkbenchPage] 加载数据失败:', err)
      setError(err instanceof Error ? err : new Error('加载失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [isEscort])

  // ============================================================================
  // 状态切换
  // ============================================================================

  const handleStatusChange = async (newStatus: EscortWorkStatus) => {
    if (updatingStatus || newStatus === workStatus) return

    setUpdatingStatus(true)
    const oldStatus = workStatus
    setWorkStatus(newStatus) // 乐观更新

    try {
      await previewApi.updateWorkbenchSettings({
        onlineStatus: newStatus === 'working' ? 'online' : newStatus === 'busy' ? 'busy' : 'rest',
      })
    } catch (err) {
      console.error('[WorkbenchPage] 更新状态失败:', err)
      setWorkStatus(oldStatus) // 回滚
    } finally {
      setUpdatingStatus(false)
    }
  }

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
        <Box style={{ flex: 1 }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号访问工作台"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={themeSettings.primaryColor}
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>
    )
  }

  // ============================================================================
  // 加载中骨架屏
  // ============================================================================

  if (loading) {
  return (
      <Box
      style={{
          minHeight: '100%',
          backgroundColor: bgColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 16 * wxScale,
          }}
        >
          <ListSkeleton count={1} variant="detail" isDarkMode={isDarkMode} />
        </Box>
      </Box>
  )
}

// ============================================================================
  // 加载失败
// ============================================================================

  if (error) {
  return (
      <Box
        style={{
          minHeight: '100%',
          backgroundColor: bgColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
        style={{
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 16 * wxScale,
          }}
        >
          <ErrorRetry
            onRetry={loadData}
            isDarkMode={isDarkMode}
            primaryColor={themeSettings.primaryColor}
          />
        </Box>
      </Box>
  )
}

// ============================================================================
  // 正常渲染
// ============================================================================

  // 构造默认数据
  const displayProfile: EscortProfileData = profile || {
    id: '',
    name: '陪诊员',
    phone: '',
    rating: 5.0,
    orderCount: 0,
    workStatus: 'resting',
  }

  const displayStats: WorkbenchStatsData = stats || {
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthEarnings: 0,
    poolOrders: 0,
    rating: 5.0,
    ratingCount: 0,
    totalOrders: 0,
    balance: 0,
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
      >
      {/* 内容区 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: (wxSafeAreaTop + 16) * wxScale,
          paddingBottom: 16 * wxScale,
        }}
      >
        {/* 个人信息卡 */}
        <ProfileCard
          profile={displayProfile}
          stats={displayStats}
          workStatus={workStatus}
          onStatusChange={handleStatusChange}
          onSettingsClick={() => onNavigate?.('workbench-settings')}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          wxScale={wxScale}
        />

        {/* 今日概览 */}
        <TodayOverview
          stats={displayStats}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          wxScale={wxScale}
        />

        {/* 快捷入口 */}
        <QuickEntries
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          wxScale={wxScale}
          onNavigate={onNavigate}
        />

        {/* 收入概览 */}
        <IncomeOverview
          stats={displayStats}
          themeSettings={themeSettings}
          isDarkMode={isDarkMode}
          wxScale={wxScale}
          onWithdraw={() => onNavigate?.('workbench-withdraw')}
        />

        {/* 退出按钮 */}
        <Box
          onClick={onExitEscortMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8 * wxScale,
            marginTop: 24 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            borderRadius: 12 * wxScale,
            backgroundColor: '#ef4444',
          }}
        >
          <LogOut size={16 * wxScale} color="#fff" />
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: '#fff',
            }}
          >
            退出陪诊员模式
          </Text>
        </Box>
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}

// 重新导出类型
export type { WorkbenchPageProps } from './types'
