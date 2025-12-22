/**
 * 当前等级卡片组件
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { wxScale, formatPercent } from '../constants'
import type { LevelInfo } from '../types'

interface CurrentLevelCardProps {
    level: LevelInfo
    primaryColor: string
    cardBg: string
    textPrimary: string
    textSecondary: string
    isDarkMode: boolean
}

export function CurrentLevelCard({
    level,
    primaryColor,
    cardBg,
    textPrimary,
    textSecondary,
    isDarkMode,
}: CurrentLevelCardProps) {
    return (
        <Box
            style={{
                padding: 16 * wxScale,
                borderRadius: 12 * wxScale,
                backgroundColor: cardBg,
            }}
        >
            <Box
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 * wxScale,
                    marginBottom: 12 * wxScale,
                }}
            >
                <Icon name="trophy" size={20 * wxScale} color={primaryColor} />
                <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
                    当前等级
                </Text>
            </Box>

            <Box
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12 * wxScale,
                    marginBottom: 12 * wxScale,
                }}
            >
                <Box
                    style={{
                        width: 48 * wxScale,
                        height: 48 * wxScale,
                        borderRadius: 24 * wxScale,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${primaryColor}15`,
                    }}
                >
                    <Icon name="vip-one" size={24 * wxScale} color={primaryColor} />
                </Box>
                <Box>
                    <Text
                        style={{
                            display: 'block',
                            fontSize: 20 * wxScale,
                            fontWeight: 700,
                            color: textPrimary,
                        }}
                    >
                        {level.name}
                    </Text>
                    <Text
                        style={{
                            display: 'block',
                            fontSize: 14 * wxScale,
                            color: primaryColor,
                        }}
                    >
                        佣金比例 {formatPercent(level.commissionRate, 0)}%
                    </Text>
                </Box>
            </Box>

            {/* 当前等级权益 */}
            <Box>
                <Text
                    style={{
                        display: 'block',
                        fontSize: 12 * wxScale,
                        marginBottom: 8 * wxScale,
                        color: isDarkMode ? '#6b7280' : '#9ca3af',
                    }}
                >
                    当前权益
                </Text>
                <Box
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8 * wxScale,
                    }}
                >
                    {level.benefits.map((benefit, index) => (
                        <Text
                            key={index}
                            style={{
                                fontSize: 12 * wxScale,
                                paddingLeft: 8 * wxScale,
                                paddingRight: 8 * wxScale,
                                paddingTop: 4 * wxScale,
                                paddingBottom: 4 * wxScale,
                                borderRadius: 9999,
                                backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                                color: textSecondary,
                            }}
                        >
                            {benefit}
                        </Text>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}

