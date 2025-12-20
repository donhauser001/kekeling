/**
 * 结算配置 API
 */

import { request } from './request'

export interface SettlementConfig {
    id: string
    defaultRate: number           // 默认分成比例 (0-100)
    minWithdrawAmount: number     // 最低提现金额
    withdrawFeeRate: number       // 提现手续费率 (0-1)
    withdrawFeeFixed: number      // 固定手续费
    settlementMode: 'realtime' | 'frozen'  // 结算模式
    settlementDays: number        // 冻结天数
    withdrawDaysOfWeek: number[]  // 允许提现的星期
    withdrawTimeRange: { start: string; end: string } // 允许提现的时间段
    updatedAt: string
}

export interface UpdateSettlementConfigDto {
    defaultRate?: number
    minWithdrawAmount?: number
    withdrawFeeRate?: number
    withdrawFeeFixed?: number
    settlementMode?: 'realtime' | 'frozen'
    settlementDays?: number
    withdrawDaysOfWeek?: number[]
    withdrawTimeRange?: { start: string; end: string }
}

export interface PendingUnfreezeStats {
    totalPending: { amount: number; count: number }
    todayUnfreeze: { amount: number; count: number }
    overdueUnfreeze: { amount: number; count: number }
}

export const settlementApi = {
    // 获取配置
    getConfig: () =>
        request<SettlementConfig>('/admin/settlement/config'),

    // 更新配置
    updateConfig: (data: UpdateSettlementConfigDto) =>
        request<SettlementConfig>('/admin/settlement/config', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // 获取待解冻统计
    getPendingUnfreeze: () =>
        request<PendingUnfreezeStats>('/admin/settlement/pending-unfreeze'),
}

