import { useState } from 'react'
import {
    Layers,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    PackageSearch,
    Check,
    Stethoscope,
    MessageSquare,
    Truck,
    Building,
    Sparkles,
    HeartPulse,
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

interface ServiceCategory {
    id: string
    name: string
    description: string
    serviceCount: number
    services: string[]
    isSystem: boolean
    color: string
    icon: 'stethoscope' | 'message' | 'truck' | 'building' | 'sparkles' | 'heart'
}

interface ServiceItem {
    id: string
    name: string
    key: string
    description: string
}

interface ServiceGroup {
    id: string
    name: string
    services: ServiceItem[]
}

const serviceGroups: ServiceGroup[] = [
    {
        id: 'escort',
        name: '陪诊服务',
        services: [
            { id: 'escort-outpatient', name: '门诊陪诊', key: 'escort:outpatient', description: '门诊就医全程陪同' },
            { id: 'escort-inpatient', name: '住院陪护', key: 'escort:inpatient', description: '住院期间陪护服务' },
            { id: 'escort-examination', name: '检查陪同', key: 'escort:examination', description: '各类检查陪同服务' },
            { id: 'escort-vip', name: 'VIP陪诊', key: 'escort:vip', description: '高端定制陪诊服务' },
            { id: 'escort-surgery', name: '术后护理', key: 'escort:surgery', description: '手术后专业护理' },
        ],
    },
    {
        id: 'diagnosis',
        name: '诊断服务',
        services: [
            { id: 'diagnosis-online', name: '在线问诊', key: 'diagnosis:online', description: '视频/图文在线咨询' },
            { id: 'diagnosis-report', name: '报告解读', key: 'diagnosis:report', description: '检查报告专业解读' },
            { id: 'diagnosis-consult', name: '健康咨询', key: 'diagnosis:consult', description: '健康管理咨询服务' },
            { id: 'diagnosis-second', name: '二次诊断', key: 'diagnosis:second', description: '专家二次诊断意见' },
        ],
    },
    {
        id: 'errand',
        name: '跑腿服务',
        services: [
            { id: 'errand-medicine', name: '药品代购', key: 'errand:medicine', description: '处方药代购配送' },
            { id: 'errand-record', name: '病历代办', key: 'errand:record', description: '病历复印邮寄服务' },
            { id: 'errand-appointment', name: '预约代办', key: 'errand:appointment', description: '挂号预约代办服务' },
            { id: 'errand-delivery', name: '物品配送', key: 'errand:delivery', description: '医院物品配送服务' },
        ],
    },
    {
        id: 'hotel',
        name: '酒店服务',
        services: [
            { id: 'hotel-hospital', name: '医院酒店', key: 'hotel:hospital', description: '医院合作酒店预订' },
            { id: 'hotel-recovery', name: '康养公寓', key: 'hotel:recovery', description: '康复疗养住宿' },
            { id: 'hotel-family', name: '家属住宿', key: 'hotel:family', description: '家属临时住宿' },
        ],
    },
    {
        id: 'special',
        name: '特色服务',
        services: [
            { id: 'special-translation', name: '医疗翻译', key: 'special:translation', description: '外语医疗翻译' },
            { id: 'special-psychology', name: '心理疏导', key: 'special:psychology', description: '专业心理咨询' },
            { id: 'special-nutrition', name: '营养指导', key: 'special:nutrition', description: '营养膳食指导' },
        ],
    },
]

const colorOptions = [
    { value: 'bg-red-500', label: '红色' },
    { value: 'bg-orange-500', label: '橙色' },
    { value: 'bg-amber-500', label: '琥珀' },
    { value: 'bg-yellow-500', label: '黄色' },
    { value: 'bg-lime-500', label: '青柠' },
    { value: 'bg-green-500', label: '绿色' },
    { value: 'bg-emerald-500', label: '翠绿' },
    { value: 'bg-teal-500', label: '青色' },
    { value: 'bg-cyan-500', label: '蓝绿' },
    { value: 'bg-sky-500', label: '天蓝' },
    { value: 'bg-blue-500', label: '蓝色' },
    { value: 'bg-indigo-500', label: '靛蓝' },
    { value: 'bg-violet-500', label: '紫罗兰' },
    { value: 'bg-purple-500', label: '紫色' },
    { value: 'bg-fuchsia-500', label: '洋红' },
    { value: 'bg-pink-500', label: '粉色' },
    { value: 'bg-rose-500', label: '玫红' },
    { value: 'bg-gray-500', label: '灰色' },
]

const iconOptions = [
    { value: 'stethoscope', label: '陪诊', icon: Stethoscope },
    { value: 'message', label: '诊断', icon: MessageSquare },
    { value: 'truck', label: '跑腿', icon: Truck },
    { value: 'building', label: '酒店', icon: Building },
    { value: 'sparkles', label: '特色', icon: Sparkles },
    { value: 'heart', label: '健康', icon: HeartPulse },
] as const

const initialCategories: ServiceCategory[] = [
    {
        id: '1',
        name: '陪诊服务',
        description: '医院陪诊相关服务，包括门诊、住院、检查等全程陪同',
        serviceCount: 5,
        services: ['escort:outpatient', 'escort:inpatient', 'escort:examination', 'escort:vip', 'escort:surgery'],
        isSystem: true,
        color: 'bg-blue-500',
        icon: 'stethoscope',
    },
    {
        id: '2',
        name: '诊断服务',
        description: '在线诊断咨询服务，提供专业医疗咨询',
        serviceCount: 4,
        services: ['diagnosis:online', 'diagnosis:report', 'diagnosis:consult', 'diagnosis:second'],
        isSystem: true,
        color: 'bg-green-500',
        icon: 'message',
    },
    {
        id: '3',
        name: '跑腿服务',
        description: '医疗相关跑腿代办，药品代购、病历代办等',
        serviceCount: 4,
        services: ['errand:medicine', 'errand:record', 'errand:appointment', 'errand:delivery'],
        isSystem: true,
        color: 'bg-orange-500',
        icon: 'truck',
    },
    {
        id: '4',
        name: '酒店服务',
        description: '医院周边住宿服务，方便就医住宿',
        serviceCount: 3,
        services: ['hotel:hospital', 'hotel:recovery', 'hotel:family'],
        isSystem: true,
        color: 'bg-purple-500',
        icon: 'building',
    },
    {
        id: '5',
        name: '特色服务',
        description: '特色增值服务，满足个性化需求',
        serviceCount: 3,
        services: ['special:translation', 'special:psychology', 'special:nutrition'],
        isSystem: false,
        color: 'bg-pink-500',
        icon: 'sparkles',
    },
]

interface CategoryFormData {
    name: string
    description: string
    color: string
    icon: 'stethoscope' | 'message' | 'truck' | 'building' | 'sparkles' | 'heart'
    isSystem: boolean
    services: string[]
}

const defaultFormData: CategoryFormData = {
    name: '',
    description: '',
    color: 'bg-blue-500',
    icon: 'stethoscope',
    isSystem: false,
    services: [],
}

const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, typeof Stethoscope> = {
        stethoscope: Stethoscope,
        message: MessageSquare,
        truck: Truck,
        building: Building,
        sparkles: Sparkles,
        heart: HeartPulse,
    }
    return iconMap[iconName] || Stethoscope
}

export function ServiceCategories() {
    const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [categoryDialogMode, setCategoryDialogMode] = useState<'create' | 'edit'>('create')
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
    const [formData, setFormData] = useState<CategoryFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const openCreateDialog = () => {
        setCategoryDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setCategoryDialogOpen(true)
    }

    const openEditDialog = (category: ServiceCategory) => {
        setCategoryDialogMode('edit')
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description,
            color: category.color,
            icon: category.icon,
            isSystem: category.isSystem,
            services: [...category.services],
        })
        setFormErrors({})
        setCategoryDialogOpen(true)
    }

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.name.trim()) {
            errors.name = '请输入分类名称'
        } else if (formData.name.length > 20) {
            errors.name = '分类名称不能超过20个字符'
        } else if (categoryDialogMode === 'create' && categories.some(c => c.name === formData.name)) {
            errors.name = '分类名称已存在'
        } else if (categoryDialogMode === 'edit' && categories.some(c => c.name === formData.name && c.id !== editingCategory?.id)) {
            errors.name = '分类名称已存在'
        }

        if (!formData.description.trim()) {
            errors.description = '请输入分类描述'
        } else if (formData.description.length > 100) {
            errors.description = '分类描述不能超过100个字符'
        }

        if (formData.services.length === 0) {
            errors.services = '请至少选择一个服务'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSaveCategory = () => {
        if (!validateForm()) return

        if (categoryDialogMode === 'create') {
            const newCategory: ServiceCategory = {
                id: Date.now().toString(),
                name: formData.name,
                description: formData.description,
                color: formData.color,
                icon: formData.icon,
                isSystem: formData.isSystem,
                services: formData.services,
                serviceCount: formData.services.length,
            }
            setCategories([...categories, newCategory])
        } else if (editingCategory) {
            setCategories(categories.map(c =>
                c.id === editingCategory.id
                    ? { ...c, name: formData.name, description: formData.description, color: formData.color, icon: formData.icon, services: formData.services, serviceCount: formData.services.length }
                    : c
            ))
        }

        setCategoryDialogOpen(false)
    }

    const toggleFormService = (key: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(key)
                ? prev.services.filter(k => k !== key)
                : [...prev.services, key]
        }))
    }

    const toggleFormGroupServices = (group: ServiceGroup) => {
        const groupKeys = group.services.map(s => s.key)
        const allEnabled = groupKeys.every(key => formData.services.includes(key))

        setFormData(prev => ({
            ...prev,
            services: allEnabled
                ? prev.services.filter(key => !groupKeys.includes(key))
                : [...prev.services, ...groupKeys.filter(key => !prev.services.includes(key))]
        }))
    }

    const getServiceName = (key: string): string => {
        for (const group of serviceGroups) {
            const service = group.services.find(s => s.key === key)
            if (service) return service.name
        }
        return key
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
                        <h1 className='text-2xl font-bold tracking-tight'>服务分类</h1>
                        <p className='text-muted-foreground'>管理服务分类和关联服务项</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建分类
                    </Button>
                </div>

                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon)
                        return (
                            <Card
                                key={category.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedCategory === category.id ? 'ring-primary ring-2' : ''}`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <CardHeader className='pb-3'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.color}`}>
                                                <IconComponent className='h-5 w-5 text-white' />
                                            </div>
                                            <div>
                                                <CardTitle className='flex items-center gap-2 text-base'>
                                                    {category.name}
                                                    {category.isSystem && (
                                                        <Badge variant='secondary' className='text-xs'>
                                                            系统
                                                        </Badge>
                                                    )}
                                                </CardTitle>
                                                <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                                                    <PackageSearch className='h-3.5 w-3.5' />
                                                    {category.serviceCount} 个服务
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8 w-8'
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end'>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        openEditDialog(category)
                                                    }}
                                                >
                                                    <Pencil className='mr-2 h-4 w-4' />
                                                    编辑分类
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <PackageSearch className='mr-2 h-4 w-4' />
                                                    查看服务
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className='text-destructive'
                                                    disabled={category.isSystem}
                                                >
                                                    <Trash2 className='mr-2 h-4 w-4' />
                                                    删除分类
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className='mb-3 line-clamp-2'>
                                        {category.description}
                                    </CardDescription>
                                    <div className='flex flex-wrap gap-1'>
                                        {category.services.slice(0, 3).map((service) => (
                                            <Badge key={service} variant='outline' className='text-xs'>
                                                {getServiceName(service)}
                                            </Badge>
                                        ))}
                                        {category.services.length > 3 && (
                                            <Badge variant='outline' className='text-xs'>
                                                +{category.services.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {selectedCategory && (
                    <div className='mt-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-base'>
                                    服务详情 - {categories.find((c) => c.id === selectedCategory)?.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                                    {categories
                                        .find((c) => c.id === selectedCategory)
                                        ?.services.map((service) => (
                                            <div
                                                key={service}
                                                className='bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2'
                                            >
                                                <Check className='text-primary h-4 w-4' />
                                                <span className='text-sm'>{getServiceName(service)}</span>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </Main>

            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Layers className='h-5 w-5' />
                            {categoryDialogMode === 'create' ? '新建分类' : '编辑分类'}
                        </DialogTitle>
                        <DialogDescription>
                            {categoryDialogMode === 'create'
                                ? '创建一个新的服务分类，并关联服务项'
                                : '修改分类的基本信息和关联服务'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-6'>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='name'>
                                        分类名称 <span className='text-destructive'>*</span>
                                    </Label>
                                    <Input
                                        id='name'
                                        placeholder='请输入分类名称'
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={formErrors.name ? 'border-destructive' : ''}
                                    />
                                    {formErrors.name && (
                                        <p className='text-destructive text-sm'>{formErrors.name}</p>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <Label>分类图标</Label>
                                    <div className='flex flex-wrap gap-2'>
                                        {iconOptions.map((opt) => {
                                            const Icon = opt.icon
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type='button'
                                                    className={cn(
                                                        'flex h-9 w-9 items-center justify-center rounded-md border transition-all',
                                                        formData.icon === opt.value
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-border hover:border-primary/50'
                                                    )}
                                                    onClick={() => setFormData({ ...formData, icon: opt.value })}
                                                    title={opt.label}
                                                >
                                                    <Icon className='h-4 w-4' />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='description'>
                                    分类描述 <span className='text-destructive'>*</span>
                                </Label>
                                <Textarea
                                    id='description'
                                    placeholder='请输入分类描述'
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={cn('resize-none', formErrors.description ? 'border-destructive' : '')}
                                    rows={2}
                                />
                                {formErrors.description && (
                                    <p className='text-destructive text-sm'>{formErrors.description}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label>分类颜色</Label>
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

                        <div className='space-y-2'>
                            <Label>
                                关联服务 <span className='text-destructive'>*</span>
                                <span className='text-muted-foreground ml-2 text-sm font-normal'>
                                    已选择 {formData.services.length} 个服务
                                </span>
                            </Label>
                            {formErrors.services && (
                                <p className='text-destructive text-sm'>{formErrors.services}</p>
                            )}
                            <ScrollArea className='h-[240px] rounded-md border p-3'>
                                <div className='space-y-4'>
                                    {serviceGroups.map((group) => {
                                        const groupKeys = group.services.map((s) => s.key)
                                        const enabledCount = groupKeys.filter((key) =>
                                            formData.services.includes(key)
                                        ).length
                                        const allEnabled = enabledCount === group.services.length
                                        const someEnabled = enabledCount > 0 && !allEnabled

                                        return (
                                            <div key={group.id} className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        id={`group-${group.id}`}
                                                        checked={allEnabled}
                                                        onCheckedChange={() => toggleFormGroupServices(group)}
                                                        className={someEnabled ? 'data-[state=checked]:bg-primary/50' : ''}
                                                    />
                                                    <label
                                                        htmlFor={`group-${group.id}`}
                                                        className='cursor-pointer text-sm font-medium'
                                                    >
                                                        {group.name}
                                                    </label>
                                                    <Badge variant='outline' className='text-xs'>
                                                        {enabledCount}/{group.services.length}
                                                    </Badge>
                                                </div>
                                                <div className='ml-6 grid gap-1.5 sm:grid-cols-2'>
                                                    {group.services.map((service) => {
                                                        const isEnabled = formData.services.includes(service.key)
                                                        return (
                                                            <div
                                                                key={service.id}
                                                                className='flex items-center gap-2'
                                                            >
                                                                <Checkbox
                                                                    id={service.id}
                                                                    checked={isEnabled}
                                                                    onCheckedChange={() => toggleFormService(service.key)}
                                                                />
                                                                <label
                                                                    htmlFor={service.id}
                                                                    className='text-muted-foreground cursor-pointer text-sm'
                                                                >
                                                                    {service.name}
                                                                </label>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setCategoryDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSaveCategory}>
                            {categoryDialogMode === 'create' ? '创建分类' : '保存更改'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
