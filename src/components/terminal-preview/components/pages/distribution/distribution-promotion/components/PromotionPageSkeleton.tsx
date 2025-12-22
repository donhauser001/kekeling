/**
 * 晋升进度页面骨架屏
 */

import { Box } from '../../../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from '../constants'

interface PromotionPageSkeletonProps {
    primaryColor: string
    isDarkMode: boolean
}

export function PromotionPageSkeleton({
    primaryColor,
    isDarkMode,
}: PromotionPageSkeletonProps) {
    const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
    const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
    const skeletonBg = isDarkMode ? '#3a3a3a' : '#e5e7eb'

    return (
        <Box
            style={{
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: bgColor,
            }}
        >
            {/* 导航栏骨架 */}
            <Box
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: primaryColor,
                    paddingTop: wxSafeAreaTop,
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: 44 * wxScale,
                        paddingLeft: 12 * wxScale,
                        paddingRight: 12 * wxScale,
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
                    <Box style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Box
                            style={{
                                width: 80 * wxScale,
                                height: 20 * wxScale,
                                borderRadius: 4 * wxScale,
                                backgroundColor: 'rgba(255,255,255,0.3)',
                            }}
                        />
                    </Box>
                    <Box style={{ width: 32 * wxScale }} />
                </Box>
            </Box>

            {/* 内容骨架 */}
            <Box style={{ flex: 1, padding: 16 * wxScale }}>
                {/* 当前等级卡片骨架 */}
                <Box
                    style={{
                        padding: 16 * wxScale,
                        borderRadius: 12 * wxScale,
                        marginBottom: 16 * wxScale,
                        backgroundColor: cardBg,
                    }}
                >
                    <Box
                        style={{
                            width: 80 * wxScale,
                            height: 16 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: skeletonBg,
                            marginBottom: 12 * wxScale,
                        }}
                    />
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
                        <Box
                            style={{
                                width: 48 * wxScale,
                                height: 48 * wxScale,
                                borderRadius: 24 * wxScale,
                                backgroundColor: skeletonBg,
                            }}
                        />
                        <Box>
                            <Box
                                style={{
                                    width: 100 * wxScale,
                                    height: 20 * wxScale,
                                    borderRadius: 4 * wxScale,
                                    backgroundColor: skeletonBg,
                                    marginBottom: 8 * wxScale,
                                }}
                            />
                            <Box
                                style={{
                                    width: 80 * wxScale,
                                    height: 14 * wxScale,
                                    borderRadius: 4 * wxScale,
                                    backgroundColor: skeletonBg,
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* 下一等级卡片骨架 */}
                <Box
                    style={{
                        padding: 16 * wxScale,
                        borderRadius: 12 * wxScale,
                        marginBottom: 16 * wxScale,
                        backgroundColor: cardBg,
                    }}
                >
                    <Box
                        style={{
                            width: 80 * wxScale,
                            height: 16 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: skeletonBg,
                            marginBottom: 12 * wxScale,
                        }}
                    />
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
                        <Box
                            style={{
                                width: 48 * wxScale,
                                height: 48 * wxScale,
                                borderRadius: 24 * wxScale,
                                backgroundColor: skeletonBg,
                            }}
                        />
                        <Box>
                            <Box
                                style={{
                                    width: 100 * wxScale,
                                    height: 20 * wxScale,
                                    borderRadius: 4 * wxScale,
                                    backgroundColor: skeletonBg,
                                    marginBottom: 8 * wxScale,
                                }}
                            />
                            <Box
                                style={{
                                    width: 120 * wxScale,
                                    height: 14 * wxScale,
                                    borderRadius: 4 * wxScale,
                                    backgroundColor: skeletonBg,
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* 晋升条件骨架 */}
                <Box
                    style={{
                        padding: 16 * wxScale,
                        borderRadius: 12 * wxScale,
                        backgroundColor: cardBg,
                    }}
                >
                    <Box
                        style={{
                            width: 80 * wxScale,
                            height: 16 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: skeletonBg,
                            marginBottom: 16 * wxScale,
                        }}
                    />
                    {[1, 2].map((i) => (
                        <Box key={i} style={{ marginBottom: 16 * wxScale }}>
                            <Box
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 8 * wxScale,
                                }}
                            >
                                <Box
                                    style={{
                                        width: 80 * wxScale,
                                        height: 14 * wxScale,
                                        borderRadius: 4 * wxScale,
                                        backgroundColor: skeletonBg,
                                    }}
                                />
                                <Box
                                    style={{
                                        width: 60 * wxScale,
                                        height: 14 * wxScale,
                                        borderRadius: 4 * wxScale,
                                        backgroundColor: skeletonBg,
                                    }}
                                />
                            </Box>
                            <Box
                                style={{
                                    height: 8 * wxScale,
                                    borderRadius: 4 * wxScale,
                                    backgroundColor: skeletonBg,
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}

