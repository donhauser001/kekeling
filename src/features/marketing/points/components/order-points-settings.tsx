'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ShoppingBag, Award, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { pointApi, type PointRule } from '@/lib/api'

interface OrderPointsSettings {
  // 首单奖励
  firstOrderEnabled: boolean
  firstOrderPoints: number
  firstOrderRate: number
  firstOrderUseRate: boolean // 是否使用比例模式
  
  // 订单消费积分
  orderCompleteEnabled: boolean
  orderCompleteRate: number
}

export function OrderPointsSettings() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<OrderPointsSettings>({
    firstOrderEnabled: true,
    firstOrderPoints: 100,
    firstOrderRate: 0.05,
    firstOrderUseRate: false,
    orderCompleteEnabled: true,
    orderCompleteRate: 0.01,
  })

  // 获取积分规则
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['point-rules'],
    queryFn: () => pointApi.getRules({ pageSize: 100 }),
  })

  // 从规则列表中提取设置
  useEffect(() => {
    if (rulesData?.data) {
      const firstOrderRule = rulesData.data.find((r: PointRule) => r.code === 'first_order')
      const orderCompleteRule = rulesData.data.find((r: PointRule) => r.code === 'order_complete')
      
      setForm({
        firstOrderEnabled: firstOrderRule?.status === 'active',
        firstOrderPoints: firstOrderRule?.points ?? 100,
        firstOrderRate: firstOrderRule?.pointsRate ? Number(firstOrderRule.pointsRate) : 0.05,
        firstOrderUseRate: !!(firstOrderRule?.pointsRate && Number(firstOrderRule.pointsRate) > 0),
        orderCompleteEnabled: orderCompleteRule?.status === 'active',
        orderCompleteRate: orderCompleteRule?.pointsRate ? Number(orderCompleteRule.pointsRate) : 0.01,
      })
    }
  }, [rulesData])

  // 更新规则
  const updateMutation = useMutation({
    mutationFn: async (data: OrderPointsSettings) => {
      const firstOrderRule = rulesData?.data?.find((r: PointRule) => r.code === 'first_order')
      const orderCompleteRule = rulesData?.data?.find((r: PointRule) => r.code === 'order_complete')
      
      const promises: Promise<any>[] = []
      
      // 更新/创建首单奖励规则
      if (firstOrderRule) {
        promises.push(pointApi.updateRule(firstOrderRule.id, {
          points: data.firstOrderUseRate ? 0 : data.firstOrderPoints,
          pointsRate: data.firstOrderUseRate ? data.firstOrderRate : null,
          status: data.firstOrderEnabled ? 'active' : 'inactive',
        }))
      } else {
        promises.push(pointApi.createRule({
          name: '完成首单',
          code: 'first_order',
          points: data.firstOrderUseRate ? 0 : data.firstOrderPoints,
          pointsRate: data.firstOrderUseRate ? data.firstOrderRate : undefined,
          status: data.firstOrderEnabled ? 'active' : 'inactive',
        }))
      }
      
      // 更新/创建订单消费积分规则
      if (orderCompleteRule) {
        promises.push(pointApi.updateRule(orderCompleteRule.id, {
          points: 0,
          pointsRate: data.orderCompleteRate,
          status: data.orderCompleteEnabled ? 'active' : 'inactive',
        }))
      } else {
        promises.push(pointApi.createRule({
          name: '订单完成奖励',
          code: 'order_complete',
          points: 0,
          pointsRate: data.orderCompleteRate,
          status: data.orderCompleteEnabled ? 'active' : 'inactive',
        }))
      }
      
      return Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['point-rules'] })
      toast.success('订单积分设置已保存')
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
      {/* 首单奖励 */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900/30'>
                <Award className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-lg'>首单奖励</CardTitle>
                <CardDescription>用户完成第一笔订单后获得的额外积分奖励</CardDescription>
              </div>
            </div>
            <Switch
              checked={form.firstOrderEnabled}
              onCheckedChange={(checked) => {
                setForm({ ...form, firstOrderEnabled: checked })
                setIsEditing(true)
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* 计算方式选择 */}
            <div className='space-y-3'>
              <Label>积分计算方式</Label>
              <div className='flex gap-4'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='radio'
                    name='firstOrderMode'
                    checked={!form.firstOrderUseRate}
                    onChange={() => {
                      setForm({ ...form, firstOrderUseRate: false })
                      setIsEditing(true)
                    }}
                    disabled={!form.firstOrderEnabled}
                    className='h-4 w-4'
                  />
                  <span className='text-sm'>固定积分</span>
                </label>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='radio'
                    name='firstOrderMode'
                    checked={form.firstOrderUseRate}
                    onChange={() => {
                      setForm({ ...form, firstOrderUseRate: true })
                      setIsEditing(true)
                    }}
                    disabled={!form.firstOrderEnabled}
                    className='h-4 w-4'
                  />
                  <span className='text-sm'>按订单金额比例</span>
                </label>
              </div>
            </div>

            {/* 根据计算方式显示不同输入 */}
            {!form.firstOrderUseRate ? (
              <div className='space-y-2'>
                <Label htmlFor='first-order-points'>奖励积分</Label>
                <div className='flex items-center gap-2 max-w-xs'>
                  <Input
                    id='first-order-points'
                    type='number'
                    min={0}
                    value={form.firstOrderPoints}
                    onChange={(e) => {
                      setForm({ ...form, firstOrderPoints: Number(e.target.value) })
                      setIsEditing(true)
                    }}
                    disabled={!form.firstOrderEnabled}
                  />
                  <span className='text-sm text-muted-foreground whitespace-nowrap'>积分</span>
                </div>
              </div>
            ) : (
              <div className='space-y-2'>
                <Label htmlFor='first-order-rate'>积分比例</Label>
                <div className='flex items-center gap-2 max-w-xs'>
                  <Input
                    id='first-order-rate'
                    type='number'
                    min={0}
                    max={1}
                    step={0.01}
                    value={form.firstOrderRate}
                    onChange={(e) => {
                      setForm({ ...form, firstOrderRate: Number(e.target.value) })
                      setIsEditing(true)
                    }}
                    disabled={!form.firstOrderEnabled}
                  />
                  <span className='text-sm text-muted-foreground whitespace-nowrap'>
                    ({(form.firstOrderRate * 100).toFixed(0)}%)
                  </span>
                </div>
                <p className='text-xs text-muted-foreground'>
                  示例：订单金额 ¥100，获得 {Math.floor(100 * form.firstOrderRate)} 积分
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* 订单消费积分 */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30'>
                <ShoppingBag className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-lg'>订单消费积分</CardTitle>
                <CardDescription>每笔订单完成后按支付金额比例发放积分（与首单奖励可叠加）</CardDescription>
              </div>
            </div>
            <Switch
              checked={form.orderCompleteEnabled}
              onCheckedChange={(checked) => {
                setForm({ ...form, orderCompleteEnabled: checked })
                setIsEditing(true)
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='order-rate'>积分比例</Label>
              <div className='flex items-center gap-2 max-w-xs'>
                <Input
                  id='order-rate'
                  type='number'
                  min={0}
                  max={1}
                  step={0.01}
                  value={form.orderCompleteRate}
                  onChange={(e) => {
                    setForm({ ...form, orderCompleteRate: Number(e.target.value) })
                    setIsEditing(true)
                  }}
                  disabled={!form.orderCompleteEnabled}
                />
                <span className='text-sm text-muted-foreground whitespace-nowrap'>
                  ({(form.orderCompleteRate * 100).toFixed(0)}%)
                </span>
              </div>
              <p className='text-xs text-muted-foreground'>
                按订单实付金额的比例发放积分，如 0.01 表示消费 100 元得 1 积分
              </p>
            </div>

            {/* 计算示例 */}
            <div className='rounded-lg bg-muted/50 p-4'>
              <p className='text-sm font-medium mb-2'>积分发放示例（订单金额 ¥200）</p>
              <div className='text-sm text-muted-foreground space-y-1'>
                {form.orderCompleteEnabled && (
                  <p>• 订单消费积分：200 × {form.orderCompleteRate} = {Math.floor(200 * form.orderCompleteRate)} 积分</p>
                )}
                {form.firstOrderEnabled && !form.firstOrderUseRate && (
                  <p>• 首单额外奖励：{form.firstOrderPoints} 积分（仅首单）</p>
                )}
                {form.firstOrderEnabled && form.firstOrderUseRate && (
                  <p>• 首单额外奖励：200 × {form.firstOrderRate} = {Math.floor(200 * form.firstOrderRate)} 积分（仅首单）</p>
                )}
                <Separator className='my-2' />
                <p className='font-medium text-foreground'>
                  首单总计：
                  {(() => {
                    let total = 0
                    if (form.orderCompleteEnabled) total += Math.floor(200 * form.orderCompleteRate)
                    if (form.firstOrderEnabled) {
                      total += form.firstOrderUseRate ? Math.floor(200 * form.firstOrderRate) : form.firstOrderPoints
                    }
                    return total
                  })()} 积分
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <Card className='bg-muted/30'>
        <CardContent className='py-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              {isEditing ? '您有未保存的更改' : '修改设置后点击保存'}
            </p>
            <div className='flex gap-2'>
              {isEditing && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    // 重新加载数据
                    const firstOrderRule = rulesData?.data?.find((r: PointRule) => r.code === 'first_order')
                    const orderCompleteRule = rulesData?.data?.find((r: PointRule) => r.code === 'order_complete')
                    setForm({
                      firstOrderEnabled: firstOrderRule?.status === 'active',
                      firstOrderPoints: firstOrderRule?.points ?? 100,
                      firstOrderRate: firstOrderRule?.pointsRate ? Number(firstOrderRule.pointsRate) : 0.05,
                      firstOrderUseRate: !!(firstOrderRule?.pointsRate && Number(firstOrderRule.pointsRate) > 0),
                      orderCompleteEnabled: orderCompleteRule?.status === 'active',
                      orderCompleteRate: orderCompleteRule?.pointsRate ? Number(orderCompleteRule.pointsRate) : 0.01,
                    })
                    setIsEditing(false)
                  }}
                >
                  取消
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={updateMutation.isPending || !isEditing}>
                {updateMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                保存设置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
