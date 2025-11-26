import { useState } from 'react'
import {
    Shield,
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
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

interface Role {
    id: string
    name: string
    description: string
    userCount: number
    permissions: string[]
    isSystem: boolean
    color: string
}

interface Permission {
    id: string
    name: string
    key: string
    description: string
}

interface PermissionGroup {
    id: string
    name: string
    permissions: Permission[]
}

const permissionGroups: PermissionGroup[] = [
    {
        id: 'user',
        name: '用户管理',
        permissions: [
            { id: 'user-read', name: '查看用户', key: 'user:read', description: '查看用户列表和详情' },
            { id: 'user-create', name: '创建用户', key: 'user:create', description: '创建新用户账号' },
            { id: 'user-update', name: '编辑用户', key: 'user:update', description: '修改用户信息' },
            { id: 'user-delete', name: '删除用户', key: 'user:delete', description: '删除用户账号' },
        ],
    },
    {
        id: 'role',
        name: '角色管理',
        permissions: [
            { id: 'role-read', name: '查看角色', key: 'role:read', description: '查看角色列表' },
            { id: 'role-create', name: '创建角色', key: 'role:create', description: '创建新角色' },
            { id: 'role-update', name: '编辑角色', key: 'role:update', description: '修改角色权限' },
            { id: 'role-delete', name: '删除角色', key: 'role:delete', description: '删除角色' },
        ],
    },
    {
        id: 'content',
        name: '内容管理',
        permissions: [
            { id: 'content-read', name: '查看内容', key: 'content:read', description: '查看内容列表' },
            { id: 'content-write', name: '编辑内容', key: 'content:write', description: '编辑内容' },
            { id: 'content-review', name: '审核内容', key: 'content:review', description: '审核内容' },
            { id: 'content-delete', name: '删除内容', key: 'content:delete', description: '删除内容' },
        ],
    },
    {
        id: 'file',
        name: '文件管理',
        permissions: [
            { id: 'file-read', name: '查看文件', key: 'file:read', description: '查看文件列表' },
            { id: 'file-upload', name: '上传文件', key: 'file:upload', description: '上传新文件' },
            { id: 'file-delete', name: '删除文件', key: 'file:delete', description: '删除文件' },
        ],
    },
    {
        id: 'settings',
        name: '系统设置',
        permissions: [
            { id: 'settings-read', name: '查看设置', key: 'settings:read', description: '查看系统设置' },
            { id: 'settings-write', name: '修改设置', key: 'settings:write', description: '修改系统设置' },
        ],
    },
    {
        id: 'finance',
        name: '财务管理',
        permissions: [
            { id: 'finance-read', name: '查看财务', key: 'finance:read', description: '查看财务数据' },
            { id: 'finance-write', name: '编辑财务', key: 'finance:write', description: '编辑财务记录' },
            { id: 'report-read', name: '查看报表', key: 'report:read', description: '查看财务报表' },
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

const initialRoles: Role[] = [
    {
        id: '1',
        name: '超级管理员',
        description: '拥有系统所有权限，可以管理所有功能和用户',
        userCount: 2,
        permissions: ['all'],
        isSystem: true,
        color: 'bg-red-500',
    },
    {
        id: '2',
        name: '管理员',
        description: '可以管理用户、内容和基本系统设置',
        userCount: 5,
        permissions: ['user:read', 'user:write', 'content:read', 'content:write', 'settings:read'],
        isSystem: true,
        color: 'bg-orange-500',
    },
    {
        id: '3',
        name: '编辑',
        description: '可以创建和编辑内容，但不能删除',
        userCount: 12,
        permissions: ['content:read', 'content:write'],
        isSystem: false,
        color: 'bg-blue-500',
    },
    {
        id: '4',
        name: '审核员',
        description: '可以审核和管理用户提交的内容',
        userCount: 8,
        permissions: ['content:read', 'content:review', 'user:read'],
        isSystem: false,
        color: 'bg-green-500',
    },
    {
        id: '5',
        name: '访客',
        description: '只能查看公开内容，无编辑权限',
        userCount: 156,
        permissions: ['content:read'],
        isSystem: true,
        color: 'bg-gray-500',
    },
    {
        id: '6',
        name: '财务',
        description: '可以查看和管理财务相关数据',
        userCount: 3,
        permissions: ['finance:read', 'finance:write', 'report:read'],
        isSystem: false,
        color: 'bg-purple-500',
    },
]

interface RoleFormData {
    name: string
    description: string
    color: string
    isSystem: boolean
    permissions: string[]
}

const defaultFormData: RoleFormData = {
    name: '',
    description: '',
    color: 'bg-blue-500',
    isSystem: false,
    permissions: [],
}

export function Roles() {
    const [roles, setRoles] = useState<Role[]>(initialRoles)
    const [selectedRole, setSelectedRole] = useState<string | null>(null)

    // 角色表单对话框状态
    const [roleDialogOpen, setRoleDialogOpen] = useState(false)
    const [roleDialogMode, setRoleDialogMode] = useState<'create' | 'edit'>('create')
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [formData, setFormData] = useState<RoleFormData>(defaultFormData)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // 打开新建角色对话框
    const openCreateDialog = () => {
        setRoleDialogMode('create')
        setFormData(defaultFormData)
        setFormErrors({})
        setRoleDialogOpen(true)
    }

    // 打开编辑角色对话框
    const openEditDialog = (role: Role) => {
        setRoleDialogMode('edit')
        setEditingRole(role)
        setFormData({
            name: role.name,
            description: role.description,
            color: role.color,
            isSystem: role.isSystem,
            permissions: role.permissions.includes('all')
                ? permissionGroups.flatMap(g => g.permissions.map(p => p.key))
                : [...role.permissions],
        })
        setFormErrors({})
        setRoleDialogOpen(true)
    }

    // 表单验证
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.name.trim()) {
            errors.name = '请输入角色名称'
        } else if (formData.name.length > 20) {
            errors.name = '角色名称不能超过20个字符'
        } else if (roleDialogMode === 'create' && roles.some(r => r.name === formData.name)) {
            errors.name = '角色名称已存在'
        } else if (roleDialogMode === 'edit' && roles.some(r => r.name === formData.name && r.id !== editingRole?.id)) {
            errors.name = '角色名称已存在'
        }

        if (!formData.description.trim()) {
            errors.description = '请输入角色描述'
        } else if (formData.description.length > 100) {
            errors.description = '角色描述不能超过100个字符'
        }

        if (formData.permissions.length === 0) {
            errors.permissions = '请至少选择一个权限'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 保存角色
    const handleSaveRole = () => {
        if (!validateForm()) return

        if (roleDialogMode === 'create') {
            const newRole: Role = {
                id: Date.now().toString(),
                name: formData.name,
                description: formData.description,
                color: formData.color,
                isSystem: formData.isSystem,
                permissions: formData.permissions,
                userCount: 0,
            }
            setRoles([...roles, newRole])
        } else if (editingRole) {
            setRoles(roles.map(r =>
                r.id === editingRole.id
                    ? { ...r, name: formData.name, description: formData.description, color: formData.color, permissions: formData.permissions }
                    : r
            ))
        }

        setRoleDialogOpen(false)
    }

    // 切换表单中的权限
    const toggleFormPermission = (key: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(key)
                ? prev.permissions.filter(k => k !== key)
                : [...prev.permissions, key]
        }))
    }

    // 切换表单中的权限组
    const toggleFormGroupPermissions = (group: PermissionGroup) => {
        const groupKeys = group.permissions.map(p => p.key)
        const allEnabled = groupKeys.every(key => formData.permissions.includes(key))

        setFormData(prev => ({
            ...prev,
            permissions: allEnabled
                ? prev.permissions.filter(key => !groupKeys.includes(key))
                : [...prev.permissions, ...groupKeys.filter(key => !prev.permissions.includes(key))]
        }))
    }

    return (
        <>
            <Header>
                <Search />
                <div className='ms-auto flex items-center gap-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='mb-6 flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>角色设置</h1>
                        <p className='text-muted-foreground'>管理系统角色和分配权限</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className='mr-2 h-4 w-4' />
                        新建角色
                    </Button>
                </div>

                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {roles.map((role) => (
                        <Card
                            key={role.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${selectedRole === role.id ? 'ring-primary ring-2' : ''
                                }`}
                            onClick={() => setSelectedRole(role.id)}
                        >
                            <CardHeader className='pb-3'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${role.color}`}
                                        >
                                            <Shield className='h-5 w-5 text-white' />
                                        </div>
                                        <div>
                                            <CardTitle className='flex items-center gap-2 text-base'>
                                                {role.name}
                                                {role.isSystem && (
                                                    <Badge variant='secondary' className='text-xs'>
                                                        系统
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                                                <Users className='h-3.5 w-3.5' />
                                                {role.userCount} 个用户
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
                                                    openEditDialog(role)
                                                }}
                                            >
                                                <Pencil className='mr-2 h-4 w-4' />
                                                编辑角色
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Users className='mr-2 h-4 w-4' />
                                                查看用户
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className='text-destructive'
                                                disabled={role.isSystem}
                                            >
                                                <Trash2 className='mr-2 h-4 w-4' />
                                                删除角色
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className='mb-3 line-clamp-2'>
                                    {role.description}
                                </CardDescription>
                                <div className='flex flex-wrap gap-1'>
                                    {role.permissions.slice(0, 3).map((perm) => (
                                        <Badge key={perm} variant='outline' className='text-xs'>
                                            {perm === 'all' ? '全部权限' : perm}
                                        </Badge>
                                    ))}
                                    {role.permissions.length > 3 && (
                                        <Badge variant='outline' className='text-xs'>
                                            +{role.permissions.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {selectedRole && (
                    <div className='mt-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-base'>
                                    权限详情 - {roles.find((r) => r.id === selectedRole)?.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                                    {roles
                                        .find((r) => r.id === selectedRole)
                                        ?.permissions.map((perm) => (
                                            <div
                                                key={perm}
                                                className='bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2'
                                            >
                                                <Check className='text-primary h-4 w-4' />
                                                <span className='text-sm'>
                                                    {perm === 'all' ? '全部权限' : perm}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </Main>

            {/* 新建/编辑角色对话框 */}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <Shield className='h-5 w-5' />
                            {roleDialogMode === 'create' ? '新建角色' : '编辑角色'}
                        </DialogTitle>
                        <DialogDescription>
                            {roleDialogMode === 'create'
                                ? '创建一个新的系统角色，并为其分配权限'
                                : '修改角色的基本信息和权限配置'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-6'>
                        {/* 基本信息 */}
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='name'>
                                    角色名称 <span className='text-destructive'>*</span>
                                </Label>
                                <Input
                                    id='name'
                                    placeholder='请输入角色名称'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={formErrors.name ? 'border-destructive' : ''}
                                />
                                {formErrors.name && (
                                    <p className='text-destructive text-sm'>{formErrors.name}</p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='description'>
                                    角色描述 <span className='text-destructive'>*</span>
                                </Label>
                                <Textarea
                                    id='description'
                                    placeholder='请输入角色描述'
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
                                <Label>角色颜色</Label>
                                <div className='flex flex-wrap gap-2'>
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            type='button'
                                            className={cn(
                                                'h-8 w-8 rounded-full transition-all',
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

                        {/* 权限设置 */}
                        <div className='space-y-2'>
                            <Label>
                                权限配置 <span className='text-destructive'>*</span>
                                <span className='text-muted-foreground ml-2 text-sm font-normal'>
                                    已选择 {formData.permissions.length} 个权限
                                </span>
                            </Label>
                            {formErrors.permissions && (
                                <p className='text-destructive text-sm'>{formErrors.permissions}</p>
                            )}
                            <ScrollArea className='h-[280px] rounded-md border p-3'>
                                <div className='space-y-4'>
                                    {permissionGroups.map((group) => {
                                        const groupKeys = group.permissions.map((p) => p.key)
                                        const enabledCount = groupKeys.filter((key) =>
                                            formData.permissions.includes(key)
                                        ).length
                                        const allEnabled = enabledCount === group.permissions.length
                                        const someEnabled = enabledCount > 0 && !allEnabled

                                        return (
                                            <div key={group.id} className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        id={`group-${group.id}`}
                                                        checked={allEnabled}
                                                        onCheckedChange={() => toggleFormGroupPermissions(group)}
                                                        className={someEnabled ? 'data-[state=checked]:bg-primary/50' : ''}
                                                    />
                                                    <label
                                                        htmlFor={`group-${group.id}`}
                                                        className='cursor-pointer text-sm font-medium'
                                                    >
                                                        {group.name}
                                                    </label>
                                                    <Badge variant='outline' className='text-xs'>
                                                        {enabledCount}/{group.permissions.length}
                                                    </Badge>
                                                </div>
                                                <div className='ml-6 grid gap-1.5 sm:grid-cols-2'>
                                                    {group.permissions.map((permission) => {
                                                        const isEnabled = formData.permissions.includes(permission.key)
                                                        return (
                                                            <div
                                                                key={permission.id}
                                                                className='flex items-center gap-2'
                                                            >
                                                                <Checkbox
                                                                    id={permission.id}
                                                                    checked={isEnabled}
                                                                    onCheckedChange={() => toggleFormPermission(permission.key)}
                                                                />
                                                                <label
                                                                    htmlFor={permission.id}
                                                                    className='text-muted-foreground cursor-pointer text-sm'
                                                                >
                                                                    {permission.name}
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
                        <Button variant='outline' onClick={() => setRoleDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSaveRole}>
                            {roleDialogMode === 'create' ? '创建角色' : '保存更改'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
