/**
 * 积分首页（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Button/Icon
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: emoji → Icon 组件
 * - 规则 4.1: 添加骨架屏
 */

import { useState, useEffect, useMemo } from 'react'
import { Box, Text, Button, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import type { ThemeSettings, PointsDataOverride, PointRuleOverride } from '../../../types'
import { previewApi } from '../../../api'
import type { PointsInfo } from '../../../api'

// ============================================================================
// 常量定义
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// 积分任务配置（emoji → iconfont）
const POINTS_TASKS: PointsTask[] = [
  { id: '1', name: '每日签到', icon: 'time', points: 10, completed: false },
  { id: '2', name: '完善个人信息', icon: 'user', points: 50, completed: true },
  { id: '3', name: '完成首单', icon: 'shopping-cart-one', points: 100, completed: false },
  { id: '4', name: '邀请好友', icon: 'peoples', points: 200, completed: false },
]

// ============================================================================
// 类型定义
// ============================================================================

export interface PointsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
  onNavigate?: (page: string) => void
  /** 积分数据覆盖（管理后台实时预览用） */
  pointsOverride?: PointsDataOverride
}

interface PointsTask {
  id: string
  name: string
  icon: string
  points: number
  completed: boolean
}

// ============================================================================
// 骨架屏组件
// ============================================================================

function PointsPageSkeleton({
  primaryColor,
  isDarkMode,
}: {
  primaryColor: string
  isDarkMode: boolean
}) {
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const skeletonBg = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  const skeletonStyle = {
    animation: 'pulse 1.5s ease-in-out infinite',
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 顶部导航栏骨架 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          <Box
            style={{
              width: 80 * wxScale,
              height: 20 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: 'rgba(255,255,255,0.3)',
              ...skeletonStyle,
            }}
          />
        </Box>
      </Box>

      {/* 积分卡片骨架 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
        }}
      >
        <Box
          style={{
            borderRadius: 12 * wxScale,
            padding: 16 * wxScale,
            backgroundColor: skeletonBg,
            ...skeletonStyle,
          }}
        >
          {/* 积分余额 */}
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 16 * wxScale,
            }}
          >
            <Box
              style={{
                width: 60 * wxScale,
                height: 14 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
                marginBottom: 8 * wxScale,
              }}
            />
            <Box
              style={{
                width: 100 * wxScale,
                height: 36 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />
          </Box>

          {/* 统计骨架 */}
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: 12 * wxScale,
            }}
          >
            {[1, 2, 3].map(item => (
              <Box
                key={item}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  style={{
                    width: 40 * wxScale,
                    height: 20 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    marginBottom: 4 * wxScale,
                  }}
                />
                <Box
                  style={{
                    width: 48 * wxScale,
                    height: 12 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* 任务列表骨架 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 24 * wxScale,
        }}
      >
        <Box
          style={{
            width: 80 * wxScale,
            height: 16 * wxScale,
            borderRadius: 4 * wxScale,
            backgroundColor: skeletonBg,
            marginBottom: 12 * wxScale,
            ...skeletonStyle,
          }}
        />
        {[1, 2, 3, 4].map(item => (
          <Box
            key={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: cardBg,
              marginBottom: 8 * wxScale,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
              <Box
                style={{
                  width: 32 * wxScale,
                  height: 32 * wxScale,
                  borderRadius: 16 * wxScale,
                  backgroundColor: skeletonBg,
                  ...skeletonStyle,
                }}
              />
              <Box>
                <Box
                  style={{
                    width: 80 * wxScale,
                    height: 14 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: skeletonBg,
                    marginBottom: 4 * wxScale,
                    ...skeletonStyle,
                  }}
                />
                <Box
                  style={{
                    width: 60 * wxScale,
                    height: 12 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: skeletonBg,
                    ...skeletonStyle,
                  }}
                />
              </Box>
            </Box>
            <Box
              style={{
                width: 60 * wxScale,
                height: 28 * wxScale,
                borderRadius: 14 * wxScale,
                backgroundColor: skeletonBg,
                ...skeletonStyle,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// ============================================================================
// 积分卡片子组件
// ============================================================================

interface PointsCardProps {
  pointsInfo: PointsInfo
  themeSettings: ThemeSettings
  onViewRecords?: () => void
}

function PointsCard({ pointsInfo, themeSettings, onViewRecords }: PointsCardProps) {
  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        color: '#ffffff',
        background: `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${adjustColor(themeSettings.primaryColor, -30)} 100%)`,
      }}
    >
      {/* 积分余额 */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 16 * wxScale,
        }}
      >
        <Text
          style={{
            fontSize: 14 * wxScale,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: 4 * wxScale,
          }}
        >
          当前积分
        </Text>
        <Text
          style={{
            fontSize: 36 * wxScale,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          {pointsInfo.balance}
        </Text>
      </Box>

      {/* 积分统计 */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: 12 * wxScale,
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 18 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {pointsInfo.totalEarned}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            累计获得
          </Text>
        </Box>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 18 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {pointsInfo.totalUsed}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            累计使用
          </Text>
        </Box>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 18 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {pointsInfo.expiringSoon}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            即将过期
          </Text>
        </Box>
      </Box>

      {/* 查看明细按钮 */}
      <Button
        onClick={onViewRecords}
        style={{
          width: '100%',
          marginTop: 16 * wxScale,
          paddingTop: 8 * wxScale,
          paddingBottom: 8 * wxScale,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 9999,
        }}
      >
        <Text style={{ fontSize: 14 * wxScale, color: '#ffffff' }}>
          查看积分明细 →
        </Text>
      </Button>
    </Box>
  )
}

// ============================================================================
// 任务项子组件
// ============================================================================

interface TaskItemProps {
  task: PointsTask
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onTaskClick?: (taskId: string) => void
}

function TaskItem({ task, themeSettings, isDarkMode, onTaskClick }: TaskItemProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  const handleClick = () => {
    if (!task.completed && onTaskClick) {
      onTaskClick(task.id)
    }
  }

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12 * wxScale,
        borderRadius: 8 * wxScale,
        backgroundColor: cardBg,
        marginBottom: 8 * wxScale,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
        <Icon name={task.icon as any} size={24 * wxScale} color={themeSettings.primaryColor} />
        <Box>
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: textPrimary,
            }}
          >
            {task.name}
          </Text>
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: textSecondary,
            }}
          >
            +{task.points} 积分
          </Text>
        </Box>
      </Box>
      <Button
        onClick={handleClick}
        style={{
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: isWxEnvironment() ? 4 * wxScale : 4,
          paddingBottom: isWxEnvironment() ? 4 * wxScale : 4,
          borderRadius: 9999,
          backgroundColor: task.completed ? '#9ca3af' : themeSettings.primaryColor,
          opacity: task.completed ? 0.6 : 1,
        }}
      >
        <Text style={{ fontSize: 12 * wxScale, color: '#ffffff' }}>
          {task.completed ? '已完成' : '去完成'}
        </Text>
      </Button>
    </Box>
  )
}

// ============================================================================
// 积分规则项子组件（管理后台预览用）
// ============================================================================

interface RuleItemProps {
  rule: PointRuleOverride
  isDarkMode: boolean
}

function RuleItem({ rule, isDarkMode }: RuleItemProps) {
  const isEarn = rule.type === 'earn'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12 * wxScale,
        borderRadius: 8 * wxScale,
        backgroundColor: cardBg,
        marginBottom: 8 * wxScale,
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
        <Icon
          name={isEarn ? 'download' : 'upload'}
          size={24 * wxScale}
          color={isEarn ? '#22c55e' : '#ef4444'}
        />
        <Box>
          <Text
            style={{
              fontSize: 14 * wxScale,
              color: textPrimary,
            }}
          >
            {rule.name}
          </Text>
          {rule.description && (
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: textSecondary,
              }}
            >
              {rule.description}
            </Text>
          )}
        </Box>
      </Box>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
        <Text
          style={{
            fontSize: 14 * wxScale,
            fontWeight: 500,
            color: isEarn ? '#22c55e' : '#ef4444',
          }}
        >
          {isEarn ? '+' : '-'}{rule.points} 积分
        </Text>
        {rule.isActive === false && (
          <Box
            style={{
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: '#e5e7eb',
            }}
          >
            <Text style={{ fontSize: 12 * wxScale, color: '#6b7280' }}>
              已禁用
            </Text>
          </Box>
        )}
      </Box>
    </Box>
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
// 主组件
// ============================================================================

export function PointsPage({
  themeSettings,
  isDarkMode,
  onBack,
  onNavigate,
  pointsOverride,
}: PointsPageProps) {
  // ============================================================================
  // 数据状态（规则 4: useState + useEffect 替代 useQuery）
  // ============================================================================
  const [apiPointsInfo, setApiPointsInfo] = useState<PointsInfo | null>(null)
  const [isLoading, setIsLoading] = useState(!pointsOverride)
  const [isError, setIsError] = useState(false)

  // 获取积分信息
  useEffect(() => {
    if (pointsOverride) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)

    previewApi.getMyPoints()
      .then(data => {
        setApiPointsInfo(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[PointsPage] 加载积分信息失败:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }, [pointsOverride])

  // 重试加载
  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)

    previewApi.getMyPoints()
      .then(data => {
        setApiPointsInfo(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[PointsPage] 重试加载失败:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }

  // 合并数据：覆盖优先
  const pointsInfo = useMemo<PointsInfo | null>(() => {
    if (pointsOverride) {
      return {
        balance: pointsOverride.balance ?? 0,
        totalEarned: 0,
        totalUsed: 0,
        expiringSoon: 0,
      }
    }
    return apiPointsInfo
  }, [pointsOverride, apiPointsInfo])

  // 积分规则（覆盖数据）
  const overrideRules = pointsOverride?.rules

  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const primaryColor = themeSettings.primaryColor

  // 加载中显示骨架屏
  if (isLoading) {
    return (
      <PointsPageSkeleton
        primaryColor={primaryColor}
        isDarkMode={isDarkMode}
      />
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
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          {/* 返回按钮 */}
          <Box
            onClick={onBack}
            style={{
              width: 32 * wxScale,
              height: 32 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="left" size={20 * wxScale} color="#fff" />
          </Box>

          {/* 标题 */}
          <Text
            style={{
              fontSize: 16 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            我的积分
          </Text>

          {/* 占位 */}
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      {/* 积分卡片区 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
        }}
      >
        {/* 请求失败 - 带重试按钮 */}
        {isError && (
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
            <Icon name="close-one" size={48 * wxScale} color="#ef4444" />
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: textMuted,
                marginTop: 12 * wxScale,
              }}
            >
              加载失败，请重试
            </Text>
            <Button
              onClick={handleRetry}
              style={{
                marginTop: 16 * wxScale,
                paddingLeft: 24 * wxScale,
                paddingRight: 24 * wxScale,
                paddingTop: isWxEnvironment() ? 8 * wxScale : 6,
                paddingBottom: isWxEnvironment() ? 8 * wxScale : 6,
                borderRadius: 9999,
                backgroundColor: primaryColor,
              }}
            >
              <Text style={{ fontSize: 14 * wxScale, color: '#ffffff' }}>
                重新加载
              </Text>
            </Button>
          </Box>
        )}

        {/* 积分信息 */}
        {!isError && pointsInfo && (
          <>
            {/* 积分卡片 */}
            <PointsCard
              pointsInfo={pointsInfo}
              themeSettings={themeSettings}
              onViewRecords={() => onNavigate?.('points-records')}
            />

            {/* 积分规则或积分任务 */}
            <Box style={{ marginTop: 24 * wxScale }}>
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  fontWeight: 500,
                  color: textPrimary,
                  marginBottom: 12 * wxScale,
                }}
              >
                {overrideRules ? '积分规则' : '赚取积分'}
              </Text>
              <Box>
                {overrideRules ? (
                  // 显示覆盖的积分规则
                  overrideRules.map((rule) => (
                    <RuleItem
                      key={rule.id}
                      rule={rule}
                      isDarkMode={isDarkMode}
                    />
                  ))
                ) : (
                  // 显示默认积分任务
                  POINTS_TASKS.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      themeSettings={themeSettings}
                      isDarkMode={isDarkMode}
                      onTaskClick={(taskId) => {
                        // 根据任务 ID 跳转到对应页面
                        switch (taskId) {
                          case '1': // 每日签到
                            // TODO: 签到功能
                            break
                          case '2': // 完善个人信息
                            onNavigate?.('user-profile-edit')
                            break
                          case '3': // 完成首单
                            onNavigate?.('services')
                            break
                          case '4': // 邀请好友
                            onNavigate?.('referrals')
                            break
                        }
                      }}
                    />
                  ))
                )}
              </Box>
            </Box>

            {/* 积分商城入口 */}
            <Box style={{ marginTop: 24 * wxScale }}>
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  fontWeight: 500,
                  color: textPrimary,
                  marginBottom: 12 * wxScale,
                }}
              >
                积分兑换
              </Text>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: cardBg,
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
                  <Icon name="gift" size={28 * wxScale} color={primaryColor} />
                  <Box>
                    <Text
                      style={{
                        fontSize: 14 * wxScale,
                        fontWeight: 500,
                        color: textPrimary,
                      }}
                    >
                      积分商城
                    </Text>
                    <Text
                      style={{
                        fontSize: 12 * wxScale,
                        color: textSecondary,
                      }}
                    >
                      用积分兑换精美礼品
                    </Text>
                  </Box>
                </Box>
                <Icon name="right" size={16 * wxScale} color={textSecondary} />
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}
