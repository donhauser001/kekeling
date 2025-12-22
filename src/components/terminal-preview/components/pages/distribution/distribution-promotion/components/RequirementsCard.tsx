/**
 * 晋升条件卡片组件
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { wxScale, getRequirementTypeName, calculateProgress } from '../constants'
import type { RequirementInfo } from '../types'

interface RequirementsCardProps {
    requirements: RequirementInfo[]
    primaryColor: string
    cardBg: string
    textPrimary: string
    textSecondary: string
    isDarkMode: boolean
}

export function RequirementsCard({
    requirements,
    primaryColor,
    cardBg,
    textPrimary,
    textSecondary,
    isDarkMode,
}: RequirementsCardProps) {
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
                    marginBottom: 16 * wxScale,
                }}
            >
                <Icon name="target" size={20 * wxScale} color={primaryColor} />
                <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
                    晋升条件
                </Text>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 * wxScale }}>
                {requirements.map((req, index) => {
                    const progress = calculateProgress(req.current, req.required)
                    const isCompleted = req.current >= req.required

                    return (
                        <Box key={index}>
                            <Box
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 8 * wxScale,
                                }}
                            >
                                <Box
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8 * wxScale,
                                    }}
                                >
                                    {isCompleted ? (
                                        <Icon name="check-one" size={16 * wxScale} color="#10b981" />
                                    ) : (
                                        <Box
                                            style={{
                                                width: 16 * wxScale,
                                                height: 16 * wxScale,
                                                borderRadius: 8 * wxScale,
                                                border: `2px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                                            }}
                                        />
                                    )}
                                    <Text
                                        style={{
                                            fontSize: 14 * wxScale,
                                            color: isDarkMode ? '#d1d5db' : '#374151',
                                        }}
                                    >
                                        {getRequirementTypeName(req.type)}
                                    </Text>
                                </Box>
                                <Text
                                    style={{
                                        fontSize: 14 * wxScale,
                                        fontWeight: 500,
                                        color: isCompleted ? '#10b981' : textSecondary,
                                    }}
                                >
                                    {req.current} / {req.required}
                                </Text>
                            </Box>

                            {/* 进度条 */}
                            <Box
                                style={{
                                    height: 8 * wxScale,
                                    borderRadius: 4 * wxScale,
                                    overflow: 'hidden',
                                    backgroundColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
                                }}
                            >
                                <Box
                                    style={{
                                        width: `${progress}%`,
                                        height: '100%',
                                        borderRadius: 4 * wxScale,
                                        backgroundColor: isCompleted ? '#10b981' : primaryColor,
                                        transition: 'width 0.3s ease',
                                    }}
                                />
                            </Box>

                            {/* 进度百分比 */}
                            <Text
                                style={{
                                    display: 'block',
                                    fontSize: 12 * wxScale,
                                    textAlign: 'right',
                                    marginTop: 4 * wxScale,
                                    color: isCompleted ? '#10b981' : isDarkMode ? '#6b7280' : '#9ca3af',
                                }}
                            >
                                {isCompleted ? '已完成' : `${progress}%`}
                            </Text>
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}

