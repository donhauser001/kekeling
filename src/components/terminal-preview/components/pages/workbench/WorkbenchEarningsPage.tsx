/**
 * 陪诊员收入统计页面（预览器版本）
 *
 * page key: 'workbench-earnings'
 * API: previewApi.getEarningsStats()
 * 数据通道: escortRequest（⚠️ 需要 escortToken）
 *
 * 指标卡片：总收入、本月收入、可提现、提现中、订单数
 * 列表：最近 5 笔收入记录
 *
 * 降级策略：
 * - 有 escortToken 时走真实请求
 * - 无 token 或请求失败时自动降级到 mock 数据
 */

import { useQuery } from '@tanstack/react-query'
import {
    Wallet,
    TrendingUp,
    CreditCard,
    Clock,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Gift,
    RefreshCw,
    type LucideIcon,
} from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi, type EarningsStats, type EarningsStatsRecord } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'

// ============================================================================
// 类型定义
// ============================================================================

export interface WorkbenchEarningsPageProps {
    themeSettings: ThemeSettings
    isDarkMode: boolean
    effectiveViewerRole: PreviewViewerRole
    onBack?: () => void
    onNavigate?: (page: string, params?: Record<string, string>) => void
    /** 显示登录弹窗回调 */
    onShowLoginDialog?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function WorkbenchEarningsPage({
    themeSettings,
    isDarkMode,
    effectiveViewerRole,
    onBack,
    onNavigate,
    onShowLoginDialog,
}: WorkbenchEarningsPageProps) {
    const isEscort = effectiveViewerRole === 'escort'

    // ⚠️ 非 escort 视角时不发请求
    const {
        data: earningsStats,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['preview', 'workbench', 'earnings-stats'],
        queryFn: () => previewApi.getEarningsStats(),
        staleTime: 60 * 1000,
        enabled: isEscort, // 只有 escort 视角才发请求
    })

    // 非 escort 视角：显示统一的 PermissionPrompt
    if (!isEscort) {
        return (
            <div
                className="min-h-full flex flex-col"
                style={{
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
                }}
            >
                <Header themeSettings={themeSettings} onBack={onBack} />
                {/* 权限提示 */}
                <div className="flex-1">
                    <PermissionPrompt
                        title="需要陪诊员身份"
                        description="请先登录陪诊员账号后再查看收入明细"
                        onLogin={onShowLoginDialog}
                        showDebugInject={process.env.NODE_ENV === 'development'}
                        primaryColor={themeSettings.primaryColor}
                        isDarkMode={isDarkMode}
                    />
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-full"
            style={{
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
            }}
        >
            {/* 页面标题 */}
            <Header themeSettings={themeSettings} onBack={onBack} />

            {/* 加载中 */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-gray-400 text-sm">加载中...</div>
                </div>
            )}

            {/* 请求失败 */}
            {isError && !earningsStats && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-4xl mb-2">😔</div>
                    <div className="text-gray-400 text-sm">加载失败，请稍后重试</div>
                </div>
            )}

            {/* 数据内容 */}
            {!isLoading && earningsStats && (
                <EarningsContent
                    stats={earningsStats}
                    themeSettings={themeSettings}
                    isDarkMode={isDarkMode}
                    onNavigate={onNavigate}
                />
            )}

            {/* 底部留白 */}
            <div className="h-16" />
        </div>
    )
}

// ============================================================================
// 内容组件
// ============================================================================

interface EarningsContentProps {
    stats: EarningsStats
    themeSettings: ThemeSettings
    isDarkMode: boolean
    onNavigate?: (page: string, params?: Record<string, string>) => void
}

function EarningsContent({
    stats,
    themeSettings,
    isDarkMode,
    onNavigate,
}: EarningsContentProps) {
    const records = stats.recentRecords ?? []
    const monthlyGrowth = stats.monthlyOrdersGrowth ?? 0

    return (
        <>
            {/* 收入概览卡片 */}
            <div className="px-4 py-4">
                <div
                    className="rounded-2xl p-5 relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${adjustColor(themeSettings.primaryColor, -20)} 100%)`,
                    }}
                >
                    {/* 装饰图案 */}
                    <div
                        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10"
                        style={{ backgroundColor: '#fff' }}
                    />
                    <div
                        className="absolute -right-8 top-12 w-16 h-16 rounded-full opacity-10"
                        style={{ backgroundColor: '#fff' }}
                    />

                    <div className="relative z-10">
                        <div className="text-white/80 text-sm font-medium">可提现余额</div>
                        <div className="text-white text-4xl font-bold mt-2 tracking-tight">
                            ¥{stats.withdrawable.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                        </div>

                        {/* 提现中金额 */}
                        {stats.pendingWithdraw > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                                <Clock className="w-3.5 h-3.5 text-white/60" />
                                <span className="text-white/60 text-xs">
                                    提现中 ¥{stats.pendingWithdraw.toFixed(2)}
                                </span>
                            </div>
                        )}

                        {/* 提现按钮 */}
                        <button
                            onClick={() => onNavigate?.('workbench-withdraw')}
                            className="mt-4 px-6 py-2.5 rounded-full bg-white text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
                            style={{ color: themeSettings.primaryColor }}
                        >
                            立即提现
                        </button>
                    </div>
                </div>
            </div>

            {/* 指标卡片网格 */}
            <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        Icon={Wallet}
                        label="总收入"
                        value={stats.totalEarnings}
                        prefix="¥"
                        isDarkMode={isDarkMode}
                        accentColor="#10b981"
                    />
                    <StatCard
                        Icon={TrendingUp}
                        label="本月收入"
                        value={stats.monthlyEarnings}
                        prefix="¥"
                        isDarkMode={isDarkMode}
                        accentColor={themeSettings.primaryColor}
                    />
                    <StatCard
                        Icon={CreditCard}
                        label="提现中"
                        value={stats.pendingWithdraw}
                        prefix="¥"
                        isDarkMode={isDarkMode}
                        accentColor="#f59e0b"
                    />
                    <StatCard
                        Icon={FileText}
                        label="累计订单"
                        value={stats.totalOrders}
                        suffix="单"
                        isDarkMode={isDarkMode}
                        accentColor="#6366f1"
                    />
                </div>

                {/* 本月订单数（单独一行） */}
                <div
                    className="mt-3 rounded-xl p-4 flex items-center justify-between"
                    style={{
                        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${themeSettings.primaryColor}15` }}
                        >
                            <FileText className="w-5 h-5" style={{ color: themeSettings.primaryColor }} />
                        </div>
                        <div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                本月完成订单
                            </div>
                            <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {stats.monthlyOrders} <span className="text-sm font-normal">单</span>
                            </div>
                        </div>
                    </div>
                    {monthlyGrowth !== 0 && (
                        <div
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: monthlyGrowth > 0 ? `${themeSettings.primaryColor}15` : '#ef444415',
                                color: monthlyGrowth > 0 ? themeSettings.primaryColor : '#ef4444',
                            }}
                        >
                            较上月 {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth}%
                        </div>
                    )}
                </div>
            </div>

            {/* 收支明细列表 */}
            <div className="px-4 pb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        最近收支
                    </div>
                    <button
                        className="text-xs font-medium flex items-center gap-0.5"
                        style={{ color: themeSettings.primaryColor }}
                    >
                        全部记录
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {records.length === 0 ? (
                    <div
                        className="rounded-xl py-12 text-center"
                        style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
                    >
                        <div className="text-4xl mb-2">📊</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            暂无收支记录
                        </div>
                    </div>
                ) : (
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{
                            backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
                        }}
                    >
                        {records.map((record, index) => (
                            <EarningsRecordRow
                                key={record.id}
                                record={record}
                                themeSettings={themeSettings}
                                isDarkMode={isDarkMode}
                                isLast={index === records.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

// ============================================================================
// 子组件
// ============================================================================

interface HeaderProps {
    themeSettings: ThemeSettings
    onBack?: () => void
}

function Header({ themeSettings, onBack }: HeaderProps) {
    return (
        <div
            className="sticky top-0 z-10 px-4 py-3 flex items-center"
            style={{
                backgroundColor: themeSettings.primaryColor,
            }}
        >
            {onBack && (
                <button onClick={onBack} className="text-white mr-3 hover:opacity-80 transition-opacity">
                    ←
                </button>
            )}
            <h1 className="text-lg font-semibold text-white flex-1 text-center pr-6">
                收入明细
            </h1>
        </div>
    )
}

interface StatCardProps {
    Icon: LucideIcon
    label: string
    value: number
    prefix?: string
    suffix?: string
    isDarkMode: boolean
    accentColor: string
}

function StatCard({
    Icon,
    label,
    value,
    prefix = '',
    suffix = '',
    isDarkMode,
    accentColor,
}: StatCardProps) {
    const formattedValue = prefix === '¥'
        ? value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
        : value.toLocaleString('zh-CN')

    return (
        <div
            className="rounded-xl p-4"
            style={{
                backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            }}
        >
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}15` }}
                >
                    <Icon className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {label}
                </span>
            </div>
            <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {prefix}{formattedValue}{suffix}
            </div>
        </div>
    )
}

interface EarningsRecordRowProps {
    record: EarningsStatsRecord
    themeSettings: ThemeSettings
    isDarkMode: boolean
    isLast: boolean
}

function EarningsRecordRow({ record, themeSettings, isDarkMode, isLast }: EarningsRecordRowProps) {
    const isIncome = record.amount > 0
    const IconComponent = getRecordIcon(record.type)
    const iconColor = isIncome ? '#10b981' : isDarkMode ? '#9ca3af' : '#6b7280'

    // 状态标签
    const statusConfig = {
        completed: { text: '已完成', color: '#10b981' },
        pending: { text: '处理中', color: '#f59e0b' },
        failed: { text: '失败', color: '#ef4444' },
    }
    const status = statusConfig[record.status]

    return (
        <div
            className="flex items-center px-4 py-3.5"
            style={{
                borderBottom: isLast ? 'none' : `1px solid ${isDarkMode ? '#3a3a3a' : '#f3f4f6'}`,
            }}
        >
            {/* 图标 */}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                    backgroundColor: isIncome
                        ? `${themeSettings.primaryColor}15`
                        : isDarkMode ? '#3a3a3a' : '#f3f4f6',
                }}
            >
                <IconComponent
                    className="w-5 h-5"
                    style={{ color: iconColor }}
                />
            </div>

            {/* 信息 */}
            <div className="flex-1 ml-3 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {record.title}
                    </span>
                    {record.status !== 'completed' && (
                        <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                            style={{
                                backgroundColor: `${status.color}15`,
                                color: status.color,
                            }}
                        >
                            {status.text}
                        </span>
                    )}
                </div>
                <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {record.createdAt}
                    {record.orderNo && ` · ${record.orderNo}`}
                </div>
            </div>

            {/* 金额 */}
            <div
                className={`text-sm font-semibold flex-shrink-0 ${isIncome ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
            >
                {isIncome ? '+' : ''}{record.amount.toFixed(2)}
            </div>
        </div>
    )
}

// ============================================================================
// 辅助函数
// ============================================================================

function getRecordIcon(type: EarningsStatsRecord['type']) {
    switch (type) {
        case 'order':
            return ArrowUpRight
        case 'bonus':
            return Gift
        case 'withdraw':
            return ArrowDownRight
        case 'refund':
            return RefreshCw
        default:
            return ArrowUpRight
    }
}

/**
 * 调整颜色明暗度
 * @param color 原始颜色（hex格式）
 * @param amount 调整量（正数变亮，负数变暗）
 */
function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
