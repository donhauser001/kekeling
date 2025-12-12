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

interface UserTag {
    id: string
    name: string
    description: string
    userCount: number
    color: string
    category: string
    createdAt: string
}

interface UserTagsTableProps {
    table: TanstackTable<UserTag>
    isLoading?: boolean
    onRowClick?: (tag: UserTag) => void
}

export function UserTagsTable({ table, isLoading, onRowClick }: UserTagsTableProps) {
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
                                    <div className='flex items-center gap-3'>
                                        <Skeleton className='h-8 w-8 rounded-lg' />
                                        <Skeleton className='h-4 w-24' />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className='h-6 w-20' /></TableCell>
                                <TableCell><Skeleton className='h-4 w-32' /></TableCell>
                                <TableCell><Skeleton className='h-4 w-16' /></TableCell>
                                <TableCell><Skeleton className='h-4 w-20' /></TableCell>
                                <TableCell><Skeleton className='h-8 w-8' /></TableCell>
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
                                className={cn('group/row', onRowClick && 'cursor-pointer')}
                                onClick={() => onRowClick?.(row.original)}
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
