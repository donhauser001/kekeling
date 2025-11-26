import { useState } from 'react'
import {
    UserRound,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search as SearchIcon,
    X,
    Eye,
    Phone,
    Mail,
    Building2,
    Stethoscope,
    LayoutGrid,
    List,
    CalendarCheck,
    Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

interface Doctor {
    id: string
    name: string
    title: string
    department: string
    hospital: string
    specialty: string[]
    phone: string
    email: string
    introduction: string
    avatar?: string
    level: string
    status: 'active' | 'inactive'
    consultCount: number
    satisfaction: number
}

const initialDoctors: Doctor[] = [
    {
        id: '1',
        name: '张明远',
        title: '主任医师',
        department: '心内科',
        hospital: '北京协和医院',
        specialty: ['冠心病', '心律失常', '高血压'],
        phone: '13800138001',
        email: 'zhang.my@hospital.com',
        introduction: '从事心血管内科工作30余年，擅长冠心病、心律失常的诊治。',
        level: '三甲',
        status: 'active',
        consultCount: 3256,
        satisfaction: 98.5,
    },
    {
        id: '2',
        name: '李芳华',
        title: '副主任医师',
        department: '神经内科',
        hospital: '上海瑞金医院',
        specialty: ['脑血管病', '帕金森病', '头痛'],
        phone: '13800138002',
        email: 'li.fh@hospital.com',
        introduction: '神经内科专家，专注于脑血管疾病和神经退行性疾病的研究与治疗。',
        level: '三甲',
        status: 'active',
        consultCount: 2845,
        satisfaction: 97.2,
    },
    {
        id: '3',
        name: '王建国',
        title: '主任医师',
        department: '骨科',
        hospital: '北京积水潭医院',
        specialty: ['关节置换', '运动损伤', '骨肿瘤'],
        phone: '13800138003',
        email: 'wang.jg@hospital.com',
        introduction: '骨科领域知名专家，完成关节置换手术超过5000例。',
        level: '三甲',
        status: 'active',
        consultCount: 4120,
        satisfaction: 99.1,
    },
    {
        id: '4',
        name: '陈雪梅',
        title: '主治医师',
        department: '妇产科',
        hospital: '广州妇女儿童医疗中心',
        specialty: ['产前诊断', '高危妊娠', '妇科肿瘤'],
        phone: '13800138004',
        email: 'chen.xm@hospital.com',
        introduction: '妇产科专业医师，擅长高危妊娠管理和妇科微创手术。',
        level: '三甲',
        status: 'active',
        consultCount: 1890,
        satisfaction: 96.8,
    },
    {
        id: '5',
        name: '刘德华',
        title: '副主任医师',
        department: '消化内科',
        hospital: '深圳人民医院',
        specialty: ['胃肠镜', '肝病', '消化道肿瘤'],
        phone: '13800138005',
        email: 'liu.dh@hospital.com',
        introduction: '消化内科专家，精通消化内镜诊疗技术。',
        level: '三甲',
        status: 'inactive',
        consultCount: 2156,
        satisfaction: 95.6,
    },
    {
        id: '6',
        name: '赵丽颖',
        title: '主治医师',
        department: '儿科',
        hospital: '北京儿童医院',
        specialty: ['儿童呼吸', '儿童消化', '儿童保健'],
        phone: '13800138006',
        email: 'zhao.ly@hospital.com',
        introduction: '儿科专业医师，在儿童常见病和多发病诊治方面有丰富经验。',
        level: '三甲',
        status: 'active',
        consultCount: 1568,
        satisfaction: 98.2,
    },
]

interface DoctorFormData {
    name: string
    title: string
    department: string
    hospital: string
    specialty: string
    phone: string
    email: string
    introduction: string
    level: string
    status: 'active' | 'inactive'
}

const defaultFormData: DoctorFormData = {
    name: '',
    title: '',
    department: '',
    hospital: '',
    specialty: '',
    phone: '',
    email: '',
    introduction: '',
    level: '三甲',
    status: 'active',
}

const titleOptions = ['主任医师', '副主任医师', '主治医师', '住院医师']
const levelOptions = ['三甲', '三乙', '二甲', '二乙', '一级']

type ViewMode = 'grid' | 'list'

export function Doctors() {
    const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')

    // 表单对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
    const [formData, setFormData] = useState<DoctorFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // 获取所有科室
    const departments = [...new Set(doctors.map(d => d.department))]

    // 过滤医师
    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesDepartment = !selectedDepartment || doctor.department === selectedDepartment
        return matchesSearch && matchesDepartment
    })

    // 打开新建对话框
    const openCreateDialog = () => {
        setDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (doctor: Doctor) => {
        setDialogMode('edit')
        setEditingDoctor(doctor)
        setFormData({
            name: doctor.name,
            title: doctor.title,
            department: doctor.department,
            hospital: doctor.hospital,
            specialty: doctor.specialty.join('、'),
            phone: doctor.phone,
            email: doctor.email,
            introduction: doctor.introduction,
            level: doctor.level,
            status: doctor.status,
        })
        setFormErrors({})
        setDialogOpen(true)
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = '请输入医师姓名'
        if (!formData.title) errors.title = '请选择职称'
        if (!formData.department.trim()) errors.department = '请输入科室'
        if (!formData.hospital.trim()) errors.hospital = '请输入医院'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存医师
    const handleSave = () => {
        if (!validateForm()) return

        if (dialogMode === 'create') {
            const newDoctor: Doctor = {
                id: Date.now().toString(),
                name: formData.name,
                title: formData.title,
                department: formData.department,
                hospital: formData.hospital,
                specialty: formData.specialty.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
                phone: formData.phone,
                email: formData.email,
                introduction: formData.introduction,
                level: formData.level,
                status: formData.status,
                consultCount: 0,
                satisfaction: 100,
            }
            setDoctors([...doctors, newDoctor])
        } else if (editingDoctor) {
            setDoctors(doctors.map(d =>
                d.id === editingDoctor.id
                    ? {
                        ...d,
                        ...formData,
                        specialty: formData.specialty.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
                    }
                    : d
            ))
        }

        setDialogOpen(false)
    }

    // 删除医师
    const handleDelete = (doctorId: string) => {
        setDoctors(doctors.filter(d => d.id !== doctorId))
    }

    // 渲染卡片视图
    const renderGridView = () => (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredDoctors.map(doctor => (
                <Card key={doctor.id} className='group'>
                    <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-3'>
                                <Avatar className='h-12 w-12'>
                                    <AvatarFallback className='bg-primary/10 text-primary'>
                                        {doctor.name.slice(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className='flex items-center gap-2 text-base'>
                                        {doctor.name}
                                        <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'} className='text-xs'>
                                            {doctor.status === 'active' ? '在职' : '离职'}
                                        </Badge>
                                    </CardTitle>
                                    <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                                        <Stethoscope className='h-3.5 w-3.5' />
                                        {doctor.title} · {doctor.department}
                                    </div>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='ghost' size='icon' className='h-8 w-8 opacity-0 group-hover:opacity-100'>
                                        <MoreHorizontal className='h-4 w-4' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuItem>
                                        <Eye className='mr-2 h-4 w-4' />
                                        查看详情
                                    </DropdownMenuItem>
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
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        <div className='flex items-center gap-2 text-sm'>
                            <Building2 className='text-muted-foreground h-4 w-4' />
                            <span>{doctor.hospital}</span>
                            <Badge variant='outline' className='text-xs'>{doctor.level}</Badge>
                        </div>
                        <div className='flex flex-wrap gap-1'>
                            {doctor.specialty.map(s => (
                                <Badge key={s} variant='secondary' className='text-xs'>
                                    {s}
                                </Badge>
                            ))}
                        </div>
                        <div className='flex items-center justify-between gap-2'>
                            <div className='text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap'>
                                <CalendarCheck className='h-3 w-3' />
                                {doctor.consultCount.toLocaleString()}
                            </div>
                            <div className='flex items-center gap-1 text-xs whitespace-nowrap text-amber-500'>
                                <Star className='h-3 w-3 fill-current' />
                                {doctor.satisfaction}%
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

    // 渲染列表视图
    const renderListView = () => (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className='w-[200px]'>医师</TableHead>
                        <TableHead>职称</TableHead>
                        <TableHead>科室</TableHead>
                        <TableHead>医院</TableHead>
                        <TableHead>专长</TableHead>
                        <TableHead>联系方式</TableHead>
                        <TableHead>接诊数</TableHead>
                        <TableHead>满意度</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className='w-[50px]'></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredDoctors.map(doctor => (
                        <TableRow key={doctor.id} className='group'>
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <Avatar className='h-9 w-9'>
                                        <AvatarFallback className='bg-primary/10 text-primary text-sm'>
                                            {doctor.name.slice(0, 1)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className='font-medium'>{doctor.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{doctor.title}</TableCell>
                            <TableCell>{doctor.department}</TableCell>
                            <TableCell>
                                <div className='flex items-center gap-1.5'>
                                    <span>{doctor.hospital}</span>
                                    <Badge variant='outline' className='text-xs'>{doctor.level}</Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className='flex flex-wrap gap-1 max-w-[200px]'>
                                    {doctor.specialty.slice(0, 2).map(s => (
                                        <Badge key={s} variant='secondary' className='text-xs'>
                                            {s}
                                        </Badge>
                                    ))}
                                    {doctor.specialty.length > 2 && (
                                        <Badge variant='secondary' className='text-xs'>
                                            +{doctor.specialty.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className='space-y-0.5 text-sm'>
                                    <div className='text-muted-foreground flex items-center gap-1'>
                                        <Phone className='h-3 w-3' />
                                        {doctor.phone}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className='text-muted-foreground flex items-center gap-1'>
                                    <CalendarCheck className='h-3.5 w-3.5' />
                                    {doctor.consultCount.toLocaleString()}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className='flex items-center gap-1 text-amber-500'>
                                    <Star className='h-3.5 w-3.5 fill-current' />
                                    {doctor.satisfaction}%
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'} className='text-xs'>
                                    {doctor.status === 'active' ? '在职' : '离职'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant='ghost' size='icon' className='h-8 w-8 opacity-0 group-hover:opacity-100'>
                                            <MoreHorizontal className='h-4 w-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                        <DropdownMenuItem>
                                            <Eye className='mr-2 h-4 w-4' />
                                            查看详情
                                        </DropdownMenuItem>
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
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

                {/* 搜索和筛选 */}
                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative flex-1 min-w-[200px] max-w-md'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索医师姓名、医院、专长...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-9'
                        />
                        {searchQuery && (
                            <button
                                className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
                                onClick={() => setSearchQuery('')}
                            >
                                <X className='h-4 w-4' />
                            </button>
                        )}
                    </div>

                    <div className='flex flex-wrap gap-2'>
                        <Badge
                            variant={selectedDepartment === null ? 'default' : 'outline'}
                            className='cursor-pointer'
                            onClick={() => setSelectedDepartment(null)}
                        >
                            全部科室
                        </Badge>
                        {departments.map(dept => (
                            <Badge
                                key={dept}
                                variant={selectedDepartment === dept ? 'default' : 'outline'}
                                className='cursor-pointer'
                                onClick={() => setSelectedDepartment(dept)}
                            >
                                {dept}
                            </Badge>
                        ))}
                    </div>

                    {/* 视图切换 */}
                    <div className='ms-auto'>
                        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                            <TabsList className='h-9'>
                                <TabsTrigger value='grid' className='px-2.5'>
                                    <LayoutGrid className='h-4 w-4' />
                                </TabsTrigger>
                                <TabsTrigger value='list' className='px-2.5'>
                                    <List className='h-4 w-4' />
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* 医师列表 */}
                {viewMode === 'grid' ? renderGridView() : renderListView()}

                {filteredDoctors.length === 0 && (
                    <div className='text-muted-foreground py-12 text-center'>
                        暂无匹配的医师
                    </div>
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
                            {dialogMode === 'create' ? '添加新的合作医师信息' : '修改医师信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='max-h-[60vh] space-y-4 overflow-y-auto py-1 pe-2'>
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
                                <Label>职称 <span className='text-destructive'>*</span></Label>
                                <select
                                    className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                >
                                    <option value=''>请选择职称</option>
                                    {titleOptions.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                {formErrors.title && <p className='text-destructive text-sm'>{formErrors.title}</p>}
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>科室 <span className='text-destructive'>*</span></Label>
                                <Input
                                    placeholder='请输入科室'
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className={formErrors.department ? 'border-destructive' : ''}
                                />
                                {formErrors.department && <p className='text-destructive text-sm'>{formErrors.department}</p>}
                            </div>
                            <div className='space-y-2'>
                                <Label>医院级别</Label>
                                <select
                                    className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                >
                                    {levelOptions.map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>所属医院 <span className='text-destructive'>*</span></Label>
                            <Input
                                placeholder='请输入所属医院'
                                value={formData.hospital}
                                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                                className={formErrors.hospital ? 'border-destructive' : ''}
                            />
                            {formErrors.hospital && <p className='text-destructive text-sm'>{formErrors.hospital}</p>}
                        </div>

                        <div className='space-y-2'>
                            <Label>专长</Label>
                            <Input
                                placeholder='请输入专长，用顿号分隔'
                                value={formData.specialty}
                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>手机号</Label>
                                <Input
                                    placeholder='请输入手机号'
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>邮箱</Label>
                                <Input
                                    placeholder='请输入邮箱'
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>简介</Label>
                            <Textarea
                                placeholder='请输入医师简介'
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
                        <Button onClick={handleSave}>
                            {dialogMode === 'create' ? '添加' : '保存'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
