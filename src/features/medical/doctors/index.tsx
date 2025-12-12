import { useState, useEffect, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import {
    useReactTable,
    getCoreRowModel,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    UserRound,
    Building2,
    Stethoscope,
    Star,
    Loader2,
    LayoutGrid,
    List,
    Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    useDoctors,
    useDoctor,
    useCreateDoctor,
    useUpdateDoctor,
    useDeleteDoctor,
    useHospitals,
} from '@/hooks/use-api'
import type { Doctor, Hospital } from '@/lib/api'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ConfigDrawer } from '@/components/config-drawer'
import {
    DataTablePagination,
    DataTableToolbar,
    DataTableViewOptions,
} from '@/components/data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

// 导入组件
import { getDoctorsColumns } from './components/doctors-columns'
import { DoctorsTable } from './components/doctors-table'
import { DoctorsDetailSheet } from './components/doctors-detail-sheet'

// 导入统一的数据定义
import { doctorTitles, doctorTitleLabels, doctorTitleColors, doctorStatuses } from './data/data'

// 职称选项（兼容旧代码）
const titleOptions = doctorTitles
const titleLabels = doctorTitleLabels
const titleColors = doctorTitleColors

interface DoctorFormData {
    name: string
    hospitalId: string
    departmentId: string
    title: string
    gender: string
    introduction: string
    specialties: string
    education: string
    experience: string
    phone: string
}

const defaultFormData: DoctorFormData = {
    name: '',
    hospitalId: '',
    departmentId: '',
    title: 'attending',
    gender: 'male',
    introduction: '',
    specialties: '',
    education: '',
    experience: '',
    phone: '',
}

export function Doctors() {
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as Record<string, unknown>

    // 视图模式
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // 分页状态
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // 筛选状态
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [selectedHospital, setSelectedHospital] = useState<string>('')

    // 从 URL 同步视图模式
    useEffect(() => {
        const view = search.view as string | undefined
        if (view === 'list' || view === 'grid') {
            setViewMode(view)
        }
    }, [search.view])

    // 切换视图时更新 URL
    const handleViewModeChange = (mode: string) => {
        setViewMode(mode as 'grid' | 'list')
        navigate({
            search: (prev: Record<string, unknown>) => ({ ...prev, view: mode }),
            replace: true,
        })
    }

    // 从筛选状态提取搜索关键词
    const keyword = useMemo(() => {
        const filter = columnFilters.find((f) => f.id === 'name')
        return (filter?.value as string) || globalFilter || ''
    }, [columnFilters, globalFilter])

    // 从后端获取医生数据
    const { data: doctorsData, isLoading, error } = useDoctors({
        keyword: keyword || undefined,
        hospitalId: selectedHospital && selectedHospital !== 'all' ? selectedHospital : undefined,
        page,
        pageSize,
    })

    const doctors = doctorsData?.data ?? []
    const total = doctorsData?.total ?? 0

    // 获取医院列表
    const { data: hospitalsData } = useHospitals({ pageSize: 100 })
    const hospitals = hospitalsData?.data ?? []

    // 表单对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null)
    const [formData, setFormData] = useState<DoctorFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // 详情抽屉状态
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

    // 删除确认对话框
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null)

    // 选中医院的科室列表
    const [availableDepartments, setAvailableDepartments] = useState<Array<{ id: string; name: string }>>([])

    // 获取编辑中的医生详情
    const { data: editingDoctor } = useDoctor(editingDoctorId || '')

    // Mutations
    const createMutation = useCreateDoctor()
    const updateMutation = useUpdateDoctor()
    const deleteMutation = useDeleteDoctor()

    // 当编辑医生数据加载完成时，更新表单
    useEffect(() => {
        if (editingDoctor && dialogMode === 'edit') {
            setFormData({
                name: editingDoctor.name,
                hospitalId: editingDoctor.hospitalId,
                departmentId: editingDoctor.departmentId,
                title: editingDoctor.title,
                gender: editingDoctor.gender || 'male',
                introduction: editingDoctor.introduction || '',
                specialties: editingDoctor.specialties?.join('、') || '',
                education: editingDoctor.education || '',
                experience: editingDoctor.experience || '',
                phone: editingDoctor.phone || '',
            })
            loadDepartments(editingDoctor.hospitalId)
        }
    }, [editingDoctor, dialogMode])

    // 加载医院科室
    const loadDepartments = async (hospitalId: string) => {
        if (!hospitalId) {
            setAvailableDepartments([])
            return
        }
        try {
            const res = await fetch(`http://localhost:3000/api/hospitals/${hospitalId}`)
            const json = await res.json()
            if (json.code === 0 && json.data?.departments) {
                setAvailableDepartments(json.data.departments.map((d: any) => ({ id: d.id, name: d.name })))
            }
        } catch (err) {
            console.error('加载科室失败:', err)
        }
    }

    // 当选择医院变化时，加载科室
    const handleHospitalChange = (hospitalId: string) => {
        setFormData(prev => ({ ...prev, hospitalId, departmentId: '' }))
        loadDepartments(hospitalId)
    }

    // 打开新建对话框
    const openCreateDialog = () => {
        setDialogMode('create')
        setEditingDoctorId(null)
        setFormData(defaultFormData)
        setAvailableDepartments([])
        setFormErrors({})
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (doctor: Doctor) => {
        setDialogMode('edit')
        setEditingDoctorId(doctor.id)
        setFormErrors({})
        setDialogOpen(true)
    }

    // 查看详情
    const handleView = (doctor: Doctor) => {
        setSelectedDoctor(doctor)
        setDetailOpen(true)
    }

    // 打开删除确认
    const handleDeleteConfirm = (doctor: Doctor) => {
        setDeletingDoctor(doctor)
        setDeleteDialogOpen(true)
    }

    // 执行删除
    const handleDelete = async () => {
        if (!deletingDoctor) return
        try {
            await deleteMutation.mutateAsync(deletingDoctor.id)
            setDeleteDialogOpen(false)
            setDeletingDoctor(null)
        } catch (err) {
            console.error('删除失败:', err)
        }
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = '请输入医生姓名'
        if (!formData.hospitalId) errors.hospitalId = '请选择医院'
        if (!formData.departmentId) errors.departmentId = '请选择科室'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存医生
    const handleSave = async () => {
        if (!validateForm()) return

        const data = {
            name: formData.name,
            hospitalId: formData.hospitalId,
            departmentId: formData.departmentId,
            title: formData.title,
            gender: formData.gender,
            introduction: formData.introduction || undefined,
            specialties: formData.specialties.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
            education: formData.education || undefined,
            experience: formData.experience || undefined,
            phone: formData.phone || undefined,
        }

        try {
            if (dialogMode === 'create') {
                await createMutation.mutateAsync(data)
            } else if (editingDoctorId) {
                await updateMutation.mutateAsync({
                    id: editingDoctorId,
                    data,
                })
            }
            setDialogOpen(false)
        } catch (err) {
            console.error('保存失败:', err)
        }
    }

    // 列定义
    const columns = useMemo(
        () =>
            getDoctorsColumns({
                onView: handleView,
                onEdit: openEditDialog,
                onDelete: handleDeleteConfirm,
            }),
        []
    )

    // useReactTable 配置
    const table = useReactTable({
        data: doctors,
        columns,
        pageCount: Math.ceil(total / pageSize),
        rowCount: total,
        state: {
            pagination: { pageIndex: page - 1, pageSize },
            columnFilters,
            globalFilter,
        },
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function'
                ? updater({ pageIndex: page - 1, pageSize })
                : updater
            setPage(newState.pageIndex + 1)
            setPageSize(newState.pageSize)
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
    })

    // 渲染卡片骨架
    const renderGridSkeleton = () => (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className='pt-6'>
                        <div className='flex items-start gap-4'>
                            <Skeleton className='h-16 w-16 rounded-full' />
                            <div className='space-y-2 flex-1'>
                                <Skeleton className='h-4 w-24' />
                                <Skeleton className='h-3 w-32' />
                                <Skeleton className='h-3 w-20' />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

    // 渲染卡片视图
    const renderGridView = () => (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {doctors.map(doctor => (
                <Card
                    key={doctor.id}
                    className='group hover:shadow-md transition-shadow cursor-pointer'
                    onClick={() => handleView(doctor)}
                >
                    <CardContent className='pt-6'>
                        <div className='flex items-start gap-4'>
                            <Avatar className='h-16 w-16'>
                                <AvatarImage src={doctor.avatar || undefined} />
                                <AvatarFallback className={cn('text-white text-lg', titleColors[doctor.title] || 'bg-gray-500')}>
                                    {doctor.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center justify-between'>
                                    <h3 className='font-semibold truncate'>{doctor.name}</h3>
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-7 w-7 opacity-0 group-hover:opacity-100'
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreHorizontal className='h-4 w-4' />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align='end' className='w-[160px]'>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(doctor) }}>
                                                查看详情
                                                <DropdownMenuShortcut>
                                                    <Eye className='h-4 w-4' />
                                                </DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(doctor) }}>
                                                编辑
                                                <DropdownMenuShortcut>
                                                    <Pencil className='h-4 w-4' />
                                                </DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className='text-destructive focus:text-destructive focus:bg-destructive/10'
                                                onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(doctor) }}
                                            >
                                                删除
                                                <DropdownMenuShortcut>
                                                    <Trash2 className='h-4 w-4' />
                                                </DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Badge variant='secondary' className='mt-1 text-xs'>
                                    {titleLabels[doctor.title] || doctor.title}
                                </Badge>
                                <div className='text-muted-foreground mt-2 text-xs space-y-1'>
                                    <div className='flex items-center gap-1 truncate'>
                                        <Building2 className='h-3 w-3 shrink-0' />
                                        {doctor.hospital?.name || '-'}
                                    </div>
                                    <div className='flex items-center gap-1 truncate'>
                                        <Stethoscope className='h-3 w-3 shrink-0' />
                                        {doctor.department?.name || '-'}
                                    </div>
                                </div>
                                {doctor.specialties && doctor.specialties.length > 0 && (
                                    <div className='mt-2 flex flex-wrap gap-1'>
                                        {doctor.specialties.slice(0, 2).map(s => (
                                            <Badge key={s} variant='outline' className='text-xs'>
                                                {s}
                                            </Badge>
                                        ))}
                                        {doctor.specialties.length > 2 && (
                                            <Badge variant='outline' className='text-xs'>
                                                +{doctor.specialties.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                                <div className='mt-2 flex items-center gap-3 text-xs'>
                                    <span className='flex items-center gap-0.5 text-amber-500'>
                                        <Star className='h-3 w-3 fill-current' />
                                        {doctor.rating || 5.0}
                                    </span>
                                    <span className='text-muted-foreground'>
                                        接诊 {doctor.consultCount || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

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
                {/* 标题区域 */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>医师库</h1>
                        <p className='text-muted-foreground'>管理合作医师信息</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加医师
                    </Button>
                </div>

                {/* 工具栏区域 */}
                <div className='flex flex-wrap items-center gap-4'>
                    <DataTableToolbar
                        table={table}
                        searchPlaceholder='搜索医师姓名...'
                        searchKey='name'
                        filters={[
                            {
                                columnId: 'status',
                                title: '状态',
                                options: doctorStatuses.map((s) => ({ label: s.label, value: s.value })),
                            },
                            {
                                columnId: 'title',
                                title: '职称',
                                options: doctorTitles.map((t) => ({ label: t.label, value: t.value })),
                            },
                        ]}
                        showViewOptions={false}
                    />

                    {/* 医院筛选 */}
                    <Select value={selectedHospital} onValueChange={(v) => { setSelectedHospital(v); setPage(1) }}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='选择医院' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>全部医院</SelectItem>
                            {hospitals.map(h => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <DataTableViewOptions table={table} />

                    {/* 视图切换 */}
                    <Tabs value={viewMode} onValueChange={handleViewModeChange}>
                        <TabsList className='h-9'>
                            <TabsTrigger value='grid' className='px-3'>
                                <LayoutGrid className='h-4 w-4' />
                            </TabsTrigger>
                            <TabsTrigger value='list' className='px-3'>
                                <List className='h-4 w-4' />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* 内容区域 */}
                {isLoading ? (
                    viewMode === 'grid' ? renderGridSkeleton() : <DoctorsTable table={table} isLoading />
                ) : error ? (
                    <div className='text-destructive py-12 text-center'>
                        加载失败: {error.message}
                    </div>
                ) : doctors.length === 0 ? (
                    <div className='text-muted-foreground py-12 text-center'>
                        暂无医师数据
                    </div>
                ) : viewMode === 'grid' ? (
                    renderGridView()
                ) : (
                    <DoctorsTable table={table} onRowClick={handleView} />
                )}

                {/* 分页 */}
                <DataTablePagination table={table} className='mt-auto' />
            </Main>

            {/* 详情抽屉 */}
            <DoctorsDetailSheet
                doctor={selectedDoctor}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />

            {/* 删除确认对话框 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title='确认删除'
                description={`确定要删除医师「${deletingDoctor?.name}」吗？此操作不可撤销。`}
                confirmText='删除'
                cancelText='取消'
                onConfirm={handleDelete}
                isLoading={deleteMutation.isPending}
                variant='destructive'
            />

            {/* 新建/编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='sm:max-w-lg'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <UserRound className='h-5 w-5' />
                            {dialogMode === 'create' ? '添加医师' : '编辑医师'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create' ? '添加新的合作医师' : '修改医师信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='max-h-[60vh] space-y-4 overflow-y-auto py-1 px-1'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>姓名 <span className='text-destructive'>*</span></Label>
                                <Input
                                    placeholder='请输入姓名'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={formErrors.name ? 'border-destructive' : ''}
                                />
                                {formErrors.name && <p className='text-destructive text-sm'>{formErrors.name}</p>}
                            </div>
                            <div className='space-y-2'>
                                <Label>性别</Label>
                                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='male'>男</SelectItem>
                                        <SelectItem value='female'>女</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>所属医院 <span className='text-destructive'>*</span></Label>
                            <Select value={formData.hospitalId} onValueChange={handleHospitalChange}>
                                <SelectTrigger className={formErrors.hospitalId ? 'border-destructive' : ''}>
                                    <SelectValue placeholder='请选择医院' />
                                </SelectTrigger>
                                <SelectContent>
                                    {hospitals.map(h => (
                                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.hospitalId && <p className='text-destructive text-sm'>{formErrors.hospitalId}</p>}
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>所属科室 <span className='text-destructive'>*</span></Label>
                                <Select
                                    value={formData.departmentId}
                                    onValueChange={(v) => setFormData({ ...formData, departmentId: v })}
                                    disabled={!formData.hospitalId}
                                >
                                    <SelectTrigger className={formErrors.departmentId ? 'border-destructive' : ''}>
                                        <SelectValue placeholder={formData.hospitalId ? '请选择科室' : '请先选择医院'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDepartments.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.departmentId && <p className='text-destructive text-sm'>{formErrors.departmentId}</p>}
                            </div>
                            <div className='space-y-2'>
                                <Label>职称</Label>
                                <Select value={formData.title} onValueChange={(v) => setFormData({ ...formData, title: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {titleOptions.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>擅长领域</Label>
                            <Input
                                placeholder='请输入擅长领域，用顿号分隔'
                                value={formData.specialties}
                                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>学历</Label>
                                <Input
                                    placeholder='如：医学博士'
                                    value={formData.education}
                                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>从医年限</Label>
                                <Input
                                    placeholder='如：20年'
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>联系电话</Label>
                            <Input
                                placeholder='请输入联系电话'
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>个人简介</Label>
                            <Textarea
                                placeholder='请输入个人简介'
                                value={formData.introduction}
                                onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                                className='resize-none'
                                rows={3}
                            />
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
                            {dialogMode === 'create' ? '添加' : '保存'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
