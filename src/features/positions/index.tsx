import { useState } from 'react'
import {
    Briefcase,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Users,
    Check,
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

interface Position {
    id: string
    name: string
    description: string
    employeeCount: number
    responsibilities: string[]
    isSystem: boolean
    color: string
    department: string
    level: string
}

interface Responsibility {
    id: string
    name: string
    key: string
    description: string
}

interface ResponsibilityGroup {
    id: string
    name: string
    responsibilities: Responsibility[]
}

const responsibilityGroups: ResponsibilityGroup[] = [
    {
        id: 'hr',
        name: '人事管理',
        responsibilities: [
            { id: 'hr-recruit', name: '招聘管理', key: 'hr:recruit', description: '负责招聘流程和人才引进' },
            { id: 'hr-train', name: '培训管理', key: 'hr:train', description: '组织员工培训和能力提升' },
            { id: 'hr-perf', name: '绩效考核', key: 'hr:performance', description: '负责绩效评估和考核' },
            { id: 'hr-salary', name: '薪酬管理', key: 'hr:salary', description: '薪资核算和福利管理' },
        ],
    },
    {
        id: 'project',
        name: '项目管理',
        responsibilities: [
            { id: 'proj-plan', name: '项目规划', key: 'project:plan', description: '项目计划制定和资源分配' },
            { id: 'proj-exec', name: '项目执行', key: 'project:execute', description: '项目推进和进度把控' },
            { id: 'proj-review', name: '项目评审', key: 'project:review', description: '项目验收和质量把控' },
            { id: 'proj-report', name: '项目汇报', key: 'project:report', description: '项目进度汇报和总结' },
        ],
    },
    {
        id: 'tech',
        name: '技术工作',
        responsibilities: [
            { id: 'tech-dev', name: '开发工作', key: 'tech:develop', description: '软件开发和功能实现' },
            { id: 'tech-test', name: '测试工作', key: 'tech:test', description: '质量测试和缺陷跟踪' },
            { id: 'tech-ops', name: '运维工作', key: 'tech:ops', description: '系统运维和监控' },
            { id: 'tech-arch', name: '架构设计', key: 'tech:architecture', description: '系统架构设计和优化' },
        ],
    },
    {
        id: 'admin',
        name: '行政工作',
        responsibilities: [
            { id: 'admin-doc', name: '文档管理', key: 'admin:document', description: '文档整理和归档' },
            { id: 'admin-meet', name: '会议组织', key: 'admin:meeting', description: '会议安排和记录' },
            { id: 'admin-asset', name: '资产管理', key: 'admin:asset', description: '办公资产管理' },
        ],
    },
    {
        id: 'finance',
        name: '财务工作',
        responsibilities: [
            { id: 'fin-budget', name: '预算管理', key: 'finance:budget', description: '预算编制和控制' },
            { id: 'fin-reimb', name: '费用报销', key: 'finance:reimburse', description: '费用审批和报销' },
            { id: 'fin-report', name: '财务报表', key: 'finance:report', description: '财务报表编制' },
        ],
    },
    {
        id: 'sales',
        name: '销售工作',
        responsibilities: [
            { id: 'sales-client', name: '客户开发', key: 'sales:client', description: '新客户开发和维护' },
            { id: 'sales-order', name: '订单处理', key: 'sales:order', description: '订单处理和跟进' },
            { id: 'sales-support', name: '售后服务', key: 'sales:support', description: '客户售后支持' },
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

const departmentOptions = [
    { value: 'tech', label: '技术部' },
    { value: 'product', label: '产品部' },
    { value: 'design', label: '设计部' },
    { value: 'hr', label: '人力资源部' },
    { value: 'finance', label: '财务部' },
    { value: 'sales', label: '销售部' },
    { value: 'admin', label: '行政部' },
    { value: 'ops', label: '运营部' },
]

const levelOptions = [
    { value: 'senior', label: '高级' },
    { value: 'middle', label: '中级' },
    { value: 'junior', label: '初级' },
    { value: 'intern', label: '实习' },
]

const initialPositions: Position[] = [
    {
        id: '1',
        name: '总经理',
        description: '负责公司整体运营和战略规划，统筹各部门工作',
        employeeCount: 1,
        responsibilities: ['all'],
        isSystem: true,
        color: 'bg-red-500',
        department: 'admin',
        level: 'senior',
    },
    {
        id: '2',
        name: '技术总监',
        description: '负责技术团队管理和技术架构决策',
        employeeCount: 1,
        responsibilities: ['tech:develop', 'tech:architecture', 'project:plan', 'project:review'],
        isSystem: true,
        color: 'bg-blue-500',
        department: 'tech',
        level: 'senior',
    },
    {
        id: '3',
        name: '项目经理',
        description: '负责项目全流程管理，确保项目按时交付',
        employeeCount: 5,
        responsibilities: ['project:plan', 'project:execute', 'project:review', 'project:report'],
        isSystem: false,
        color: 'bg-green-500',
        department: 'tech',
        level: 'middle',
    },
    {
        id: '4',
        name: '高级开发工程师',
        description: '负责核心功能开发和技术攻关',
        employeeCount: 12,
        responsibilities: ['tech:develop', 'tech:test', 'project:execute'],
        isSystem: false,
        color: 'bg-cyan-500',
        department: 'tech',
        level: 'senior',
    },
    {
        id: '5',
        name: '开发工程师',
        description: '负责功能开发和日常维护',
        employeeCount: 25,
        responsibilities: ['tech:develop', 'tech:test'],
        isSystem: false,
        color: 'bg-sky-500',
        department: 'tech',
        level: 'middle',
    },
    {
        id: '6',
        name: '人事专员',
        description: '负责招聘、培训和员工关系管理',
        employeeCount: 3,
        responsibilities: ['hr:recruit', 'hr:train', 'admin:document', 'admin:meeting'],
        isSystem: false,
        color: 'bg-pink-500',
        department: 'hr',
        level: 'middle',
    },
    {
        id: '7',
        name: '财务主管',
        description: '负责财务核算和预算管理',
        employeeCount: 2,
        responsibilities: ['finance:budget', 'finance:reimburse', 'finance:report'],
        isSystem: false,
        color: 'bg-amber-500',
        department: 'finance',
        level: 'middle',
    },
    {
        id: '8',
        name: '销售代表',
        description: '负责客户开发和业务拓展',
        employeeCount: 8,
        responsibilities: ['sales:client', 'sales:order', 'sales:support'],
        isSystem: false,
        color: 'bg-orange-500',
        department: 'sales',
        level: 'junior',
    },
]

interface PositionFormData {
    name: string
    description: string
    color: string
    department: string
    level: string
    isSystem: boolean
    responsibilities: string[]
}

const defaultFormData: PositionFormData = {
    name: '',
    description: '',
    color: 'bg-blue-500',
    department: 'tech',
    level: 'middle',
    isSystem: false,
    responsibilities: [],
}

export function Positions() {
    const [positions, setPositions] = useState<Position[]>(initialPositions)
    const [selectedPosition, setSelectedPosition] = useState<string | null>(null)

    // 岗位表单对话框状态
    const [positionDialogOpen, setPositionDialogOpen] = useState(false)
    const [positionDialogMode, setPositionDialogMode] = useState<'create' | 'edit'>('create')
    const [editingPosition, setEditingPosition] = useState<Position | null>(null)
    const [formData, setFormData] = useState<PositionFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // 打开新建岗位对话框
    const openCreateDialog = () => {
        setPositionDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setPositionDialogOpen(true)
    }

    // 打开编辑岗位对话框
    const openEditDialog = (position: Position) => {
        setPositionDialogMode('edit')
        setEditingPosition(position)
        setFormData({
            name: position.name,
            description: position.description,
            color: position.color,
            department: position.department,
            level: position.level,
            isSystem: position.isSystem,
            responsibilities: position.responsibilities.includes('all')
                ? responsibilityGroups.flatMap(g => g.responsibilities.map(p => p.key))
                : [...position.responsibilities],
        })
        setFormErrors({})
        setPositionDialogOpen(true)
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.name.trim()) {
            errors.name = '请输入岗位名称'
        } else if (formData.name.length > 20) {
            errors.name = '岗位名称不能超过20个字符'
        } else if (positionDialogMode === 'create' && positions.some(r => r.name === formData.name)) {
            errors.name = '岗位名称已存在'
        } else if (positionDialogMode === 'edit' && positions.some(r => r.name === formData.name && r.id !== editingPosition?.id)) {
            errors.name = '岗位名称已存在'
        }

        if (!formData.description.trim()) {
            errors.description = '请输入岗位描述'
        } else if (formData.description.length > 100) {
            errors.description = '岗位描述不能超过100个字符'
        }

        if (formData.responsibilities.length === 0) {
            errors.responsibilities = '请至少选择一个职责'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存岗位
    const handleSavePosition = () => {
        if (!validateForm()) return

        if (positionDialogMode === 'create') {
            const newPosition: Position = {
                id: Date.now().toString(),
                name: formData.name,
                description: formData.description,
                color: formData.color,
                department: formData.department,
                level: formData.level,
                isSystem: formData.isSystem,
                responsibilities: formData.responsibilities,
                employeeCount: 0,
            }
            setPositions([...positions, newPosition])
        } else if (editingPosition) {
            setPositions(positions.map(r =>
                r.id === editingPosition.id
                    ? { ...r, name: formData.name, description: formData.description, color: formData.color, department: formData.department, level: formData.level, responsibilities: formData.responsibilities }
                    : r
            ))
        }

        setPositionDialogOpen(false)
    }

    // 切换表单中的职责
    const toggleFormResponsibility = (key: string) => {
        setFormData(prev => ({
            ...prev,
            responsibilities: prev.responsibilities.includes(key)
                ? prev.responsibilities.filter(k => k !== key)
                : [...prev.responsibilities, key]
        }))
    }

    // 切换表单中的职责组
    const toggleFormGroupResponsibilities = (group: ResponsibilityGroup) => {
        const groupKeys = group.responsibilities.map(p => p.key)
        const allEnabled = groupKeys.every(key => formData.responsibilities.includes(key))

        setFormData(prev => ({
            ...prev,
            responsibilities: allEnabled
                ? prev.responsibilities.filter(key => !groupKeys.includes(key))
                : [...prev.responsibilities, ...groupKeys.filter(key => !prev.responsibilities.includes(key))]
        }))
    }

    const getDepartmentLabel = (value: string) => departmentOptions.find(d => d.value === value)?.label || value
    const getLevelLabel = (value: string) => levelOptions.find(l => l.value === value)?.label || value

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
                        <h1 className='text-2xl font-bold tracking-tight'>岗位设置</h1>
                        <p className='text-muted-foreground'>管理公司岗位和分配职责</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建岗位
                    </Button>
                </div>

                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {positions.map((position) => (
                        <Card
                            key={position.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${selectedPosition === position.id ? 'ring-primary ring-2' : ''
                                }`}
                            onClick={() => setSelectedPosition(position.id)}
                        >
                            <CardHeader className='pb-3'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${position.color}`}
                                        >
                                            <Briefcase className='h-5 w-5 text-white' />
                                        </div>
                                        <div>
                                            <CardTitle className='flex items-center gap-2 text-base'>
                                                {position.name}
                                                {position.isSystem && (
                                                    <Badge variant='secondary' className='text-xs'>
                                                        系统
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                                                <Users className='h-3.5 w-3.5' />
                                                {position.employeeCount} 人
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
                                                    openEditDialog(position)
                                                }}
                                            >
                                                <Pencil className='mr-2 h-4 w-4' />
                                                编辑岗位
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Users className='mr-2 h-4 w-4' />
                                                查看员工
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className='text-destructive'
                                                disabled={position.isSystem}
                                            >
                                                <Trash2 className='mr-2 h-4 w-4' />
                                                删除岗位
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className='mb-2 flex gap-1'>
                                    <Badge variant='outline' className='text-xs'>
                                        {getDepartmentLabel(position.department)}
                                    </Badge>
                                    <Badge variant='outline' className='text-xs'>
                                        {getLevelLabel(position.level)}
                                    </Badge>
                                </div>
                                <CardDescription className='mb-3 line-clamp-2'>
                                    {position.description}
                                </CardDescription>
                                <div className='flex flex-wrap gap-1'>
                                    {position.responsibilities.slice(0, 3).map((resp) => (
                                        <Badge key={resp} variant='outline' className='text-xs'>
                                            {resp === 'all' ? '全部职责' : resp}
                                        </Badge>
                                    ))}
                                    {position.responsibilities.length > 3 && (
                                        <Badge variant='outline' className='text-xs'>
                                            +{position.responsibilities.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {selectedPosition && (
                    <div className='mt-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-base'>
                                    职责详情 - {positions.find((r) => r.id === selectedPosition)?.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                                    {positions
                                        .find((r) => r.id === selectedPosition)
                                        ?.responsibilities.map((resp) => (
                                            <div
                                                key={resp}
                                                className='bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2'
                                            >
                                                <Check className='text-primary h-4 w-4' />
                                                <span className='text-sm'>
                                                    {resp === 'all' ? '全部职责' : resp}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </Main>

            {/* 新建/编辑岗位对话框 */}
            <Dialog open={positionDialogOpen} onOpenChange={setPositionDialogOpen}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Briefcase className='h-5 w-5' />
                            {positionDialogMode === 'create' ? '新建岗位' : '编辑岗位'}
                        </DialogTitle>
                        <DialogDescription>
                            {positionDialogMode === 'create'
                                ? '创建一个新的公司岗位，并为其分配职责'
                                : '修改岗位的基本信息和职责配置'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-6'>
                        {/* 基本信息 */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='name'>
                                        岗位名称 <span className='text-destructive'>*</span>
                                    </Label>
                                    <Input
                                        id='name'
                                        placeholder='请输入岗位名称'
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={formErrors.name ? 'border-destructive' : ''}
                                    />
                                    {formErrors.name && (
                                        <p className='text-destructive text-sm'>{formErrors.name}</p>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='department'>所属部门</Label>
                                    <select
                                        id='department'
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className='border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm'
                                    >
                                        {departmentOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='level'>岗位级别</Label>
                                    <select
                                        id='level'
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        className='border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm'
                                    >
                                        {levelOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className='space-y-2'>
                                    <Label>岗位颜色</Label>
                                    <div className='flex flex-wrap gap-1.5'>
                                        {colorOptions.slice(0, 9).map((color) => (
                                            <button
                                                key={color.value}
                                                type='button'
                                                className={cn(
                                                    'h-6 w-6 rounded-full transition-all',
                                                    color.value,
                                                    formData.color === color.value
                                                        ? 'ring-primary ring-2 ring-offset-1'
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
                                <Label htmlFor='description'>
                                    岗位描述 <span className='text-destructive'>*</span>
                                </Label>
                                <Textarea
                                    id='description'
                                    placeholder='请输入岗位描述'
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={cn('resize-none', formErrors.description ? 'border-destructive' : '')}
                                    rows={2}
                                />
                                {formErrors.description && (
                                    <p className='text-destructive text-sm'>{formErrors.description}</p>
                                )}
                            </div>
                        </div>

                        {/* 职责设置 */}
                        <div className='space-y-2'>
                            <Label>
                                职责配置 <span className='text-destructive'>*</span>
                                <span className='text-muted-foreground ml-2 text-sm font-normal'>
                                    已选择 {formData.responsibilities.length} 个职责
                                </span>
                            </Label>
                            {formErrors.responsibilities && (
                                <p className='text-destructive text-sm'>{formErrors.responsibilities}</p>
                            )}
                            <ScrollArea className='h-[240px] rounded-md border p-3'>
                                <div className='space-y-4'>
                                    {responsibilityGroups.map((group) => {
                                        const groupKeys = group.responsibilities.map((p) => p.key)
                                        const enabledCount = groupKeys.filter((key) =>
                                            formData.responsibilities.includes(key)
                                        ).length
                                        const allEnabled = enabledCount === group.responsibilities.length
                                        const someEnabled = enabledCount > 0 && !allEnabled

                                        return (
                                            <div key={group.id} className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        id={`group-${group.id}`}
                                                        checked={allEnabled}
                                                        onCheckedChange={() => toggleFormGroupResponsibilities(group)}
                                                        className={someEnabled ? 'data-[state=checked]:bg-primary/50' : ''}
                                                    />
                                                    <label
                                                        htmlFor={`group-${group.id}`}
                                                        className='cursor-pointer text-sm font-medium'
                                                    >
                                                        {group.name}
                                                    </label>
                                                    <Badge variant='outline' className='text-xs'>
                                                        {enabledCount}/{group.responsibilities.length}
                                                    </Badge>
                                                </div>
                                                <div className='ml-6 grid gap-1.5 sm:grid-cols-2'>
                                                    {group.responsibilities.map((responsibility) => {
                                                        const isEnabled = formData.responsibilities.includes(responsibility.key)
                                                        return (
                                                            <div
                                                                key={responsibility.id}
                                                                className='flex items-center gap-2'
                                                            >
                                                                <Checkbox
                                                                    id={responsibility.id}
                                                                    checked={isEnabled}
                                                                    onCheckedChange={() => toggleFormResponsibility(responsibility.key)}
                                                                />
                                                                <label
                                                                    htmlFor={responsibility.id}
                                                                    className='text-muted-foreground cursor-pointer text-sm'
                                                                >
                                                                    {responsibility.name}
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
                        <Button variant='outline' onClick={() => setPositionDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSavePosition}>
                            {positionDialogMode === 'create' ? '创建岗位' : '保存更改'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

