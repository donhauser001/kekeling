import { flexRender, type Table as TableType } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { type ServiceCategory } from '@/lib/api'

interface ServiceCategoriesTableProps {
    table: TableType<ServiceCategory>
    isLoading: boolean
    onRowClick: (item: ServiceCategory) => void
}

export function ServiceCategoriesTable({
    table,
    isLoading,
    onRowClick,
}: ServiceCategoriesTableProps) {
    const columns = table.getAllColumns()

    return (
        <div className='overflow-hidden rounded-md border'>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                                {columns.map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className='h-4 w-full' />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className={cn(
                                    'group cursor-pointer',
                                    row.original.status !== 'active' && 'opacity-60'
                                )}
                                onClick={() => onRowClick(row.original)}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className='h-24 text-center'>
                                暂无数据
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

