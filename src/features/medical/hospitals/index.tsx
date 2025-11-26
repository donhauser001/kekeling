import { useState } from 'react'
import {
    Hospital,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search as SearchIcon,
    X,
    MapPin,
    Phone,
    Globe,
    Users,
    Building2,
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

interface HospitalData {
    id: string
    name: string
    level: string
    type: string
    city: string
    address: string
    phone: string
    website: string
    description: string
    departments: string[]
    doctorCount: number
    consultCount: number
    satisfaction: number
    status: 'active' | 'inactive'
}

const levelColors: Record<string, string> = {
    '三甲': 'bg-red-500',
    '三乙': 'bg-orange-500',
    '二甲': 'bg-amber-500',
    '二乙': 'bg-yellow-500',
    '一级': 'bg-green-500',
    '专科': 'bg-purple-500',
}

const initialHospitals: HospitalData[] = [
    {
        id: '1',
        name: '北京协和医院',
        level: '三甲',
        type: '综合医院',
        city: '北京',
        address: '北京市东城区帅府园1号',
        phone: '010-69156114',
        website: 'www.pumch.cn',
        description: '中国医学科学院北京协和医学院直属医院，是国家卫生健康委指定的全国疑难重症诊治指导中心。',
        departments: ['心内科', '神经内科', '骨科', '妇产科', '儿科'],
        doctorCount: 2500,
        consultCount: 856000,
        satisfaction: 98.5,
        status: 'active',
    },
    {
        id: '2',
        name: '上海瑞金医院',
        level: '三甲',
        type: '综合医院',
        city: '上海',
        address: '上海市黄浦区瑞金二路197号',
        phone: '021-64370045',
        website: 'www.rjh.com.cn',
        description: '上海交通大学医学院附属瑞金医院，是一所三级甲等大型综合性教学医院。',
        departments: ['血液科', '内分泌科', '消化内科', '心血管外科'],
        doctorCount: 2200,
        consultCount: 723000,
        satisfaction: 97.8,
        status: 'active',
    },
    {
        id: '3',
        name: '北京积水潭医院',
        level: '三甲',
        type: '专科医院',
        city: '北京',
        address: '北京市西城区新街口东街31号',
        phone: '010-58516688',
        website: 'www.jst-hosp.com.cn',
        description: '以骨科和烧伤科为重点，是国内骨科领域的权威医疗机构。',
        departments: ['骨科', '烧伤科', '手外科', '脊柱外科'],
        doctorCount: 1800,
        consultCount: 568000,
        satisfaction: 98.2,
        status: 'active',
    },
    {
        id: '4',
        name: '广州妇女儿童医疗中心',
        level: '三甲',
        type: '专科医院',
        city: '广州',
        address: '广州市天河区金穗路9号',
        phone: '020-81886332',
        website: 'www.gwcmc.org',
        description: '华南地区规模最大的妇女儿童医疗机构。',
        departments: ['产科', '新生儿科', '儿童呼吸科', '妇科肿瘤'],
        doctorCount: 1500,
        consultCount: 425000,
        satisfaction: 97.5,
        status: 'active',
    },
    {
        id: '5',
        name: '深圳人民医院',
        level: '三甲',
        type: '综合医院',
        city: '深圳',
        address: '深圳市罗湖区东门北路1017号',
        phone: '0755-25533018',
        website: 'www.szrm.com',
        description: '深圳市最大的三级甲等综合医院。',
        departments: ['急诊科', '重症医学科', '肿瘤科', '神经外科'],
        doctorCount: 1600,
        consultCount: 489000,
        satisfaction: 96.8,
        status: 'active',
    },
    {
        id: '6',
        name: '成都华西医院',
        level: '三甲',
        type: '综合医院',
        city: '成都',
        address: '成都市武侯区国学巷37号',
        phone: '028-85422114',
        website: 'www.wchscu.cn',
        description: '西南地区医疗中心，四川大学附属医院。',
        departments: ['肝胆外科', '胸外科', '泌尿外科', '眼科'],
        doctorCount: 2800,
        consultCount: 912000,
        satisfaction: 98.8,
        status: 'active',
    },
]

interface HospitalFormData {
    name: string
    level: string
    type: string
    city: string
    address: string
    phone: string
    website: string
    description: string
    departments: string
    status: 'active' | 'inactive'
}

const defaultFormData: HospitalFormData = {
    name: '',
    level: '三甲',
    type: '综合医院',
    city: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    departments: '',
    status: 'active',
}

const levelOptions = ['三甲', '三乙', '二甲', '二乙', '一级', '专科']
const typeOptions = ['综合医院', '专科医院', '中医医院', '妇幼保健院', '社区医院']
const cityOptions = ['北京', '上海', '广州', '深圳', '成都', '杭州', '南京', '武汉', '西安', '重庆']

export function Hospitals() {
    const [hospitals, setHospitals] = useState<HospitalData[]>(initialHospitals)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
    const [selectedCity, setSelectedCity] = useState<string | null>(null)

    // 表单对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingHospital, setEditingHospital] = useState<HospitalData | null>(null)
    const [formData, setFormData] = useState<HospitalFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // 获取所有城市
    const cities = [...new Set(hospitals.map(h => h.city))]

    // 过滤医院
    const filteredHospitals = hospitals.filter(hospital => {
        const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hospital.departments.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesLevel = !selectedLevel || hospital.level === selectedLevel
        const matchesCity = !selectedCity || hospital.city === selectedCity
        return matchesSearch && matchesLevel && matchesCity
    })

    // 打开新建对话框
    const openCreateDialog = () => {
        setDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (hospital: HospitalData) => {
        setDialogMode('edit')
        setEditingHospital(hospital)
        setFormData({
            name: hospital.name,
            level: hospital.level,
            type: hospital.type,
            city: hospital.city,
            address: hospital.address,
            phone: hospital.phone,
            website: hospital.website,
            description: hospital.description,
            departments: hospital.departments.join('、'),
            status: hospital.status,
        })
        setFormErrors({})
        setDialogOpen(true)
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = '请输入医院名称'
        if (!formData.city.trim()) errors.city = '请输入所在城市'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存医院
    const handleSave = () => {
        if (!validateForm()) return

        if (dialogMode === 'create') {
            const newHospital: HospitalData = {
                id: Date.now().toString(),
                ...formData,
                departments: formData.departments.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
                doctorCount: 0,
                consultCount: 0,
                satisfaction: 100,
            }
            setHospitals([...hospitals, newHospital])
        } else if (editingHospital) {
            setHospitals(hospitals.map(h =>
                h.id === editingHospital.id
                    ? {
                        ...h,
                        ...formData,
                        departments: formData.departments.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
                    }
                    : h
            ))
        }

        setDialogOpen(false)
    }

    // 删除医院
    const handleDelete = (hospitalId: string) => {
        setHospitals(hospitals.filter(h => h.id !== hospitalId))
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
                        <h1 className='text-2xl font-bold tracking-tight'>医院库</h1>
                        <p className='text-muted-foreground'>管理合作医院信息</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加医院
                    </Button>
                </div>

                {/* 搜索和筛选 */}
                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative flex-1 min-w-[200px] max-w-md'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索医院名称或科室...'
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
                            variant={selectedLevel === null ? 'default' : 'outline'}
                            className='cursor-pointer'
                            onClick={() => setSelectedLevel(null)}
                        >
                            全部级别
                        </Badge>
                        {levelOptions.slice(0, 4).map(level => (
                            <Badge
                                key={level}
                                variant={selectedLevel === level ? 'default' : 'outline'}
                                className='cursor-pointer gap-1.5'
                                onClick={() => setSelectedLevel(level)}
                            >
                                <span className={cn('h-2 w-2 rounded-full', levelColors[level])} />
                                {level}
                            </Badge>
                        ))}
                    </div>

                    <div className='flex flex-wrap gap-2'>
                        <Badge
                            variant={selectedCity === null ? 'default' : 'outline'}
                            className='cursor-pointer'
                            onClick={() => setSelectedCity(null)}
                        >
                            全部城市
                        </Badge>
                        {cities.map(city => (
                            <Badge
                                key={city}
                                variant={selectedCity === city ? 'default' : 'outline'}
                                className='cursor-pointer'
                                onClick={() => setSelectedCity(city)}
                            >
                                {city}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* 医院列表 */}
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {filteredHospitals.map(hospital => (
                        <Card key={hospital.id} className='group'>
                            <CardHeader className='pb-3'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', levelColors[hospital.level] || 'bg-gray-500')}>
                                            <Building2 className='h-6 w-6 text-white' />
                                        </div>
                                        <div>
                                            <CardTitle className='flex items-center gap-2 text-base'>
                                                {hospital.name}
                                            </CardTitle>
                                            <div className='flex items-center gap-2'>
                                                <Badge variant='outline' className='text-xs'>{hospital.level}</Badge>
                                                <Badge variant='secondary' className='text-xs'>{hospital.type}</Badge>
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
                                            <DropdownMenuItem onClick={() => openEditDialog(hospital)}>
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
                                                onClick={() => handleDelete(hospital.id)}
                                            >
                                                <Trash2 className='mr-2 h-4 w-4' />
                                                删除
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className='space-y-3'>
                                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                                    <MapPin className='h-4 w-4' />
                                    <span className='line-clamp-1'>{hospital.city} · {hospital.address}</span>
                                </div>
                                <div className='flex items-center gap-4 text-sm'>
                                    <div className='text-muted-foreground flex items-center gap-1'>
                                        <Users className='h-4 w-4' />
                                        {hospital.doctorCount}
                                    </div>
                                    <div className='text-muted-foreground flex items-center gap-1'>
                                        <CalendarCheck className='h-4 w-4' />
                                        {hospital.consultCount.toLocaleString()}
                                    </div>
                                    <div className='flex items-center gap-1 text-amber-500'>
                                        <Star className='h-4 w-4 fill-current' />
                                        {hospital.satisfaction}%
                                    </div>
                                </div>
                                <div className='flex flex-wrap gap-1'>
                                    {hospital.departments.slice(0, 4).map(d => (
                                        <Badge key={d} variant='outline' className='text-xs'>
                                            {d}
                                        </Badge>
                                    ))}
                                    {hospital.departments.length > 4 && (
                                        <Badge variant='outline' className='text-xs'>
                                            +{hospital.departments.length - 4}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredHospitals.length === 0 && (
                    <div className='text-muted-foreground py-12 text-center'>
                        暂无匹配的医院
                    </div>
                )}
            </Main>

            {/* 新建/编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='sm:max-w-lg'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Hospital className='h-5 w-5' />
                            {dialogMode === 'create' ? '添加医院' : '编辑医院'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create' ? '添加新的合作医院信息' : '修改医院信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='max-h-[60vh] space-y-4 overflow-y-auto py-1 pe-2'>
                        <div className='space-y-2'>
                            <Label>医院名称 <span className='text-destructive'>*</span></Label>
                            <Input
                                placeholder='请输入医院名称'
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={formErrors.name ? 'border-destructive' : ''}
                            />
                            {formErrors.name && <p className='text-destructive text-sm'>{formErrors.name}</p>}
                        </div>

                        <div className='grid grid-cols-3 gap-4'>
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
                            <div className='space-y-2'>
                                <Label>医院类型</Label>
                                <select
                                    className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {typeOptions.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='space-y-2'>
                                <Label>所在城市 <span className='text-destructive'>*</span></Label>
                                <Input
                                    placeholder='城市'
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className={formErrors.city ? 'border-destructive' : ''}
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>详细地址</Label>
                            <Input
                                placeholder='请输入详细地址'
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>联系电话</Label>
                                <Input
                                    placeholder='请输入联系电话'
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>官网</Label>
                                <Input
                                    placeholder='请输入官网地址'
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>重点科室</Label>
                            <Input
                                placeholder='请输入重点科室，用顿号分隔'
                                value={formData.departments}
                                onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>医院简介</Label>
                            <Textarea
                                placeholder='请输入医院简介'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

