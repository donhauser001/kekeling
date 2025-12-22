/**
 * 工作台设置页面类型定义
 */

import type { ThemeSettings, PreviewViewerRole } from '../../../../types'

export interface WorkbenchSettingsPageProps {
    themeSettings: ThemeSettings
    isDarkMode: boolean
    /** 当前有效视角（必须为 escort 才能预览） */
    effectiveViewerRole: PreviewViewerRole
    onNavigate?: (page: string, params?: Record<string, string>) => void
    /** 退出陪诊员视角回调 */
    onExitEscortMode?: () => void
    /** 显示登录弹窗回调 */
    onLogin?: () => void
}

export interface WorkbenchSettings {
    profile: {
        name: string
        avatar?: string
        level: string
        rating: number
    }
    autoAcceptOrders: boolean
    preferences: {
        serviceTypes: string[]
        serviceAreas: string[]
        departments?: string[]
        workingHours?: {
            start: string
            end: string
        }
    }
    notifications: {
        newOrder: boolean
        orderStatus: boolean
        system: boolean
        marketing: boolean
    }
}

export interface SettingItemProps {
    icon: string
    iconColor: string
    label: string
    value: string
    isDarkMode: boolean
    primaryColor: string
    showBorder?: boolean
    onClick?: () => void
}

export interface SwitchItemProps {
    icon: string
    iconColor: string
    label: string
    description?: string
    checked: boolean
    loading?: boolean
    onChange: () => void
    isDarkMode: boolean
    primaryColor: string
    showBorder?: boolean
}

export interface ProfileCardProps {
    profile: WorkbenchSettings['profile']
    isDarkMode: boolean
    primaryColor: string
    onClick?: () => void
}

