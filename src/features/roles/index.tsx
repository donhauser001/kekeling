import { useState } from 'react'
import {
    Tags,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Users,
    Check,
    Crown,
    Star,
    Building2,
    UserCheck,
    Zap,
    Gift,
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

interface UserCategory {
    id: string
    name: string
    description: string
    userCount: number
    benefits: string[]
    isSystem: boolean
    color: string
    icon: 'crown' | 'star' | 'building' | 'user' | 'zap' | 'gift'
}

interface Benefit {
    id: string
    name: string
    key: string
    description: string
}

interface BenefitGroup {
    id: string
    name: string
    benefits: Benefit[]
}

const benefitGroups: BenefitGroup[] = [
    {
        id: 'discount',
        name: '优惠折扣',
        benefits: [
            { id: 'discount-5', name: '9.5折优惠', key: 'discount:5', description: '全场商品享受9.5折' },
            { id: 'discount-10', name: '9折优惠', key: 'discount:10', description: '全场商品享受9折' },
            { id: 'discount-20', name: '8折优惠', key: 'discount:20', description: '全场商品享受8折' },
            { id: 'discount-free', name: '免运费', key: 'discount:free-shipping', description: '所有订单免运费' },
        ],
    },
    {
        id: 'points',
        name: '积分权益',
        benefits: [
            { id: 'points-double', name: '双倍积分', key: 'points:double', description: '消费获得双倍积分' },
            { id: 'points-triple', name: '三倍积分', key: 'points:triple', description: '消费获得三倍积分' },
            { id: 'points-birthday', name: '生日积分', key: 'points:birthday', description: '生日当天获赠积分' },
            { id: 'points-exchange', name: '积分兑换', key: 'points:exchange', description: '可使用积分兑换商品' },
        ],
    },
    {
        id: 'service',
        name: '专属服务',
        benefits: [
            { id: 'service-vip', name: 'VIP客服', key: 'service:vip', description: '专属VIP客服通道' },
            { id: 'service-priority', name: '优先发货', key: 'service:priority', description: '订单优先处理发货' },
            { id: 'service-return', name: '无忧退换', key: 'service:return', description: '30天无理由退换货' },
            { id: 'service-trial', name: '新品试用', key: 'service:trial', description: '新品优先试用权' },
        ],
    },
    {
        id: 'content',
        name: '内容权益',
        benefits: [
            { id: 'content-course', name: '免费课程', key: 'content:course', description: '免费观看付费课程' },
            { id: 'content-download', name: '资源下载', key: 'content:download', description: '免费下载付费资源' },
            { id: 'content-live', name: '直播特权', key: 'content:live', description: '专属直播间特权' },
        ],
    },
    {
        id: 'activity',
        name: '活动权益',
        benefits: [
            { id: 'activity-early', name: '提前购买', key: 'activity:early', description: '活动商品提前购买' },
            { id: 'activity-exclusive', name: '专属活动', key: 'activity:exclusive', description: '参与专属会员活动' },
            { id: 'activity-gift', name: '专属礼品', key: 'activity:gift', description: '节日专属礼品' },
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
    { value: 'crown', label: '皇冠', icon: Crown },
    { value: 'star', label: '星星', icon: Star },
    { value: 'building', label: '企业', icon: Building2 },
    { value: 'user', label: '用户', icon: UserCheck },
    { value: 'zap', label: '闪电', icon: Zap },
    { value: 'gift', label: '礼物', icon: Gift },
] as const

const initialCategories: UserCategory[] = [
    {
        id: '1',
        name: '至尊VIP',
        description: '最高等级会员，享受全部特权和最优折扣',
        userCount: 128,
        benefits: ['all'],
        isSystem: true,
        color: 'bg-amber-500',
        icon: 'crown',
    },
    {
        id: '2',
        name: '黄金会员',
        description: '高级会员用户，享受大部分会员特权',
        userCount: 1256,
        benefits: ['discount:10', 'points:double', 'service:vip', 'service:priority', 'activity:early'],
        isSystem: true,
        color: 'bg-yellow-500',
        icon: 'star',
    },
    {
        id: '3',
        name: '白银会员',
        description: '中级会员用户，享受基础会员特权',
        userCount: 5832,
        benefits: ['discount:5', 'points:birthday', 'service:return', 'points:exchange'],
        isSystem: true,
        color: 'bg-gray-400',
        icon: 'star',
    },
    {
        id: '4',
        name: '企业用户',
        description: '企业级用户，享受企业专属服务和批量优惠',
        userCount: 89,
        benefits: ['discount:20', 'service:vip', 'service:priority', 'activity:exclusive'],
        isSystem: false,
        color: 'bg-blue-500',
        icon: 'building',
    },
    {
        id: '5',
        name: '普通用户',
        description: '注册用户，享受基础服务',
        userCount: 25680,
        benefits: ['points:exchange', 'service:return'],
        isSystem: true,
        color: 'bg-slate-500',
        icon: 'user',
    },
    {
        id: '6',
        name: '新用户',
        description: '新注册用户，享受新人专属福利',
        userCount: 3420,
        benefits: ['discount:10', 'activity:gift', 'content:trial'],
        isSystem: true,
        color: 'bg-green-500',
        icon: 'gift',
    },
]

interface CategoryFormData {
    name: string
    description: string
    color: string
    icon: 'crown' | 'star' | 'building' | 'user' | 'zap' | 'gift'
    isSystem: boolean
    benefits: string[]
}

const defaultFormData: CategoryFormData = {
    name: '',
    description: '',
    color: 'bg-blue-500',
    icon: 'user',
    isSystem: false,
    benefits: [],
}

const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, typeof Crown> = {
        crown: Crown,
        star: Star,
        building: Building2,
        user: UserCheck,
        zap: Zap,
        gift: Gift,
    }
    return iconMap[iconName] || UserCheck
}

export function Roles() {
    const [categories, setCategories] = useState<UserCategory[]>(initialCategories)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // 分类表单对话框状态
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [categoryDialogMode, setCategoryDialogMode] = useState<'create' | 'edit'>('create')
    const [editingCategory, setEditingCategory] = useState<UserCategory | null>(null)
    const [formData, setFormData] = useState<CategoryFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // 打开新建分类对话框
    const openCreateDialog = () => {
        setCategoryDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setCategoryDialogOpen(true)
    }

    // 打开编辑分类对话框
    const openEditDialog = (category: UserCategory) => {
        setCategoryDialogMode('edit')
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description,
            color: category.color,
            icon: category.icon,
            isSystem: category.isSystem,
            benefits: category.benefits.includes('all')
                ? benefitGroups.flatMap(g => g.benefits.map(p => p.key))
                : [...category.benefits],
        })
        setFormErrors({})
        setCategoryDialogOpen(true)
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.name.trim()) {
            errors.name = '请输入分类名称'
        } else if (formData.name.length > 20) {
            errors.name = '分类名称不能超过20个字符'
        } else if (categoryDialogMode === 'create' && categories.some(r => r.name === formData.name)) {
            errors.name = '分类名称已存在'
        } else if (categoryDialogMode === 'edit' && categories.some(r => r.name === formData.name && r.id !== editingCategory?.id)) {
            errors.name = '分类名称已存在'
        }

        if (!formData.description.trim()) {
            errors.description = '请输入分类描述'
        } else if (formData.description.length > 100) {
            errors.description = '分类描述不能超过100个字符'
        }

        if (formData.benefits.length === 0) {
            errors.benefits = '请至少选择一个权益'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存分类
    const handleSaveCategory = () => {
        if (!validateForm()) return

        if (categoryDialogMode === 'create') {
            const newCategory: UserCategory = {
                id: Date.now().toString(),
                name: formData.name,
                description: formData.description,
                color: formData.color,
                icon: formData.icon,
                isSystem: formData.isSystem,
                benefits: formData.benefits,
                userCount: 0,
            }
            setCategories([...categories, newCategory])
        } else if (editingCategory) {
            setCategories(categories.map(r =>
                r.id === editingCategory.id
                    ? { ...r, name: formData.name, description: formData.description, color: formData.color, icon: formData.icon, benefits: formData.benefits }
                    : r
            ))
        }

        setCategoryDialogOpen(false)
    }

    // 切换表单中的权益
    const toggleFormBenefit = (key: string) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.includes(key)
                ? prev.benefits.filter(k => k !== key)
                : [...prev.benefits, key]
        }))
    }

    // 切换表单中的权益组
    const toggleFormGroupBenefits = (group: BenefitGroup) => {
        const groupKeys = group.benefits.map(p => p.key)
        const allEnabled = groupKeys.every(key => formData.benefits.includes(key))

        setFormData(prev => ({
            ...prev,
            benefits: allEnabled
                ? prev.benefits.filter(key => !groupKeys.includes(key))
                : [...prev.benefits, ...groupKeys.filter(key => !prev.benefits.includes(key))]
        }))
    }

    const getBenefitName = (key: string): string => {
        for (const group of benefitGroups) {
            const benefit = group.benefits.find(b => b.key === key)
            if (benefit) return benefit.name
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
                        <h1 className='text-2xl font-bold tracking-tight'>用户分类</h1>
                        <p className='text-muted-foreground'>管理用户分类和分配权益</p>
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
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedCategory === category.id ? 'ring-primary ring-2' : ''
                                    }`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <CardHeader className='pb-3'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.color}`}
                                            >
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
                                                    <Users className='h-3.5 w-3.5' />
                                                    {category.userCount.toLocaleString()} 人
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
                                                    <Users className='mr-2 h-4 w-4' />
                                                    查看用户
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
                                        {category.benefits.slice(0, 3).map((benefit) => (
                                            <Badge key={benefit} variant='outline' className='text-xs'>
                                                {benefit === 'all' ? '全部权益' : getBenefitName(benefit)}
                                            </Badge>
                                        ))}
                                        {category.benefits.length > 3 && (
                                            <Badge variant='outline' className='text-xs'>
                                                +{category.benefits.length - 3}
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
                                    权益详情 - {categories.find((r) => r.id === selectedCategory)?.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                                    {categories
                                        .find((r) => r.id === selectedCategory)
                                        ?.benefits.map((benefit) => (
                                            <div
                                                key={benefit}
                                                className='bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2'
                                            >
                                                <Check className='text-primary h-4 w-4' />
                                                <span className='text-sm'>
                                                    {benefit === 'all' ? '全部权益' : getBenefitName(benefit)}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </Main>

            {/* 新建/编辑分类对话框 */}
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Tags className='h-5 w-5' />
                            {categoryDialogMode === 'create' ? '新建分类' : '编辑分类'}
                        </DialogTitle>
                        <DialogDescription>
                            {categoryDialogMode === 'create'
                                ? '创建一个新的用户分类，并为其分配权益'
                                : '修改分类的基本信息和权益配置'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-6'>
                        {/* 基本信息 */}
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

                        {/* 权益设置 */}
                        <div className='space-y-2'>
                            <Label>
                                权益配置 <span className='text-destructive'>*</span>
                                <span className='text-muted-foreground ml-2 text-sm font-normal'>
                                    已选择 {formData.benefits.length} 个权益
                                </span>
                            </Label>
                            {formErrors.benefits && (
                                <p className='text-destructive text-sm'>{formErrors.benefits}</p>
                            )}
                            <ScrollArea className='h-[240px] rounded-md border p-3'>
                                <div className='space-y-4'>
                                    {benefitGroups.map((group) => {
                                        const groupKeys = group.benefits.map((p) => p.key)
                                        const enabledCount = groupKeys.filter((key) =>
                                            formData.benefits.includes(key)
                                        ).length
                                        const allEnabled = enabledCount === group.benefits.length
                                        const someEnabled = enabledCount > 0 && !allEnabled

                                        return (
                                            <div key={group.id} className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        id={`group-${group.id}`}
                                                        checked={allEnabled}
                                                        onCheckedChange={() => toggleFormGroupBenefits(group)}
                                                        className={someEnabled ? 'data-[state=checked]:bg-primary/50' : ''}
                                                    />
                                                    <label
                                                        htmlFor={`group-${group.id}`}
                                                        className='cursor-pointer text-sm font-medium'
                                                    >
                                                        {group.name}
                                                    </label>
                                                    <Badge variant='outline' className='text-xs'>
                                                        {enabledCount}/{group.benefits.length}
                                                    </Badge>
                                                </div>
                                                <div className='ml-6 grid gap-1.5 sm:grid-cols-2'>
                                                    {group.benefits.map((benefit) => {
                                                        const isEnabled = formData.benefits.includes(benefit.key)
                                                        return (
                                                            <div
                                                                key={benefit.id}
                                                                className='flex items-center gap-2'
                                                            >
                                                                <Checkbox
                                                                    id={benefit.id}
                                                                    checked={isEnabled}
                                                                    onCheckedChange={() => toggleFormBenefit(benefit.key)}
                                                                />
                                                                <label
                                                                    htmlFor={benefit.id}
                                                                    className='text-muted-foreground cursor-pointer text-sm'
                                                                >
                                                                    {benefit.name}
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
