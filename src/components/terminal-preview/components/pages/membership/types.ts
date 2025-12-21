/**
 * 会员中心页面 - 类型定义
 */

import type { ThemeSettings, MembershipInfoOverride } from '../../../types'
import type { MembershipInfo, MembershipPlan } from '../../../api'

// ============================================================================
// Props 类型
// ============================================================================

export interface MembershipPageProps {
    themeSettings: ThemeSettings
    isDarkMode: boolean
    onBack?: () => void
    onNavigate?: (page: string) => void
    /**
     * 会员信息覆盖
     * - undefined: 不覆盖，使用 API 数据
     * - null: 用户未开通会员
     * - object: 覆盖数据
     */
    membershipOverride?: MembershipInfoOverride | null
}

export interface MembershipCardProps {
    membership: MembershipInfo
    themeSettings: ThemeSettings
    isDarkMode: boolean
    onNavigate?: (page: string) => void
}

export interface BenefitsGridProps {
    themeSettings: ThemeSettings
    isDarkMode: boolean
}

export interface MembershipSkeletonProps {
    primaryColor: string
    isDarkMode: boolean
}

export interface NoMembershipProps {
    themeSettings: ThemeSettings
    isDarkMode: boolean
    onNavigate?: (page: string) => void
}

export interface ErrorStateProps {
    isDarkMode: boolean
    primaryColor: string
    onRetry: () => void
}

// ============================================================================
// 权益类型
// ============================================================================

export interface MembershipBenefit {
    id: string
    name: string
    icon: string
    description?: string
}

// ============================================================================
// Re-export
// ============================================================================

export type { MembershipInfo, MembershipPlan }

