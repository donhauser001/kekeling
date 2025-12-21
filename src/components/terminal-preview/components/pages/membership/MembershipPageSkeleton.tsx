/**
 * 会员中心骨架屏组件
 *
 * 加载状态展示
 */

import { Box } from '../../../ui/primitives'
import { wxScale, wxSafeAreaTop, getColorConfig } from './constants'
import type { MembershipSkeletonProps } from './types'

export function MembershipPageSkeleton({
    primaryColor,
    isDarkMode,
}: MembershipSkeletonProps) {
    const { bgColor, cardBg, skeletonBg } = getColorConfig(isDarkMode, primaryColor)

    const skeletonStyle = {
        animation: 'pulse 1.5s ease-in-out infinite',
    }

    return (
        <Box
            style={{
                minHeight: '100%',
                backgroundColor: bgColor,
            }}
        >
            {/* 顶部导航栏骨架 */}
            <Box
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    paddingTop: wxSafeAreaTop,
                    backgroundColor: primaryColor,
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingLeft: 16 * wxScale,
                        paddingRight: 16 * wxScale,
                        paddingTop: 12 * wxScale,
                        paddingBottom: 12 * wxScale,
                    }}
                >
                    <Box
                        style={{
                            width: 80 * wxScale,
                            height: 20 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            ...skeletonStyle,
                        }}
                    />
                </Box>
            </Box>

            {/* 会员卡片骨架 */}
            <Box
                style={{
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    paddingTop: 16 * wxScale,
                }}
            >
                <Box
                    style={{
                        borderRadius: 12 * wxScale,
                        padding: 16 * wxScale,
                        backgroundColor: skeletonBg,
                        ...skeletonStyle,
                    }}
                >
                    {/* 顶部等级 */}
                    <Box
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8 * wxScale,
                            marginBottom: 16 * wxScale,
                        }}
                    >
                        <Box
                            style={{
                                width: 32 * wxScale,
                                height: 32 * wxScale,
                                borderRadius: 16 * wxScale,
                                backgroundColor: 'rgba(255,255,255,0.3)',
                            }}
                        />
                        <Box
                            style={{
                                width: 80 * wxScale,
                                height: 20 * wxScale,
                                borderRadius: 4 * wxScale,
                                backgroundColor: 'rgba(255,255,255,0.3)',
                            }}
                        />
                    </Box>

                    {/* 有效期 */}
                    <Box
                        style={{
                            width: '60%',
                            height: 14 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                        }}
                    />

                    {/* 积分 */}
                    <Box
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 4 * wxScale,
                            marginTop: 16 * wxScale,
                        }}
                    >
                        <Box
                            style={{
                                width: 60 * wxScale,
                                height: 28 * wxScale,
                                borderRadius: 4 * wxScale,
                                backgroundColor: 'rgba(255,255,255,0.3)',
                            }}
                        />
                        <Box
                            style={{
                                width: 32 * wxScale,
                                height: 14 * wxScale,
                                borderRadius: 4 * wxScale,
                                backgroundColor: 'rgba(255,255,255,0.3)',
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* 权益列表骨架 */}
            <Box
                style={{
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    paddingTop: 24 * wxScale,
                }}
            >
                <Box
                    style={{
                        width: 80 * wxScale,
                        height: 16 * wxScale,
                        borderRadius: 4 * wxScale,
                        backgroundColor: skeletonBg,
                        marginBottom: 12 * wxScale,
                        ...skeletonStyle,
                    }}
                />
                <Box
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12 * wxScale,
                    }}
                >
                    {[1, 2, 3, 4].map((item) => (
                        <Box
                            key={item}
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
                                    width: 32 * wxScale,
                                    height: 32 * wxScale,
                                    borderRadius: 16 * wxScale,
                                    backgroundColor: skeletonBg,
                                    marginBottom: 8 * wxScale,
                                    ...skeletonStyle,
                                }}
                            />
                            <Box
                                style={{
                                    width: 48 * wxScale,
                                    height: 12 * wxScale,
                                    borderRadius: 4 * wxScale,
                                    backgroundColor: skeletonBg,
                                    ...skeletonStyle,
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}

