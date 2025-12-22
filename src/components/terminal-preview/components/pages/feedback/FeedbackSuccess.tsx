/**
 * 意见反馈页面 - 提交成功状态
 */

import { Box, Text, Icon } from '../../../ui/primitives'
import { FeedbackHeader } from './FeedbackHeader'
import { wxScale } from './constants'

interface FeedbackSuccessProps {
    primaryColor: string
    bgColor: string
    textPrimary: string
    textSecondary: string
    onBack?: () => void
}

export function FeedbackSuccess({
    primaryColor,
    bgColor,
    textPrimary,
    textSecondary,
    onBack,
}: FeedbackSuccessProps) {
    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: bgColor,
            }}
        >
            {/* 导航栏 */}
            <FeedbackHeader primaryColor={primaryColor} onBack={onBack} />

            {/* 成功状态 */}
            <Box
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 32 * wxScale,
                }}
            >
                <Box
                    style={{
                        width: 80 * wxScale,
                        height: 80 * wxScale,
                        borderRadius: 40 * wxScale,
                        backgroundColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24 * wxScale,
                    }}
                >
                    <Icon name="check" size={40 * wxScale} color="#fff" />
                </Box>

                <Text
                    style={{
                        display: 'block',
                        fontSize: 20 * wxScale,
                        fontWeight: 600,
                        color: textPrimary,
                        marginBottom: 12 * wxScale,
                    }}
                >
                    提交成功
                </Text>

                <Text
                    style={{
                        display: 'block',
                        fontSize: 14 * wxScale,
                        color: textSecondary,
                        textAlign: 'center',
                        lineHeight: 1.6,
                    }}
                >
                    感谢您的反馈，我们会认真查看并持续改进
                </Text>

                <Box
                    onClick={onBack}
                    style={{
                        marginTop: 32 * wxScale,
                        paddingLeft: 32 * wxScale,
                        paddingRight: 32 * wxScale,
                        paddingTop: 12 * wxScale,
                        paddingBottom: 12 * wxScale,
                        backgroundColor: primaryColor,
                        borderRadius: 24 * wxScale,
                    }}
                >
                    <Text style={{ fontSize: 15 * wxScale, color: '#fff' }}>返回</Text>
                </Box>
            </Box>
        </Box>
    )
}

