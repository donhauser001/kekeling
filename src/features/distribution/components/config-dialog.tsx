import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { distributionApi } from '@/lib/api'

const configSchema = z.object({
  l1CommissionRate: z.coerce.number().min(0).max(100),
  l2CommissionRate: z.coerce.number().min(0).max(100),
  l3CommissionRate: z.coerce.number().min(0).max(100),
  directInviteBonus: z.coerce.number().min(0),
  maxMonthlyDistribution: z.coerce.number().min(0).nullable(),
  l2PromotionConfig: z.object({
    minOrders: z.coerce.number().min(0),
    minRating: z.coerce.number().min(0).max(5),
    minDirectInvites: z.coerce.number().min(0),
    minActiveMonths: z.coerce.number().min(0),
  }),
  l1PromotionConfig: z.object({
    minTeamSize: z.coerce.number().min(0),
    minTeamMonthlyOrders: z.coerce.number().min(0),
    minPersonalMonthlyOrders: z.coerce.number().min(0),
    requireTraining: z.boolean(),
    byInvitation: z.boolean(),
  }),
})

type ConfigFormValues = z.infer<typeof configSchema>

interface ConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfigDialog({ open, onOpenChange }: ConfigDialogProps) {
  const queryClient = useQueryClient()

  const { data: config, isLoading } = useQuery({
    queryKey: ['distribution-config'],
    queryFn: () => distributionApi.getConfig(),
    enabled: open,
  })

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      l1CommissionRate: 2,
      l2CommissionRate: 3,
      l3CommissionRate: 1,
      directInviteBonus: 50,
      maxMonthlyDistribution: null,
      l2PromotionConfig: {
        minOrders: 50,
        minRating: 4.5,
        minDirectInvites: 3,
        minActiveMonths: 3,
      },
      l1PromotionConfig: {
        minTeamSize: 10,
        minTeamMonthlyOrders: 100,
        minPersonalMonthlyOrders: 30,
        requireTraining: true,
        byInvitation: true,
      },
    },
  })

  useEffect(() => {
    if (config) {
      form.reset({
        l1CommissionRate: config.l1CommissionRate,
        l2CommissionRate: config.l2CommissionRate,
        l3CommissionRate: config.l3CommissionRate,
        directInviteBonus: config.directInviteBonus,
        maxMonthlyDistribution: config.maxMonthlyDistribution,
        l2PromotionConfig: config.l2PromotionConfig,
        l1PromotionConfig: config.l1PromotionConfig,
      })
    }
  }, [config, form])

  const updateMutation = useMutation({
    mutationFn: (data: ConfigFormValues) => distributionApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-config'] })
      toast.success('配置已保存')
      onOpenChange(false)
    },
    onError: (err: any) => {
      toast.error(err.message || '保存失败')
    },
  })

  const onSubmit = (data: ConfigFormValues) => {
    updateMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>分销配置</DialogTitle>
          <DialogDescription>配置三级分销的分润比例和晋升条件</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="commission" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="commission">分润设置</TabsTrigger>
                  <TabsTrigger value="l2-promotion">团队长晋升</TabsTrigger>
                  <TabsTrigger value="l1-promotion">合伙人晋升</TabsTrigger>
                </TabsList>

                {/* 分润设置 */}
                <TabsContent value="commission" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">各级分润比例</CardTitle>
                      <CardDescription>
                        设置各分销等级从下级订单中获取的分润比例（基于订单实付金额）
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="l1CommissionRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>城市合伙人 (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>L1 分润比例</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="l2CommissionRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>团队长 (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>L2 分润比例</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="l3CommissionRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>普通成员 (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>仅直推奖励</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">直推奖励</CardTitle>
                      <CardDescription>
                        邀请新陪诊员并完成首单后发放的一次性奖励
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="directInviteBonus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>直推奖励金额 (元)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxMonthlyDistribution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>月分润上限 (元)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="不限制"
                                value={field.value ?? ''}
                                onChange={(e) =>
                                  field.onChange(e.target.value ? Number(e.target.value) : null)
                                }
                              />
                            </FormControl>
                            <FormDescription>留空表示不限制</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 团队长晋升条件 */}
                <TabsContent value="l2-promotion" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">L3 → L2 晋升条件</CardTitle>
                      <CardDescription>
                        普通成员晋升为团队长需要满足的条件（自动晋升）
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="l2PromotionConfig.minOrders"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>最低完成订单数</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="l2PromotionConfig.minRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>最低评分</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="l2PromotionConfig.minDirectInvites"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>最低直推人数</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="l2PromotionConfig.minActiveMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>最低活跃月数</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 城市合伙人晋升条件 */}
                <TabsContent value="l1-promotion" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">L2 → L1 晋升条件</CardTitle>
                      <CardDescription>
                        团队长晋升为城市合伙人需要满足的条件（需平台审核）
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="l1PromotionConfig.minTeamSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>最低团队人数</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="l1PromotionConfig.minTeamMonthlyOrders"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>团队月订单数</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="l1PromotionConfig.minPersonalMonthlyOrders"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>个人月订单数</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="l1PromotionConfig.requireTraining"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>需要培训考核</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="l1PromotionConfig.byInvitation"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>平台邀请制</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  保存配置
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
