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
    Users,
    Building2,
    CalendarCheck,
    Star,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useHospitals } from '@/hooks/use-api'
import type { Hospital as HospitalType } from '@/lib/api'
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

// 等级颜色映射 (支持中英文)
const levelColors: Record<string, string> = {
    'tertiary_a': 'bg-red-500',
    'tertiary_b': 'bg-orange-500',
    'secondary_a': 'bg-amber-500',
    'secondary_b': 'bg-yellow-500',
    'primary': 'bg-green-500',
    'other': 'bg-gray-500',
    // 中文版本
    '三甲': 'bg-red-500',
    '三乙': 'bg-orange-500',
    '二甲': 'bg-amber-500',
    '二乙': 'bg-yellow-500',
    '一级': 'bg-green-500',
}

// 等级显示名称
const levelLabels: Record<string, string> = {
    'tertiary_a': '三甲',
    'tertiary_b': '三乙',
    'secondary_a': '二甲',
    'secondary_b': '二乙',
    'primary': '一级',
    'other': '其他',
    // 中文版本 (直接返回)
    '三甲': '三甲',
    '三乙': '三乙',
    '二甲': '二甲',
    '二乙': '二乙',
    '一级': '一级',
}

// 类型显示名称
const typeLabels: Record<string, string> = {
    'general': '综合医院',
    'specialized': '专科医院',
    'tcm': '中医医院',
    'maternal': '妇幼保健院',
    'other': '其他',
    // 中文版本
    '综合': '综合医院',
    '专科': '专科医院',
    '中医': '中医医院',
    '妇幼': '妇幼保健院',
}

interface HospitalFormData {
    name: string
    level: string
    type: string
    address: string
    phone: string
    introduction: string
    status: 'active' | 'inactive'
}

const defaultFormData: HospitalFormData = {
    name: '',
    level: 'tertiary_a',
    type: 'general',
    address: '',
    phone: '',
    introduction: '',
    status: 'active',
}

const levelOptions = [
    { value: 'tertiary_a', label: '三甲' },
    { value: 'tertiary_b', label: '三乙' },
    { value: 'secondary_a', label: '二甲' },
    { value: 'secondary_b', label: '二乙' },
    { value: 'primary', label: '一级' },
]
const typeOptions = [
    { value: 'general', label: '综合医院' },
    { value: 'specialized', label: '专科医院' },
    { value: 'tcm', label: '中医医院' },
    { value: 'maternal', label: '妇幼保健院' },
]

export function Hospitals() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const pageSize = 12

    // 从后端获取医院数据
    const { data: hospitalsData, isLoading, error } = useHospitals({
        keyword: searchQuery || undefined,
        page,
        pageSize,
    })

    const hospitals = hospitalsData?.data ?? []
    const total = hospitalsData?.total ?? 0

    // 表单对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingHospital, setEditingHospital] = useState<HospitalType | null>(null)
    const [formData, setFormData] = useState<HospitalFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // 过滤医院 (按级别)
    const filteredHospitals = hospitals.filter(hospital => {
        const matchesLevel = !selectedLevel || hospital.level === selectedLevel
        return matchesLevel
    })

    // 打开新建对话框
    const openCreateDialog = () => {
        setDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (hospital: HospitalType) => {
        setDialogMode('edit')
        setEditingHospital(hospital)
        setFormData({
            name: hospital.name,
            level: hospital.level,
            type: hospital.type,
            address: hospital.address,
            phone: hospital.phone || '',
            introduction: hospital.introduction || '',
            status: hospital.status as 'active' | 'inactive',
        })
        setFormErrors({})
        setDialogOpen(true)
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = '请输入医院名称'
        if (!formData.address.trim()) errors.address = '请输入医院地址'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存医院 (TODO: 对接后端 API)
    const handleSave = () => {
        if (!validateForm()) return
        // TODO: 调用后端 API 保存
        console.log('保存医院:', formData)
        setDialogOpen(false)
    }

    // 删除医院 (TODO: 对接后端 API)
    const handleDelete = (hospitalId: string) => {
        // TODO: 调用后端 API 删除
        console.log('删除医院:', hospitalId)
    }

    // 从地址提取城市
    const getCityFromAddress = (address: string) => {
        const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '南京', '武汉', '西安', '重庆', '天津']
        for (const city of cities) {
            if (address.includes(city)) return city
        }
        return address.substring(0, 2)
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
                        {levelOptions.map(level => (
                            <Badge
                                key={level.value}
                                variant={selectedLevel === level.value ? 'default' : 'outline'}
                                className='cursor-pointer gap-1.5'
                                onClick={() => setSelectedLevel(level.value)}
                            >
                                <span className={cn('h-2 w-2 rounded-full', levelColors[level.value])} />
                                {level.label}
                            </Badge>
                        ))}
                    </div>

                    <div className='text-muted-foreground text-sm'>
                        共 {total} 家医院
                    </div>
                </div>

                {/* 加载状态 */}
                {isLoading && (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {[...Array(6)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader className='pb-3'>
                                    <div className='flex items-center gap-3'>
                                        <Skeleton className='h-12 w-12 rounded-lg' />
                                        <div className='space-y-2'>
                                            <Skeleton className='h-4 w-32' />
                                            <Skeleton className='h-3 w-20' />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className='space-y-3'>
                                    <Skeleton className='h-4 w-full' />
                                    <Skeleton className='h-4 w-24' />
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

                {/* 医院列表 */}
                {!isLoading && !error && (
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {filteredHospitals.map(hospital => {
                            const city = getCityFromAddress(hospital.address)
                            return (
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
                                                        <Badge variant='outline' className='text-xs'>
                                                            {levelLabels[hospital.level] || hospital.level}
                                                        </Badge>
                                                        <Badge variant='secondary' className='text-xs'>
                                                            {typeLabels[hospital.type] || hospital.type}
                                                        </Badge>
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
                                                        查看科室
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
                                            <MapPin className='h-4 w-4 shrink-0' />
                                            <span className='line-clamp-1'>{city} · {hospital.address}</span>
                                        </div>
                                        {hospital.phone && (
                                            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                                                <CalendarCheck className='h-4 w-4' />
                                                {hospital.phone}
                                            </div>
                                        )}
                                        {hospital.introduction && (
                                            <p className='text-muted-foreground line-clamp-2 text-sm'>
                                                {hospital.introduction}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {!isLoading && !error && filteredHospitals.length === 0 && (
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

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>医院级别</Label>
                                <select
                                    className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                >
                                    {levelOptions.map(l => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
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
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>详细地址 <span className='text-destructive'>*</span></Label>
                            <Input
                                placeholder='请输入详细地址'
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className={formErrors.address ? 'border-destructive' : ''}
                            />
                            {formErrors.address && <p className='text-destructive text-sm'>{formErrors.address}</p>}
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
                            <Label>医院简介</Label>
                            <Textarea
                                placeholder='请输入医院简介'
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

