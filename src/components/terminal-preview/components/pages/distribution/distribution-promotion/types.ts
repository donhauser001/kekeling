/**
 * 晋升进度页面类型定义
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../../types'

export interface DistributionPromotionPageProps {
    themeSettings: ThemeSettings
    isDarkMode: boolean
    effectiveViewerRole: PreviewViewerRole
    onNavigate?: (page: string, params?: Record<string, string>) => void
    onLogin?: () => void
}

export interface LevelInfo {
    name: string
    commissionRate: number
    benefits: string[]
}

export interface RequirementInfo {
    type: 'team_size' | 'total_orders' | 'monthly_orders'
    current: number
    required: number
}

export interface NextLevelInfo extends LevelInfo {
    requirements: RequirementInfo[]
}

export interface PromotionData {
    currentLevel: LevelInfo
    nextLevel?: NextLevelInfo
}

