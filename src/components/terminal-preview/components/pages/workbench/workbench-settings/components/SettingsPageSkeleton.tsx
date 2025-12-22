/**
 * 工作台设置页面骨架屏
 */

import { Box } from '../../../../../ui/primitives'
import { wxScale, wxSafeAreaTop } from '../constants'

interface SettingsPageSkeletonProps {
    primaryColor: string
    isDarkMode: boolean
}

export function SettingsPageSkeleton({
    primaryColor,
    isDarkMode,
}: SettingsPageSkeletonProps) {
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
                    backgroundColor: primaryColor,
                    paddingTop: wxSafeAreaTop,
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: 44 * wxScale,
                        paddingLeft: 12 * wxScale,
                        paddingRight: 12 * wxScale,
                    }}
                >
                    <Box
                        style={{
                            width: 24 * wxScale,
                            height: 24 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                        }}
                    />
                    <Box
                        style={{
                            width: 60 * wxScale,
                            height: 20 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                        }}
                    />
                    <Box style={{ width: 24 * wxScale }} />
                </Box>
            </Box>

            {/* 个人资料卡片骨架 */}
            <Box
                style={{
                    marginLeft: 16 * wxScale,
                    marginRight: 16 * wxScale,
                    marginTop: 16 * wxScale,
                    padding: 16 * wxScale,
                    borderRadius: 12 * wxScale,
                    backgroundColor: cardBg,
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12 * wxScale,
                    }}
                >
                    <Box
                        style={{
                            width: 56 * wxScale,
                            height: 56 * wxScale,
                            borderRadius: 28 * wxScale,
                            backgroundColor: skeletonBg,
                        }}
                    />
                    <Box style={{ flex: 1 }}>
                        <Box
                            style={{
                                width: 80 * wxScale,
                                height: 18 * wxScale,
                                borderRadius: 4 * wxScale,
                                backgroundColor: skeletonBg,
                            }}
                        />
                        <Box
                            style={{
                                width: 120 * wxScale,
                                height: 14 * wxScale,
                                marginTop: 8 * wxScale,
                                borderRadius: 4 * wxScale,
                                backgroundColor: skeletonBg,
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* 设置分组骨架 */}
            {[1, 2, 3].map((section) => (
                <Box key={section} style={{ paddingLeft: 16 * wxScale, paddingRight: 16 * wxScale, marginTop: 16 * wxScale }}>
                    <Box
                        style={{
                            width: 60 * wxScale,
                            height: 14 * wxScale,
                            marginBottom: 8 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: skeletonBg,
                        }}
                    />
                    <Box
                        style={{
                            backgroundColor: cardBg,
                            borderRadius: 12 * wxScale,
                            overflow: 'hidden',
                        }}
                    >
                        {[1, 2, 3].slice(0, section === 1 ? 1 : 3).map((item, idx, arr) => (
                            <Box
                                key={item}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 12 * wxScale,
                                    borderBottom: idx < arr.length - 1 ? `1px solid ${isDarkMode ? '#3a3a3a' : '#f0f0f0'}` : 'none',
                                }}
                            >
                                <Box
                                    style={{
                                        width: 32 * wxScale,
                                        height: 32 * wxScale,
                                        borderRadius: 8 * wxScale,
                                        marginRight: 12 * wxScale,
                                        backgroundColor: skeletonBg,
                                    }}
                                />
                                <Box style={{ flex: 1 }}>
                                    <Box
                                        style={{
                                            width: 80 * wxScale,
                                            height: 14 * wxScale,
                                            borderRadius: 4 * wxScale,
                                            backgroundColor: skeletonBg,
                                        }}
                                    />
                                </Box>
                                <Box
                                    style={{
                                        width: 60 * wxScale,
                                        height: 14 * wxScale,
                                        borderRadius: 4 * wxScale,
                                        backgroundColor: skeletonBg,
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    )
}

