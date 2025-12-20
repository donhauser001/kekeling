/**
 * 服务流程卡片
 * 显示陪诊服务的流程进度（仅陪诊员可见）
 */

import React from 'react'
import { Box, Text } from '../../../ui/primitives'
import { CheckCircle } from '../../../ui/lucide-compat'
import type { ThemeSettings } from '../../../types'
import type { OrderStatus } from './types'

interface ServiceStep {
  key: string
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
}

interface ServiceFlowCardProps {
  orderStatus: OrderStatus
  themeSettings: ThemeSettings
  isDarkMode: boolean
  wxScale: number
}

export function ServiceFlowCard({
  orderStatus,
  themeSettings,
  isDarkMode,
  wxScale,
}: ServiceFlowCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#fff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 生成服务流程步骤
  const getServiceSteps = (): ServiceStep[] => {
    const steps: ServiceStep[] = [
      {
        key: 'accepted',
        title: '已接单',
        description: '订单已确认，请准时到达',
        status: 'pending',
      },
      {
        key: 'arrived',
        title: '确认到达',
        description: '到达医院后点击确认',
        status: 'pending',
      },
      {
        key: 'started',
        title: '开始服务',
        description: '见到客户后开始服务',
        status: 'pending',
      },
      {
        key: 'completed',
        title: '完成服务',
        description: '服务结束后确认完成',
        status: 'pending',
      },
    ]

    // 根据订单状态更新步骤状态
    switch (orderStatus) {
      case 'accepted':
        steps[0].status = 'completed'
        steps[1].status = 'current'
        break
      case 'ongoing':
        steps[0].status = 'completed'
        steps[1].status = 'completed'
        steps[2].status = 'completed'
        steps[3].status = 'current'
        break
      case 'completed':
        steps.forEach(s => s.status = 'completed')
        break
      default:
        break
    }

    return steps
  }

  const steps = getServiceSteps()
  const circleSize = 28 * wxScale

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      <Text
        style={{
          display: 'block',
          fontSize: 14 * wxScale,
          fontWeight: 600,
          color: textPrimary,
          marginBottom: 16 * wxScale,
        }}
      >
        服务流程
      </Text>

      <Box>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const nextStep = !isLast ? steps[index + 1] : null

          // 连接线颜色：当前步骤已完成时显示绿色
          const lineColor = step.status === 'completed' ? '#10b981' : 
            isDarkMode ? '#374151' : '#e5e7eb'

          return (
            <Box
              key={step.key}
              style={{
                display: 'flex',
                alignItems: 'stretch',
              }}
            >
              {/* 左侧：圆圈 + 连接线 */}
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: circleSize,
                  flexShrink: 0,
                }}
              >
                {/* 步骤圆圈 */}
                <Box
                  style={{
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: step.status === 'completed' ? '#10b981' :
                      step.status === 'current' ? themeSettings.primaryColor : 
                      isDarkMode ? '#374151' : '#e5e7eb',
                    flexShrink: 0,
                  }}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle size={16 * wxScale} color="#fff" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 12 * wxScale,
                        fontWeight: 600,
                        color: step.status === 'current' ? '#fff' : textSecondary,
                      }}
                    >
                      {index + 1}
                    </Text>
                  )}
                </Box>

                {/* 连接线 */}
                {!isLast && (
                  <Box
                    style={{
                      width: 2 * wxScale,
                      flex: 1,
                      minHeight: 20 * wxScale,
                      backgroundColor: lineColor,
                    }}
                  />
                )}
              </Box>

              {/* 右侧：步骤内容 */}
              <Box
                style={{
                  marginLeft: 12 * wxScale,
                  flex: 1,
                  paddingBottom: !isLast ? 16 * wxScale : 0,
                }}
              >
                <Text
                  style={{
                    display: 'block',
                    fontSize: 14 * wxScale,
                    fontWeight: 500,
                    color: step.status === 'pending' ? textSecondary : textPrimary,
                  }}
                >
                  {step.title}
                </Text>
                <Text
                  style={{
                    display: 'block',
                    fontSize: 12 * wxScale,
                    color: textSecondary,
                    marginTop: 2 * wxScale,
                  }}
                >
                  {step.description}
                </Text>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
