import { useState } from 'react'
import {
    PackageSearch,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search as SearchIcon,
    X,
    ToggleLeft,
    ToggleRight,
    Clock,
    Star,
    LayoutGrid,
    List,
    Stethoscope,
    Bed,
    FlaskConical,
    MessageSquare,
    FileText,
    Pill,
    FileStack,
    Building,
    Crown,
    HeartPulse,
    type LucideIcon,
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
import { Switch } from '@/components/ui/switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

interface Service {
    id: string
    name: string
    category: string
    description: string
    price: number
    unit: string
    duration: string
    status: 'active' | 'inactive'
    orderCount: number
    rating: number
    icon: LucideIcon
}

const categoryColors: Record<string, string> = {
    '陪诊服务': 'bg-blue-500',
    '诊断服务': 'bg-green-500',
    '跑腿服务': 'bg-orange-500',
    '酒店服务': 'bg-purple-500',
    '其他服务': 'bg-gray-500',
}

const initialServices: Service[] = [
    { id: '1', name: '门诊陪诊', category: '陪诊服务', description: '全程陪同就医，协助挂号、取号、缴费、取药等', price: 299, unit: '次', duration: '4小时', status: 'active', orderCount: 12580, rating: 98.5, icon: Stethoscope },
    { id: '2', name: '住院陪护', category: '陪诊服务', description: '住院期间全程陪护，协助日常护理', price: 399, unit: '天', duration: '24小时', status: 'active', orderCount: 5680, rating: 97.8, icon: Bed },
    { id: '3', name: '检查陪同', category: '陪诊服务', description: '陪同进行各类检查，协助沟通解读', price: 199, unit: '次', duration: '2小时', status: 'active', orderCount: 8920, rating: 96.5, icon: FlaskConical },
    { id: '4', name: '在线问诊', category: '诊断服务', description: '线上视频/图文问诊，快速获取医生建议', price: 49, unit: '次', duration: '15分钟', status: 'active', orderCount: 25680, rating: 95.2, icon: MessageSquare },
    { id: '5', name: '报告解读', category: '诊断服务', description: '专业医生解读各类检查报告', price: 99, unit: '份', duration: '30分钟', status: 'active', orderCount: 15890, rating: 97.2, icon: FileText },
    { id: '6', name: '药品代购', category: '跑腿服务', description: '代购处方药品并配送到家', price: 29, unit: '次', duration: '2小时', status: 'active', orderCount: 32560, rating: 98.1, icon: Pill },
    { id: '7', name: '病历复印', category: '跑腿服务', description: '代办病历复印及邮寄', price: 59, unit: '次', duration: '1-3天', status: 'active', orderCount: 4560, rating: 96.8, icon: FileStack },
    { id: '8', name: '医院酒店', category: '酒店服务', description: '医院周边优质酒店预订', price: 0, unit: '晚', duration: '-', status: 'active', orderCount: 2890, rating: 94.5, icon: Building },
    { id: '9', name: 'VIP陪诊', category: '陪诊服务', description: '高端定制陪诊服务，专属管家全程服务', price: 999, unit: '次', duration: '8小时', status: 'active', orderCount: 890, rating: 99.2, icon: Crown },
    { id: '10', name: '术后护理', category: '陪诊服务', description: '手术后专业护理指导和陪护', price: 499, unit: '天', duration: '12小时', status: 'inactive', orderCount: 1250, rating: 97.5, icon: HeartPulse },
]

interface ServiceFormData {
    name: string
    category: string
    description: string
    price: string
    unit: string
    duration: string
    status: 'active' | 'inactive'
}

const defaultFormData: ServiceFormData = {
    name: '',
    category: '陪诊服务',
    description: '',
    price: '',
    unit: '次',
    duration: '',
    status: 'active',
}

const categoryOptions = ['陪诊服务', '诊断服务', '跑腿服务', '酒店服务', '其他服务']
const unitOptions = ['次', '天', '小时', '份', '晚']

type ViewMode = 'grid' | 'list'

export function Services() {
    const [services, setServices] = useState<Service[]>(initialServices)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')

    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [formData, setFormData] = useState<ServiceFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const categories = [...new Set(services.map(s => s.category))]

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || service.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const openCreateDialog = () => {
        setDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setDialogOpen(true)
    }

    const openEditDialog = (service: Service) => {
        setDialogMode('edit')
        setEditingService(service)
        setFormData({
            name: service.name,
            category: service.category,
            description: service.description,
            price: service.price.toString(),
            unit: service.unit,
            duration: service.duration,
            status: service.status,
        })
        setFormErrors({})
        setDialogOpen(true)
    }

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = '请输入服务名称'
        if (!formData.price.trim()) errors.price = '请输入价格'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSave = () => {
        if (!validateForm()) return

        if (dialogMode === 'create') {
            const newService: Service = {
                id: Date.now().toString(),
                name: formData.name,
                category: formData.category,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                unit: formData.unit,
                duration: formData.duration,
                status: formData.status,
                orderCount: 0,
                rating: 100,
                icon: PackageSearch,
            }
            setServices([...services, newService])
        } else if (editingService) {
            setServices(services.map(s =>
                s.id === editingService.id
                    ? {
                        ...s,
                        name: formData.name,
                        category: formData.category,
                        description: formData.description,
                        price: parseFloat(formData.price) || 0,
                        unit: formData.unit,
                        duration: formData.duration,
                        status: formData.status,
                    }
                    : s
            ))
        }

        setDialogOpen(false)
    }

    const handleToggleStatus = (serviceId: string) => {
        setServices(services.map(s =>
            s.id === serviceId
                ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
                : s
        ))
    }

    const handleDelete = (serviceId: string) => {
        setServices(services.filter(s => s.id !== serviceId))
    }

    const renderGridView = () => (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {filteredServices.map(service => (
                <Card key={service.id} className={cn('group', service.status === 'inactive' && 'opacity-60')}>
                    <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                            <div className='flex items-center gap-3'>
                                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', categoryColors[service.category] || 'bg-gray-500')}>
                                    <service.icon className='h-5 w-5 text-white' />
                                </div>
                                <div>
                                    <CardTitle className='text-sm font-medium'>{service.name}</CardTitle>
                                    <Badge variant='outline' className='mt-1 text-xs'>{service.category}</Badge>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='ghost' size='icon' className='h-8 w-8 opacity-0 group-hover:opacity-100'>
                                        <MoreHorizontal className='h-4 w-4' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuItem onClick={() => openEditDialog(service)}>
                                        <Pencil className='mr-2 h-4 w-4' />
                                        编辑
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleStatus(service.id)}>
                                        {service.status === 'active' ? (
                                            <>
                                                <ToggleLeft className='mr-2 h-4 w-4' />
                                                下架
                                            </>
                                        ) : (
                                            <>
                                                <ToggleRight className='mr-2 h-4 w-4' />
                                                上架
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className='text-destructive'
                                        onClick={() => handleDelete(service.id)}
                                    >
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        删除
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className='space-y-2.5'>
                        <CardDescription className='line-clamp-2 text-xs'>
                            {service.description}
                        </CardDescription>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='font-semibold text-primary'>
                                {service.price > 0 ? `¥${service.price}` : '面议'}
                                <span className='text-muted-foreground text-xs font-normal'>/{service.unit}</span>
                            </div>
                            <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                                <Clock className='h-3 w-3' />
                                {service.duration}
                            </div>
                        </div>
                        <div className='border-t pt-2'>
                            <div className='flex items-center gap-4 text-xs'>
                                <div className='text-muted-foreground'>
                                    <span className='font-medium'>{service.orderCount.toLocaleString()}</span> 单
                                </div>
                                <div className='flex items-center gap-1 text-amber-500'>
                                    <Star className='h-3 w-3 fill-current' />
                                    <span className='font-medium'>{service.rating}%</span>
                                </div>
                                <Badge variant={service.status === 'active' ? 'default' : 'secondary'} className='ml-auto text-xs'>
                                    {service.status === 'active' ? '已上架' : '已下架'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

    const renderListView = () => (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>服务</TableHead>
                        <TableHead>分类</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>时长</TableHead>
                        <TableHead>订单数</TableHead>
                        <TableHead>满意度</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className='w-[50px]'></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredServices.map(service => (
                        <TableRow key={service.id} className={cn('group', service.status === 'inactive' && 'opacity-60')}>
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-md', categoryColors[service.category] || 'bg-gray-500')}>
                                        <service.icon className='h-4 w-4 text-white' />
                                    </div>
                                    <div>
                                        <div className='font-medium'>{service.name}</div>
                                        <div className='text-muted-foreground text-xs line-clamp-1 max-w-[200px]'>{service.description}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant='outline' className='text-xs'>{service.category}</Badge>
                            </TableCell>
                            <TableCell>
                                <span className='font-medium text-primary'>
                                    {service.price > 0 ? `¥${service.price}` : '面议'}
                                </span>
                                <span className='text-muted-foreground text-xs'>/{service.unit}</span>
                            </TableCell>
                            <TableCell className='text-muted-foreground text-sm'>{service.duration}</TableCell>
                            <TableCell>{service.orderCount.toLocaleString()}</TableCell>
                            <TableCell>
                                <div className='flex items-center gap-1 text-amber-500'>
                                    <Star className='h-3.5 w-3.5 fill-current' />
                                    {service.rating}%
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={service.status === 'active' ? 'default' : 'secondary'} className='text-xs'>
                                    {service.status === 'active' ? '已上架' : '已下架'}
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
                                        <DropdownMenuItem onClick={() => openEditDialog(service)}>
                                            <Pencil className='mr-2 h-4 w-4' />
                                            编辑
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleStatus(service.id)}>
                                            {service.status === 'active' ? (
                                                <>
                                                    <ToggleLeft className='mr-2 h-4 w-4' />
                                                    下架
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleRight className='mr-2 h-4 w-4' />
                                                    上架
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className='text-destructive'
                                            onClick={() => handleDelete(service.id)}
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
                        <h1 className='text-2xl font-bold tracking-tight'>服务管理</h1>
                        <p className='text-muted-foreground'>管理陪诊、诊断、跑腿、酒店等服务项目</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加服务
                    </Button>
                </div>

                <div className='mb-6 flex flex-wrap items-center gap-4'>
                    <div className='relative flex-1 min-w-[200px] max-w-md'>
                        <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                        <Input
                            placeholder='搜索服务名称或描述...'
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
                        {categories.map(cat => (
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

                {viewMode === 'grid' ? renderGridView() : renderListView()}

                {filteredServices.length === 0 && (
                    <div className='text-muted-foreground py-12 text-center'>
                        暂无匹配的服务
                    </div>
                )}
            </Main>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <PackageSearch className='h-5 w-5' />
                            {dialogMode === 'create' ? '添加服务' : '编辑服务'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create' ? '添加新的服务项目' : '修改服务信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>服务名称 <span className='text-destructive'>*</span></Label>
                            <Input
                                placeholder='请输入服务名称'
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={formErrors.name ? 'border-destructive' : ''}
                            />
                            {formErrors.name && <p className='text-destructive text-sm'>{formErrors.name}</p>}
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>服务分类</Label>
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
                            <div className='space-y-2'>
                                <Label>服务时长</Label>
                                <Input
                                    placeholder='如：2小时'
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>价格 <span className='text-destructive'>*</span></Label>
                                <Input
                                    type='number'
                                    placeholder='0'
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className={formErrors.price ? 'border-destructive' : ''}
                                />
                                {formErrors.price && <p className='text-destructive text-sm'>{formErrors.price}</p>}
                            </div>
                            <div className='space-y-2'>
                                <Label>计价单位</Label>
                                <select
                                    className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    {unitOptions.map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>服务描述</Label>
                            <Textarea
                                placeholder='请输入服务描述'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className='resize-none'
                                rows={3}
                            />
                        </div>

                        <div className='flex items-center justify-between'>
                            <Label>上架状态</Label>
                            <Switch
                                checked={formData.status === 'active'}
                                onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
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

