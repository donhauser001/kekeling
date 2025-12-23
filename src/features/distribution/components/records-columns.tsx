import { type ColumnDef } from '@tanstack/react-table'
import {
    TrendingUp,
    Gift,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import type { DistributionRecord } from '@/lib/api'

// 状态配置
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    pending: { label: '待结算', variant: 'outline' },
    settled: { label: '已结算', variant: 'default' },
    cancelled: { label: '已取消', variant: 'secondary' },
}

// 类型配置
const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    order: { label: '订单分润', icon: <TrendingUp className="h-4 w-4 text-blue-600" /> },
    bonus: { label: '直推奖励', icon: <Gift className="h-4 w-4 text-purple-600" /> },
}

// 关系层级
const relationLabels: Record<number, string> = {
    1: '直接下级',
    2: '二级下级',
    3: '三级下级',
}

export function getRecordsColumns(): ColumnDef<DistributionRecord>[] {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatMoney = (amount: number) => {
        return `¥${amount.toFixed(2)}`
    }

    return [
        {
            accessorKey: 'type',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='类型' />
            ),
            cell: ({ row }) => {
                const type = row.getValue<string>('type')
                const typeInfo = typeConfig[type] || typeConfig.order
                return (
                    <div className='flex items-center gap-2'>
                        {typeInfo.icon}
                        <span>{typeInfo.label}</span>
                    </div>
                )
            },
            meta: { title: '类型' },
            filterFn: (row, id, value) => {
                if (!value || value.length === 0) return true
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: 'beneficiary',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='受益人' />
            ),
            cell: ({ row }) => {
                const beneficiary = row.original.beneficiary
                return beneficiary ? (
                    <div>
                        <div className='font-medium'>{beneficiary.name}</div>
                        <div className='text-sm text-muted-foreground font-mono'>
                            {beneficiary.phone}
                        </div>
                    </div>
                ) : (
                    <span className='text-muted-foreground'>-</span>
                )
            },
            meta: { title: '受益人' },
            enableSorting: false,
        },
        {
            accessorKey: 'sourceEscort',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='来源陪诊员' />
            ),
            cell: ({ row }) => {
                const sourceEscort = row.original.sourceEscort
                return sourceEscort ? (
                    <div>
                        <div className='font-medium'>{sourceEscort.name}</div>
                        <div className='text-sm text-muted-foreground font-mono'>
                            {sourceEscort.phone}
                        </div>
                    </div>
                ) : (
                    <span className='text-muted-foreground'>-</span>
                )
            },
            meta: { title: '来源陪诊员' },
            enableSorting: false,
        },
        {
            accessorKey: 'relationLevel',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='关系' />
            ),
            cell: ({ row }) => {
                const level = row.getValue<number>('relationLevel')
                return (
                    <Badge variant='outline'>
                        {relationLabels[level] || `${level}级`}
                    </Badge>
                )
            },
            meta: { title: '关系' },
        },
        {
            accessorKey: 'orderAmount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='订单金额' />
            ),
            cell: ({ row }) => (
                <span className='font-mono'>
                    {formatMoney(row.getValue<number>('orderAmount'))}
                </span>
            ),
            meta: { title: '订单金额' },
        },
        {
            accessorKey: 'rate',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='分润比例' />
            ),
            cell: ({ row }) => (
                <span className='font-mono'>
                    {row.getValue<number>('rate')}%
                </span>
            ),
            meta: { title: '分润比例' },
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='分润金额' />
            ),
            cell: ({ row }) => (
                <span className='font-medium text-green-600 font-mono'>
                    {formatMoney(row.getValue<number>('amount'))}
                </span>
            ),
            meta: { title: '分润金额' },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='状态' />
            ),
            cell: ({ row }) => {
                const status = row.getValue<string>('status')
                const statusInfo = statusConfig[status] || statusConfig.pending
                return (
                    <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                    </Badge>
                )
            },
            meta: { title: '状态' },
            filterFn: (row, id, value) => {
                if (!value || value.length === 0) return true
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='创建时间' />
            ),
            cell: ({ row }) => (
                <span className='text-muted-foreground'>
                    {formatDate(row.getValue<string>('createdAt'))}
                </span>
            ),
            meta: { title: '创建时间' },
        },
    ]
}

