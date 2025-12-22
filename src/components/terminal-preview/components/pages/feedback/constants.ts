/**
 * 意见反馈模块常量
 */

import { isWxEnvironment } from '../../../platform/env'
import type { FeedbackType } from './types'

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export const FEEDBACK_TYPES: FeedbackType[] = [
    { value: 'suggestion', label: '功能建议', desc: '对产品功能的改进建议' },
    { value: 'bug', label: '问题反馈', desc: '使用过程中遇到的问题' },
    { value: 'service', label: '服务相关', desc: '对服务质量的意见或建议' },
    { value: 'experience', label: '体验优化', desc: '使用体验方面的建议' },
    { value: 'other', label: '其他', desc: '以上类型未涵盖的其他反馈' },
]

/**
 * 跨平台显示 Toast 消息
 */
export function showToast(message: string, type: 'success' | 'error' | 'none' = 'none') {
    if (isWxEnvironment() && typeof wx !== 'undefined') {
        wx.showToast({
            title: message,
            icon: type === 'success' ? 'success' : 'none',
        })
    } else {
        // Web 环境使用 alert（后续可替换为 toast 组件）
        if (type === 'error' || type === 'none') {
            alert(message)
        }
    }
}

