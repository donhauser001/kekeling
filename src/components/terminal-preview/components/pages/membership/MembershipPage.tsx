/**
 * 会员中心页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Button/Icon
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: emoji → Icon 组件
 * - 规则 4.1: 添加骨架屏
 * - 规则 12: 拆分为模块化组件
 *
 * 文件结构：
 * - types.ts - 类型定义
 * - constants.ts - 常量和工具函数
 * - MembershipCard.tsx - 会员卡片
 * - BenefitsGrid.tsx - 权益网格
 * - MembershipPageSkeleton.tsx - 骨架屏
 * - NoMembership.tsx - 未开通状态
 * - ErrorState.tsx - 错误状态
 * - MembershipPage.tsx - 主组件（本文件）
 */

import { useState, useEffect, useMemo } from 'react'
import { Box, Text, Icon } from '../../../ui/primitives'
import { previewApi } from '../../../api'
import { wxScale, wxSafeAreaTop, getColorConfig } from './constants'
import { MembershipCard } from './MembershipCard'
import { BenefitsGrid } from './BenefitsGrid'
import { MembershipPageSkeleton } from './MembershipPageSkeleton'
import { NoMembership } from './NoMembership'
import { ErrorState } from './ErrorState'
import type { MembershipPageProps, MembershipInfo } from './types'

// ============================================================================
// 主组件
// ============================================================================

export function MembershipPage({
    themeSettings,
    isDarkMode,
    onBack,
    onNavigate,
    membershipOverride,
}: MembershipPageProps) {
    // 是否使用覆盖数据（undefined 表示不覆盖）
    const hasOverride = membershipOverride !== undefined

    // ============================================================================
    // 数据状态（规则 4: useState + useEffect 替代 useQuery）
    // ============================================================================
    const [apiMembership, setApiMembership] = useState<MembershipInfo | null>(null)
    const [isLoading, setIsLoading] = useState(!hasOverride)
    const [isError, setIsError] = useState(false)

    // 获取会员信息
    useEffect(() => {
        if (hasOverride) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setIsError(false)

        previewApi
            .getMyMembership()
            .then((data) => {
                setApiMembership(data)
                setIsLoading(false)
            })
            .catch((err) => {
                console.error('[MembershipPage] 加载会员信息失败:', err)
                setIsError(true)
                setIsLoading(false)
            })
    }, [hasOverride])

    // 重试加载
    const handleRetry = () => {
        setIsLoading(true)
        setIsError(false)

        previewApi
            .getMyMembership()
            .then((data) => {
                setApiMembership(data)
                setIsLoading(false)
            })
            .catch((err) => {
                console.error('[MembershipPage] 重试加载失败:', err)
                setIsError(true)
                setIsLoading(false)
            })
    }

    // 合并数据：覆盖优先
    const membership = useMemo<MembershipInfo | null>(() => {
        if (hasOverride) {
            // null 表示用户未开通会员
            if (membershipOverride === null) return null
            // 覆盖数据转换为完整类型（提供默认值）
            return {
                id: membershipOverride.id ?? 'override-membership',
                level: membershipOverride.level ?? 'default',
                levelName: membershipOverride.levelName ?? '会员',
                expireAt: membershipOverride.expireAt ?? '2099-12-31',
                points: membershipOverride.points ?? 0,
            }
        }
        return apiMembership ?? null
    }, [hasOverride, membershipOverride, apiMembership])

    // 状态计算
    const hasMembership = !!membership

    // 颜色定义
    const { bgColor, primaryColor } = getColorConfig(isDarkMode, themeSettings.primaryColor)

    // 加载中显示骨架屏
    if (isLoading) {
        return (
            <MembershipPageSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
        )
    }

    return (
        <Box
            style={{
                minHeight: '100%',
                backgroundColor: bgColor,
            }}
        >
            {/* 页面标题 */}
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
                        position: 'relative',
                        height: 44 * wxScale,
                        paddingLeft: 12 * wxScale,
                        paddingRight: 12 * wxScale,
                    }}
                >
                    {/* 返回按钮 */}
                    <Box
                        onClick={onBack}
                        style={{
                            position: 'absolute',
                            left: 12 * wxScale,
                            width: 36 * wxScale,
                            height: 36 * wxScale,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon name="left" size={22 * wxScale} color="#fff" />
                    </Box>

                    {/* 标题 */}
                    <Text
                        style={{
                            fontSize: 17 * wxScale,
                            fontWeight: 600,
                            color: '#ffffff',
                        }}
                    >
                        会员中心
                    </Text>
                </Box>
            </Box>

            {/* 会员卡片区 */}
            <Box
                style={{
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    paddingTop: 16 * wxScale,
                }}
            >
                {/* 请求失败 - 带重试按钮 */}
                {isError && (
                    <ErrorState
                        isDarkMode={isDarkMode}
                        primaryColor={primaryColor}
                        onRetry={handleRetry}
                    />
                )}

                {/* 已开通会员 */}
                {!isError && hasMembership && (
                    <MembershipCard
                        membership={membership}
                        themeSettings={themeSettings}
                        isDarkMode={isDarkMode}
                        onNavigate={onNavigate}
                    />
                )}

                {/* 未开通会员 */}
                {!isError && !hasMembership && (
                    <NoMembership
                        themeSettings={themeSettings}
                        isDarkMode={isDarkMode}
                        onNavigate={onNavigate}
                    />
                )}
            </Box>

            {/* 会员权益列表 */}
            {!isError && (
                <BenefitsGrid themeSettings={themeSettings} isDarkMode={isDarkMode} />
            )}

            {/* 底部留白 */}
            <Box style={{ height: 64 * wxScale }} />
        </Box>
    )
}

