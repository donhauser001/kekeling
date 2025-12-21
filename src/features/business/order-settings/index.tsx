import { useState, useEffect } from 'react'
import {
    Save,
    RotateCcw,
    Clock,
    Percent,
    Users,
    Loader2,
    AlertTriangle,
    Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useOrderSettings, useUpdateOrderSettings } from '@/hooks/use-api'
import type { OrderSettings as OrderSettingsType, CancellationFeeRules } from '@/lib/api'

// 默认取消扣费规则
const defaultCancellationFeeRules: CancellationFeeRules = {
    unassigned: { enabled: true, feeRate: 0 },       // 未指派：允许退款，全额退
    assigned: { enabled: true, feeRate: 0.1 },       // 已指派：允许退款，扣10%
    beforeOneDay: { enabled: true, feeRate: 0.2 },   // 距服务超1天：允许退款，扣20%
    sameDay: { enabled: true, feeRate: 0.5 },        // 服务当天：允许退款，扣50%
    afterStart: { enabled: false, feeRate: 0.8 },    // 服务已开始：默认不允许退款
}

// 默认值
const defaultSettings: OrderSettingsType = {
    autoCancelMinutes: 15,
    autoCompleteHours: 24,
    dispatchMode: 'assign',
    grabTimeoutMinutes: 30,
    cancellationFeeRules: defaultCancellationFeeRules,
}

export function OrderSettings() {
    const { data: settings, isLoading, error } = useOrderSettings()
    const updateMutation = useUpdateOrderSettings()

    // 表单状态
    const [formData, setFormData] = useState<OrderSettingsType>(defaultSettings)
    const [hasChanges, setHasChanges] = useState(false)

    // 当数据加载完成时初始化表单
    useEffect(() => {
        if (settings) {
            setFormData(settings)
            setHasChanges(false)
        }
    }, [settings])

    // 更新表单数据
    const updateField = <K extends keyof OrderSettingsType>(
        key: K,
        value: OrderSettingsType[K]
    ) => {
        setFormData(prev => ({ ...prev, [key]: value }))
        setHasChanges(true)
    }

    // 保存设置
    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync(formData)
            toast.success('设置已保存')
            setHasChanges(false)
        } catch (err: any) {
            toast.error(err.message || '保存失败')
        }
    }

    // 重置为服务器数据
    const handleReset = () => {
        if (settings) {
            setFormData(settings)
            setHasChanges(false)
            toast.info('已重置为保存的设置')
        }
    }

    // 加载状态
    if (isLoading) {
        return (
            <>
                <Header>
                    <Search />
                    <div className='ms-auto flex items-center gap-4'>
                        <MessageButton />
                        <ThemeSwitch />
                        <ConfigDrawer />
                        <ProfileDropdown />
                    </div>
                </Header>
                <Main>
                    <div className='flex h-64 items-center justify-center'>
                        <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    </div>
                </Main>
            </>
        )
    }

    // 错误状态
    if (error) {
        return (
            <>
                <Header>
                    <Search />
                    <div className='ms-auto flex items-center gap-4'>
                        <MessageButton />
                        <ThemeSwitch />
                        <ConfigDrawer />
                        <ProfileDropdown />
                    </div>
                </Header>
                <Main>
                    <div className='flex h-64 flex-col items-center justify-center gap-2'>
                        <AlertTriangle className='h-12 w-12 text-destructive' />
                        <p className='text-muted-foreground'>加载失败，请刷新重试</p>
                    </div>
                </Main>
            </>
        )
    }

    return (
        <>
            <Header>
                <Search />
                <div className='ms-auto flex items-center gap-4'>
                    <MessageButton />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='mb-6 flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight'>接单设置</h1>
                        <p className='text-muted-foreground'>
                            配置订单超时、派单规则、费用设置等业务参数
                        </p>
                    </div>
                    <div className='flex gap-2'>
                        <Button
                            variant='outline'
                            onClick={handleReset}
                            disabled={!hasChanges}
                        >
                            <RotateCcw className='mr-2 h-4 w-4' />
                            重置
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges || updateMutation.isPending}
                        >
                            {updateMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Save className='mr-2 h-4 w-4' />
                            )}
                            保存设置
                        </Button>
                    </div>
                </div>

                <div className='grid gap-6 lg:grid-cols-2'>
                    {/* 订单超时设置 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-lg'>
                                <Clock className='h-5 w-5' />
                                订单超时设置
                            </CardTitle>
                            <CardDescription>
                                配置订单各环节的超时时间
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='space-y-2'>
                                <Label htmlFor='autoCancelMinutes'>
                                    未支付自动取消时间（分钟）
                                </Label>
                                <Input
                                    id='autoCancelMinutes'
                                    type='number'
                                    min={1}
                                    max={60}
                                    value={formData.autoCancelMinutes}
                                    onChange={e =>
                                        updateField(
                                            'autoCancelMinutes',
                                            parseInt(e.target.value) || 15
                                        )
                                    }
                                />
                                <p className='text-muted-foreground text-xs'>
                                    用户下单后超过此时间未支付，订单将自动取消
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='autoCompleteHours'>
                                    服务自动完成时间（小时）
                                </Label>
                                <Input
                                    id='autoCompleteHours'
                                    type='number'
                                    min={1}
                                    max={72}
                                    value={formData.autoCompleteHours}
                                    onChange={e =>
                                        updateField(
                                            'autoCompleteHours',
                                            parseInt(e.target.value) || 24
                                        )
                                    }
                                />
                                <p className='text-muted-foreground text-xs'>
                                    服务结束后超过此时间用户未操作，订单将自动确认完成
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 派单设置 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-lg'>
                                <Users className='h-5 w-5' />
                                派单设置
                            </CardTitle>
                            <CardDescription>
                                配置订单如何分配给陪诊员
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='space-y-3'>
                                <Label>派单模式</Label>
                                <RadioGroup
                                    value={formData.dispatchMode}
                                    onValueChange={v =>
                                        updateField('dispatchMode', v as 'grab' | 'assign' | 'mixed')
                                    }
                                >
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='grab' id='grab' />
                                        <Label htmlFor='grab' className='cursor-pointer'>
                                            抢单模式
                                            <span className='text-muted-foreground ml-2 text-xs'>
                                                陪诊员主动抢单
                                            </span>
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='assign' id='assign' />
                                        <Label htmlFor='assign' className='cursor-pointer'>
                                            指派模式
                                            <span className='text-muted-foreground ml-2 text-xs'>
                                                管理员手动指派
                                            </span>
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='mixed' id='mixed' />
                                        <Label htmlFor='mixed' className='cursor-pointer'>
                                            混合模式
                                            <span className='text-muted-foreground ml-2 text-xs'>
                                                先抢单，超时后指派
                                            </span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {(formData.dispatchMode === 'grab' ||
                                formData.dispatchMode === 'mixed') && (
                                    <div className='space-y-2'>
                                        <Label htmlFor='grabTimeoutMinutes'>
                                            抢单超时时间（分钟）
                                        </Label>
                                        <Input
                                            id='grabTimeoutMinutes'
                                            type='number'
                                            min={5}
                                            max={120}
                                            value={formData.grabTimeoutMinutes}
                                            onChange={e =>
                                                updateField(
                                                    'grabTimeoutMinutes',
                                                    parseInt(e.target.value) || 30
                                                )
                                            }
                                        />
                                        <p className='text-muted-foreground text-xs'>
                                            {formData.dispatchMode === 'mixed'
                                                ? '超过此时间无人抢单，将转为指派模式'
                                                : '超过此时间无人抢单，订单将被系统处理'}
                                        </p>
                                    </div>
                                )}
                        </CardContent>
                    </Card>

                    {/* 取消与退款规则 - 占满整行 */}
                    <Card className='lg:col-span-2'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-lg'>
                                <Percent className='h-5 w-5' />
                                取消与退款规则
                            </CardTitle>
                            <CardDescription>
                                根据订单不同阶段配置是否允许退款及扣费比例，平台抽成在服务项目中单独设置
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                {/* 未指派陪诊员 */}
                                <div className='rounded-lg border p-4 space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <Label className='text-sm font-medium'>未指派陪诊员</Label>
                                            <p className='text-muted-foreground text-xs mt-0.5'>
                                                已支付，尚未分配陪诊员
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.cancellationFeeRules?.unassigned?.enabled ?? true}
                                            onCheckedChange={v =>
                                                updateField('cancellationFeeRules', {
                                                    ...formData.cancellationFeeRules,
                                                    unassigned: {
                                                        ...formData.cancellationFeeRules?.unassigned,
                                                        enabled: v,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    {formData.cancellationFeeRules?.unassigned?.enabled ? (
                                        <div className='flex items-center gap-2 pt-1'>
                                            <span className='text-xs text-muted-foreground'>扣费比例</span>
                                            <Input
                                                type='number'
                                                min={0}
                                                max={100}
                                                className='w-20 h-8'
                                                value={Math.round((formData.cancellationFeeRules?.unassigned?.feeRate ?? 0) * 100)}
                                                onChange={e =>
                                                    updateField('cancellationFeeRules', {
                                                        ...formData.cancellationFeeRules,
                                                        unassigned: {
                                                            ...formData.cancellationFeeRules?.unassigned,
                                                            feeRate: (parseInt(e.target.value) || 0) / 100,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className='text-xs text-muted-foreground'>%</span>
                                        </div>
                                    ) : (
                                        <p className='text-xs text-destructive pt-1'>不允许退款</p>
                                    )}
                                </div>

                                {/* 已指派陪诊员 */}
                                <div className='rounded-lg border p-4 space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <Label className='text-sm font-medium'>已指派陪诊员</Label>
                                            <p className='text-muted-foreground text-xs mt-0.5'>
                                                已分配陪诊员
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.cancellationFeeRules?.assigned?.enabled ?? true}
                                            onCheckedChange={v =>
                                                updateField('cancellationFeeRules', {
                                                    ...formData.cancellationFeeRules,
                                                    assigned: {
                                                        ...formData.cancellationFeeRules?.assigned,
                                                        enabled: v,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    {formData.cancellationFeeRules?.assigned?.enabled ? (
                                        <div className='flex items-center gap-2 pt-1'>
                                            <span className='text-xs text-muted-foreground'>扣费比例</span>
                                            <Input
                                                type='number'
                                                min={0}
                                                max={100}
                                                className='w-20 h-8'
                                                value={Math.round((formData.cancellationFeeRules?.assigned?.feeRate ?? 0) * 100)}
                                                onChange={e =>
                                                    updateField('cancellationFeeRules', {
                                                        ...formData.cancellationFeeRules,
                                                        assigned: {
                                                            ...formData.cancellationFeeRules?.assigned,
                                                            feeRate: (parseInt(e.target.value) || 0) / 100,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className='text-xs text-muted-foreground'>%</span>
                                        </div>
                                    ) : (
                                        <p className='text-xs text-destructive pt-1'>不允许退款</p>
                                    )}
                                </div>

                                {/* 距服务开始超过1天 */}
                                <div className='rounded-lg border p-4 space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <Label className='text-sm font-medium'>距服务超1天</Label>
                                            <p className='text-muted-foreground text-xs mt-0.5'>
                                                距服务开始还有1天以上
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.cancellationFeeRules?.beforeOneDay?.enabled ?? true}
                                            onCheckedChange={v =>
                                                updateField('cancellationFeeRules', {
                                                    ...formData.cancellationFeeRules,
                                                    beforeOneDay: {
                                                        ...formData.cancellationFeeRules?.beforeOneDay,
                                                        enabled: v,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    {formData.cancellationFeeRules?.beforeOneDay?.enabled ? (
                                        <div className='flex items-center gap-2 pt-1'>
                                            <span className='text-xs text-muted-foreground'>扣费比例</span>
                                            <Input
                                                type='number'
                                                min={0}
                                                max={100}
                                                className='w-20 h-8'
                                                value={Math.round((formData.cancellationFeeRules?.beforeOneDay?.feeRate ?? 0) * 100)}
                                                onChange={e =>
                                                    updateField('cancellationFeeRules', {
                                                        ...formData.cancellationFeeRules,
                                                        beforeOneDay: {
                                                            ...formData.cancellationFeeRules?.beforeOneDay,
                                                            feeRate: (parseInt(e.target.value) || 0) / 100,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className='text-xs text-muted-foreground'>%</span>
                                        </div>
                                    ) : (
                                        <p className='text-xs text-destructive pt-1'>不允许退款</p>
                                    )}
                                </div>

                                {/* 服务当天 */}
                                <div className='rounded-lg border p-4 space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <Label className='text-sm font-medium'>服务当天</Label>
                                            <p className='text-muted-foreground text-xs mt-0.5'>
                                                距离服务开始不足1天
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.cancellationFeeRules?.sameDay?.enabled ?? true}
                                            onCheckedChange={v =>
                                                updateField('cancellationFeeRules', {
                                                    ...formData.cancellationFeeRules,
                                                    sameDay: {
                                                        ...formData.cancellationFeeRules?.sameDay,
                                                        enabled: v,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    {formData.cancellationFeeRules?.sameDay?.enabled ? (
                                        <div className='flex items-center gap-2 pt-1'>
                                            <span className='text-xs text-muted-foreground'>扣费比例</span>
                                            <Input
                                                type='number'
                                                min={0}
                                                max={100}
                                                className='w-20 h-8'
                                                value={Math.round((formData.cancellationFeeRules?.sameDay?.feeRate ?? 0) * 100)}
                                                onChange={e =>
                                                    updateField('cancellationFeeRules', {
                                                        ...formData.cancellationFeeRules,
                                                        sameDay: {
                                                            ...formData.cancellationFeeRules?.sameDay,
                                                            feeRate: (parseInt(e.target.value) || 0) / 100,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className='text-xs text-muted-foreground'>%</span>
                                        </div>
                                    ) : (
                                        <p className='text-xs text-destructive pt-1'>不允许退款</p>
                                    )}
                                </div>

                                {/* 服务已开始 */}
                                <div className='rounded-lg border p-4 space-y-3'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <Label className='text-sm font-medium'>服务已开始</Label>
                                            <p className='text-muted-foreground text-xs mt-0.5'>
                                                陪诊员已开始服务
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.cancellationFeeRules?.afterStart?.enabled ?? false}
                                            onCheckedChange={v =>
                                                updateField('cancellationFeeRules', {
                                                    ...formData.cancellationFeeRules,
                                                    afterStart: {
                                                        ...formData.cancellationFeeRules?.afterStart,
                                                        enabled: v,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    {formData.cancellationFeeRules?.afterStart?.enabled ? (
                                        <div className='flex items-center gap-2 pt-1'>
                                            <span className='text-xs text-muted-foreground'>扣费比例</span>
                                            <Input
                                                type='number'
                                                min={0}
                                                max={100}
                                                className='w-20 h-8'
                                                value={Math.round((formData.cancellationFeeRules?.afterStart?.feeRate ?? 0) * 100)}
                                                onChange={e =>
                                                    updateField('cancellationFeeRules', {
                                                        ...formData.cancellationFeeRules,
                                                        afterStart: {
                                                            ...formData.cancellationFeeRules?.afterStart,
                                                            feeRate: (parseInt(e.target.value) || 0) / 100,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className='text-xs text-muted-foreground'>%</span>
                                        </div>
                                    ) : (
                                        <p className='text-xs text-destructive pt-1'>不允许退款</p>
                                    )}
                                </div>

                                {/* 服务已完成 - 固定不可退款 */}
                                <div className='rounded-lg border border-dashed p-4 space-y-3 bg-muted/30'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <Label className='text-sm font-medium text-muted-foreground'>服务已完成</Label>
                                            <p className='text-muted-foreground text-xs mt-0.5'>
                                                订单已完成确认
                                            </p>
                                        </div>
                                        <Switch checked={false} disabled />
                                    </div>
                                    <p className='text-xs text-muted-foreground pt-1'>不支持取消</p>
                                </div>
                            </div>

                            {/* 规则说明提示 */}
                            <div className='mt-6 flex items-start gap-2 text-muted-foreground bg-muted/50 rounded-lg p-3'>
                                <Info className='h-4 w-4 mt-0.5 flex-shrink-0' />
                                <div className='text-xs space-y-1'>
                                    <p><strong>规则说明：</strong>订单取消时，根据当前所处阶段按对应扣费比例退款。</p>
                                    <p>例如：订单金额100元，扣费20%，则退还80元给用户，扣除的20元按服务项目抽成比例分配。</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Main>
        </>
    )
}
