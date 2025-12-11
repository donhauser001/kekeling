import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { pricingConfigApi } from '@/lib/api'

export function PricingConfig() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['pricing-config'],
    queryFn: () => pricingConfigApi.get(),
  })

  const [formData, setFormData] = useState({
    discountStackMode: 'multiply' as 'multiply' | 'min',
    couponStackWithMember: true,
    couponStackWithCampaign: true,
    pointsEnabled: true,
    pointsRate: 100,
    pointsMaxRate: 10,
    minPayAmount: 0.01,
    showOriginalPrice: true,
    showMemberPrice: true,
    showSavings: true,
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => pricingConfigApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-config'] })
      toast.success('更新成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  // 当数据加载完成后更新表单数据
  if (data && formData.discountStackMode === 'multiply' && data.discountStackMode !== formData.discountStackMode) {
    setFormData({
      discountStackMode: data.discountStackMode,
      couponStackWithMember: data.couponStackWithMember,
      couponStackWithCampaign: data.couponStackWithCampaign,
      pointsEnabled: data.pointsEnabled,
      pointsRate: data.pointsRate,
      pointsMaxRate: data.pointsMaxRate,
      minPayAmount: data.minPayAmount,
      showOriginalPrice: data.showOriginalPrice,
      showMemberPrice: data.showMemberPrice,
      showSavings: data.showSavings,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  return (
    <>
      <Header>
        <TopNav links={[]} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>价格引擎配置</h1>
          <p className='text-muted-foreground'>配置价格计算规则和展示方式</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>价格配置</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='py-8 text-center text-muted-foreground'>加载中...</div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='space-y-4'>
                  <div>
                    <Label>折扣叠加模式</Label>
                    <select
                      className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                      value={formData.discountStackMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountStackMode: e.target.value as 'multiply' | 'min',
                        })
                      }
                    >
                      <option value='multiply'>乘法叠加</option>
                      <option value='min'>取最优</option>
                    </select>
                  </div>

                  <div className='flex items-center justify-between'>
                    <Label>优惠券与会员折扣叠加</Label>
                    <Switch
                      checked={formData.couponStackWithMember}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, couponStackWithMember: checked })
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <Label>优惠券与活动叠加</Label>
                    <Switch
                      checked={formData.couponStackWithCampaign}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, couponStackWithCampaign: checked })
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <Label>启用积分抵扣</Label>
                    <Switch
                      checked={formData.pointsEnabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, pointsEnabled: checked })
                      }
                    />
                  </div>

                  <div>
                    <Label>积分兑换比例（1元 = ? 积分）</Label>
                    <Input
                      type='number'
                      value={formData.pointsRate}
                      onChange={(e) =>
                        setFormData({ ...formData, pointsRate: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <Label>积分最高抵扣比例 (%)</Label>
                    <Input
                      type='number'
                      value={formData.pointsMaxRate}
                      onChange={(e) =>
                        setFormData({ ...formData, pointsMaxRate: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <Label>最低支付金额 (元)</Label>
                    <Input
                      type='number'
                      step='0.01'
                      value={formData.minPayAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, minPayAmount: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <Label>显示原价</Label>
                    <Switch
                      checked={formData.showOriginalPrice}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, showOriginalPrice: checked })
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <Label>显示会员价</Label>
                    <Switch
                      checked={formData.showMemberPrice}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, showMemberPrice: checked })
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <Label>显示节省金额</Label>
                    <Switch
                      checked={formData.showSavings}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, showSavings: checked })
                      }
                    />
                  </div>
                </div>

                <div className='flex justify-end'>
                  <Button type='submit' disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? '保存中...' : '保存配置'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

