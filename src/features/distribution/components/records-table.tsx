import { type Table as TanstackTable, flexRender } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { DistributionRecord } from '@/lib/api'

interface RecordsTableProps {
    table: TanstackTable<DistributionRecord>
    isLoading?: boolean
}

export function RecordsTable({ table, isLoading }: RecordsTableProps) {
    const columns = table.getAllColumns()

    if (isLoading) {
        return (
            <div className='overflow-hidden rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.id}>
                                    <Skeleton className='h-4 w-20' />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-4 w-4' />
                                        <Skeleton className='h-4 w-16' />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='space-y-1'>
                                        <Skeleton className='h-4 w-20' />
                                        <Skeleton className='h-3 w-24' />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='space-y-1'>
                                        <Skeleton className='h-4 w-20' />
                                        <Skeleton className='h-3 w-24' />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className='h-5 w-16' /></TableCell>
                                <TableCell><Skeleton className='h-4 w-16' /></TableCell>
                                <TableCell><Skeleton className='h-4 w-10' /></TableCell>
                                <TableCell><Skeleton className='h-4 w-16' /></TableCell>
                                <TableCell><Skeleton className='h-5 w-14' /></TableCell>
                                <TableCell><Skeleton className='h-4 w-32' /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <div className='overflow-hidden rounded-md border'>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className='group/row'>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={cn(
                                            'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                            header.column.columnDef.meta?.className,
                                            header.column.columnDef.meta?.thClassName
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                                className='group/row'
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        className={cn(
                                            'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                            cell.column.columnDef.meta?.className,
                                            cell.column.columnDef.meta?.tdClassName
                                        )}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className='h-24 text-center'
                            >
                                暂无数据
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

