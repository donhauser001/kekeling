/**
 * 晋升进度页面常量
 */

import { isWxEnvironment } from '../../../../platform/env'

export const wxScale = isWxEnvironment() ? 1.1 : 1
export const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

/**
 * 获取条件类型的中文名称
 */
export function getRequirementTypeName(type: string): string {
    const names: Record<string, string> = {
        team_size: '团队人数',
        total_orders: '累计订单',
        monthly_orders: '本月订单',
    }
    return names[type] || type
}

/**
 * 计算条件完成进度（0-100）
 * ⚠️ 正确处理 current = 0 的情况
 */
export function calculateProgress(current: number, required: number): number {
    if (required <= 0) return 100
    // current 为 0 时返回 0，不返回 undefined
    return Math.min(Math.round((current / required) * 100), 100)
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, digits = 0): string {
    return (value * 100).toFixed(digits)
}

