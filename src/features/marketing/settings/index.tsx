import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Settings, Crown, Gift, Ticket, Megaphone, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { marketingSettingsApi, pricingConfigApi, type MarketingSettings, type PricingConfig } from '@/lib/api'

const topNav = [
  { title: '功能开关', href: '/marketing/settings', isActive: true },
  { title: '价格配置', href: '/marketing/settings/pricing', isActive: false },
]

export function MarketingSettingsPage() {
  const queryClient = useQueryClient()

  // 功能开关配置
  const { data: marketingSettings, isLoading: marketingLoading } = useQuery({
    queryKey: ['marketing-settings'],
    queryFn: () => marketingSettingsApi.get(),
  })

  // 价格配置
  const { data: pricingConfig, isLoading: pricingLoading } = useQuery({
    queryKey: ['pricing-config'],
    queryFn: () => pricingConfigApi.get(),
  })

  const [marketingForm, setMarketingForm] = useState<MarketingSettings>({
    membershipEnabled: true,
    pointsEnabled: true,
    couponsEnabled: true,
    campaignsEnabled: true,
  })

  const [pricingForm, setPricingForm] = useState<Partial<PricingConfig>>({
    discountStackMode: 'multiply',
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

  // 数据加载后更新表单
  useEffect(() => {
    if (marketingSettings) {
      setMarketingForm(marketingSettings)
    }
  }, [marketingSettings])

  useEffect(() => {
    if (pricingConfig) {
      setPricingForm(pricingConfig)
    }
  }, [pricingConfig])

  const updateMarketingMutation = useMutation({
    mutationFn: (data: Partial<MarketingSettings>) => marketingSettingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-settings'] })
      toast.success('功能开关配置已保存')
    },
    onError: (error: Error) => {
      toast.error(error.message || '保存失败')
    },
  })

  const updatePricingMutation = useMutation({
    mutationFn: (data: Partial<PricingConfig>) => pricingConfigApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-config'] })
      toast.success('价格配置已保存')
    },
    onError: (error: Error) => {
      toast.error(error.message || '保存失败')
    },
  })

  const handleMarketingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMarketingMutation.mutate(marketingForm)
  }

  const handlePricingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePricingMutation.mutate(pricingForm)
  }

  const isLoading = marketingLoading || pricingLoading

  const featureItems = [
    {
      key: 'membershipEnabled',
      icon: Crown,
      title: '会员系统',
      description: '启用会员卡、会员权益、会员折扣等功能',
      color: 'text-amber-500',
    },
    {
      key: 'pointsEnabled',
      icon: Gift,
      title: '积分系统',
      description: '启用积分签到、积分任务、积分抵扣等功能',
      color: 'text-purple-500',
    },
    {
      key: 'couponsEnabled',
      icon: Ticket,
      title: '优惠券系统',
      description: '启用优惠券发放、领取、使用等功能',
      color: 'text-blue-500',
    },
    {
      key: 'campaignsEnabled',
      icon: Megaphone,
      title: '营销活动',
      description: '启用限时活动、满减、秒杀等功能',
      color: 'text-red-500',
    },
  ]

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>营销设置</h1>
          <p className='text-muted-foreground'>管理营销功能开关和价格计算规则</p>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          {/* 功能开关配置 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                功能开关
              </CardTitle>
              <CardDescription>
                控制营销功能模块的启用/关闭状态，关闭后相关页面和功能将不可见
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='py-8 text-center text-muted-foreground'>加载中...</div>
              ) : (
                <form onSubmit={handleMarketingSubmit} className='space-y-4'>
                  {featureItems.map((item) => {
                    const Icon = item.icon
                    const key = item.key as keyof MarketingSettings
                    return (
                      <div
                        key={key}
                        className='flex items-center justify-between rounded-lg border p-4'
                      >
                        <div className='flex items-center gap-3'>
                          <div className={`rounded-lg bg-muted p-2 ${item.color}`}>
                            <Icon className='h-5 w-5' />
                          </div>
                          <div>
                            <Label className='text-base font-medium'>{item.title}</Label>
                            <p className='text-sm text-muted-foreground'>
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={marketingForm[key]}
                          onCheckedChange={(checked) =>
                            setMarketingForm({ ...marketingForm, [key]: checked })
                          }
                        />
                      </div>
                    )
                  })}

                  <div className='flex justify-end pt-4'>
                    <Button type='submit' disabled={updateMarketingMutation.isPending}>
                      {updateMarketingMutation.isPending ? '保存中...' : '保存功能开关'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* 价格配置 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' />
                价格引擎配置
              </CardTitle>
              <CardDescription>
                配置价格计算规则、折扣叠加方式和展示选项
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='py-8 text-center text-muted-foreground'>加载中...</div>
              ) : (
                <form onSubmit={handlePricingSubmit} className='space-y-4'>
                  <div>
                    <Label>折扣叠加模式</Label>
                    <select
                      className='mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                      value={pricingForm.discountStackMode}
                      onChange={(e) =>
                        setPricingForm({
                          ...pricingForm,
                          discountStackMode: e.target.value as 'multiply' | 'best',
                        })
                      }
                    >
                      <option value='multiply'>乘法叠加（折上折）</option>
                      <option value='best'>取最优（使用最低价）</option>
                    </select>
                  </div>

                  <Separator />

                  <div className='space-y-3'>
                    <Label className='text-base'>折扣叠加规则</Label>
                    <div className='flex items-center justify-between'>
                      <Label className='font-normal'>优惠券与会员折扣叠加</Label>
                      <Switch
                        checked={pricingForm.couponStackWithMember}
                        onCheckedChange={(checked) =>
                          setPricingForm({ ...pricingForm, couponStackWithMember: checked })
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <Label className='font-normal'>优惠券与活动叠加</Label>
                      <Switch
                        checked={pricingForm.couponStackWithCampaign}
                        onCheckedChange={(checked) =>
                          setPricingForm({ ...pricingForm, couponStackWithCampaign: checked })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-3'>
                    <Label className='text-base'>积分抵扣</Label>
                    <div className='flex items-center justify-between'>
                      <Label className='font-normal'>启用积分抵扣</Label>
                      <Switch
                        checked={pricingForm.pointsEnabled}
                        onCheckedChange={(checked) =>
                          setPricingForm({ ...pricingForm, pointsEnabled: checked })
                        }
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label>积分兑换比例（1元 = ? 积分）</Label>
                        <Input
                          type='number'
                          value={pricingForm.pointsRate}
                          onChange={(e) =>
                            setPricingForm({ ...pricingForm, pointsRate: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label>积分最高抵扣比例 (%)</Label>
                        <Input
                          type='number'
                          value={pricingForm.pointsMaxRate}
                          onChange={(e) =>
                            setPricingForm({ ...pricingForm, pointsMaxRate: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>最低支付金额 (元)</Label>
                    <Input
                      type='number'
                      step='0.01'
                      value={pricingForm.minPayAmount}
                      onChange={(e) =>
                        setPricingForm({ ...pricingForm, minPayAmount: Number(e.target.value) })
                      }
                    />
                  </div>

                  <Separator />

                  <div className='space-y-3'>
                    <Label className='text-base'>价格展示</Label>
                    <div className='flex items-center justify-between'>
                      <Label className='font-normal'>显示原价</Label>
                      <Switch
                        checked={pricingForm.showOriginalPrice}
                        onCheckedChange={(checked) =>
                          setPricingForm({ ...pricingForm, showOriginalPrice: checked })
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <Label className='font-normal'>显示会员价</Label>
                      <Switch
                        checked={pricingForm.showMemberPrice}
                        onCheckedChange={(checked) =>
                          setPricingForm({ ...pricingForm, showMemberPrice: checked })
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <Label className='font-normal'>显示节省金额</Label>
                      <Switch
                        checked={pricingForm.showSavings}
                        onCheckedChange={(checked) =>
                          setPricingForm({ ...pricingForm, showSavings: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className='flex justify-end pt-4'>
                    <Button type='submit' disabled={updatePricingMutation.isPending}>
                      {updatePricingMutation.isPending ? '保存中...' : '保存价格配置'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
