import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Clock, Wallet, AlertCircle, Info, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { settlementApi, type UpdateSettlementConfigDto } from '@/lib/api'

const formSchema = z.object({
    minWithdrawAmount: z.number().min(0),
    withdrawFeeRate: z.number().min(0).max(1),
    withdrawFeeFixed: z.number().min(0),
    settlementMode: z.enum(['realtime', 'frozen']),
    settlementDays: z.number().min(0).max(30),
})

type FormData = z.infer<typeof formSchema>

export function SettlementForm() {
    const queryClient = useQueryClient()

    // 获取配置
    const { data: config, isLoading } = useQuery({
        queryKey: ['settlement-config'],
        queryFn: settlementApi.getConfig,
    })

    // 获取待解冻统计
    const { data: unfreezeStats } = useQuery({
        queryKey: ['pending-unfreeze'],
        queryFn: settlementApi.getPendingUnfreeze,
    })

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        values: {
            minWithdrawAmount: config?.minWithdrawAmount ?? 100,
            withdrawFeeRate: config?.withdrawFeeRate ?? 0,
            withdrawFeeFixed: config?.withdrawFeeFixed ?? 0,
            settlementMode: config?.settlementMode ?? 'realtime',
            settlementDays: config?.settlementDays ?? 0,
        },
    })

    // 更新配置
    const updateMutation = useMutation({
        mutationFn: (data: UpdateSettlementConfigDto) => settlementApi.updateConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settlement-config'] })
            toast.success('配置已保存')
        },
        onError: (err: Error) => {
            toast.error(err.message || '保存失败')
        },
    })

    const onSubmit = (data: FormData) => {
        updateMutation.mutate(data)
    }

    const settlementMode = form.watch('settlementMode')
    const settlementDays = form.watch('settlementDays')

    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 待解冻资金统计 */}
            {unfreezeStats && (unfreezeStats.totalPending.count > 0 || unfreezeStats.overdueUnfreeze.count > 0) && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            冻结资金统计
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">待解冻总额</p>
                                <p className="text-lg font-semibold text-orange-600">
                                    ¥{unfreezeStats.totalPending.amount.toFixed(2)}
                                    <span className="text-xs text-muted-foreground ml-1">({unfreezeStats.totalPending.count}笔)</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">今日将解冻</p>
                                <p className="text-lg font-semibold text-green-600">
                                    ¥{unfreezeStats.todayUnfreeze.amount.toFixed(2)}
                                    <span className="text-xs text-muted-foreground ml-1">({unfreezeStats.todayUnfreeze.count}笔)</span>
                                </p>
                            </div>
                            {unfreezeStats.overdueUnfreeze.count > 0 && (
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 text-red-500" />
                                        已过期未解冻
                                    </p>
                                    <p className="text-lg font-semibold text-red-600">
                                        ¥{unfreezeStats.overdueUnfreeze.amount.toFixed(2)}
                                        <span className="text-xs text-muted-foreground ml-1">({unfreezeStats.overdueUnfreeze.count}笔)</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 结算模式设置 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        结算模式
                    </CardTitle>
                    <CardDescription>
                        配置订单完成后收入何时到账
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">冻结期结算</Label>
                            <p className="text-sm text-muted-foreground">
                                {settlementMode === 'frozen'
                                    ? `订单完成后收入冻结 ${settlementDays} 天，期满后自动解冻到可用余额`
                                    : '订单完成后收入立即到账，可直接提现'
                                }
                            </p>
                        </div>
                        <Switch
                            checked={settlementMode === 'frozen'}
                            onCheckedChange={(checked) => {
                                form.setValue('settlementMode', checked ? 'frozen' : 'realtime')
                                if (!checked) {
                                    form.setValue('settlementDays', 0)
                                } else if (settlementDays === 0) {
                                    form.setValue('settlementDays', 7)
                                }
                            }}
                        />
                    </div>

                    {settlementMode === 'frozen' && (
                        <div className="space-y-2">
                            <Label>冻结天数</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={1}
                                    max={30}
                                    {...form.register('settlementDays', { valueAsNumber: true })}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">天</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                订单完成后，收入将冻结指定天数后自动解冻。建议 3-7 天，给用户退款/投诉的缓冲期。
                            </p>
                        </div>
                    )}

                    <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                        <Info className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium">结算流程说明</p>
                            <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
                                <li>订单完成 → 计算分成 → {settlementMode === 'frozen' ? '进入冻结金额' : '直接进入可用余额'}</li>
                                {settlementMode === 'frozen' && (
                                    <li>冻结期满 → 系统自动解冻 → 进入可用余额</li>
                                )}
                                <li>可用余额 → 发起提现 → 审核通过 → 打款</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 提现设置 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        提现设置
                    </CardTitle>
                    <CardDescription>
                        配置提现的最低金额和手续费
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>最低提现金额</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">¥</span>
                            <Input
                                type="number"
                                min={0}
                                step={0.01}
                                {...form.register('minWithdrawAmount', { valueAsNumber: true })}
                                className="w-32"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            可用余额达到此金额后才能发起提现申请
                        </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>提现手续费率</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.001}
                                    {...form.register('withdrawFeeRate', { valueAsNumber: true })}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">
                                    ({(form.watch('withdrawFeeRate') * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>固定手续费</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">¥</span>
                                <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    {...form.register('withdrawFeeFixed', { valueAsNumber: true })}
                                    className="w-24"
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        实际手续费 = 提现金额 × 手续费率 + 固定手续费。设为 0 表示无手续费。
                    </p>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    保存设置
                </Button>
            </div>
        </form>
    )
}

