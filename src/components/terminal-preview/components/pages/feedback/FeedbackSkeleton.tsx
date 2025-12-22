/**
 * 意见反馈页面 - 骨架屏组件
 */

import { Box } from '../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from './constants'

interface FeedbackSkeletonProps {
    bgColor: string
    cardBg: string
}

export function FeedbackSkeleton({ bgColor, cardBg }: FeedbackSkeletonProps) {
    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: bgColor,
                padding: 16 * wxScale,
                paddingTop: wxSafeAreaTop + 56 * wxScale,
            }}
        >
            {/* 类型选择骨架 */}
            <Box
                style={{
                    backgroundColor: cardBg,
                    borderRadius: 12 * wxScale,
                    padding: 16 * wxScale,
                    marginBottom: 16 * wxScale,
                }}
            >
                {[1, 2, 3, 4, 5].map((i) => (
                    <Box
                        key={i}
                        style={{
                            height: 48 * wxScale,
                            backgroundColor: '#f3f4f6',
                            borderRadius: 8 * wxScale,
                            marginBottom: i < 5 ? 8 * wxScale : 0,
                        }}
                    />
                ))}
            </Box>
            {/* 内容输入骨架 */}
            <Box
                style={{
                    backgroundColor: cardBg,
                    borderRadius: 12 * wxScale,
                    height: 150 * wxScale,
                }}
            />
        </Box>
    )
}

