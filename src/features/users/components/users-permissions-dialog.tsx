import { useState } from 'react'
import { Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type User } from '../data/schema'

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

// 根据角色获取默认权限
function getRolePermissions(role: string): string[] {
  switch (role) {
    case 'superadmin':
      return permissionGroups.flatMap(g => g.permissions.map(p => p.key))
    case 'admin':
      return ['user:read', 'user:create', 'user:update', 'content:read', 'content:write', 'content:review', 'file:read', 'file:upload', 'settings:read']
    case 'manager':
      return ['user:read', 'content:read', 'content:write', 'file:read', 'file:upload', 'finance:read', 'report:read']
    case 'cashier':
      return ['content:read', 'finance:read', 'finance:write']
    default:
      return ['content:read']
  }
}

interface UsersPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersPermissionsDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersPermissionsDialogProps) {
  const rolePermissions = getRolePermissions(currentRow.role)
  const [customPermissions, setCustomPermissions] = useState<string[]>(rolePermissions)

  const togglePermission = (key: string) => {
    setCustomPermissions(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  const toggleGroupPermissions = (group: PermissionGroup) => {
    const groupKeys = group.permissions.map(p => p.key)
    const allEnabled = groupKeys.every(key => customPermissions.includes(key))

    if (allEnabled) {
      setCustomPermissions(prev => prev.filter(key => !groupKeys.includes(key)))
    } else {
      setCustomPermissions(prev => [
        ...prev,
        ...groupKeys.filter(key => !prev.includes(key)),
      ])
    }
  }

  const handleSave = () => {
    // 这里可以调用 API 保存用户权限
    console.log('保存用户权限:', currentRow.id, customPermissions)
    onOpenChange(false)
  }

  const handleReset = () => {
    setCustomPermissions(rolePermissions)
  }

  const hasChanges = JSON.stringify([...customPermissions].sort()) !== JSON.stringify([...rolePermissions].sort())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Key className='h-5 w-5' />
            权限设置 - {currentRow.firstName} {currentRow.lastName}
          </DialogTitle>
          <DialogDescription>
            为用户配置个人权限，覆盖角色默认权限。当前角色：
            <Badge variant='outline' className='ml-1'>
              {currentRow.role}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              已选择 {customPermissions.length} 个权限
            </span>
            {hasChanges && (
              <Button variant='ghost' size='sm' onClick={handleReset}>
                重置为角色默认
              </Button>
            )}
          </div>

          <ScrollArea className='h-[400px] rounded-md border p-3'>
            <div className='space-y-4'>
              {permissionGroups.map((group) => {
                const groupKeys = group.permissions.map(p => p.key)
                const enabledCount = groupKeys.filter(key =>
                  customPermissions.includes(key)
                ).length
                const allEnabled = enabledCount === group.permissions.length
                const someEnabled = enabledCount > 0 && !allEnabled

                return (
                  <div key={group.id} className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        id={`user-perm-group-${group.id}`}
                        checked={allEnabled}
                        onCheckedChange={() => toggleGroupPermissions(group)}
                        className={someEnabled ? 'data-[state=checked]:bg-primary/50' : ''}
                      />
                      <label
                        htmlFor={`user-perm-group-${group.id}`}
                        className='cursor-pointer text-sm font-medium'
                      >
                        {group.name}
                      </label>
                      <Badge variant='outline' className='text-xs'>
                        {enabledCount}/{group.permissions.length}
                      </Badge>
                    </div>
                    <div className='ml-6 grid gap-2 sm:grid-cols-2'>
                      {group.permissions.map((permission) => {
                        const isEnabled = customPermissions.includes(permission.key)
                        const isFromRole = rolePermissions.includes(permission.key)
                        return (
                          <div
                            key={permission.id}
                            className={`flex items-center gap-2 rounded-md border p-2 transition-colors ${
                              isEnabled
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border'
                            }`}
                          >
                            <Checkbox
                              id={`user-perm-${permission.id}`}
                              checked={isEnabled}
                              onCheckedChange={() => togglePermission(permission.key)}
                            />
                            <div className='flex-1'>
                            <label
                              htmlFor={`user-perm-${permission.id}`}
                              className='flex cursor-pointer items-center gap-1.5 text-sm'
                            >
                              {permission.name}
                              {isFromRole && (
                                <Badge variant='secondary' className='ml-1 text-[10px]'>
                                  角色
                                </Badge>
                              )}
                            </label>
                              <p className='text-muted-foreground text-xs'>
                                {permission.description}
                              </p>
                            </div>
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

        <div className='flex justify-end gap-2 pt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存更改
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

