import { useState } from 'react'
import {
    Award,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronUp,
    ChevronDown,
    Building2,
    Users,
    Stethoscope,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface Level {
    id: string
    name: string
    code: string
    description: string
    color: string
    order: number
    count: number
}

interface LevelCategory {
    id: string
    name: string
    description: string
    levels: Level[]
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
    { value: 'bg-blue-500', label: '蓝色' },
    { value: 'bg-indigo-500', label: '靛蓝' },
    { value: 'bg-violet-500', label: '紫罗兰' },
    { value: 'bg-purple-500', label: '紫色' },
    { value: 'bg-pink-500', label: '粉色' },
    { value: 'bg-gray-500', label: '灰色' },
]

const initialCategories: LevelCategory[] = [
    {
        id: 'hospital',
        name: '医院等级',
        description: '医疗机构的等级评定标准',
        levels: [
            { id: 'h1', name: '三级甲等', code: '3A', description: '最高等级医疗机构', color: 'bg-red-500', order: 1, count: 156 },
            { id: 'h2', name: '三级乙等', code: '3B', description: '三级医疗机构', color: 'bg-orange-500', order: 2, count: 289 },
            { id: 'h3', name: '二级甲等', code: '2A', description: '二级甲等医疗机构', color: 'bg-amber-500', order: 3, count: 523 },
            { id: 'h4', name: '二级乙等', code: '2B', description: '二级乙等医疗机构', color: 'bg-yellow-500', order: 4, count: 412 },
            { id: 'h5', name: '一级医院', code: '1', description: '基层医疗机构', color: 'bg-green-500', order: 5, count: 1856 },
            { id: 'h6', name: '社区医院', code: 'C', description: '社区卫生服务中心', color: 'bg-gray-500', order: 6, count: 2340 },
        ],
    },
    {
        id: 'doctor',
        name: '医师职称',
        description: '医师专业技术职称等级',
        levels: [
            { id: 'd1', name: '主任医师', code: 'CM', description: '正高级职称', color: 'bg-red-500', order: 1, count: 4520 },
            { id: 'd2', name: '副主任医师', code: 'ACM', description: '副高级职称', color: 'bg-orange-500', order: 2, count: 8960 },
            { id: 'd3', name: '主治医师', code: 'AP', description: '中级职称', color: 'bg-amber-500', order: 3, count: 15680 },
            { id: 'd4', name: '住院医师', code: 'RP', description: '初级职称', color: 'bg-green-500', order: 4, count: 23450 },
            { id: 'd5', name: '见习医师', code: 'IP', description: '规培医师', color: 'bg-gray-500', order: 5, count: 8920 },
        ],
    },
    {
        id: 'department',
        name: '科室级别',
        description: '医院科室的等级划分',
        levels: [
            { id: 'dp1', name: '国家重点科室', code: 'NK', description: '国家级重点学科', color: 'bg-red-500', order: 1, count: 89 },
            { id: 'dp2', name: '省级重点科室', code: 'PK', description: '省级重点学科', color: 'bg-orange-500', order: 2, count: 256 },
            { id: 'dp3', name: '市级重点科室', code: 'CK', description: '市级重点学科', color: 'bg-amber-500', order: 3, count: 520 },
            { id: 'dp4', name: '普通科室', code: 'GD', description: '常规临床科室', color: 'bg-blue-500', order: 4, count: 3560 },
        ],
    },
    {
        id: 'service',
        name: '服务等级',
        description: '陪诊服务的等级标准',
        levels: [
            { id: 's1', name: 'VIP服务', code: 'VIP', description: '高端定制陪诊服务', color: 'bg-purple-500', order: 1, count: 1250 },
            { id: 's2', name: '专属服务', code: 'EXC', description: '专属陪诊服务', color: 'bg-blue-500', order: 2, count: 3680 },
            { id: 's3', name: '标准服务', code: 'STD', description: '标准陪诊服务', color: 'bg-green-500', order: 3, count: 8920 },
            { id: 's4', name: '基础服务', code: 'BSC', description: '基础陪诊服务', color: 'bg-gray-500', order: 4, count: 15680 },
        ],
    },
]

interface LevelFormData {
    name: string
    code: string
    description: string
    color: string
}

const defaultFormData: LevelFormData = {
    name: '',
    code: '',
    description: '',
    color: 'bg-blue-500',
}

export function MedicalLevels() {
    const [categories, setCategories] = useState<LevelCategory[]>(initialCategories)
    const [activeTab, setActiveTab] = useState(initialCategories[0].id)

    // 表单对话框状态
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingLevel, setEditingLevel] = useState<{ categoryId: string; level: Level } | null>(null)
    const [formData, setFormData] = useState<LevelFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const activeCategory = categories.find(c => c.id === activeTab)

    // 打开新建对话框
    const openCreateDialog = () => {
        setDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setDialogOpen(true)
    }

    // 打开编辑对话框
    const openEditDialog = (categoryId: string, level: Level) => {
        setDialogMode('edit')
        setEditingLevel({ categoryId, level })
        setFormData({
            name: level.name,
            code: level.code,
            description: level.description,
            color: level.color,
        })
        setFormErrors({})
        setDialogOpen(true)
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = '请输入级别名称'
        if (!formData.code.trim()) errors.code = '请输入级别代码'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存级别
    const handleSave = () => {
        if (!validateForm()) return

        if (dialogMode === 'create') {
            const currentCategory = categories.find(c => c.id === activeTab)
            if (!currentCategory) return

            const newLevel: Level = {
                id: Date.now().toString(),
                ...formData,
                order: currentCategory.levels.length + 1,
                count: 0,
            }

            setCategories(categories.map(c =>
                c.id === activeTab
                    ? { ...c, levels: [...c.levels, newLevel] }
                    : c
            ))
        } else if (editingLevel) {
            setCategories(categories.map(c =>
                c.id === editingLevel.categoryId
                    ? {
                        ...c,
                        levels: c.levels.map(l =>
                            l.id === editingLevel.level.id
                                ? { ...l, ...formData }
                                : l
                        ),
                    }
                    : c
            ))
        }

        setDialogOpen(false)
    }

    // 删除级别
    const handleDelete = (categoryId: string, levelId: string) => {
        setCategories(categories.map(c =>
            c.id === categoryId
                ? { ...c, levels: c.levels.filter(l => l.id !== levelId) }
                : c
        ))
    }

    // 移动级别顺序
    const moveLevel = (categoryId: string, levelId: string, direction: 'up' | 'down') => {
        setCategories(categories.map(c => {
            if (c.id !== categoryId) return c

            const levels = [...c.levels]
            const index = levels.findIndex(l => l.id === levelId)
            if (index === -1) return c

            const newIndex = direction === 'up' ? index - 1 : index + 1
            if (newIndex < 0 || newIndex >= levels.length) return c

            // 交换位置
            const temp = levels[index]
            levels[index] = levels[newIndex]
            levels[newIndex] = temp

            // 更新 order
            return {
                ...c,
                levels: levels.map((l, i) => ({ ...l, order: i + 1 })),
            }
        }))
    }

    const getIcon = (categoryId: string) => {
        switch (categoryId) {
            case 'hospital': return Building2
            case 'doctor': return Stethoscope
            case 'department': return Users
            default: return Award
        }
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
                        <h1 className='text-2xl font-bold tracking-tight'>级别管理</h1>
                        <p className='text-muted-foreground'>管理医疗资源的等级分类</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        添加级别
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className='mb-6'>
                        {categories.map(category => {
                            const Icon = getIcon(category.id)
                            return (
                                <TabsTrigger key={category.id} value={category.id} className='gap-2'>
                                    <Icon className='h-4 w-4' />
                                    {category.name}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>

                    {categories.map(category => (
                        <TabsContent key={category.id} value={category.id}>
                            <Card className='mb-4'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-base'>{category.name}</CardTitle>
                                    <CardDescription>{category.description}</CardDescription>
                                </CardHeader>
                            </Card>

                            <div className='space-y-2'>
                                {category.levels.map((level, index) => (
                                    <Card key={level.id} className='group'>
                                        <CardContent className='flex items-center gap-4 p-4'>
                                            <div className='text-muted-foreground flex flex-col'>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-5 w-5'
                                                    disabled={index === 0}
                                                    onClick={() => moveLevel(category.id, level.id, 'up')}
                                                >
                                                    <ChevronUp className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-5 w-5'
                                                    disabled={index === category.levels.length - 1}
                                                    onClick={() => moveLevel(category.id, level.id, 'down')}
                                                >
                                                    <ChevronDown className='h-4 w-4' />
                                                </Button>
                                            </div>

                                            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', level.color)}>
                                                <span className='text-sm font-bold text-white'>{level.order}</span>
                                            </div>

                                            <div className='flex-1'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-medium'>{level.name}</span>
                                                    <Badge variant='outline' className='text-xs'>{level.code}</Badge>
                                                </div>
                                                <p className='text-muted-foreground text-sm'>{level.description}</p>
                                            </div>

                                            <div className='text-muted-foreground text-sm'>
                                                {level.count.toLocaleString()} 条数据
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant='ghost' size='icon' className='h-8 w-8 opacity-0 group-hover:opacity-100'>
                                                        <MoreHorizontal className='h-4 w-4' />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align='end'>
                                                    <DropdownMenuItem onClick={() => openEditDialog(category.id, level)}>
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        编辑
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className='text-destructive'
                                                        onClick={() => handleDelete(category.id, level.id)}
                                                        disabled={level.count > 0}
                                                    >
                                                        <Trash2 className='mr-2 h-4 w-4' />
                                                        删除
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {category.levels.length === 0 && (
                                <div className='text-muted-foreground py-12 text-center'>
                                    暂无级别数据，点击上方按钮添加
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </Main>

            {/* 新建/编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Award className='h-5 w-5' />
                            {dialogMode === 'create' ? '添加级别' : '编辑级别'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create'
                                ? `为"${activeCategory?.name}"添加新的级别`
                                : '修改级别信息'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>级别名称 <span className='text-destructive'>*</span></Label>
                                <Input
                                    placeholder='请输入级别名称'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={formErrors.name ? 'border-destructive' : ''}
                                />
                                {formErrors.name && <p className='text-destructive text-sm'>{formErrors.name}</p>}
                            </div>
                            <div className='space-y-2'>
                                <Label>级别代码 <span className='text-destructive'>*</span></Label>
                                <Input
                                    placeholder='请输入代码'
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className={formErrors.code ? 'border-destructive' : ''}
                                />
                                {formErrors.code && <p className='text-destructive text-sm'>{formErrors.code}</p>}
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>级别描述</Label>
                            <Textarea
                                placeholder='请输入级别描述'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className='resize-none'
                                rows={2}
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

                        <div className='space-y-2'>
                            <Label>预览</Label>
                            <div className='bg-muted/50 flex items-center gap-3 rounded-md p-3'>
                                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', formData.color)}>
                                    <span className='text-sm font-bold text-white'>1</span>
                                </div>
                                <div>
                                    <div className='flex items-center gap-2'>
                                        <span className='font-medium'>{formData.name || '级别名称'}</span>
                                        <Badge variant='outline' className='text-xs'>{formData.code || 'CODE'}</Badge>
                                    </div>
                                    <p className='text-muted-foreground text-sm'>{formData.description || '级别描述'}</p>
                                </div>
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

