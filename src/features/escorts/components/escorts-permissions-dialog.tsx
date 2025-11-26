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
import { type Escort } from '../data/schema'

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
    id: 'escort',
    name: '陪诊服务',
    permissions: [
      { id: 'escort-accept', name: '接单', key: 'escort:accept', description: '接受陪诊订单' },
      { id: 'escort-cancel', name: '取消订单', key: 'escort:cancel', description: '取消已接订单' },
      { id: 'escort-complete', name: '完成订单', key: 'escort:complete', description: '确认完成陪诊' },
      { id: 'escort-transfer', name: '转单', key: 'escort:transfer', description: '将订单转给其他陪诊员' },
    ],
  },
  {
    id: 'patient',
    name: '患者管理',
    permissions: [
      { id: 'patient-read', name: '查看患者', key: 'patient:read', description: '查看患者信息' },
      { id: 'patient-contact', name: '联系患者', key: 'patient:contact', description: '获取患者联系方式' },
      { id: 'patient-record', name: '记录信息', key: 'patient:record', description: '记录患者就诊信息' },
    ],
  },
  {
    id: 'schedule',
    name: '排班管理',
    permissions: [
      { id: 'schedule-read', name: '查看排班', key: 'schedule:read', description: '查看自己的排班' },
      { id: 'schedule-update', name: '调整排班', key: 'schedule:update', description: '调整自己的工作时间' },
      { id: 'schedule-leave', name: '请假', key: 'schedule:leave', description: '提交请假申请' },
    ],
  },
  {
    id: 'finance',
    name: '收入管理',
    permissions: [
      { id: 'finance-read', name: '查看收入', key: 'finance:read', description: '查看个人收入' },
      { id: 'finance-withdraw', name: '提现', key: 'finance:withdraw', description: '申请提现' },
    ],
  },
]

// 根据分类获取默认权限
function getCategoryPermissions(category: string): string[] {
  switch (category) {
    case 'senior':
      return permissionGroups.flatMap(g => g.permissions.map(p => p.key))
    case 'intermediate':
      return ['escort:accept', 'escort:cancel', 'escort:complete', 'escort:transfer', 'patient:read', 'patient:contact', 'patient:record', 'schedule:read', 'schedule:update', 'schedule:leave', 'finance:read', 'finance:withdraw']
    case 'junior':
      return ['escort:accept', 'escort:complete', 'patient:read', 'patient:contact', 'schedule:read', 'schedule:leave', 'finance:read']
    case 'trainee':
      return ['patient:read', 'schedule:read', 'finance:read']
    default:
      return ['schedule:read']
  }
}

interface EscortsPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Escort
}

export function EscortsPermissionsDialog({
  open,
  onOpenChange,
  currentRow,
}: EscortsPermissionsDialogProps) {
  const categoryPermissions = getCategoryPermissions(currentRow.category)
  const [customPermissions, setCustomPermissions] = useState<string[]>(categoryPermissions)

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
    console.log('保存陪诊员权限:', currentRow.id, customPermissions)
    onOpenChange(false)
  }

  const handleReset = () => {
    setCustomPermissions(categoryPermissions)
  }

  const hasChanges = JSON.stringify([...customPermissions].sort()) !== JSON.stringify([...categoryPermissions].sort())

  const categoryLabels: Record<string, string> = {
    senior: '高级陪诊员',
    intermediate: '中级陪诊员',
    junior: '初级陪诊员',
    trainee: '实习陪诊员',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Key className='h-5 w-5' />
            权限设置 - {currentRow.firstName} {currentRow.lastName}
          </DialogTitle>
          <DialogDescription>
            为陪诊员配置个人权限，覆盖分类默认权限。当前分类：
            <Badge variant='outline' className='ml-1'>
              {categoryLabels[currentRow.category] || currentRow.category}
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
                重置为分类默认
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
                        id={`escort-perm-group-${group.id}`}
                        checked={allEnabled}
                        onCheckedChange={() => toggleGroupPermissions(group)}
                        className={someEnabled ? 'data-[state=checked]:bg-primary/50' : ''}
                      />
                      <label
                        htmlFor={`escort-perm-group-${group.id}`}
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
                        const isFromCategory = categoryPermissions.includes(permission.key)
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
                              id={`escort-perm-${permission.id}`}
                              checked={isEnabled}
                              onCheckedChange={() => togglePermission(permission.key)}
                            />
                            <div className='flex-1'>
                            <label
                              htmlFor={`escort-perm-${permission.id}`}
                              className='flex cursor-pointer items-center gap-1.5 text-sm'
                            >
                              {permission.name}
                              {isFromCategory && (
                                <Badge variant='secondary' className='ml-1 text-[10px]'>
                                  分类
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
