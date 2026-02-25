/**
 * 服务信息卡片组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { formatCount } from '../../../../utils'
import type { ServiceInfoCardProps } from '../types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function ServiceInfoCard({
  service,
  themeSettings,
  colors,
  isDarkMode,
}: ServiceInfoCardProps) {
  const { cardBg, textPrimary, textSecondary, textMuted } = colors

  return (
    <Box
      className='mx-3 -mt-6 relative z-10 rounded-xl p-4'
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: -24 * wxScale,
        position: 'relative',
        zIndex: 10,
        borderRadius: 12 * wxScale,
        padding: 16 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      {/* 服务名称 + 分类标签 */}
      <Box
        className='flex items-center gap-2'
          style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8 * wxScale,
          }}
        >
      <Text
        className='text-lg font-bold'
        style={{
          fontSize: 18 * wxScale,
          fontWeight: 700,
          color: textPrimary,
        }}
      >
        {service.name}
      </Text>
        {service.category && (
          <Box
            className='px-2 rounded flex items-center'
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              height: isWxEnvironment() ? 22 * wxScale : 20,
              borderRadius: 4 * wxScale,
              backgroundColor: `${themeSettings.primaryColor}15`,
            }}
          >
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: themeSettings.primaryColor,
              }}
            >
              {service.category.name}
            </Text>
          </Box>
        )}
      </Box>

      {/* 简介 */}
      {service.description && (
        <Text
          className='mt-2 text-sm block'
          style={{
            display: 'block',
            marginTop: isWxEnvironment() ? 12 * wxScale : 8,
            fontSize: 14 * wxScale,
            lineHeight: 1.5,
            color: textSecondary,
          }}
        >
          {service.description}
        </Text>
      )}

      {/* 价格和统计 */}
      <Box
        className='mt-4 flex items-center justify-between'
        style={{
          marginTop: 16 * wxScale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          className='flex items-center gap-1'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4 * wxScale,
          }}
        >
          <Text style={{ fontSize: 14 * wxScale, color: themeSettings.primaryColor }}>¥</Text>
          <Text
            style={{
              fontSize: 24 * wxScale,
              fontWeight: 700,
              color: themeSettings.primaryColor,
            }}
          >
            {service.price}
          </Text>
          {service.unit && (
            <Text style={{ fontSize: 14 * wxScale, color: textMuted }}>/{service.unit}</Text>
          )}
          {service.originalPrice && service.originalPrice > service.price && (
            <Text
              className='ml-2 text-sm line-through'
              style={{
                marginLeft: 8 * wxScale,
                fontSize: 14 * wxScale,
                color: textMuted,
                textDecoration: 'line-through',
              }}
            >
              ¥{service.originalPrice}
            </Text>
          )}
        </Box>
        <Box
          className='flex items-center gap-3 text-xs'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
          }}
        >
          <Box
            className='flex items-center gap-1'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4 * wxScale,
            }}
          >
            <Icon name="peoples" size={14 * wxScale} color={textMuted} />
            <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>
              {formatCount(service.orderCount)}人购
            </Text>
          </Box>
        </Box>
      </Box>

      {/* 费用说明 */}
      {service.workflow && (
        <FeeDescription
          workflow={service.workflow}
          themeSettings={themeSettings}
          colors={colors}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 旧版服务时长（兼容无流程的服务） */}
      {!service.workflow && service.duration && (
        <Box
          className='mt-4 flex items-center gap-2 px-3 py-2 rounded-lg'
          style={{
            marginTop: 16 * wxScale,
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 8 * wxScale,
            paddingBottom: 8 * wxScale,
            borderRadius: 8 * wxScale,
            backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb',
          }}
        >
          <Icon name="time" size={16 * wxScale} color={themeSettings.primaryColor} />
          <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
            预计服务时长：{service.duration}
          </Text>
        </Box>
      )}
    </Box>
  )
}

/** 费用说明子组件 */
function FeeDescription({
  workflow,
  themeSettings,
  colors,
  isDarkMode,
}: {
  workflow: NonNullable<ServiceInfoCardProps['service']['workflow']>
  themeSettings: ServiceInfoCardProps['themeSettings']
  colors: ServiceInfoCardProps['colors']
  isDarkMode: boolean
}) {
  const { textPrimary, textSecondary } = colors
  const baseDuration = workflow.baseDuration
  const graceMinutes = workflow.overtimeGrace
  const totalFreeMinutes = baseDuration + graceMinutes
  const baseHours = Math.floor(baseDuration / 60)
  const baseMinutesRemainder = baseDuration % 60
  const freeHours = Math.floor(totalFreeMinutes / 60)
  const freeMinutesRemainder = totalFreeMinutes % 60
  const baseDurationText = `${baseHours > 0 ? `${baseHours}小时` : ''}${baseMinutesRemainder > 0 ? `${baseMinutesRemainder}分钟` : ''}`
  const freeDurationText = `${freeHours > 0 ? `${freeHours}小时` : ''}${freeMinutesRemainder > 0 ? `${freeMinutesRemainder}分钟` : ''}`

  return (
    <Box
      className='mt-4 rounded-lg p-3'
      style={{
        marginTop: 16 * wxScale,
        borderRadius: 8 * wxScale,
        padding: 12 * wxScale,
        backgroundColor: isDarkMode ? '#3a3a3a' : '#f0fdf4',
      }}
    >
      <Box
        className='flex items-center gap-2 mb-2'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8 * wxScale,
          marginBottom: 8 * wxScale,
        }}
      >
        <Icon name="bill" size={16 * wxScale} color="#10b981" />
        <Text
          className='text-sm font-medium'
          style={{ fontSize: 14 * wxScale, fontWeight: 500, color: '#10b981' }}
        >
          费用说明
        </Text>
      </Box>
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 * wxScale }}>
        <Box
          className='flex items-start gap-2'
          style={{ display: 'flex', alignItems: 'flex-start', gap: 8 * wxScale }}
        >
          <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>•</Text>
          <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
            包含
            <Text style={{ fontWeight: 500, color: textPrimary }}> {baseDurationText} </Text>
            基础服务时长
          </Text>
        </Box>
        {workflow.overtimeEnabled && workflow.overtimePrice && (
          <>
            {graceMinutes > 0 && (
              <Box
                className='flex items-start gap-2'
                style={{ display: 'flex', alignItems: 'flex-start', gap: 8 * wxScale }}
              >
                <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>•</Text>
                <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
                  服务
                  <Text style={{ fontWeight: 500, color: textPrimary }}> {freeDurationText} </Text>
                  内不额外收费
                </Text>
              </Box>
            )}
            <Box
              className='flex items-start gap-2'
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8 * wxScale }}
            >
              <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>•</Text>
              <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
                超过
                <Text style={{ fontWeight: 500, color: textPrimary }}> {freeDurationText} </Text>
                后按
                <Text style={{ fontWeight: 500, color: themeSettings.primaryColor }}>
                  {' '}¥{Number(workflow.overtimePrice)}/{workflow.overtimeUnit}{' '}
                </Text>
                加收
              </Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
