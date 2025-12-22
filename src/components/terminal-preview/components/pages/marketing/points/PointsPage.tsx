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
 * - 规则 12: 已拆分为模块化结构
 */

import { useState, useEffect, useMemo } from 'react'
import { Box, Text, Button, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { previewApi } from '../../../../api'
import type { PointsInfo } from '../../../../api'
import { wxScale, wxSafeAreaTop, POINTS_TASKS } from './constants'
import type { PointsPageProps } from './types'
import {
  PointsPageSkeleton,
  PointsCard,
  TaskItem,
  RuleItem,
} from './components'

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
      .then((data) => {
        setApiPointsInfo(data)
        setIsLoading(false)
      })
      .catch((err) => {
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
      .then((data) => {
        setApiPointsInfo(data)
        setIsLoading(false)
      })
      .catch((err) => {
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

