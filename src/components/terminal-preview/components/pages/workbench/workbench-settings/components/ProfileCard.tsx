/**
 * 个人资料卡片组件
 */

import { Box, Text, Icon, Image } from '../../../../../ui/primitives'
import { wxScale } from '../constants'
import type { ProfileCardProps } from '../types'

export function ProfileCard({
    profile,
    isDarkMode,
    primaryColor,
    onClick,
}: ProfileCardProps) {
    const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
    const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
    const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
    const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

    return (
        <Box
            onClick={onClick}
            style={{
                marginLeft: 16 * wxScale,
                marginRight: 16 * wxScale,
                marginTop: 16 * wxScale,
                padding: 16 * wxScale,
                borderRadius: 12 * wxScale,
                backgroundColor: cardBg,
            }}
        >
            <Box
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12 * wxScale,
                }}
            >
                {profile.avatar ? (
                    <Image
                        src={profile.avatar}
                        mode="aspectFill"
                        style={{
                            width: 56 * wxScale,
                            height: 56 * wxScale,
                            borderRadius: 28 * wxScale,
                        }}
                    />
                ) : (
                    <Box
                        style={{
                            width: 56 * wxScale,
                            height: 56 * wxScale,
                            borderRadius: 28 * wxScale,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: `${primaryColor}20`,
                        }}
                    >
                        <Icon name="user" size={28 * wxScale} color={primaryColor} />
                    </Box>
                )}
                <Box style={{ flex: 1 }}>
                    <Text
                        style={{
                            display: 'block',
                            fontSize: 18 * wxScale,
                            fontWeight: 600,
                            color: textPrimary,
                        }}
                    >
                        {profile.name}
                    </Text>
                    <Box
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8 * wxScale,
                            marginTop: 4 * wxScale,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12 * wxScale,
                                paddingLeft: 8 * wxScale,
                                paddingRight: 8 * wxScale,
                                paddingTop: 2 * wxScale,
                                paddingBottom: 2 * wxScale,
                                borderRadius: 9999,
                                backgroundColor: `${primaryColor}20`,
                                color: primaryColor,
                            }}
                        >
                            {profile.level}
                        </Text>
                        <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
                            评分 {profile.rating}
                        </Text>
                    </Box>
                </Box>
                <Icon name="right" size={20 * wxScale} color={textMuted} />
            </Box>
        </Box>
    )
}

