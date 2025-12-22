/**
 * 晋升进度页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/功能模块改造指南/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Icon
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: HTML 元素 → 跨平台原语
 * - 规则 4.1: 添加骨架屏
 * - 规则 11: 导航栏预留安全区域
 * - 规则 12: 已拆分为模块化结构
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon } from '../../../../ui/primitives'
import { previewApi } from '../../../../api'
import { PermissionPrompt } from '../../../PermissionPrompt'
import { wxScale, wxSafeAreaTop } from './constants'
import type { DistributionPromotionPageProps, PromotionData } from './types'
import {
    PromotionPageSkeleton,
    CurrentLevelCard,
    NextLevelCard,
    RequirementsCard,
    MaxLevelCard,
} from './components'

// ============================================================================
// 组件实现
// ============================================================================

export function DistributionPromotionPage({
    themeSettings,
    isDarkMode,
    effectiveViewerRole,
    onNavigate,
    onLogin,
}: DistributionPromotionPageProps) {
    const isEscort = effectiveViewerRole === 'escort'
    const primaryColor = themeSettings.primaryColor

    // 颜色变量
    const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
    const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
    const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
    const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

    // 数据状态
    const [promotionData, setPromotionData] = useState<PromotionData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    // 获取晋升数据
    useEffect(() => {
        if (!isEscort) {
            setLoading(false)
            return
        }

        previewApi
            .getDistributionPromotion()
            .then(setPromotionData)
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [isEscort])

    const handleRetry = () => {
        setError(false)
        setLoading(true)
        previewApi
            .getDistributionPromotion()
            .then(setPromotionData)
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    const handleBack = () => {
        onNavigate?.('distribution')
    }

    // 非 escort 视角：显示统一的 PermissionPrompt
    if (!isEscort) {
        return (
            <Box
                style={{
                    minHeight: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: bgColor,
                }}
            >
                {/* 导航栏 */}
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
                            justifyContent: 'center',
                            position: 'relative',
                            height: 44 * wxScale,
                            paddingLeft: 12 * wxScale,
                            paddingRight: 12 * wxScale,
                        }}
                    >
                        <Box
                            onClick={handleBack}
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
                        <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
                            晋升进度
                        </Text>
                    </Box>
                </Box>

                <Box style={{ flex: 1, padding: 16 * wxScale }}>
                    <PermissionPrompt
                        title="需要陪诊员身份"
                        description="请先登录陪诊员账号查看晋升信息"
                        onLogin={onLogin}
                        showDebugInject={process.env.NODE_ENV === 'development'}
                        primaryColor={primaryColor}
                        isDarkMode={isDarkMode}
                    />
                </Box>
            </Box>
        )
    }

    // 加载中
    if (loading) {
        return <PromotionPageSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
    }

    // 错误状态
    if (error || !promotionData) {
        return (
            <Box
                style={{
                    minHeight: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: bgColor,
                }}
            >
                {/* 导航栏 */}
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
                            justifyContent: 'center',
                            position: 'relative',
                            height: 44 * wxScale,
                            paddingLeft: 12 * wxScale,
                            paddingRight: 12 * wxScale,
                        }}
                    >
                        <Box
                            onClick={handleBack}
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
                        <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
                            晋升进度
                        </Text>
                    </Box>
                </Box>

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
                    <Icon name="caution" size={48 * wxScale} color={textSecondary} />
                    <Text
                        style={{
                            display: 'block',
                            marginTop: 16 * wxScale,
                            fontSize: 14 * wxScale,
                            color: textSecondary,
                        }}
                    >
                        加载失败，请稍后重试
                    </Text>
                    <Box
                        onClick={handleRetry}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8 * wxScale,
                            marginTop: 16 * wxScale,
                            paddingLeft: 16 * wxScale,
                            paddingRight: 16 * wxScale,
                            paddingTop: 8 * wxScale,
                            paddingBottom: 8 * wxScale,
                            borderRadius: 8 * wxScale,
                            backgroundColor: primaryColor,
                        }}
                    >
                        <Icon name="refresh" size={16 * wxScale} color="#fff" />
                        <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>重试</Text>
                    </Box>
                </Box>
            </Box>
        )
    }

    const { currentLevel, nextLevel } = promotionData
    const isMaxLevel = !nextLevel

    // 主界面
    return (
        <Box
            style={{
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: bgColor,
            }}
        >
            {/* 导航栏 */}
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
                        justifyContent: 'center',
                        position: 'relative',
                        height: 44 * wxScale,
                        paddingLeft: 12 * wxScale,
                        paddingRight: 12 * wxScale,
                    }}
                >
                    <Box
                        onClick={handleBack}
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
                    <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
                        晋升进度
                    </Text>
                </Box>
            </Box>

            {/* 内容区域 */}
            <Box style={{ flex: 1, padding: 16 * wxScale }}>
                {/* 当前等级卡片 */}
                <CurrentLevelCard
                    level={currentLevel}
                    primaryColor={primaryColor}
                    cardBg={cardBg}
                    textPrimary={textPrimary}
                    textSecondary={textSecondary}
                    isDarkMode={isDarkMode}
                />

                {/* 已达最高级提示 */}
                {isMaxLevel && (
                    <Box style={{ marginTop: 16 * wxScale }}>
                        <MaxLevelCard
                            currentLevel={currentLevel}
                            primaryColor={primaryColor}
                            textSecondary={textSecondary}
                        />
                    </Box>
                )}

                {/* 下一等级信息（非最高级时显示） */}
                {nextLevel && (
                    <>
                        <Box style={{ marginTop: 16 * wxScale }}>
                            <NextLevelCard
                                currentLevel={currentLevel}
                                nextLevel={nextLevel}
                                primaryColor={primaryColor}
                                cardBg={cardBg}
                                textPrimary={textPrimary}
                                textSecondary={textSecondary}
                                isDarkMode={isDarkMode}
                            />
                        </Box>

                        <Box style={{ marginTop: 16 * wxScale }}>
                            <RequirementsCard
                                requirements={nextLevel.requirements}
                                primaryColor={primaryColor}
                                cardBg={cardBg}
                                textPrimary={textPrimary}
                                textSecondary={textSecondary}
                                isDarkMode={isDarkMode}
                            />
                        </Box>
                    </>
                )}

                {/* 底部提示 */}
                <Text
                    style={{
                        display: 'block',
                        fontSize: 12 * wxScale,
                        textAlign: 'center',
                        marginTop: 16 * wxScale,
                        paddingBottom: 16 * wxScale,
                        color: isDarkMode ? '#6b7280' : '#9ca3af',
                    }}
                >
                    {isMaxLevel ? '感谢您的支持与信任' : '完成所有条件后将自动晋升'}
                </Text>
            </Box>
        </Box>
    )
}

