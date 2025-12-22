/**
 * 意见反馈模块类型定义
 */

import type { ThemeSettings } from '../../../types'

export interface FeedbackPageProps {
    themeSettings: ThemeSettings
    isDarkMode: boolean
    onBack?: () => void
    onNavigate?: (page: string, params?: Record<string, string>) => void
}

export interface FeedbackType {
    value: string
    label: string
    desc: string
}

export interface FeedbackFormData {
    type: string
    content: string
    contact: string
    images: string[]
}

