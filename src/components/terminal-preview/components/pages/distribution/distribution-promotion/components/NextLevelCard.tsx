/**
 * 下一等级卡片组件
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { wxScale, formatPercent } from '../constants'
import type { LevelInfo, NextLevelInfo } from '../types'

interface NextLevelCardProps {
    currentLevel: LevelInfo
    nextLevel: NextLevelInfo
    primaryColor: string
    cardBg: string
    textPrimary: string
    textSecondary: string
    isDarkMode: boolean
}

export function NextLevelCard({
    currentLevel,
    nextLevel,
    primaryColor,
    cardBg,
    textPrimary,
    textSecondary,
    isDarkMode,
}: NextLevelCardProps) {
    const commissionDiff = nextLevel.commissionRate - currentLevel.commissionRate

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
                <Icon name="trending-up" size={20 * wxScale} color={primaryColor} />
                <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
                    下一等级
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
                        backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                        border: `2px dashed ${primaryColor}`,
                    }}
                >
                    <Icon name="vip-one" size={24 * wxScale} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
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
                        {nextLevel.name}
                    </Text>
                    <Box
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4 * wxScale,
                        }}
                    >
                        <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
                            佣金比例 {formatPercent(nextLevel.commissionRate, 0)}%
                        </Text>
                        <Text
                            style={{
                                fontSize: 12 * wxScale,
                                color: primaryColor,
                            }}
                        >
                            (+{formatPercent(commissionDiff, 0)}%)
                        </Text>
                    </Box>
                </Box>
            </Box>

            {/* 下一等级权益 */}
            <Box>
                <Text
                    style={{
                        display: 'block',
                        fontSize: 12 * wxScale,
                        marginBottom: 8 * wxScale,
                        color: isDarkMode ? '#6b7280' : '#9ca3af',
                    }}
                >
                    升级后权益
                </Text>
                <Box
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8 * wxScale,
                    }}
                >
                    {nextLevel.benefits.map((benefit, index) => {
                        const isNew = !currentLevel.benefits.includes(benefit)
                        return (
                            <Text
                                key={index}
                                style={{
                                    fontSize: 12 * wxScale,
                                    paddingLeft: 8 * wxScale,
                                    paddingRight: 8 * wxScale,
                                    paddingTop: 4 * wxScale,
                                    paddingBottom: 4 * wxScale,
                                    borderRadius: 9999,
                                    backgroundColor: isNew ? `${primaryColor}15` : isDarkMode ? '#3a3a3a' : '#f3f4f6',
                                    color: isNew ? primaryColor : textSecondary,
                                }}
                            >
                                {isNew && '✨ '}
                                {benefit}
                            </Text>
                        )
                    })}
                </Box>
            </Box>
        </Box>
    )
}

