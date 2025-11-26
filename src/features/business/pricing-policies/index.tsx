import { useState } from 'react'
import {
    BadgePercent,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search as SearchIcon,
    X,
    ToggleLeft,
    ToggleRight,
    Calendar,
    Users,
    Percent,
    DollarSign,
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
import { Switch } from '@/components/ui/switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

interface PricingPolicy {
    id: string
    name: string
    type: 'discount' | 'tiered' | 'member' | 'time' | 'combo'
    description: string
    discount: number
    minAmount?: number
    maxDiscount?: number
    startDate: string
    endDate: string
    status: 'active' | 'inactive' | 'expired'
    usageCount: number
    conditions: string[]
}

const typeConfig: Record<string, { label: string; color: string; icon: typeof Percent }> = {
    discount: { label: '折扣优惠', color: 'bg-red-500', icon: Percent },
    tiered: { label: '阶梯优惠', color: 'bg-orange-500', icon: DollarSign },
    member: { label: '会员优惠', color: 'bg-purple-500', icon: Users },
    time: { label: '时段优惠', color: 'bg-blue-500', icon: Calendar },
    combo: { label: '组合优惠', color: 'bg-green-500', icon: BadgePercent },
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    active: { label: '生效中', variant: 'default' },
    inactive: { label: '未启用', variant: 'secondary' },
    expired: { label: '已过期', variant: 'destructive' },
}

const initialPolicies: PricingPolicy[] = [
    {
        id: '1',
        name: '新用户首单立减',
        type: 'discount',
        description: '新注册用户首次下单立减20元',
        discount: 20,
        minAmount: 99,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        usageCount: 15680,
        conditions: ['新用户', '首单', '订单满99元'],
    },
    {
        id: '2',
        name: '会员9折优惠',
        type: 'member',
        description: 'VIP会员享受全场9折优惠',
        discount: 10,
        maxDiscount: 100,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        usageCount: 8920,
        conditions: ['VIP会员', '全场通用'],
    },
    {
        id: '3',
        name: '早鸟优惠',
        type: 'time',
        description: '早上6-8点下单享受85折优惠',
        discount: 15,
        maxDiscount: 50,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        status: 'active',
        usageCount: 3560,
        conditions: ['6:00-8:00', '陪诊服务'],
    },
    {
        id: '4',
        name: '阶梯满减',
        type: 'tiered',
        description: '满200减30，满500减80，满1000减180',
        discount: 0,
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        status: 'active',
        usageCount: 5680,
        conditions: ['满200减30', '满500减80', '满1000减180'],
    },
    {
        id: '5',
        name: '陪诊+酒店组合优惠',
        type: 'combo',
        description: '同时购买陪诊和酒店服务享受8折',
        discount: 20,
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        status: 'active',
        usageCount: 1250,
        conditions: ['陪诊服务', '酒店服务', '同时购买'],
    },
    {
        id: '6',
        name: '春节特惠',
        type: 'discount',
        description: '春节期间全场8折优惠',
        discount: 20,
        startDate: '2024-02-10',
        endDate: '2024-02-17',
        status: 'expired',
        usageCount: 2890,
        conditions: ['全场通用', '限春节期间'],
    },
]

const typeOptions = [
    { value: 'discount', label: '折扣优惠' },
    { value: 'tiered', label: '阶梯优惠' },
    { value: 'member', label: '会员优惠' },
    { value: 'time', label: '时段优惠' },
    { value: 'combo', label: '组合优惠' },
]

export function PricingPolicies() {
    const [policies, setPolicies] = useState<PricingPolicy[]>(initialPolicies)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedType, setSelectedType] = useState<string | null>(null)

    const [dialogOpen, setDialogOpen] = useState(false)

    const types = [...new Set(policies.map(p => p.type))]

    const filteredPolicies = policies.filter(policy => {
        const matchesSearch = policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = !selectedType || policy.type === selectedType
        return matchesSearch && matchesType
    })

    const handleToggleStatus = (policyId: string) => {
        setPolicies(policies.map(p =>
            p.id === policyId
                ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
                : p
        ))
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
                        <h1 className='text-2xl font-bold tracking-tight'>价格政策</h1>
                        <p className='text-muted-foreground'>管理折扣、满减、会员等优惠政策</p>
                    </div>
                    <Button onClick={() => setDialogOpen(true)}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建政策
                    </Button>
                </div>

                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative flex-1 min-w-[200px] max-w-md'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索政策名称或描述...'
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
                            variant={selectedType === null ? 'default' : 'outline'}
                            className='cursor-pointer'
                            onClick={() => setSelectedType(null)}
                        >
                            全部
                        </Badge>
                        {types.map(type => (
                            <Badge
                                key={type}
                                variant={selectedType === type ? 'default' : 'outline'}
                                className='cursor-pointer gap-1.5'
                                onClick={() => setSelectedType(type)}
                            >
                                <span className={cn('h-2 w-2 rounded-full', typeConfig[type]?.color)} />
                                {typeConfig[type]?.label}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {filteredPolicies.map(policy => {
                        const config = typeConfig[policy.type]
                        const Icon = config?.icon || BadgePercent
                        return (
                            <Card key={policy.id} className={cn('group', policy.status !== 'active' && 'opacity-60')}>
                                <CardHeader className='pb-3'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config?.color || 'bg-gray-500')}>
                                                <Icon className='h-5 w-5 text-white' />
                                            </div>
                                            <div>
                                                <CardTitle className='text-sm font-medium'>{policy.name}</CardTitle>
                                                <div className='flex items-center gap-2 mt-1'>
                                                    <Badge variant='outline' className='text-xs'>{config?.label}</Badge>
                                                    <Badge variant={statusConfig[policy.status]?.variant} className='text-xs'>
                                                        {statusConfig[policy.status]?.label}
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
                                                <DropdownMenuItem>
                                                    <Pencil className='mr-2 h-4 w-4' />
                                                    编辑
                                                </DropdownMenuItem>
                                                {policy.status !== 'expired' && (
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(policy.id)}>
                                                        {policy.status === 'active' ? (
                                                            <>
                                                                <ToggleLeft className='mr-2 h-4 w-4' />
                                                                停用
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ToggleRight className='mr-2 h-4 w-4' />
                                                                启用
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className='text-destructive'>
                                                    <Trash2 className='mr-2 h-4 w-4' />
                                                    删除
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className='space-y-3'>
                                    <CardDescription className='line-clamp-2 text-xs'>
                                        {policy.description}
                                    </CardDescription>

                                    <div className='flex flex-wrap gap-1'>
                                        {policy.conditions.map((condition, index) => (
                                            <Badge key={index} variant='secondary' className='text-xs'>
                                                {condition}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className='border-t pt-2'>
                                        <div className='text-muted-foreground flex items-center justify-between text-xs'>
                                            <span>使用: {policy.usageCount.toLocaleString()} 次</span>
                                            <span>{policy.startDate} ~ {policy.endDate}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {filteredPolicies.length === 0 && (
                    <div className='text-muted-foreground py-12 text-center'>
                        暂无匹配的政策
                    </div>
                )}
            </Main>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <BadgePercent className='h-5 w-5' />
                            新建价格政策
                        </DialogTitle>
                        <DialogDescription>
                            创建新的优惠政策
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>政策名称 <span className='text-destructive'>*</span></Label>
                            <Input placeholder='请输入政策名称' />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>政策类型</Label>
                                <select className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'>
                                    {typeOptions.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='space-y-2'>
                                <Label>折扣比例 (%)</Label>
                                <Input type='number' placeholder='如：10' />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>开始日期</Label>
                                <Input type='date' />
                            </div>
                            <div className='space-y-2'>
                                <Label>结束日期</Label>
                                <Input type='date' />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>政策描述</Label>
                            <Textarea
                                placeholder='请输入政策描述'
                                className='resize-none'
                                rows={2}
                            />
                        </div>

                        <div className='flex items-center justify-between'>
                            <Label>立即启用</Label>
                            <Switch defaultChecked />
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button variant='outline' onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={() => setDialogOpen(false)}>
                            创建
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

