'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserPlus, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { referralApi, type ReferralRule } from '@/lib/api'

interface ReferralSettings {
  enabled: boolean
  inviterPoints: number     // 邀请人获得积分
  inviteePoints: number     // 被邀请人获得积分
  requireFirstOrder: boolean // 是否需要完成首单
  dailyLimit: number | null  // 每日上限
  totalLimit: number | null  // 总上限
}

interface ReferralSettingsProps {
  onShowRecords?: () => void
}

export function ReferralSettings({ onShowRecords }: ReferralSettingsProps) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<ReferralSettings>({
    enabled: true,
    inviterPoints: 200,
    inviteePoints: 100,
    requireFirstOrder: true,
    dailyLimit: null,
    totalLimit: null,
  })

  // 获取邀请规则（取第一条作为默认规则）
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['referral-rules'],
    queryFn: () => referralApi.getRules({ pageSize: 10 }),
  })

  // 从规则列表中找到首单邀请规则（type=user 或 first_order）
  useEffect(() => {
    if (rulesData?.data && rulesData.data.length > 0) {
      // 优先找 type=user 的规则，否则取第一条
      const rule = rulesData.data.find((r: ReferralRule) => r.type === 'user') || rulesData.data[0]
      if (rule) {
        setForm({
          enabled: rule.status === 'active',
          inviterPoints: rule.inviterPoints || 200,
          inviteePoints: rule.inviteePoints || 100,
          requireFirstOrder: rule.requireFirstOrder ?? true,
          dailyLimit: rule.dailyLimit || null,
          totalLimit: rule.totalLimit || null,
        })
      }
    }
  }, [rulesData])

  // 更新规则
  const updateMutation = useMutation({
    mutationFn: async (data: ReferralSettings) => {
      // 查找现有规则
      const existingRule = rulesData?.data?.find((r: ReferralRule) => r.type === 'user') || rulesData?.data?.[0]
      
      if (existingRule) {
        // 更新时不能发送 type 字段
        return referralApi.updateRule(existingRule.id, {
          name: '邀请好友奖励',
          inviterPoints: data.inviterPoints,
          inviteePoints: data.inviteePoints,
          requireFirstOrder: data.requireFirstOrder,
          dailyLimit: data.dailyLimit || undefined,
          totalLimit: data.totalLimit || undefined,
          status: data.enabled ? 'active' : 'inactive',
        })
      } else {
        // 创建时需要 type 字段
        return referralApi.createRule({
          name: '邀请好友奖励',
          type: 'user',
          inviterPoints: data.inviterPoints,
          inviteePoints: data.inviteePoints,
          requireFirstOrder: data.requireFirstOrder,
          dailyLimit: data.dailyLimit || undefined,
          totalLimit: data.totalLimit || undefined,
          status: data.enabled ? 'active' : 'inactive',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-rules'] })
      toast.success('邀请奖励设置已保存')
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
    <div className='space-y-6'>
      {/* 邀请奖励设置 */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900/30'>
                <UserPlus className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-lg'>邀请好友奖励</CardTitle>
                <CardDescription>配置邀请好友成功后双方获得的积分奖励</CardDescription>
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
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* 奖励设置 */}
            <div className='grid gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='inviter-points' className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  邀请人奖励
                </Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='inviter-points'
                    type='number'
                    min={0}
                    value={form.inviterPoints}
                    onChange={(e) => {
                      setForm({ ...form, inviterPoints: Number(e.target.value) })
                      setIsEditing(true)
                    }}
                    disabled={!form.enabled}
                  />
                  <span className='text-sm text-muted-foreground whitespace-nowrap'>积分</span>
                </div>
                <p className='text-xs text-muted-foreground'>邀请成功后邀请人获得的积分</p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='invitee-points' className='flex items-center gap-2'>
                  <UserPlus className='h-4 w-4 text-muted-foreground' />
                  被邀请人奖励
                </Label>
                <div className='flex items-center gap-2'>
                  <Input
                    id='invitee-points'
                    type='number'
                    min={0}
                    value={form.inviteePoints}
                    onChange={(e) => {
                      setForm({ ...form, inviteePoints: Number(e.target.value) })
                      setIsEditing(true)
                    }}
                    disabled={!form.enabled}
                  />
                  <span className='text-sm text-muted-foreground whitespace-nowrap'>积分</span>
                </div>
                <p className='text-xs text-muted-foreground'>新用户注册后获得的积分</p>
              </div>
            </div>

            <Separator />

            {/* 奖励条件 */}
            <div className='space-y-4'>
              <Label className='text-base'>奖励条件</Label>
              
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div>
                  <Label className='font-normal'>需要完成首单</Label>
                  <p className='text-xs text-muted-foreground mt-1'>
                    被邀请人需要完成首笔订单后，邀请人才能获得奖励
                  </p>
                </div>
                <Switch
                  checked={form.requireFirstOrder}
                  onCheckedChange={(checked) => {
                    setForm({ ...form, requireFirstOrder: checked })
                    setIsEditing(true)
                  }}
                  disabled={!form.enabled}
                />
              </div>
            </div>

            <Separator />

            {/* 限制设置 */}
            <div className='space-y-4'>
              <Label className='text-base'>邀请限制</Label>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='daily-limit'>每日上限</Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='daily-limit'
                      type='number'
                      min={0}
                      placeholder='不限制'
                      value={form.dailyLimit ?? ''}
                      onChange={(e) => {
                        setForm({ ...form, dailyLimit: e.target.value ? Number(e.target.value) : null })
                        setIsEditing(true)
                      }}
                      disabled={!form.enabled}
                    />
                    <span className='text-sm text-muted-foreground whitespace-nowrap'>人/天</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='total-limit'>总邀请上限</Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='total-limit'
                      type='number'
                      min={0}
                      placeholder='不限制'
                      value={form.totalLimit ?? ''}
                      onChange={(e) => {
                        setForm({ ...form, totalLimit: e.target.value ? Number(e.target.value) : null })
                        setIsEditing(true)
                      }}
                      disabled={!form.enabled}
                    />
                    <span className='text-sm text-muted-foreground whitespace-nowrap'>人</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 预览说明 */}
            <div className='rounded-lg bg-muted/50 p-4'>
              <p className='text-sm font-medium mb-2'>奖励说明</p>
              <div className='text-sm text-muted-foreground space-y-1'>
                <p>• 用户A邀请用户B注册</p>
                {form.requireFirstOrder ? (
                  <>
                    <p>• 用户B完成首笔订单后</p>
                    <p>• 用户A获得 <span className='font-medium text-foreground'>{form.inviterPoints}</span> 积分</p>
                    <p>• 用户B获得 <span className='font-medium text-foreground'>{form.inviteePoints}</span> 积分</p>
                  </>
                ) : (
                  <>
                    <p>• 用户B注册成功后</p>
                    <p>• 用户A获得 <span className='font-medium text-foreground'>{form.inviterPoints}</span> 积分</p>
                    <p>• 用户B获得 <span className='font-medium text-foreground'>{form.inviteePoints}</span> 积分</p>
                  </>
                )}
              </div>
            </div>

            <div className='flex justify-end gap-2 pt-4 border-t'>
              {isEditing && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    // 重置表单
                    const rule = rulesData?.data?.find((r: ReferralRule) => r.type === 'user') || rulesData?.data?.[0]
                    if (rule) {
                      setForm({
                        enabled: rule.isActive !== false && rule.status === 'active',
                        inviterPoints: rule.inviterReward || 200,
                        inviteePoints: rule.rewardValue || 100,
                        requireFirstOrder: true,
                        dailyLimit: rule.maxInvites || null,
                        totalLimit: null,
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

      {/* 邀请记录入口 */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30'>
                <Users className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-lg'>邀请记录</CardTitle>
                <CardDescription>查看用户邀请记录和奖励发放情况</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground mb-4'>
            您可以在用户详情页面查看每个用户的邀请记录，或点击下方按钮查看所有邀请记录。
          </p>
          <Button variant='outline' onClick={onShowRecords}>
            查看邀请记录
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
