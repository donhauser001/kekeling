import { useState, useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    type ColumnFiltersState,
    type ColumnDef,
} from '@tanstack/react-table'
import { Menu, Plus, Loader2, MoreHorizontal, Pencil, Trash2, ExternalLink, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { IconPicker, AppIcon, type IconName } from '@/components/ui/icon-picker'
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
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTablePagination } from '@/components/data-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { flexRender } from '@tanstack/react-table'
import {
    useCmsMenus,
    useCreateCmsMenu,
    useUpdateCmsMenu,
    useDeleteCmsMenu,
    useArticleCategories,
    useCmsPages,
} from '@/hooks/use-api'
import type { CmsMenu, MenuType } from '@/lib/api/cms'

// 状态选项
const statusOptions = [
    { value: 'active', label: '启用' },
    { value: 'inactive', label: '停用' },
]

// 类型选项
const typeOptions = [
    { value: 'link', label: '自定义链接', group: '基础' },
    { value: 'category', label: '文章分类', group: '基础' },
    { value: 'page', label: '页面', group: '基础' },
    { value: 'service_list', label: '服务列表', group: '业务页面' },
    { value: 'user_login', label: '用户登录页', group: '系统页面' },
    { value: 'escort_register', label: '陪诊员注册页', group: '系统页面' },
    { value: 'escort_login', label: '陪诊员登录页', group: '系统页面' },
    { value: 'escort_forgot_password', label: '陪诊员找回密码页', group: '系统页面' },
    { value: 'escort_profile', label: '陪诊员资料页', group: '系统页面' },
]

// 系统页面对应的路由
const systemPageRoutes: Record<string, string> = {
    user_login: '/login',
    escort_register: '/escort/register',
    escort_login: '/escort/login',
    escort_forgot_password: '/escort/forgot-password',
    escort_profile: '/escort/profile',
    service_list: '/services',
}

// 打开方式选项
const targetOptions = [
    { value: '_self', label: '当前窗口' },
    { value: '_blank', label: '新窗口' },
]

// 表单数据类型
interface MenuFormData {
    name: string
    code: string
    type: string
    url: string
    categoryId: string
    pageId: string
    target: string
    icon: string
    parentId: string
    isHome: boolean
    hideInMain: boolean
    sort: string
    status: string
}

const defaultFormData: MenuFormData = {
    name: '',
    code: '',
    type: 'link',
    url: '',
    categoryId: '',
    pageId: '',
    target: '_self',
    icon: '',
    parentId: '',
    isHome: false,
    hideInMain: false,
    sort: '0',
    status: 'active',
}

export function CmsMenus() {
    // 筛选状态
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    // 弹窗状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [currentRow, setCurrentRow] = useState<CmsMenu | null>(null)
    const [formData, setFormData] = useState<MenuFormData>(defaultFormData)

    // API hooks
    const { data: menus = [], isLoading } = useCmsMenus({})
    const { data: categories = [] } = useArticleCategories({ status: 'active' })
    const { data: pages = [] } = useCmsPages({ status: 'published' })
    const createMutation = useCreateCmsMenu()
    const updateMutation = useUpdateCmsMenu()
    const deleteMutation = useDeleteCmsMenu()

    // 顶级菜单列表（用于选择父级）
    const topLevelMenus = menus.filter((m) => !m.parentId)

    // 打开创建弹窗
    const handleCreate = (parentId?: string) => {
        setCurrentRow(null)
        setFormData({ ...defaultFormData, parentId: parentId || '' })
        setDialogOpen(true)
    }

    // 编辑
    const handleEdit = (item: CmsMenu) => {
        setCurrentRow(item)
        setFormData({
            name: item.name,
            code: item.code,
            type: item.type || 'link',
            url: item.url || '',
            categoryId: item.categoryId || '',
            pageId: item.pageId || '',
            target: item.target || '_self',
            icon: item.icon || '',
            parentId: item.parentId || '',
            isHome: item.isHome || false,
            hideInMain: item.hideInMain || false,
            sort: item.sort.toString(),
            status: item.status,
        })
        setDialogOpen(true)
    }

    // 删除
    const handleDelete = (item: CmsMenu) => {
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
    const handleToggleStatus = async (item: CmsMenu) => {
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
            toast.error('请输入菜单名称')
            return
        }
        if (!formData.code.trim()) {
            toast.error('请输入菜单代码')
            return
        }
        if (!/^[a-z0-9_-]+$/.test(formData.code)) {
            toast.error('菜单代码只能包含小写字母、数字、下划线和连字符')
            return
        }

        // 根据类型验证
        if (formData.type === 'link' && !formData.url.trim()) {
            toast.error('请输入链接地址')
            return
        }
        if (formData.type === 'category' && !formData.categoryId) {
            toast.error('请选择文章分类')
            return
        }
        if (formData.type === 'page' && !formData.pageId) {
            toast.error('请选择页面')
            return
        }

        // 系统页面类型
        const isSystemPage = ['user_login', 'escort_register', 'escort_login', 'escort_forgot_password', 'escort_profile'].includes(formData.type)

        const submitData = {
            name: formData.name.trim(),
            code: formData.code.trim(),
            type: formData.type as MenuType,
            url: formData.type === 'link' ? (formData.url.trim() || undefined) :
                isSystemPage ? systemPageRoutes[formData.type] : undefined,
            categoryId: formData.type === 'category' ? (formData.categoryId || undefined) : undefined,
            pageId: formData.type === 'page' ? (formData.pageId || undefined) : undefined,
            target: formData.target as '_self' | '_blank',
            icon: formData.icon.trim() || undefined,
            parentId: formData.parentId || undefined,
            isHome: formData.isHome,
            hideInMain: formData.hideInMain,
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
    const columns: ColumnDef<CmsMenu>[] = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: '菜单名称',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        {row.original.parentId && <ChevronRight className='h-4 w-4 text-muted-foreground ml-4' />}
                        {row.original.icon && (
                            <AppIcon name={row.original.icon as IconName} size={18} className='text-primary' />
                        )}
                        <span className='font-medium'>{row.original.name}</span>
                        {row.original.isHome && (
                            <Badge variant='secondary' className='ml-1 text-xs'>首页</Badge>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'code',
                header: '代码',
                cell: ({ getValue }) => (
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>{getValue() as string}</code>
                ),
            },
            {
                accessorKey: 'type',
                header: '类型',
                cell: ({ row }) => {
                    const type = row.original.type
                    const typeLabel = typeOptions.find((t) => t.value === type)?.label || type
                    return <Badge variant='outline'>{typeLabel}</Badge>
                },
            },
            {
                accessorKey: 'url',
                header: '目标',
                cell: ({ row }) => {
                    const { type, url, category, page, target } = row.original
                    if (type === 'category' && category) {
                        return (
                            <div className='text-sm text-muted-foreground'>
                                分类: {category.name}
                            </div>
                        )
                    }
                    if (type === 'page' && page) {
                        return (
                            <div className='text-sm text-muted-foreground'>
                                页面: {page.title}
                            </div>
                        )
                    }
                    // 系统页面
                    if (['user_login', 'escort_register', 'escort_login', 'escort_forgot_password', 'escort_profile'].includes(type)) {
                        const route = systemPageRoutes[type]
                        return (
                            <div className='text-sm text-muted-foreground'>
                                系统: {route}
                            </div>
                        )
                    }
                    if (url) {
                        return (
                            <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                <span className='truncate max-w-[180px]'>{url}</span>
                                {target === '_blank' && <ExternalLink className='h-3 w-3' />}
                            </div>
                        )
                    }
                    return <span className='text-muted-foreground'>-</span>
                },
            },
            {
                accessorKey: 'sort',
                header: '排序',
                cell: ({ getValue }) => <span className='text-muted-foreground'>{getValue() as number}</span>,
            },
            {
                accessorKey: 'status',
                header: '状态',
                cell: ({ row }) => {
                    const status = row.original.status
                    const hideInMain = row.original.hideInMain
                    return (
                        <div className='flex flex-col gap-1'>
                            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                                {status === 'active' ? '启用' : '停用'}
                            </Badge>
                            {hideInMain && (
                                <Badge variant='outline' className='text-xs text-amber-600 border-amber-300'>
                                    主菜单隐藏
                                </Badge>
                            )}
                        </div>
                    )
                },
                filterFn: (row, id, value) => value.includes(row.getValue(id)),
            },
            {
                id: 'actions',
                header: '操作',
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-8 w-8'>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                                <Pencil className='mr-2 h-4 w-4' />
                                编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreate(row.original.id)}>
                                <Plus className='mr-2 h-4 w-4' />
                                添加子菜单
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(row.original)}>
                                {row.original.status === 'active' ? '停用' : '启用'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='text-destructive focus:text-destructive'
                                onClick={() => handleDelete(row.original)}
                            >
                                <Trash2 className='mr-2 h-4 w-4' />
                                删除
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        []
    )

    // 表格实例
    const table = useReactTable({
        data: menus,
        columns,
        state: {
            columnFilters,
            globalFilter,
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
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
                        <h2 className='text-2xl font-bold tracking-tight'>菜单管理</h2>
                        <p className='text-muted-foreground'>
                            管理网站导航菜单，如顶部导航、底部链接等
                        </p>
                    </div>
                    <Button onClick={() => handleCreate()}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建菜单
                    </Button>
                </div>

                {/* 工具栏 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <Input
                        placeholder='搜索菜单名称...'
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className='h-8 w-[200px]'
                    />
                </div>

                {/* 表格 */}
                {isLoading ? (
                    <div className='rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((_, i) => (
                                        <TableHead key={i}>
                                            <Skeleton className='h-4 w-20' />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {columns.map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className='h-4 w-full' />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className='rounded-md border'>
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                )}

                {/* 分页 */}
                <DataTablePagination table={table} className='mt-auto' />
            </Main>

            {/* 创建/编辑弹窗 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='max-w-lg'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Menu className='h-5 w-5' />
                            {currentRow ? '编辑菜单' : '新建菜单'}
                        </DialogTitle>
                        <DialogDescription>
                            {currentRow ? '修改菜单信息' : '创建新的导航菜单'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>
                                    菜单名称 <span className='text-destructive'>*</span>
                                </Label>
                                <Input
                                    placeholder='如：关于我们'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>
                                    菜单代码 <span className='text-destructive'>*</span>
                                </Label>
                                <Input
                                    placeholder='如：about'
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                类型 <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(v) => {
                                    const disableHomePage = v === 'link' || ['user_login', 'escort_register', 'escort_login', 'escort_forgot_password'].includes(v)
                                    setFormData({
                                        ...formData,
                                        type: v,
                                        url: '',
                                        categoryId: '',
                                        pageId: '',
                                        isHome: disableHomePage ? false : formData.isHome,
                                    })
                                }}
                            >
                                <SelectTrigger className='w-full'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>基础类型</SelectLabel>
                                        {typeOptions.filter(opt => opt.group === '基础').map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>业务页面</SelectLabel>
                                        {typeOptions.filter(opt => opt.group === '业务页面').map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>系统页面</SelectLabel>
                                        {typeOptions.filter(opt => opt.group === '系统页面').map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 自定义链接 */}
                        {formData.type === 'link' && (
                            <div className='space-y-2'>
                                <Label>
                                    链接地址 <span className='text-destructive'>*</span>
                                </Label>
                                <Input
                                    placeholder='如：/about 或 https://example.com'
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                            </div>
                        )}

                        {/* 文章分类 */}
                        {formData.type === 'category' && (
                            <div className='space-y-2'>
                                <Label>
                                    文章分类 <span className='text-destructive'>*</span>
                                </Label>
                                <Select
                                    value={formData.categoryId || 'none'}
                                    onValueChange={(v) => setFormData({ ...formData, categoryId: v === 'none' ? '' : v })}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='请选择分类' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='none' disabled>请选择分类</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* 页面 */}
                        {formData.type === 'page' && (
                            <div className='space-y-2'>
                                <Label>
                                    页面 <span className='text-destructive'>*</span>
                                </Label>
                                <Select
                                    value={formData.pageId || 'none'}
                                    onValueChange={(v) => setFormData({ ...formData, pageId: v === 'none' ? '' : v })}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='请选择页面' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='none' disabled>请选择页面</SelectItem>
                                        {pages.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>打开方式</Label>
                                <Select
                                    value={formData.target}
                                    onValueChange={(v) => setFormData({ ...formData, target: v })}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {targetOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <Label>父级菜单</Label>
                                <Select
                                    value={formData.parentId || 'none'}
                                    onValueChange={(v) => setFormData({ ...formData, parentId: v === 'none' ? '' : v })}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='无（顶级菜单）' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='none'>无（顶级菜单）</SelectItem>
                                        {topLevelMenus
                                            .filter((m) => m.id !== currentRow?.id)
                                            .map((m) => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>图标</Label>
                                <IconPicker
                                    value={formData.icon as IconName}
                                    onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
                                    placeholder='选择图标'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>排序</Label>
                                <Input
                                    type='number'
                                    value={formData.sort}
                                    onChange={(e) => setFormData({ ...formData, sort: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>状态</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <Label>设为首页</Label>
                                <div className='flex items-center h-9'>
                                    <Switch
                                        checked={formData.isHome}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isHome: checked })}
                                        disabled={formData.type === 'link' || ['user_login', 'escort_register', 'escort_login', 'escort_forgot_password'].includes(formData.type)}
                                    />
                                    <span className='ml-2 text-sm text-muted-foreground'>
                                        {formData.type === 'link' ? '自定义链接不可设为首页' :
                                            ['user_login', 'escort_register', 'escort_login', 'escort_forgot_password'].includes(formData.type) ? '系统登录页不可设为首页' :
                                                (formData.isHome ? '是' : '否')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>在主菜单中隐藏</Label>
                                <div className='flex items-center h-9'>
                                    <Switch
                                        checked={formData.hideInMain}
                                        onCheckedChange={(checked) => setFormData({ ...formData, hideInMain: checked })}
                                    />
                                    <span className='ml-2 text-sm text-muted-foreground'>
                                        {formData.hideInMain ? '已隐藏' : '显示'}
                                    </span>
                                </div>
                                <p className='text-xs text-muted-foreground'>
                                    隐藏后仅可在侧边栏等其他位置调用
                                </p>
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
                disabled={(currentRow?.childrenCount || 0) > 0}
                title='删除菜单'
                desc={
                    <>
                        确定要删除菜单「{currentRow?.name}」吗？
                        {(currentRow?.childrenCount || 0) > 0 && (
                            <span className='text-destructive mt-2 block'>
                                该菜单下还有 {currentRow?.childrenCount} 个子菜单，请先删除子菜单！
                            </span>
                        )}
                    </>
                }
                confirmText='删除'
                destructive
            />
        </>
    )
}

