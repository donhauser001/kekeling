import { useState, useMemo, type ReactNode } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    Shield,
    Plus,
    Loader2,
    Check,
    Star,
    Heart,
    Clock,
    Banknote,
    Lock,
    ThumbsUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
    DataTableToolbar,
    DataTablePagination,
    DataTableViewOptions,
} from '@/components/data-table'
import {
    useServiceGuarantees,
    useCreateServiceGuarantee,
    useUpdateServiceGuarantee,
    useDeleteServiceGuarantee,
} from '@/hooks/use-api'
import type { ServiceGuarantee } from '@/lib/api'
import {
    ServiceGuaranteesTable,
    ServiceGuaranteesDetailSheet,
    getServiceGuaranteesColumns,
} from './components'

// 图标选项
const iconOptions: { value: string; label: string; icon: ReactNode }[] = [
    { value: 'shield', label: '盾牌', icon: <Shield className='h-4 w-4' /> },
    { value: 'check', label: '对勾', icon: <Check className='h-4 w-4' /> },
    { value: 'star', label: '星星', icon: <Star className='h-4 w-4' /> },
    { value: 'heart', label: '爱心', icon: <Heart className='h-4 w-4' /> },
    { value: 'clock', label: '时钟', icon: <Clock className='h-4 w-4' /> },
    { value: 'money', label: '金钱', icon: <Banknote className='h-4 w-4' /> },
    { value: 'lock', label: '锁', icon: <Lock className='h-4 w-4' /> },
    { value: 'thumbs-up', label: '点赞', icon: <ThumbsUp className='h-4 w-4' /> },
]

// 状态选项
const statusOptions = [
    { value: 'active', label: '启用' },
    { value: 'inactive', label: '停用' },
]

// 表单数据类型
interface GuaranteeFormData {
    name: string
    icon: string
    description: string
    sort: string
    status: string
}

const defaultFormData: GuaranteeFormData = {
    name: '',
    icon: 'shield',
    description: '',
    sort: '0',
    status: 'active',
}

export function ServiceGuarantees() {
    // 分页和筛选状态
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 弹窗状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [detailSheetOpen, setDetailSheetOpen] = useState(false)
    const [currentRow, setCurrentRow] = useState<ServiceGuarantee | null>(null)
    const [formData, setFormData] = useState<GuaranteeFormData>(defaultFormData)

    // API hooks
    const { data: guarantees = [], isLoading } = useServiceGuarantees({})
    const createMutation = useCreateServiceGuarantee()
    const updateMutation = useUpdateServiceGuarantee()
    const deleteMutation = useDeleteServiceGuarantee()

    // 打开创建弹窗
    const handleCreate = () => {
        setCurrentRow(null)
        setFormData(defaultFormData)
        setDialogOpen(true)
    }

    // 查看详情
    const handleView = (item: ServiceGuarantee) => {
        setCurrentRow(item)
        setDetailSheetOpen(true)
    }

    // 编辑
    const handleEdit = (item: ServiceGuarantee) => {
        setCurrentRow(item)
        setFormData({
            name: item.name,
            icon: item.icon,
            description: item.description || '',
            sort: item.sort.toString(),
            status: item.status,
        })
        setDialogOpen(true)
    }

    // 删除
    const handleDelete = (item: ServiceGuarantee) => {
        setCurrentRow(item)
        setDeleteDialogOpen(true)
    }

    // 确认删除
    const handleConfirmDelete = async () => {
        if (!currentRow) return

        try {
            await deleteMutation.mutateAsync(currentRow.id)
            toast.success('删除成功')
            setDeleteDialogOpen(false)
            setCurrentRow(null)
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '删除失败')
        }
    }

    // 切换状态
    const handleToggleStatus = async (item: ServiceGuarantee) => {
        try {
            const newStatus = item.status === 'active' ? 'inactive' : 'active'
            await updateMutation.mutateAsync({
                id: item.id,
                data: { status: newStatus },
            })
            toast.success(newStatus === 'active' ? '已启用' : '已停用')
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '操作失败')
        }
    }

    // 保存
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('请输入保障名称')
            return
        }

        const submitData = {
            name: formData.name.trim(),
            icon: formData.icon,
            description: formData.description.trim() || undefined,
            sort: parseInt(formData.sort) || 0,
            status: formData.status as 'active' | 'inactive',
        }

        try {
            if (currentRow) {
                await updateMutation.mutateAsync({
                    id: currentRow.id,
                    data: submitData,
                })
                toast.success('更新成功')
            } else {
                await createMutation.mutateAsync(submitData)
                toast.success('创建成功')
            }
            setDialogOpen(false)
        } catch (err: unknown) {
            const error = err as Error
            toast.error(error.message || '操作失败')
        }
    }

    // 列定义
    const columns = useMemo(
        () => getServiceGuaranteesColumns({
            onView: handleView,
            onEdit: handleEdit,
            onToggleStatus: handleToggleStatus,
            onDelete: handleDelete,
        }),
        []
    )

    // 表格实例（客户端分页）
    const table = useReactTable({
        data: guarantees,
        columns,
        state: {
            columnFilters,
            globalFilter,
            pagination: { pageIndex: page - 1, pageSize },
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function'
                ? updater({ pageIndex: page - 1, pageSize })
                : updater
            setPage(newState.pageIndex + 1)
            setPageSize(newState.pageSize)
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <>
            <Header>
                <Search />
                <div className='ms-auto flex items-center gap-4'>
                    <MessageButton />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>服务保障</h2>
                        <p className='text-muted-foreground'>
                            管理服务保障条目，可在服务中引用展示给消费者
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加保障
                    </Button>
                </div>

                {/* 工具栏 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索保障名称...'
                        searchKey='name'
                        filters={[
                            {
                                columnId: 'status',
                                title: '状态',
                                options: statusOptions,
                            },
                        ]}
                    />
                    <DataTableViewOptions table={table} className='ml-auto' />
                </div>

                {/* 表格 */}
                <ServiceGuaranteesTable
                    table={table}
                    isLoading={isLoading}
                    onRowClick={handleView}
                />

                {/* 分页 */}
                <DataTablePagination table={table} className='mt-auto' />
            </Main>

            {/* 创建/编辑弹窗 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='max-w-lg'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Shield className='h-5 w-5' />
                            {currentRow ? '编辑保障' : '添加保障'}
                        </DialogTitle>
                        <DialogDescription>
                            {currentRow ? '修改保障信息' : '添加新的服务保障条目'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>
                                    保障名称 <span className='text-destructive'>*</span>
                                </Label>
                                <Input
                                    placeholder='如：平台担保'
                                    value={formData.name}
                                    onChange={e =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>图标</Label>
                                <Select
                                    value={formData.icon}
                                    onValueChange={v =>
                                        setFormData({ ...formData, icon: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {iconOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <span className='flex items-center gap-2'>
                                                    <span className='text-emerald-500'>{opt.icon}</span>
                                                    <span>{opt.label}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>详细说明</Label>
                            <Textarea
                                placeholder='输入保障的详细说明，消费者点击后可以查看'
                                value={formData.description}
                                onChange={e =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={4}
                            />
                            <p className='text-xs text-muted-foreground'>
                                详细说明会在消费者点击保障项时弹出显示
                            </p>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>排序</Label>
                                <Input
                                    type='number'
                                    value={formData.sort}
                                    onChange={e =>
                                        setFormData({ ...formData, sort: e.target.value })
                                    }
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>状态</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={v =>
                                        setFormData({ ...formData, status: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            {currentRow ? '保存' : '创建'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 删除确认弹窗 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                handleConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                disabled={(currentRow?.usageCount || 0) > 0}
                title='删除服务保障'
                desc={
                    <>
                        确定要删除保障「{currentRow?.name}」吗？
                        {(currentRow?.usageCount || 0) > 0 && (
                            <span className='text-destructive mt-2 block'>
                                该保障已被 {currentRow?.usageCount} 个服务使用，无法删除！
                            </span>
                        )}
                    </>
                }
                confirmText='删除'
                destructive
            />

            {/* 详情抽屉 */}
            <ServiceGuaranteesDetailSheet
                open={detailSheetOpen}
                onOpenChange={setDetailSheetOpen}
                item={currentRow}
                onEdit={handleEdit}
            />
        </>
    )
}
