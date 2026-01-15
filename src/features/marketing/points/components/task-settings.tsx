'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { pointApi, type PointRule } from '@/lib/api'

interface TaskSettings {
  completeProfilePoints: number
  completeProfileEnabled: boolean
}

export function TaskSettings() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<TaskSettings>({
    completeProfilePoints: 50,
    completeProfileEnabled: true,
  })

  // 获取积分规则
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['point-rules'],
    queryFn: () => pointApi.getRules({ pageSize: 100 }),
  })

  // 从规则列表中找到完善信息规则
  useEffect(() => {
    if (rulesData?.data) {
      const profileRule = rulesData.data.find((r: PointRule) => r.code === 'complete_profile')
      if (profileRule) {
        setForm({
          completeProfilePoints: profileRule.points ?? 50,
          completeProfileEnabled: profileRule.status === 'active',
        })
      }
    }
  }, [rulesData])

  // 更新规则
  const updateMutation = useMutation({
    mutationFn: async (data: TaskSettings) => {
      const existingRule = rulesData?.data?.find((r: PointRule) => r.code === 'complete_profile')
      
      if (existingRule) {
        return pointApi.updateRule(existingRule.id, {
          points: data.completeProfilePoints,
          status: data.completeProfileEnabled ? 'active' : 'inactive',
        })
      } else {
        return pointApi.createRule({
          name: '完善个人信息',
          code: 'complete_profile',
          points: data.completeProfilePoints,
          totalLimit: data.completeProfilePoints, // 总上限等于积分数，表示只能领一次
          status: data.completeProfileEnabled ? 'active' : 'inactive',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['point-rules'] })
      toast.success('任务奖励设置已保存')
      setIsEditing(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || '保存失败')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(form)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30'>
              <UserCheck className='h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-lg'>完善个人信息</CardTitle>
              <CardDescription>用户完善头像、昵称、手机号后获得一次性奖励</CardDescription>
            </div>
          </div>
          <Switch
            checked={form.completeProfileEnabled}
            onCheckedChange={(checked) => {
              setForm({ ...form, completeProfileEnabled: checked })
              setIsEditing(true)
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='profile-points'>奖励积分</Label>
            <div className='flex items-center gap-2 max-w-xs'>
              <Input
                id='profile-points'
                type='number'
                min={0}
                value={form.completeProfilePoints}
                onChange={(e) => {
                  setForm({ ...form, completeProfilePoints: Number(e.target.value) })
                  setIsEditing(true)
                }}
                disabled={!form.completeProfileEnabled}
              />
              <span className='text-sm text-muted-foreground whitespace-nowrap'>积分</span>
            </div>
            <p className='text-xs text-muted-foreground'>
              用户完善个人信息后可获得的一次性积分奖励
            </p>
          </div>

          {/* 说明 */}
          <div className='rounded-lg bg-muted/50 p-4'>
            <p className='text-sm font-medium mb-2'>完善信息要求</p>
            <div className='text-sm text-muted-foreground space-y-1'>
              <p>• 设置头像</p>
              <p>• 设置昵称</p>
              <p>• 绑定手机号</p>
            </div>
            <p className='text-sm text-muted-foreground mt-2'>
              用户完成以上所有信息后，可领取 <span className='font-medium text-foreground'>{form.completeProfilePoints}</span> 积分奖励（仅限一次）
            </p>
          </div>

          <div className='flex justify-end gap-2 pt-4 border-t'>
            {isEditing && (
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  const profileRule = rulesData?.data?.find((r: PointRule) => r.code === 'complete_profile')
                  if (profileRule) {
                    setForm({
                      completeProfilePoints: profileRule.points ?? 50,
                      completeProfileEnabled: profileRule.status === 'active',
                    })
                  }
                  setIsEditing(false)
                }}
              >
                取消
              </Button>
            )}
            <Button type='submit' disabled={updateMutation.isPending || !isEditing}>
              {updateMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              保存设置
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
