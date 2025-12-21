/**
 * 用户资料编辑页面 - 类型定义
 */

import type { ThemeSettings } from '../../../types'

// ============================================================================
// Props 类型
// ============================================================================

export interface UserProfileEditPageProps {
    themeSettings: ThemeSettings
    isDarkMode?: boolean
    onBack?: () => void
    onNavigate?: (page: string, params?: Record<string, string>) => void
    /** 小程序专用：头像选择后回调 */
    onAvatarChoose?: (tempFilePath: string) => void
    /** 小程序专用：绑定手机号回调 */
    onBindPhone?: () => void
    /** 小程序专用：退出登录回调 */
    onLogout?: () => void
    /** 小程序专用：渲染自定义头像按钮 */
    renderAvatarButton?: (props: AvatarButtonProps) => React.ReactNode
    /** 小程序专用：渲染自定义绑定手机号按钮 */
    renderBindPhoneButton?: (props: BindPhoneButtonProps) => React.ReactNode
    /** 小程序专用：渲染自定义日期选择器 */
    renderDatePicker?: (props: DatePickerProps) => React.ReactNode
}

export interface AvatarButtonProps {
    avatarUrl: string | null
    onClick: () => void
    onAvatarChange: (url: string) => void
}

export interface BindPhoneButtonProps {
    onSuccess: () => void
}

export interface DatePickerProps {
    value: string
    onChange: (date: string) => void
}

// ============================================================================
// 组件内部类型
// ============================================================================

export interface ThemeColors {
    primaryColor: string
    bgColor: string
    cardBg: string
    borderColor: string
    textPrimary: string
    textSecondary: string
    textMuted: string
}

export interface GenderOption {
    value: string
    label: string
}

export interface FormSectionProps {
    colors: ThemeColors
    nickname: string
    setNickname: (value: string) => void
    phone: string | null | undefined
    gender: string
    birthday: string
    onGenderClick: () => void
    onBirthdayClick: () => void
    renderBindPhoneButton?: (props: BindPhoneButtonProps) => React.ReactNode
    onPhoneBindSuccess: () => void
}

export interface GenderPickerProps {
    visible: boolean
    onClose: () => void
    value: string
    onChange: (value: string) => void
    colors: ThemeColors
}

export interface DatePickerModalProps {
    visible: boolean
    onClose: () => void
    value: string
    onChange: (value: string) => void
    colors: ThemeColors
    renderDatePicker?: (props: DatePickerProps) => React.ReactNode
}

