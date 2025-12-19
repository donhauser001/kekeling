/**
 * 申请状态卡片组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Button, Icon } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import type { ApplicationStatus, ThemeColors } from '../types'
import { STATUS_CONFIG } from '../constants'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface ApplyStatusCardProps {
  application: ApplicationStatus
  colors: ThemeColors
  primaryColor: string
  onReapply?: () => void
  onGoWorkbench?: () => void
}

export function ApplyStatusCard({
  application,
  colors,
  primaryColor,
  onReapply,
  onGoWorkbench,
}: ApplyStatusCardProps) {
  const config = STATUS_CONFIG[application.status]

  return (
    <Box
      style={{
        margin: 16 * wxScale,
        padding: 24 * wxScale,
        borderRadius: 12 * wxScale,
        backgroundColor: colors.cardBg,
      }}
    >
      {/* 状态图标和标题 */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12 * wxScale,
        }}
      >
        <Box
          style={{
            width: 64 * wxScale,
            height: 64 * wxScale,
            borderRadius: 32 * wxScale,
            backgroundColor: `${config.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={config.icon as any} size={32 * wxScale} color={config.color} />
        </Box>

        <Text
          style={{
            fontSize: 18 * wxScale,
            fontWeight: 600,
            color: colors.textPrimary,
          }}
        >
          {config.title}
        </Text>

        <Text
          style={{
            display: 'block',
            fontSize: 14 * wxScale,
            color: colors.textMuted,
            textAlign: 'center',
          }}
        >
          {config.desc}
        </Text>
      </Box>

      {/* 驳回原因 */}
      {application.status === 'rejected' && application.rejectReason && (
        <Box
          style={{
            marginTop: 16 * wxScale,
            padding: 12 * wxScale,
            borderRadius: 8 * wxScale,
            backgroundColor: '#fef2f2',
          }}
        >
          <Text
            style={{
              display: 'block',
              fontSize: 12 * wxScale,
              color: '#991b1b',
              fontWeight: 500,
            }}
          >
            驳回原因
          </Text>
          <Text
            style={{
              display: 'block',
              marginTop: 4 * wxScale,
              fontSize: 14 * wxScale,
              color: '#dc2626',
            }}
          >
            {application.rejectReason}
          </Text>
        </Box>
      )}

      {/* 申请信息 */}
      <Box
        style={{
          marginTop: 20 * wxScale,
          paddingTop: 16 * wxScale,
          borderTopWidth: 1,
          borderTopStyle: 'solid',
          borderTopColor: colors.border,
        }}
      >
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8 * wxScale,
          }}
        >
          <Text style={{ fontSize: 14 * wxScale, color: colors.textMuted }}>
            申请人
          </Text>
          <Text style={{ fontSize: 14 * wxScale, color: colors.textPrimary }}>
            {application.name}
          </Text>
        </Box>

        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8 * wxScale,
          }}
        >
          <Text style={{ fontSize: 14 * wxScale, color: colors.textMuted }}>
            手机号
          </Text>
          <Text style={{ fontSize: 14 * wxScale, color: colors.textPrimary }}>
            {application.phone}
          </Text>
        </Box>

        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8 * wxScale,
          }}
        >
          <Text style={{ fontSize: 14 * wxScale, color: colors.textMuted }}>
            申请时间
          </Text>
          <Text style={{ fontSize: 14 * wxScale, color: colors.textPrimary }}>
            {new Date(application.createdAt).toLocaleDateString()}
          </Text>
        </Box>

        {application.inviter && (
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, color: colors.textMuted }}>
              邀请人
            </Text>
            <Text style={{ fontSize: 14 * wxScale, color: colors.textPrimary }}>
              {application.inviter.name}
            </Text>
          </Box>
        )}
      </Box>

      {/* 操作按钮 */}
      <Box style={{ marginTop: 20 * wxScale }}>
        {application.status === 'approved' && (
          <Button
            onClick={onGoWorkbench}
            style={{
              width: '100%',
              height: 44 * wxScale,
              borderRadius: 22 * wxScale,
              backgroundColor: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 * wxScale, color: '#ffffff', fontWeight: 500 }}>
              进入工作台
            </Text>
          </Button>
        )}

        {application.status === 'rejected' && (
          <Button
            onClick={onReapply}
            style={{
              width: '100%',
              height: 44 * wxScale,
              borderRadius: 22 * wxScale,
              backgroundColor: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 * wxScale, color: '#ffffff', fontWeight: 500 }}>
              重新申请
            </Text>
          </Button>
        )}
      </Box>
    </Box>
  )
}
