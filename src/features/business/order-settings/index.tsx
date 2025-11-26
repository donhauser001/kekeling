import { useState } from 'react'
import {
    ClipboardCheck,
    Save,
    RotateCcw,
    Clock,
    Users,
    MapPin,
    Bell,
    ShieldCheck,
    Zap,
    Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

interface SettingSection {
    id: string
    title: string
    description: string
    icon: typeof Clock
    color: string
}

const settingSections: SettingSection[] = [
    { id: 'dispatch', title: '派单设置', description: '配置自动派单和手动派单规则', icon: Zap, color: 'bg-blue-500' },
    { id: 'timeout', title: '超时设置', description: '配置各环节超时时间和处理方式', icon: Clock, color: 'bg-orange-500' },
    { id: 'matching', title: '匹配规则', description: '配置服务人员匹配优先级和条件', icon: Users, color: 'bg-green-500' },
    { id: 'area', title: '服务区域', description: '配置可接单的地理区域范围', icon: MapPin, color: 'bg-purple-500' },
    { id: 'notify', title: '通知设置', description: '配置各环节的通知方式和内容', icon: Bell, color: 'bg-pink-500' },
    { id: 'verify', title: '审核设置', description: '配置订单审核规则和流程', icon: ShieldCheck, color: 'bg-cyan-500' },
]

export function OrderSettings() {
    const [activeTab, setActiveTab] = useState('dispatch')
    const [hasChanges, setHasChanges] = useState(false)

    // 派单设置
    const [autoDispatch, setAutoDispatch] = useState(true)
    const [dispatchTimeout, setDispatchTimeout] = useState(30)
    const [maxRetry, setMaxRetry] = useState(3)
    const [priorityByRating, setPriorityByRating] = useState(true)
    const [priorityByDistance, setPriorityByDistance] = useState(true)
    const [priorityByOrderCount, setPriorityByOrderCount] = useState(false)

    // 超时设置
    const [acceptTimeout, setAcceptTimeout] = useState(15)
    const [arriveTimeout, setArriveTimeout] = useState(60)
    const [serviceTimeout, setServiceTimeout] = useState(480)
    const [autoCancel, setAutoCancel] = useState(true)

    // 匹配规则
    const [minRating, setMinRating] = useState([90])
    const [maxDistance, setMaxDistance] = useState([10])
    const [requireCertification, setRequireCertification] = useState(true)

    const handleSave = () => {
        setHasChanges(false)
        // 保存设置
    }

    const handleReset = () => {
        setHasChanges(false)
        // 重置设置
    }

    const markChanged = () => {
        setHasChanges(true)
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
                        <p className='text-muted-foreground'>配置订单派发、匹配、超时等规则</p>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant='outline' onClick={handleReset} disabled={!hasChanges}>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            重置
                        </Button>
                        <Button onClick={handleSave} disabled={!hasChanges}>
                            <Save className='mr-2 h-4 w-4' />
                            保存设置
                        </Button>
                    </div>
                </div>

                <div className='grid gap-6 lg:grid-cols-4'>
                    {/* 左侧导航 */}
                    <Card className='lg:col-span-1'>
                        <CardHeader>
                            <CardTitle className='text-base'>设置分类</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-1 p-2'>
                            {settingSections.map(section => {
                                const Icon = section.icon
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveTab(section.id)}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                                            activeTab === section.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                        )}
                                    >
                                        <div className={cn(
                                            'flex h-8 w-8 items-center justify-center rounded-md',
                                            activeTab === section.id ? 'bg-primary-foreground/20' : section.color
                                        )}>
                                            <Icon className={cn('h-4 w-4', activeTab === section.id ? '' : 'text-white')} />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='font-medium text-sm'>{section.title}</div>
                                            <div className={cn(
                                                'text-xs truncate',
                                                activeTab === section.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                            )}>
                                                {section.description}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </CardContent>
                    </Card>

                    {/* 右侧内容 */}
                    <div className='lg:col-span-3'>
                        {activeTab === 'dispatch' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <Zap className='h-5 w-5' />
                                        派单设置
                                    </CardTitle>
                                    <CardDescription>配置订单自动派发和重试规则</CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-6'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <Label className='text-base'>自动派单</Label>
                                            <p className='text-muted-foreground text-sm'>开启后系统将自动派发订单给合适的服务人员</p>
                                        </div>
                                        <Switch
                                            checked={autoDispatch}
                                            onCheckedChange={(v) => { setAutoDispatch(v); markChanged() }}
                                        />
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <Label>派单超时时间（秒）</Label>
                                            <Badge variant='outline'>{dispatchTimeout} 秒</Badge>
                                        </div>
                                        <Input
                                            type='number'
                                            value={dispatchTimeout}
                                            onChange={(e) => { setDispatchTimeout(Number(e.target.value)); markChanged() }}
                                            className='max-w-[200px]'
                                        />
                                        <p className='text-muted-foreground text-xs'>服务人员未响应时，自动转派下一位</p>
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <Label>最大重试次数</Label>
                                            <Badge variant='outline'>{maxRetry} 次</Badge>
                                        </div>
                                        <Input
                                            type='number'
                                            value={maxRetry}
                                            onChange={(e) => { setMaxRetry(Number(e.target.value)); markChanged() }}
                                            className='max-w-[200px]'
                                        />
                                    </div>

                                    <div className='border-t pt-4'>
                                        <Label className='text-base'>派单优先级</Label>
                                        <p className='text-muted-foreground mb-4 text-sm'>选择派单时的优先考虑因素</p>
                                        <div className='space-y-3'>
                                            <div className='flex items-center justify-between'>
                                                <span>按评分优先</span>
                                                <Switch
                                                    checked={priorityByRating}
                                                    onCheckedChange={(v) => { setPriorityByRating(v); markChanged() }}
                                                />
                                            </div>
                                            <div className='flex items-center justify-between'>
                                                <span>按距离优先</span>
                                                <Switch
                                                    checked={priorityByDistance}
                                                    onCheckedChange={(v) => { setPriorityByDistance(v); markChanged() }}
                                                />
                                            </div>
                                            <div className='flex items-center justify-between'>
                                                <span>按接单量均衡</span>
                                                <Switch
                                                    checked={priorityByOrderCount}
                                                    onCheckedChange={(v) => { setPriorityByOrderCount(v); markChanged() }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'timeout' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <Clock className='h-5 w-5' />
                                        超时设置
                                    </CardTitle>
                                    <CardDescription>配置各服务环节的超时时间</CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-6'>
                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <Label>接单超时（分钟）</Label>
                                            <Badge variant='outline'>{acceptTimeout} 分钟</Badge>
                                        </div>
                                        <Input
                                            type='number'
                                            value={acceptTimeout}
                                            onChange={(e) => { setAcceptTimeout(Number(e.target.value)); markChanged() }}
                                            className='max-w-[200px]'
                                        />
                                        <p className='text-muted-foreground text-xs'>服务人员需在此时间内接单</p>
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <Label>到达超时（分钟）</Label>
                                            <Badge variant='outline'>{arriveTimeout} 分钟</Badge>
                                        </div>
                                        <Input
                                            type='number'
                                            value={arriveTimeout}
                                            onChange={(e) => { setArriveTimeout(Number(e.target.value)); markChanged() }}
                                            className='max-w-[200px]'
                                        />
                                        <p className='text-muted-foreground text-xs'>接单后需在此时间内到达服务地点</p>
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <Label>服务超时（分钟）</Label>
                                            <Badge variant='outline'>{serviceTimeout} 分钟</Badge>
                                        </div>
                                        <Input
                                            type='number'
                                            value={serviceTimeout}
                                            onChange={(e) => { setServiceTimeout(Number(e.target.value)); markChanged() }}
                                            className='max-w-[200px]'
                                        />
                                        <p className='text-muted-foreground text-xs'>单次服务的最长时间限制</p>
                                    </div>

                                    <div className='flex items-center justify-between border-t pt-4'>
                                        <div>
                                            <Label className='text-base'>超时自动取消</Label>
                                            <p className='text-muted-foreground text-sm'>超时未接单时自动取消并退款</p>
                                        </div>
                                        <Switch
                                            checked={autoCancel}
                                            onCheckedChange={(v) => { setAutoCancel(v); markChanged() }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'matching' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <Users className='h-5 w-5' />
                                        匹配规则
                                    </CardTitle>
                                    <CardDescription>配置服务人员的匹配条件</CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-6'>
                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <Label>最低满意度要求</Label>
                                            <Badge variant='outline'>{minRating[0]}%</Badge>
                                        </div>
                                        <Slider
                                            value={minRating}
                                            onValueChange={(v) => { setMinRating(v); markChanged() }}
                                            max={100}
                                            min={60}
                                            step={5}
                                        />
                                        <p className='text-muted-foreground text-xs'>只有满意度达到此标准的服务人员才能接单</p>
                                    </div>

                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <Label>最大服务距离（公里）</Label>
                                            <Badge variant='outline'>{maxDistance[0]} km</Badge>
                                        </div>
                                        <Slider
                                            value={maxDistance}
                                            onValueChange={(v) => { setMaxDistance(v); markChanged() }}
                                            max={50}
                                            min={1}
                                            step={1}
                                        />
                                        <p className='text-muted-foreground text-xs'>服务人员与服务地点的最大距离</p>
                                    </div>

                                    <div className='flex items-center justify-between border-t pt-4'>
                                        <div>
                                            <Label className='text-base'>要求资质认证</Label>
                                            <p className='text-muted-foreground text-sm'>只派单给已通过资质认证的服务人员</p>
                                        </div>
                                        <Switch
                                            checked={requireCertification}
                                            onCheckedChange={(v) => { setRequireCertification(v); markChanged() }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'area' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <MapPin className='h-5 w-5' />
                                        服务区域
                                    </CardTitle>
                                    <CardDescription>配置可接单的地理区域范围</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='text-muted-foreground flex h-40 items-center justify-center rounded-lg border-2 border-dashed'>
                                        地图区域选择组件（开发中）
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'notify' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <Bell className='h-5 w-5' />
                                        通知设置
                                    </CardTitle>
                                    <CardDescription>配置各环节的通知方式</CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    {['新订单通知', '接单成功通知', '服务开始通知', '服务完成通知', '评价提醒通知'].map((item, index) => (
                                        <div key={index} className='flex items-center justify-between'>
                                            <span>{item}</span>
                                            <div className='flex gap-4'>
                                                <label className='flex items-center gap-1.5 text-sm'>
                                                    <input type='checkbox' defaultChecked className='rounded' />
                                                    短信
                                                </label>
                                                <label className='flex items-center gap-1.5 text-sm'>
                                                    <input type='checkbox' defaultChecked className='rounded' />
                                                    推送
                                                </label>
                                                <label className='flex items-center gap-1.5 text-sm'>
                                                    <input type='checkbox' className='rounded' />
                                                    邮件
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'verify' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <ShieldCheck className='h-5 w-5' />
                                        审核设置
                                    </CardTitle>
                                    <CardDescription>配置订单审核规则</CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <Label className='text-base'>大额订单审核</Label>
                                            <p className='text-muted-foreground text-sm'>金额超过指定数额的订单需人工审核</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>审核金额阈值（元）</Label>
                                        <Input type='number' defaultValue={1000} className='max-w-[200px]' />
                                    </div>
                                    <div className='flex items-center justify-between border-t pt-4'>
                                        <div>
                                            <Label className='text-base'>首单审核</Label>
                                            <p className='text-muted-foreground text-sm'>新用户首单需人工审核</p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <Label className='text-base'>异常订单审核</Label>
                                            <p className='text-muted-foreground text-sm'>系统检测到异常的订单需人工审核</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </Main>
        </>
    )
}

