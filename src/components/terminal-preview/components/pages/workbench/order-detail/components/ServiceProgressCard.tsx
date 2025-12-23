/**
 * 服务流程进度卡片组件
 */

import { Box, Text } from '../../../../../ui/primitives'
import { CheckCircle } from '../../../../../ui/lucide-compat'
import type { ServiceProgressCardProps } from '../types'
import { getServiceSteps } from '../constants'

export function ServiceProgressCard({
  order,
  themeSettings,
  isDarkMode,
  cardBg,
  textPrimary,
  textSecondary,
  wxScale,
}: ServiceProgressCardProps) {
  const steps = getServiceSteps(order.status, wxScale, themeSettings.primaryColor)

  return (
    <Box
      style={{
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        marginTop: 16 * wxScale,
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

      <Box style={{ position: 'relative' }}>
        {steps.map((step, index) => (
          <Box
            key={step.key}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: index < steps.length - 1 ? 20 * wxScale : 0,
            }}
          >
            {/* 步骤指示器 */}
            <Box
              style={{
                width: 28 * wxScale,
                height: 28 * wxScale,
                borderRadius: 14 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  step.status === 'completed'
                    ? '#10b981'
                    : step.status === 'current'
                      ? themeSettings.primaryColor
                      : isDarkMode
                        ? '#374151'
                        : '#e5e7eb',
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
            {index < steps.length - 1 && (
              <Box
                style={{
                  position: 'absolute',
                  left: 13 * wxScale,
                  top: (index + 1) * 48 * wxScale - 20 * wxScale,
                  width: 2 * wxScale,
                  height: 20 * wxScale,
                  backgroundColor:
                    step.status === 'completed'
                      ? '#10b981'
                      : isDarkMode
                        ? '#374151'
                        : '#e5e7eb',
                }}
              />
            )}

            {/* 步骤内容 */}
            <Box style={{ marginLeft: 12 * wxScale, flex: 1 }}>
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
        ))}
      </Box>
    </Box>
  )
}

