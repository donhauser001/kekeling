/**
 * 未开通会员状态组件
 *
 * 展示开通会员引导
 */

import { Box, Text, Button, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { wxScale, getColorConfig } from './constants'
import type { NoMembershipProps } from './types'

export function NoMembership({
    themeSettings,
    isDarkMode,
    onNavigate,
}: NoMembershipProps) {
    const { textSecondary, textMuted, primaryColor } = getColorConfig(
        isDarkMode,
        themeSettings.primaryColor
    )

    return (
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
            {/* VIP 图标 */}
            <Box
                style={{
                    width: 80 * wxScale,
                    height: 80 * wxScale,
                    borderRadius: 40 * wxScale,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${primaryColor}15`,
                    marginBottom: 16 * wxScale,
                }}
            >
                <Icon name="vip-one" size={48 * wxScale} color="#fbbf24" />
            </Box>

            {/* 提示文案 */}
            <Text
                style={{
                    display: 'block',
                    fontSize: 16 * wxScale,
                    fontWeight: 500,
                    color: textSecondary,
                    marginTop: 4 * wxScale,
                }}
            >
                您还不是会员
            </Text>
            <Text
                style={{
                    display: 'block',
                    fontSize: 13 * wxScale,
                    color: textMuted,
                    marginTop: 8 * wxScale,
                }}
            >
                开通会员享受更多专属权益
            </Text>

            {/* 开通按钮 */}
            <Button
                onClick={() => onNavigate?.('membership-plans')}
                style={{
                    marginTop: 24 * wxScale,
                    paddingLeft: 40 * wxScale,
                    paddingRight: 40 * wxScale,
                    paddingTop: isWxEnvironment() ? 12 * wxScale : 10,
                    paddingBottom: isWxEnvironment() ? 12 * wxScale : 10,
                    borderRadius: 24 * wxScale,
                    backgroundColor: primaryColor,
                    border: 'none',
                }}
            >
                <Text
                    style={{
                        fontSize: 15 * wxScale,
                        fontWeight: 500,
                        color: '#ffffff',
                    }}
                >
                    立即开通
                </Text>
            </Button>
        </Box>
    )
}

