/**
 * 会员权益网格组件
 *
 * 展示会员专属权益列表
 */

import { Box, Text, Icon } from '../../../ui/primitives'
import { wxScale, MEMBERSHIP_BENEFITS, getColorConfig } from './constants'
import type { BenefitsGridProps } from './types'

export function BenefitsGrid({ themeSettings, isDarkMode }: BenefitsGridProps) {
    const { cardBg, textPrimary, textSecondary, primaryColor } = getColorConfig(
        isDarkMode,
        themeSettings.primaryColor
    )

    return (
        <Box
            style={{
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 24 * wxScale,
                paddingBottom: 16 * wxScale,
            }}
        >
            <Text
                style={{
                    display: 'block',
                    fontSize: 14 * wxScale,
                    fontWeight: 500,
                    color: textPrimary,
                    marginBottom: 12 * wxScale,
                }}
            >
                会员权益
            </Text>
            <Box
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12 * wxScale,
                }}
            >
                {MEMBERSHIP_BENEFITS.map((benefit) => (
                    <Box
                        key={benefit.id}
                        style={{
                            width: `calc(25% - ${9 * wxScale}px)`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 12 * wxScale,
                            borderRadius: 8 * wxScale,
                            backgroundColor: cardBg,
                        }}
                    >
                        <Box
                            style={{
                                width: 40 * wxScale,
                                height: 40 * wxScale,
                                borderRadius: 20 * wxScale,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: `${primaryColor}15`,
                                marginBottom: 8 * wxScale,
                            }}
                        >
                            <Icon name={benefit.icon} size={20 * wxScale} color={primaryColor} />
                        </Box>
                        <Text
                            style={{
                                fontSize: 12 * wxScale,
                                color: textSecondary,
                                textAlign: 'center',
                            }}
                        >
                            {benefit.name}
                        </Text>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

