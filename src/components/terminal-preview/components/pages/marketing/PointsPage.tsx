/**
 * 积分首页（预览器版本）
 *
 * Step 7 批次 B: points
 * - page key: 'points'
 * - API: previewApi.getMyPoints()
 * - 数据通道: userRequest
 */

import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings } from '../../../types'
import { previewApi, type PointsInfo } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface PointsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onNavigate?: (page: string) => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function PointsPage({ themeSettings, isDarkMode, onNavigate }: PointsPageProps) {
  // 获取积分信息
  const {
    data: pointsInfo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'points', 'my'],
    queryFn: previewApi.getMyPoints,
    staleTime: 60 * 1000,
  })

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 页面标题 */}
      <div
        className="px-4 py-3"
        style={{
          backgroundColor: themeSettings.primaryColor,
        }}
      >
        <h1 className="text-lg font-semibold text-white text-center">
          我的积分
        </h1>
      </div>

      {/* 积分卡片 */}
      <div className="px-4 py-4">
        {/* 加载中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 text-sm">加载中...</div>
          </div>
        )}

        {/* 请求失败 */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-2">😔</div>
            <div className="text-gray-400 text-sm">加载失败，请稍后重试</div>
          </div>
        )}

        {/* 积分信息 */}
        {!isLoading && !isError && pointsInfo && (
          <>
            {/* 积分卡片 */}
            <PointsCard
              pointsInfo={pointsInfo}
              themeSettings={themeSettings}
              isDarkMode={isDarkMode}
              onViewRecords={() => onNavigate?.('points-records')}
            />

            {/* 积分任务 */}
            <div className="mt-4">
              <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                赚取积分
              </div>
              <div className="space-y-2">
                {POINTS_TASKS.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    themeSettings={themeSettings}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </div>

            {/* 积分商城入口 */}
            <div className="mt-4">
              <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                积分兑换
              </div>
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      积分商城
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      用积分兑换精美礼品
                    </div>
                  </div>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  →
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}

// ============================================================================
// 积分卡片子组件
// ============================================================================

interface PointsCardProps {
  pointsInfo: PointsInfo
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onViewRecords?: () => void
}

function PointsCard({ pointsInfo, themeSettings, onViewRecords }: PointsCardProps) {
  return (
    <div
      className="rounded-xl p-4 text-white"
      style={{
        background: `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${adjustColor(themeSettings.primaryColor, -30)} 100%)`,
      }}
    >
      {/* 积分余额 */}
      <div className="text-center mb-4">
        <div className="text-sm opacity-80 mb-1">当前积分</div>
        <div className="text-4xl font-bold">{pointsInfo.balance}</div>
      </div>

      {/* 积分统计 */}
      <div className="flex justify-around border-t border-white/20 pt-3">
        <div className="text-center">
          <div className="text-lg font-semibold">{pointsInfo.totalEarned}</div>
          <div className="text-xs opacity-80">累计获得</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">{pointsInfo.totalUsed}</div>
          <div className="text-xs opacity-80">累计使用</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">{pointsInfo.expiringSoon}</div>
          <div className="text-xs opacity-80">即将过期</div>
        </div>
      </div>

      {/* 查看明细按钮 */}
      <button
        onClick={onViewRecords}
        className="w-full mt-4 py-2 bg-white/20 rounded-full text-sm"
      >
        查看积分明细 →
      </button>
    </div>
  )
}

// ============================================================================
// 任务项子组件
// ============================================================================

interface TaskItemProps {
  task: PointsTask
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

function TaskItem({ task, themeSettings, isDarkMode }: TaskItemProps) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg"
      style={{
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{task.icon}</span>
        <div>
          <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {task.name}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            +{task.points} 积分
          </div>
        </div>
      </div>
      <button
        className="px-3 py-1 rounded-full text-xs text-white"
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        {task.completed ? '已完成' : '去完成'}
      </button>
    </div>
  )
}

// ============================================================================
// 辅助函数
// ============================================================================

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// ============================================================================
// 类型与常量
// ============================================================================

interface PointsTask {
  id: string
  name: string
  icon: string
  points: number
  completed: boolean
}

const POINTS_TASKS: PointsTask[] = [
  { id: '1', name: '每日签到', icon: '📅', points: 10, completed: false },
  { id: '2', name: '完善个人信息', icon: '👤', points: 50, completed: true },
  { id: '3', name: '完成首单', icon: '🛒', points: 100, completed: false },
  { id: '4', name: '邀请好友', icon: '👥', points: 200, completed: false },
]

