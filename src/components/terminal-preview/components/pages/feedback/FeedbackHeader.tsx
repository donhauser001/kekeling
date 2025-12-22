/**
 * 意见反馈页面 - 导航栏组件
 */

import { Box, Text, Icon } from '../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from './constants'

interface FeedbackHeaderProps {
    primaryColor: string
    onBack?: () => void
}

export function FeedbackHeader({ primaryColor, onBack }: FeedbackHeaderProps) {
    return (
        <Box
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: primaryColor,
                paddingTop: wxSafeAreaTop,
            }}
        >
            <Box
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    height: 44 * wxScale,
                    paddingLeft: 12 * wxScale,
                    paddingRight: 12 * wxScale,
                }}
            >
                <Box
                    onClick={onBack}
                    style={{
                        position: 'absolute',
                        left: 12 * wxScale,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36 * wxScale,
                        height: 36 * wxScale,
                    }}
                >
                    <Icon name="left" size={22 * wxScale} color="#fff" />
                </Box>
                <Text
                    style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}
                >
                    意见反馈
                </Text>
            </Box>
        </Box>
    )
}

