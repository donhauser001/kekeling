import { useState, useEffect } from 'react'
import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search as SearchIcon,
    X,
    UserRound,
    Building2,
    Stethoscope,
    Star,
    Loader2,
    Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
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
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SimplePagination } from '@/components/simple-pagination'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

// 导入统一的数据定义
import { doctorTitles, doctorTitleLabels, doctorTitleColors } from './data/data'

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
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedHospital, setSelectedHospital] = useState<string>('')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(12)

    // 从后端获取医生数据
    const { data: doctorsData, isLoading, error } = useDoctors({
        keyword: searchQuery || undefined,
        hospitalId: selectedHospital && selectedHospital !== 'all' ? selectedHospital : undefined,
        page,
        pageSize,
    })

    const doctors = doctorsData?.data ?? []
    const total = doctorsData?.total ?? 0
    const totalPages = Math.ceil(total / pageSize)

    // 翻页时重置到第一页
    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        setPage(1)
    }

    // 搜索时重置到第一页
    const handleSearchChange = (query: string) => {
        setSearchQuery(query)
        setPage(1)
    }

    // 筛选医院时重置到第一页
    const handleHospitalFilter = (hospitalId: string) => {
        setSelectedHospital(hospitalId)
        setPage(1)
    }

    // 获取医院列表（用于筛选和选择）
    const { data: hospitalsData } = useHospitals({ pageSize: 100 })
    const hospitals = hospitalsData?.data ?? []

    // 表单对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null)
    const [formData, setFormData] = useState<DoctorFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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
            // 加载医院的科室
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

    // 删除医生
    const handleDelete = async (doctorId: string) => {
        if (!confirm('确定要删除此医生吗？')) return
        try {
            await deleteMutation.mutateAsync(doctorId)
        } catch (err) {
            console.error('删除失败:', err)
        }
    }

    // 统计数据
    const activeDoctors = doctors.filter(d => d.status === 'active').length
    const totalConsults = doctors.reduce((sum, d) => sum + (d.consultCount || 0), 0)
    const avgRating = doctors.length > 0 
        ? Math.round(doctors.reduce((sum, d) => sum + (d.rating || 0), 0) / doctors.length * 10) / 10
        : 0

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

            <Main>
                <div className='mb-6 flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>医师库</h1>
                        <p className='text-muted-foreground'>管理合作医师信息</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加医师
                    </Button>
                </div>

                {/* 统计卡片 */}
                <div className='mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>医师总数</CardTitle>
                            <UserRound className='text-muted-foreground h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{total}</div>
                            <p className='text-muted-foreground text-xs'>在职 {activeDoctors} 人</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>累计接诊</CardTitle>
                            <Stethoscope className='text-muted-foreground h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{totalConsults.toLocaleString()}</div>
                            <p className='text-muted-foreground text-xs'>本月 +12.5%</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>平均评分</CardTitle>
                            <Star className='text-muted-foreground h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{avgRating}</div>
                            <p className='text-muted-foreground text-xs'>满分 5.0</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>覆盖医院</CardTitle>
                            <Building2 className='text-muted-foreground h-4 w-4' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{hospitals.length}</div>
                            <p className='text-muted-foreground text-xs'>合作医院</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 搜索和筛选 */}
                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative flex-1 min-w-[200px] max-w-md'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索医生姓名或擅长...'
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className='pl-9'
                        />
                        {searchQuery && (
                            <button
                                className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
                                onClick={() => handleSearchChange('')}
                            >
                                <X className='h-4 w-4' />
                            </button>
                        )}
                    </div>

                    <Select value={selectedHospital} onValueChange={handleHospitalFilter}>
                        <SelectTrigger className='w-[200px]'>
                            <SelectValue placeholder='选择医院筛选' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>全部医院</SelectItem>
                            {hospitals.map(h => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className='text-muted-foreground text-sm'>
                        共 {total} 位医师
                    </div>
                </div>

                {/* 加载状态 */}
                {isLoading && (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {[...Array(8)].map((_, i) => (
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
                )}

                {/* 错误状态 */}
                {error && (
                    <div className='text-destructive py-12 text-center'>
                        加载失败: {error.message}
                    </div>
                )}

                {/* 医生列表 */}
                {!isLoading && !error && (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {doctors.map(doctor => (
                            <Card key={doctor.id} className='group hover:shadow-md transition-shadow'>
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant='ghost' size='icon' className='h-7 w-7 opacity-0 group-hover:opacity-100'>
                                                            <MoreHorizontal className='h-4 w-4' />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align='end'>
                                                        <DropdownMenuItem onClick={() => openEditDialog(doctor)}>
                                                            <Pencil className='mr-2 h-4 w-4' />
                                                            编辑
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className='text-destructive'
                                                            onClick={() => handleDelete(doctor.id)}
                                                        >
                                                            <Trash2 className='mr-2 h-4 w-4' />
                                                            删除
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
                )}

                {!isLoading && !error && doctors.length === 0 && (
                    <div className='text-muted-foreground py-12 text-center'>
                        暂无医师数据
                    </div>
                )}

                {/* 分页 */}
                {!isLoading && !error && total > 0 && (
                    <SimplePagination
                        currentPage={page}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={total}
                        onPageChange={setPage}
                        onPageSizeChange={handlePageSizeChange}
                        pageSizeOptions={[12, 24, 36, 48]}
                        className='mt-6'
                    />
                )}
            </Main>

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
