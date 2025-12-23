/**
 * 订单详情内容组件
 */

import { Box, Text } from '../../../../../ui/primitives'
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Clock,
  CreditCard,
  FileText,
  Navigation,
} from '../../../../../ui/lucide-compat'
import { formatMoney, safeNumber } from '../../../../../utils'
import type { OrderDetailContentProps } from '../types'
import { SectionTitle, InfoRow } from './helpers'

export function OrderDetailContent({
  order,
  themeSettings,
  isDarkMode,
  cardBg,
  textPrimary,
  textSecondary,
  textTertiary,
  wxScale,
  isFromMyOrders,
}: OrderDetailContentProps) {
  return (
    <>
      {/* 预约信息 */}
      <Box
        style={{
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginTop: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        <SectionTitle title="预约信息" textPrimary={textPrimary} wxScale={wxScale} />
        <Box
          style={{
            marginTop: 12 * wxScale,
            display: 'flex',
            flexDirection: 'column',
            gap: 12 * wxScale,
          }}
        >
          <InfoRow
            icon={<Calendar size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="预约时间"
            value={`${order.appointment.date} ${order.appointment.time}`}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
          <InfoRow
            icon={<MapPin size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="就诊医院"
            value={order.appointment.hospitalName}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
            action={
              isFromMyOrders ? (
                <Box
                  style={{
                    paddingLeft: 8 * wxScale,
                    paddingRight: 8 * wxScale,
                    paddingTop: 4 * wxScale,
                    paddingBottom: 4 * wxScale,
                    borderRadius: 4 * wxScale,
                    backgroundColor: `${themeSettings.primaryColor}20`,
                  }}
                >
                  <Navigation size={14 * wxScale} color={themeSettings.primaryColor} />
                </Box>
              ) : undefined
            }
          />
          {order.appointment.department && (
            <InfoRow
              icon={<MapPin size={16 * wxScale} color={themeSettings.primaryColor} />}
              label="就诊科室"
              value={order.appointment.department}
              themeSettings={themeSettings}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              wxScale={wxScale}
            />
          )}
        </Box>
      </Box>

      {/* 用户信息 - 已接订单显示更多信息 */}
      <Box
        style={{
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginTop: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        <SectionTitle title="用户信息" textPrimary={textPrimary} wxScale={wxScale} />
        <Box
          style={{
            marginTop: 12 * wxScale,
            display: 'flex',
            flexDirection: 'column',
            gap: 12 * wxScale,
          }}
        >
          <InfoRow
            icon={<User size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="用户姓名"
            value={order.user.name}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
          <InfoRow
            icon={<Phone size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="联系电话"
            value={isFromMyOrders && order.user.phone ? order.user.phone : order.user.maskedPhone}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
            action={
              <Box
                style={{
                  paddingLeft: 8 * wxScale,
                  paddingRight: 8 * wxScale,
                  paddingTop: 4 * wxScale,
                  paddingBottom: 4 * wxScale,
                  borderRadius: 4 * wxScale,
                  backgroundColor: `${themeSettings.primaryColor}20`,
                }}
              >
                <Text
                  style={{
                    fontSize: 12 * wxScale,
                    color: themeSettings.primaryColor,
                  }}
                >
                  拨打
                </Text>
              </Box>
            }
          />
        </Box>
      </Box>

      {/* 服务信息 */}
      <Box
        style={{
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginTop: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        <SectionTitle title="服务信息" textPrimary={textPrimary} wxScale={wxScale} />
        <Box style={{ marginTop: 12 * wxScale }}>
          <InfoRow
            icon={<FileText size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="服务类型"
            value={order.service.name}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
          {order.service.duration && (
            <Box style={{ marginTop: 12 * wxScale }}>
              <InfoRow
                icon={<Clock size={16 * wxScale} color={themeSettings.primaryColor} />}
                label="服务时长"
                value={`约 ${order.service.duration} 分钟`}
                themeSettings={themeSettings}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                wxScale={wxScale}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* 金额信息 */}
      <Box
        style={{
          borderRadius: 12 * wxScale,
          padding: 16 * wxScale,
          marginTop: 16 * wxScale,
          backgroundColor: cardBg,
        }}
      >
        <SectionTitle title="金额信息" textPrimary={textPrimary} wxScale={wxScale} />
        <Box
          style={{
            marginTop: 12 * wxScale,
            display: 'flex',
            flexDirection: 'column',
            gap: 12 * wxScale,
          }}
        >
          <InfoRow
            icon={<CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="订单金额"
            value={`¥${formatMoney(order.payment.amount)}`}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
          />
          <InfoRow
            icon={<CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />}
            label="预计佣金"
            value={`¥${formatMoney(order.payment.commission)}`}
            themeSettings={themeSettings}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            wxScale={wxScale}
            highlight
          />
          {order.payment.tip !== undefined && safeNumber(order.payment.tip) > 0 && (
            <InfoRow
              icon={<CreditCard size={16 * wxScale} color={themeSettings.primaryColor} />}
              label="用户打赏"
              value={`¥${formatMoney(order.payment.tip)}`}
              themeSettings={themeSettings}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              wxScale={wxScale}
            />
          )}
        </Box>
      </Box>

      {/* 备注 */}
      {order.remark && (
        <Box
          style={{
            borderRadius: 12 * wxScale,
            padding: 16 * wxScale,
            marginTop: 16 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <SectionTitle title="订单备注" textPrimary={textPrimary} wxScale={wxScale} />
          <Text
            style={{
              display: 'block',
              marginTop: 12 * wxScale,
              fontSize: 14 * wxScale,
              color: textSecondary,
              lineHeight: 1.5,
            }}
          >
            {order.remark}
          </Text>
        </Box>
      )}

      {/* 时间信息 */}
      <Box
        style={{
          marginTop: 16 * wxScale,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 12 * wxScale,
            color: textTertiary,
          }}
        >
          创建时间：{order.createdAt}
        </Text>
        <Text
          style={{
            marginTop: 4 * wxScale,
            fontSize: 12 * wxScale,
            color: textTertiary,
          }}
        >
          更新时间：{order.updatedAt}
        </Text>
      </Box>
    </>
  )
}

