import { useState } from 'react'
import {
    LayoutList,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search as SearchIcon,
    X,
    Users,
    Stethoscope,
    CalendarCheck,
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
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

interface Department {
    id: string
    name: string
    category: string
    description: string
    doctorCount: number
    consultCount: number
    diseases: string[]
    color: string
}

const categoryColors: Record<string, string> = {
    '内科': 'bg-blue-500',
    '外科': 'bg-red-500',
    '妇儿': 'bg-pink-500',
    '五官': 'bg-purple-500',
    '医技': 'bg-green-500',
    '其他': 'bg-gray-500',
}

const initialDepartments: Department[] = [
    { id: '1', name: '心内科', category: '内科', description: '诊治心血管系统疾病', doctorCount: 45, consultCount: 12580, diseases: ['冠心病', '心律失常', '高血压', '心肌病'], color: 'bg-red-500' },
    { id: '2', name: '神经内科', category: '内科', description: '诊治神经系统疾病', doctorCount: 38, consultCount: 9860, diseases: ['脑血管病', '帕金森病', '癫痫', '头痛'], color: 'bg-purple-500' },
    { id: '3', name: '消化内科', category: '内科', description: '诊治消化系统疾病', doctorCount: 42, consultCount: 11240, diseases: ['胃炎', '肝病', '胃肠道肿瘤', '消化道出血'], color: 'bg-amber-500' },
    { id: '4', name: '呼吸内科', category: '内科', description: '诊治呼吸系统疾病', doctorCount: 35, consultCount: 8950, diseases: ['肺炎', '哮喘', '慢阻肺', '肺癌'], color: 'bg-cyan-500' },
    { id: '5', name: '骨科', category: '外科', description: '诊治骨骼和关节疾病', doctorCount: 52, consultCount: 15680, diseases: ['骨折', '关节炎', '脊柱病', '运动损伤'], color: 'bg-orange-500' },
    { id: '6', name: '普外科', category: '外科', description: '诊治腹部外科疾病', doctorCount: 48, consultCount: 13450, diseases: ['阑尾炎', '胆囊炎', '疝气', '甲状腺疾病'], color: 'bg-rose-500' },
    { id: '7', name: '妇产科', category: '妇儿', description: '诊治妇科和产科疾病', doctorCount: 56, consultCount: 18960, diseases: ['妇科肿瘤', '不孕症', '高危妊娠', '产前检查'], color: 'bg-pink-500' },
    { id: '8', name: '儿科', category: '妇儿', description: '诊治儿童疾病', doctorCount: 62, consultCount: 22350, diseases: ['儿童呼吸道感染', '儿童消化病', '儿童保健', '新生儿疾病'], color: 'bg-sky-500' },
    { id: '9', name: '眼科', category: '五官', description: '诊治眼部疾病', doctorCount: 28, consultCount: 6580, diseases: ['白内障', '青光眼', '近视', '眼底病'], color: 'bg-emerald-500' },
    { id: '10', name: '耳鼻喉科', category: '五官', description: '诊治耳鼻喉疾病', doctorCount: 25, consultCount: 5890, diseases: ['鼻炎', '中耳炎', '咽喉炎', '听力障碍'], color: 'bg-teal-500' },
    { id: '11', name: '放射科', category: '医技', description: '影像诊断科室', doctorCount: 32, consultCount: 28560, diseases: ['CT检查', 'MRI检查', 'X光检查', '超声检查'], color: 'bg-indigo-500' },
    { id: '12', name: '检验科', category: '医技', description: '临床检验科室', doctorCount: 28, consultCount: 35680, diseases: ['血液检查', '生化检查', '免疫检查', '微生物检查'], color: 'bg-violet-500' },
]

interface DepartmentFormData {
    name: string
    category: string
    description: string
    diseases: string
    color: string
}

const defaultFormData: DepartmentFormData = {
    name: '',
    category: '内科',
    description: '',
    diseases: '',
    color: 'bg-blue-500',
}

const colorOptions = [
    { value: 'bg-red-500', label: '红色' },
    { value: 'bg-orange-500', label: '橙色' },
    { value: 'bg-amber-500', label: '琥珀' },
    { value: 'bg-yellow-500', label: '黄色' },
    { value: 'bg-green-500', label: '绿色' },
    { value: 'bg-emerald-500', label: '翠绿' },
    { value: 'bg-teal-500', label: '青色' },
    { value: 'bg-cyan-500', label: '蓝绿' },
    { value: 'bg-sky-500', label: '天蓝' },
    { value: 'bg-blue-500', label: '蓝色' },
    { value: 'bg-indigo-500', label: '靛蓝' },
    { value: 'bg-violet-500', label: '紫罗兰' },
    { value: 'bg-purple-500', label: '紫色' },
    { value: 'bg-pink-500', label: '粉色' },
    { value: 'bg-rose-500', label: '玫红' },
]

const categoryOptions = ['内科', '外科', '妇儿', '五官', '医技', '其他']

export function Departments() {
    const [departments, setDepartments] = useState<Department[]>(initialDepartments)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // 表单对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
    const [formData, setFormData] = useState<DepartmentFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // 过滤科室
    const filteredDepartments = departments.filter(dept => {
        const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dept.diseases.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesCategory = !selectedCategory || dept.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    // 按分类分组
    const groupedDepartments = categoryOptions.map(category => ({
        category,
        color: categoryColors[category] || 'bg-gray-500',
        departments: filteredDepartments.filter(d => d.category === category),
        totalDoctors: filteredDepartments
            .filter(d => d.category === category)
            .reduce((sum, d) => sum + d.doctorCount, 0),
    })).filter(g => g.departments.length > 0)

    // 打开新建对话框
    const openCreateDialog = () => {
        setDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (dept: Department) => {
        setDialogMode('edit')
        setEditingDepartment(dept)
        setFormData({
            name: dept.name,
            category: dept.category,
            description: dept.description,
            diseases: dept.diseases.join('、'),
            color: dept.color,
        })
        setFormErrors({})
        setDialogOpen(true)
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = '请输入科室名称'
        if (!formData.category) errors.category = '请选择科室分类'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存科室
    const handleSave = () => {
        if (!validateForm()) return

        if (dialogMode === 'create') {
            const newDepartment: Department = {
                id: Date.now().toString(),
                name: formData.name,
                category: formData.category,
                description: formData.description,
                diseases: formData.diseases.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
                color: formData.color,
                doctorCount: 0,
                consultCount: 0,
            }
            setDepartments([...departments, newDepartment])
        } else if (editingDepartment) {
            setDepartments(departments.map(d =>
                d.id === editingDepartment.id
                    ? {
                        ...d,
                        name: formData.name,
                        category: formData.category,
                        description: formData.description,
                        diseases: formData.diseases.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
                        color: formData.color,
                    }
                    : d
            ))
        }

        setDialogOpen(false)
    }

    // 删除科室
    const handleDelete = (deptId: string) => {
        setDepartments(departments.filter(d => d.id !== deptId))
    }

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
                        <h1 className='text-2xl font-bold tracking-tight'>科室库</h1>
                        <p className='text-muted-foreground'>管理医院科室信息</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加科室
                    </Button>
                </div>

                {/* 搜索和筛选 */}
                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative flex-1 min-w-[200px] max-w-md'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索科室名称或疾病...'
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
                            variant={selectedCategory === null ? 'default' : 'outline'}
                            className='cursor-pointer'
                            onClick={() => setSelectedCategory(null)}
                        >
                            全部
                        </Badge>
                        {categoryOptions.map(cat => (
                            <Badge
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                className='cursor-pointer gap-1.5'
                                onClick={() => setSelectedCategory(cat)}
                            >
                                <span className={cn('h-2 w-2 rounded-full', categoryColors[cat])} />
                                {cat}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* 科室列表 - 按分类分组 */}
                <div className='space-y-6'>
                    {groupedDepartments.map(group => (
                        <div key={group.category}>
                            <div className='mb-3 flex items-center gap-2'>
                                <span className={cn('h-3 w-3 rounded-full', group.color)} />
                                <h3 className='font-semibold'>{group.category}</h3>
                                <Badge variant='secondary' className='text-xs'>
                                    {group.departments.length} 个科室
                                </Badge>
                                <span className='text-muted-foreground text-xs'>
                                    共 {group.totalDoctors} 位医师
                                </span>
                            </div>
                            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                                {group.departments.map(dept => (
                                    <Card key={dept.id} className='group'>
                                        <CardHeader className='pb-2'>
                                            <div className='flex items-start justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', dept.color)}>
                                                        <Stethoscope className='h-4 w-4 text-white' />
                                                    </div>
                                                    <div>
                                                        <CardTitle className='text-sm font-medium'>{dept.name}</CardTitle>
                                                        <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                                                            <span className='flex items-center gap-0.5'>
                                                                <Users className='h-3 w-3' />
                                                                {dept.doctorCount}
                                                            </span>
                                                            <span className='flex items-center gap-0.5'>
                                                                <CalendarCheck className='h-3 w-3' />
                                                                {dept.consultCount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant='ghost' size='icon' className='h-7 w-7 opacity-0 group-hover:opacity-100'>
                                                            <MoreHorizontal className='h-4 w-4' />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align='end'>
                                                        <DropdownMenuItem onClick={() => openEditDialog(dept)}>
                                                            <Pencil className='mr-2 h-4 w-4' />
                                                            编辑
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Users className='mr-2 h-4 w-4' />
                                                            查看医师
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className='text-destructive'
                                                            onClick={() => handleDelete(dept.id)}
                                                        >
                                                            <Trash2 className='mr-2 h-4 w-4' />
                                                            删除
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className='pt-0'>
                                            <CardDescription className='mb-2 line-clamp-1 text-xs'>
                                                {dept.description}
                                            </CardDescription>
                                            <div className='flex flex-wrap gap-1'>
                                                {dept.diseases.slice(0, 3).map(d => (
                                                    <Badge key={d} variant='outline' className='text-xs'>
                                                        {d}
                                                    </Badge>
                                                ))}
                                                {dept.diseases.length > 3 && (
                                                    <Badge variant='outline' className='text-xs'>
                                                        +{dept.diseases.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Main>

            {/* 新建/编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <LayoutList className='h-5 w-5' />
                            {dialogMode === 'create' ? '添加科室' : '编辑科室'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create' ? '添加新的科室信息' : '修改科室信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>科室名称 <span className='text-destructive'>*</span></Label>
                                <Input
                                    placeholder='请输入科室名称'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={formErrors.name ? 'border-destructive' : ''}
                                />
                                {formErrors.name && <p className='text-destructive text-sm'>{formErrors.name}</p>}
                            </div>
                            <div className='space-y-2'>
                                <Label>科室分类 <span className='text-destructive'>*</span></Label>
                                <select
                                    className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categoryOptions.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>科室描述</Label>
                            <Textarea
                                placeholder='请输入科室描述'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className='resize-none'
                                rows={2}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>常见疾病</Label>
                            <Input
                                placeholder='请输入常见疾病，用顿号分隔'
                                value={formData.diseases}
                                onChange={(e) => setFormData({ ...formData, diseases: e.target.value })}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>显示颜色</Label>
                            <div className='flex flex-wrap gap-2'>
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        type='button'
                                        className={cn(
                                            'h-7 w-7 rounded-full transition-all',
                                            color.value,
                                            formData.color === color.value
                                                ? 'ring-primary ring-2 ring-offset-2'
                                                : 'hover:scale-110'
                                        )}
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                        title={color.label}
                                    />
                                ))}
                            </div>
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

