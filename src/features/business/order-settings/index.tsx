import { useState, useEffect } from 'react'
import {
    Save,
    RotateCcw,
    Clock,
    Percent,
    Users,
    CreditCard,
    Loader2,
    AlertTriangle,
    Settings2,
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
import type { OrderSettings as OrderSettingsType } from '@/lib/api'

// 默认值
const defaultSettings: OrderSettingsType = {
    autoCancelMinutes: 15,
    autoCompleteHours: 24,
    platformFeeRate: 0.2,
    dispatchMode: 'assign',
    grabTimeoutMinutes: 30,
    allowRefundBeforeStart: true,
    refundFeeRate: 0.5,
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

                    {/* 费用设置 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-lg'>
                                <Percent className='h-5 w-5' />
                                费用设置
                            </CardTitle>
                            <CardDescription>
                                配置平台抽成和退款扣款比例
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='space-y-2'>
                                <Label htmlFor='platformFeeRate'>
                                    平台抽成比例（%）
                                </Label>
                                <Input
                                    id='platformFeeRate'
                                    type='number'
                                    min={0}
                                    max={100}
                                    value={Math.round(formData.platformFeeRate * 100)}
                                    onChange={e =>
                                        updateField(
                                            'platformFeeRate',
                                            (parseInt(e.target.value) || 0) / 100
                                        )
                                    }
                                />
                                <p className='text-muted-foreground text-xs'>
                                    从陪诊员服务收入中扣除的平台费用比例
                                </p>
                            </div>

                            <Separator />

                            <div className='space-y-2'>
                                <Label htmlFor='refundFeeRate'>
                                    取消订单扣款比例（%）
                                </Label>
                                <Input
                                    id='refundFeeRate'
                                    type='number'
                                    min={0}
                                    max={100}
                                    value={Math.round(formData.refundFeeRate * 100)}
                                    onChange={e =>
                                        updateField(
                                            'refundFeeRate',
                                            (parseInt(e.target.value) || 0) / 100
                                        )
                                    }
                                />
                                <p className='text-muted-foreground text-xs'>
                                    服务开始后取消订单时扣除的费用比例
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 退款政策 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-lg'>
                                <CreditCard className='h-5 w-5' />
                                退款政策
                            </CardTitle>
                            <CardDescription>
                                配置订单退款相关规则
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='flex items-center justify-between'>
                                <div className='space-y-0.5'>
                                    <Label className='text-base'>允许服务前退款</Label>
                                    <p className='text-muted-foreground text-sm'>
                                        服务开始前用户可申请全额退款
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.allowRefundBeforeStart}
                                    onCheckedChange={v =>
                                        updateField('allowRefundBeforeStart', v)
                                    }
                                />
                            </div>

                            <Separator />

                            <div className='bg-muted/50 rounded-lg p-4'>
                                <h4 className='text-sm font-medium mb-2'>当前退款规则说明</h4>
                                <ul className='text-muted-foreground space-y-1 text-sm'>
                                    {formData.allowRefundBeforeStart ? (
                                        <li>• 服务开始前：可申请全额退款</li>
                                    ) : (
                                        <li>• 服务开始前：不支持退款</li>
                                    )}
                                    <li>
                                        • 服务开始后：扣除{' '}
                                        {Math.round(formData.refundFeeRate * 100)}% 费用后退款
                                    </li>
                                    <li>• 服务完成后：不支持退款</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 设置说明 */}
                <Card className='mt-6'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <Settings2 className='h-5 w-5' />
                            设置说明
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-muted-foreground space-y-2 text-sm'>
                            <p>
                                <strong>订单超时设置：</strong>
                                控制订单各环节的超时时间，确保订单流程顺畅进行。
                            </p>
                            <p>
                                <strong>派单模式：</strong>
                                "抢单模式"适合陪诊员主动性强的团队；"指派模式"适合需要精细管控的场景；"混合模式"兼顾效率和灵活性。
                            </p>
                            <p>
                                <strong>费用设置：</strong>
                                平台抽成将从每笔订单的陪诊员收入中自动扣除，请根据实际运营成本合理设置。
                            </p>
                            <p>
                                <strong>退款政策：</strong>
                                合理的退款政策可以提升用户信任度，同时保护陪诊员的劳动权益。
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </Main>
        </>
    )
}
