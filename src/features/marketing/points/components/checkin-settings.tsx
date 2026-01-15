'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { pointApi, type PointRule } from '@/lib/api'

interface CheckinSettings {
  points: number
  consecutiveBonus: number
  dailyLimit: number
  enabled: boolean
}

export function CheckinSettings() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<CheckinSettings>({
    points: 10,
    consecutiveBonus: 1,
    dailyLimit: 20,
    enabled: true,
  })

  // 获取签到规则
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['point-rules'],
    queryFn: () => pointApi.getRules({ pageSize: 100 }),
  })

  // 从规则列表中找到签到规则
  useEffect(() => {
    if (rulesData?.data) {
      const checkinRule = rulesData.data.find((r: PointRule) => r.code === 'daily_checkin')
      if (checkinRule) {
        setForm({
          points: checkinRule.points ?? 10,
          consecutiveBonus: (checkinRule.conditions as any)?.consecutiveBonus ?? 1,
          dailyLimit: checkinRule.dailyLimit ?? 20,
          enabled: checkinRule.status === 'active',
        })
      }
    }
  }, [rulesData])

  // 更新规则
  const updateMutation = useMutation({
    mutationFn: async (data: CheckinSettings) => {
      const existingRule = rulesData?.data?.find((r: PointRule) => r.code === 'daily_checkin')
      
      if (existingRule) {
        return pointApi.updateRule(existingRule.id, {
          points: data.points,
          dailyLimit: data.dailyLimit,
          conditions: { consecutiveBonus: data.consecutiveBonus },
          status: data.enabled ? 'active' : 'inactive',
        })
      } else {
        return pointApi.createRule({
          name: '每日签到',
          code: 'daily_checkin',
          points: data.points,
          dailyLimit: data.dailyLimit,
          conditions: { consecutiveBonus: data.consecutiveBonus },
          status: data.enabled ? 'active' : 'inactive',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['point-rules'] })
      toast.success('签到设置已保存')
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
            <div className='rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30'>
              <Calendar className='h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-lg'>每日签到</CardTitle>
              <CardDescription>配置用户每日签到获取的积分奖励</CardDescription>
            </div>
          </div>
          <Switch
            checked={form.enabled}
            onCheckedChange={(checked) => {
              setForm({ ...form, enabled: checked })
              setIsEditing(true)
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-3'>
            <div className='space-y-2'>
              <Label htmlFor='checkin-points'>签到积分</Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='checkin-points'
                  type='number'
                  min={0}
                  value={form.points}
                  onChange={(e) => {
                    setForm({ ...form, points: Number(e.target.value) })
                    setIsEditing(true)
                  }}
                  disabled={!form.enabled}
                />
                <span className='text-sm text-muted-foreground whitespace-nowrap'>积分/天</span>
              </div>
              <p className='text-xs text-muted-foreground'>每次签到获得的基础积分</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='consecutive-bonus'>连续签到加成</Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='consecutive-bonus'
                  type='number'
                  min={0}
                  value={form.consecutiveBonus}
                  onChange={(e) => {
                    setForm({ ...form, consecutiveBonus: Number(e.target.value) })
                    setIsEditing(true)
                  }}
                  disabled={!form.enabled}
                />
                <span className='text-sm text-muted-foreground whitespace-nowrap'>积分/天</span>
              </div>
              <p className='text-xs text-muted-foreground'>连续签到每天额外奖励（最多+10天）</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='daily-limit'>每日上限</Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='daily-limit'
                  type='number'
                  min={0}
                  value={form.dailyLimit}
                  onChange={(e) => {
                    setForm({ ...form, dailyLimit: Number(e.target.value) })
                    setIsEditing(true)
                  }}
                  disabled={!form.enabled}
                />
                <span className='text-sm text-muted-foreground whitespace-nowrap'>积分</span>
              </div>
              <p className='text-xs text-muted-foreground'>签到每日最多可获得积分数</p>
            </div>
          </div>

          {/* 预览说明 */}
          <div className='rounded-lg bg-muted/50 p-4'>
            <p className='text-sm font-medium mb-2'>积分计算示例</p>
            <div className='text-sm text-muted-foreground space-y-1'>
              <p>• 第1天签到：{form.points} 积分</p>
              <p>• 第2天签到：{form.points} + {form.consecutiveBonus} = {form.points + form.consecutiveBonus} 积分</p>
              <p>• 第7天签到：{form.points} + {form.consecutiveBonus * 6} = {form.points + form.consecutiveBonus * 6} 积分</p>
              <p>• 连续签到最高可达 {form.points + form.consecutiveBonus * 10} 积分/天</p>
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4 border-t'>
            {isEditing && (
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  // 重置表单
                  const checkinRule = rulesData?.data?.find((r: PointRule) => r.code === 'daily_checkin')
                  if (checkinRule) {
                    setForm({
                      points: checkinRule.points ?? 10,
                      consecutiveBonus: (checkinRule.conditions as any)?.consecutiveBonus ?? 1,
                      dailyLimit: checkinRule.dailyLimit ?? 20,
                      enabled: checkinRule.status === 'active',
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
