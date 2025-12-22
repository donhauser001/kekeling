/**
 * 最高等级卡片组件
 */

import { Box, Text, Icon } from '../../../../../ui/primitives'
import { wxScale } from '../constants'
import type { LevelInfo } from '../types'

interface MaxLevelCardProps {
    currentLevel: LevelInfo
    primaryColor: string
    textSecondary: string
}

export function MaxLevelCard({
    currentLevel,
    primaryColor,
    textSecondary,
}: MaxLevelCardProps) {
    return (
        <Box
            style={{
                padding: 24 * wxScale,
                borderRadius: 12 * wxScale,
                textAlign: 'center',
                backgroundColor: `${primaryColor}10`,
                border: `1px solid ${primaryColor}`,
            }}
        >
            <Box
                style={{
                    width: 64 * wxScale,
                    height: 64 * wxScale,
                    borderRadius: 32 * wxScale,
                    margin: '0 auto',
                    marginBottom: 16 * wxScale,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${primaryColor}20`,
                }}
            >
                <Icon name="vip-one" size={32 * wxScale} color={primaryColor} />
            </Box>
            <Text
                style={{
                    display: 'block',
                    fontSize: 18 * wxScale,
                    fontWeight: 600,
                    marginBottom: 8 * wxScale,
                    color: primaryColor,
                }}
            >
                🎉 恭喜！已达最高等级
            </Text>
            <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
                您已经是{currentLevel.name}，继续保持优秀表现！
            </Text>
        </Box>
    )
}

