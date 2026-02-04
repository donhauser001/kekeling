/**
 * 积分首页（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/功能模块改造指南/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Button/Icon
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: emoji → Icon 组件
 * - 规则 4.1: 添加骨架屏
 * - 规则 12: 拆分为模块化组件
 *
 * 积分任务功能：
 * - 从 API 获取任务列表及状态
 * - 支持三种状态：pending/completed/claimed
 * - 可领取状态显示"领取"按钮，点击领取积分
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Box, Text, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'
import type { PointsInfo, CheckInStatus, PointsTaskItem } from '../../../api/types'

import { wxScale, wxSafeAreaTop } from './constants'
import type { PointsPageProps, PointsTask } from './types'
import { PointsPageSkeleton } from './PointsPageSkeleton'
import { PointsCard } from './PointsCard'
import { CheckInCard } from './CheckInCard'
import { TaskItem } from './TaskItem'
import { RuleItem } from './RuleItem'
import { ErrorState } from './ErrorState'

// 声明 wx 对象
declare const wx: {
  showToast: (options: { title: string; icon?: string }) => void
}

export function PointsPage({
  themeSettings,
  isDarkMode,
  onBack,
  onNavigate,
  pointsOverride,
}: PointsPageProps) {
  // ============================================================================
  // 数据状态
  // ============================================================================
  const [apiPointsInfo, setApiPointsInfo] = useState<PointsInfo | null>(null)
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(null)
  const [pointsTasks, setPointsTasks] = useState<PointsTaskItem[]>([])
  const [isLoading, setIsLoading] = useState(!pointsOverride)
  const [isError, setIsError] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  // 领取中的任务代码
  const [claimingTaskCode, setClaimingTaskCode] = useState<string | null>(null)

  // 获取积分信息、签到状态和任务列表
  useEffect(() => {
    if (pointsOverride) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)

    Promise.all([
      previewApi.getMyPoints(),
      previewApi.getCheckInStatus(),
      previewApi.getPointsTasks(),
    ])
      .then(([pointsData, statusData, tasksData]) => {
        setApiPointsInfo(pointsData)
        setCheckInStatus(statusData)
        setPointsTasks(tasksData || [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[PointsPage] 加载数据失败:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }, [pointsOverride])

  // 重试加载
  const handleRetry = () => {
    setIsLoading(true)
    setIsError(false)

    Promise.all([
      previewApi.getMyPoints(),
      previewApi.getCheckInStatus(),
      previewApi.getPointsTasks(),
    ])
      .then(([pointsData, statusData, tasksData]) => {
        setApiPointsInfo(pointsData)
        setCheckInStatus(statusData)
        setPointsTasks(tasksData || [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error('[PointsPage] 重试加载失败:', err)
        setIsError(true)
        setIsLoading(false)
      })
  }

  // 签到
  const handleCheckIn = async () => {
    if (isChecking || checkInStatus?.checkedIn) return

    setIsChecking(true)
    const result = await previewApi.checkIn()
    setIsChecking(false)

    if (result.success && result.data) {
      // 更新签到状态
      setCheckInStatus({
        checkedIn: true,
        consecutiveDays: result.data.consecutiveDays,
        todayPoints: result.data.points,
      })
      // 更新积分余额
      if (apiPointsInfo) {
        setApiPointsInfo({
          ...apiPointsInfo,
          balance: result.data.totalPoints,
          totalEarned: apiPointsInfo.totalEarned + result.data.points,
        })
      }
      // 更新任务列表中的签到状态
      setPointsTasks(prevTasks =>
        prevTasks.map(task =>
          task.code === 'daily_checkin'
            ? { ...task, status: 'claimed' as const }
            : task
        )
      )
      wx.showToast({
        title: `签到成功 +${result.data.points}积分`,
        icon: 'success',
      })
    } else {
      wx.showToast({
        title: result.message || '签到失败',
        icon: 'none',
      })
    }
  }

  // 去完成任务
  const handleGoComplete = useCallback((taskCode: string) => {
    switch (taskCode) {
      case 'daily_checkin':
        // 签到任务：直接调用签到接口
        handleCheckIn()
        break
      case 'complete_profile':
        onNavigate?.('user-profile-edit')
        break
      case 'first_order':
      case 'order_complete':
        onNavigate?.('services')
        break
      case 'referral':
        onNavigate?.('referrals')
        break
      default:
        break
    }
  }, [onNavigate])

  // 领取任务奖励
  const handleClaimTask = useCallback(async (taskCode: string) => {
    if (claimingTaskCode) return

    setClaimingTaskCode(taskCode)

    try {
      // 签到任务使用签到接口
      if (taskCode === 'daily_checkin') {
        const result = await previewApi.checkIn()
        if (result.success && result.data) {
          // 更新积分余额
          if (apiPointsInfo) {
            setApiPointsInfo({
              ...apiPointsInfo,
              balance: result.data.totalPoints,
              totalEarned: apiPointsInfo.totalEarned + result.data.points,
            })
          }
          // 更新任务状态
          setPointsTasks((prev) =>
            prev.map((t) =>
              t.code === taskCode ? { ...t, status: 'claimed' as const } : t
            )
          )
          // 更新签到状态
          setCheckInStatus({
            checkedIn: true,
            consecutiveDays: result.data.consecutiveDays,
            todayPoints: result.data.points,
          })
          // 显示提示
          if (isWxEnvironment()) {
            wx.showToast({
              title: `签到成功 +${result.data.points}积分`,
              icon: 'success',
            })
          }
        } else {
          if (isWxEnvironment()) {
            wx.showToast({
              title: result.message || '签到失败',
              icon: 'none',
            })
          }
        }
      } else {
        // 其他任务使用领取接口
        const result = await previewApi.claimPointsTask(taskCode)
        if (result.success && result.data) {
          // 更新积分余额
          if (apiPointsInfo) {
            setApiPointsInfo({
              ...apiPointsInfo,
              balance: result.data.totalPoints,
              totalEarned: apiPointsInfo.totalEarned + result.data.points,
            })
          }
          // 更新任务状态
          setPointsTasks((prev) =>
            prev.map((t) =>
              t.code === taskCode ? { ...t, status: 'claimed' as const } : t
            )
          )
          // 显示提示
          if (isWxEnvironment()) {
            wx.showToast({
              title: `领取成功 +${result.data.points}积分`,
              icon: 'success',
            })
          }
        } else {
          if (isWxEnvironment()) {
            wx.showToast({
              title: result.message || '领取失败',
              icon: 'none',
            })
          }
        }
      }
    } catch (error) {
      console.error('[PointsPage] 领取任务失败:', error)
      if (isWxEnvironment()) {
        wx.showToast({
          title: '领取失败，请重试',
          icon: 'none',
        })
      }
    } finally {
      setClaimingTaskCode(null)
    }
  }, [claimingTaskCode, apiPointsInfo])

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
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
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
            justifyContent: 'center',
            position: 'relative',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          {/* 返回按钮 */}
          <Box
            onClick={onBack}
            style={{
              position: 'absolute',
              left: 12 * wxScale,
              width: 36 * wxScale,
              height: 36 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="left" size={22 * wxScale} color="#fff" />
          </Box>

          {/* 标题 */}
          <Text
            style={{
              fontSize: 17 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            我的积分
          </Text>
        </Box>
      </Box>

      {/* 内容区 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 16 * wxScale,
        }}
      >
        {/* 请求失败 */}
        {isError && (
          <ErrorState
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
            onRetry={handleRetry}
          />
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

            {/* 签到卡片（非管理后台预览时，且签到功能已启用时显示） */}
            {!pointsOverride && pointsTasks.some(t => t.code === 'daily_checkin') && (
              <Box style={{ marginTop: 16 * wxScale }}>
                <CheckInCard
                  themeSettings={themeSettings}
                  isDarkMode={isDarkMode}
                  checkInStatus={checkInStatus}
                  onCheckIn={handleCheckIn}
                  isChecking={isChecking}
                />
              </Box>
            )}

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
                  // 显示从后端获取的积分任务列表
                  pointsTasks.map((task) => {
                    // 计算显示的积分数和文本
                    const rateValue = task.pointsRate || 0
                    const displayPoints = task.isRateBased
                      ? Math.round(rateValue)
                      : task.points

                    // 比例型任务显示 "1元+x积分"
                    const pointsText = task.isRateBased
                      ? `1元+${rateValue >= 1 ? Math.round(rateValue) : rateValue}积分`
                      : undefined

                    // 转换为 PointsTask 格式
                    // order_complete 是持续性任务，永远显示为 pending
                    const taskForDisplay: PointsTask = {
                      code: task.code,
                      name: task.name,
                      icon: task.icon,
                      points: displayPoints,
                      status: task.code === 'order_complete' ? 'pending' : task.status,
                      pointsText,
                    }

                    return (
                      <TaskItem
                        key={task.code}
                        task={taskForDisplay}
                        themeSettings={themeSettings}
                        isDarkMode={isDarkMode}
                        isClaiming={claimingTaskCode === task.code}
                        onGoComplete={handleGoComplete}
                        onClaim={handleClaimTask}
                      />
                    )
                  })
                )}
              </Box>
            </Box>

            {/* 积分商城入口 - 暂时隐藏，后续开发 */}
          </>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}

