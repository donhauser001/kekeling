import { useState, type JSX } from 'react'
import {
  Save,
  RotateCcw,
  Clock,
  Users,
  MapPin,
  Bell,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface SettingSection {
  id: string
  title: string
  desc: string
  icon: JSX.Element
  href: string
}

const settingSections: SettingSection[] = [
  { id: 'dispatch', title: '派单设置', desc: '配置自动派单和手动派单规则', icon: <Zap size={18} />, href: '/order-settings' },
  { id: 'timeout', title: '超时设置', desc: '配置各环节超时时间', icon: <Clock size={18} />, href: '/order-settings/timeout' },
  { id: 'matching', title: '匹配规则', desc: '配置服务人员匹配条件', icon: <Users size={18} />, href: '/order-settings/matching' },
  { id: 'area', title: '服务区域', desc: '配置可接单的地理范围', icon: <MapPin size={18} />, href: '/order-settings/area' },
  { id: 'notify', title: '通知设置', desc: '配置各环节通知方式', icon: <Bell size={18} />, href: '/order-settings/notify' },
  { id: 'verify', title: '审核设置', desc: '配置订单审核规则', icon: <ShieldCheck size={18} />, href: '/order-settings/verify' },
]

// 侧边栏导航组件
function SidebarNav({ items, activeId, onSelect }: {
  items: SettingSection[]
  activeId: string
  onSelect: (id: string) => void
}) {
  return (
    <>
      <div className='p-1 md:hidden'>
        <Select value={activeId} onValueChange={onSelect}>
          <SelectTrigger className='h-12 sm:w-48'>
            <SelectValue placeholder='选择设置项' />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                <div className='flex gap-x-4 px-2 py-1'>
                  <span className='scale-125'>{item.icon}</span>
                  <span className='text-md'>{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea
        orientation='horizontal'
        type='always'
        className='bg-background hidden w-full min-w-40 px-1 py-2 md:block'
      >
        <nav className='flex space-x-2 py-1 lg:flex-col lg:space-y-1 lg:space-x-0'>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                activeId === item.id
                  ? 'bg-muted hover:bg-accent'
                  : 'hover:bg-accent hover:underline',
                'justify-start'
              )}
            >
              <span className='me-2'>{item.icon}</span>
              {item.title}
            </button>
          ))}
        </nav>
      </ScrollArea>
    </>
  )
}

// 内容区组件
function ContentSection({ title, desc, children }: {
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>{title}</h3>
        <p className='text-muted-foreground text-sm'>{desc}</p>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        <div className='-mx-1 px-1.5 lg:max-w-xl'>{children}</div>
      </div>
    </div>
  )
}

export function OrderSettings() {
  const [activeSection, setActiveSection] = useState('dispatch')
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
  const [minRating, setMinRating] = useState(90)
  const [maxDistance, setMaxDistance] = useState(10)
  const [requireCertification, setRequireCertification] = useState(true)

  const currentSection = settingSections.find(s => s.id === activeSection)

  const handleSave = () => {
    setHasChanges(false)
  }

  const handleReset = () => {
    setHasChanges(false)
  }

  const markChanged = () => {
    setHasChanges(true)
  }

  const renderDispatchSettings = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <Label className='text-base'>自动派单</Label>
          <p className='text-muted-foreground text-sm'>开启后系统将自动派发订单给合适的服务人员</p>
        </div>
        <Switch
          checked={autoDispatch}
          onCheckedChange={(v) => { setAutoDispatch(v); markChanged() }}
        />
      </div>

      <Separator />

      <div className='space-y-2'>
        <Label>派单超时时间（秒）</Label>
        <Input
          type='number'
          value={dispatchTimeout}
          onChange={(e) => { setDispatchTimeout(Number(e.target.value)); markChanged() }}
        />
        <p className='text-muted-foreground text-xs'>服务人员未响应时，自动转派下一位</p>
      </div>

      <div className='space-y-2'>
        <Label>最大重试次数</Label>
        <Input
          type='number'
          value={maxRetry}
          onChange={(e) => { setMaxRetry(Number(e.target.value)); markChanged() }}
        />
      </div>

      <Separator />

      <div className='space-y-4'>
        <Label className='text-base'>派单优先级</Label>
        <p className='text-muted-foreground text-sm'>选择派单时的优先考虑因素</p>

        <div className='flex items-center justify-between'>
          <Label>按评分优先</Label>
          <Switch
            checked={priorityByRating}
            onCheckedChange={(v) => { setPriorityByRating(v); markChanged() }}
          />
        </div>
        <div className='flex items-center justify-between'>
          <Label>按距离优先</Label>
          <Switch
            checked={priorityByDistance}
            onCheckedChange={(v) => { setPriorityByDistance(v); markChanged() }}
          />
        </div>
        <div className='flex items-center justify-between'>
          <Label>按接单量均衡</Label>
          <Switch
            checked={priorityByOrderCount}
            onCheckedChange={(v) => { setPriorityByOrderCount(v); markChanged() }}
          />
        </div>
      </div>
    </div>
  )

  const renderTimeoutSettings = () => (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label>接单超时（分钟）</Label>
        <Input
          type='number'
          value={acceptTimeout}
          onChange={(e) => { setAcceptTimeout(Number(e.target.value)); markChanged() }}
        />
        <p className='text-muted-foreground text-xs'>服务人员需在此时间内接单</p>
      </div>

      <div className='space-y-2'>
        <Label>到达超时（分钟）</Label>
        <Input
          type='number'
          value={arriveTimeout}
          onChange={(e) => { setArriveTimeout(Number(e.target.value)); markChanged() }}
        />
        <p className='text-muted-foreground text-xs'>接单后需在此时间内到达服务地点</p>
      </div>

      <div className='space-y-2'>
        <Label>服务超时（分钟）</Label>
        <Input
          type='number'
          value={serviceTimeout}
          onChange={(e) => { setServiceTimeout(Number(e.target.value)); markChanged() }}
        />
        <p className='text-muted-foreground text-xs'>单次服务的最长时间限制</p>
      </div>

      <Separator />

      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <Label className='text-base'>超时自动取消</Label>
          <p className='text-muted-foreground text-sm'>超时未接单时自动取消并退款</p>
        </div>
        <Switch
          checked={autoCancel}
          onCheckedChange={(v) => { setAutoCancel(v); markChanged() }}
        />
      </div>
    </div>
  )

  const renderMatchingSettings = () => (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label>最低满意度要求 (%)</Label>
        <Input
          type='number'
          value={minRating}
          onChange={(e) => { setMinRating(Number(e.target.value)); markChanged() }}
          max={100}
          min={60}
        />
        <p className='text-muted-foreground text-xs'>只有满意度达到此标准的服务人员才能接单</p>
      </div>

      <div className='space-y-2'>
        <Label>最大服务距离（公里）</Label>
        <Input
          type='number'
          value={maxDistance}
          onChange={(e) => { setMaxDistance(Number(e.target.value)); markChanged() }}
          max={50}
          min={1}
        />
        <p className='text-muted-foreground text-xs'>服务人员与服务地点的最大距离</p>
      </div>

      <Separator />

      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <Label className='text-base'>要求资质认证</Label>
          <p className='text-muted-foreground text-sm'>只派单给已通过资质认证的服务人员</p>
        </div>
        <Switch
          checked={requireCertification}
          onCheckedChange={(v) => { setRequireCertification(v); markChanged() }}
        />
      </div>
    </div>
  )

  const renderAreaSettings = () => (
    <div className='space-y-4'>
      <div className='text-muted-foreground flex h-40 items-center justify-center rounded-lg border-2 border-dashed'>
        地图区域选择组件（开发中）
      </div>
      <p className='text-muted-foreground text-sm'>配置可接单的地理区域范围，超出范围的订单将不会被推送。</p>
    </div>
  )

  const renderNotifySettings = () => (
    <div className='space-y-4'>
      {['新订单通知', '接单成功通知', '服务开始通知', '服务完成通知', '评价提醒通知'].map((item, index) => (
        <div key={index} className='flex items-center justify-between py-2'>
          <Label>{item}</Label>
          <div className='flex gap-4'>
            <label className='flex items-center gap-2 text-sm'>
              <Checkbox defaultChecked />
              短信
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <Checkbox defaultChecked />
              推送
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <Checkbox />
              邮件
            </label>
          </div>
        </div>
      ))}
    </div>
  )

  const renderVerifySettings = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <Label className='text-base'>大额订单审核</Label>
          <p className='text-muted-foreground text-sm'>金额超过指定数额的订单需人工审核</p>
        </div>
        <Switch defaultChecked />
      </div>

      <div className='space-y-2'>
        <Label>审核金额阈值（元）</Label>
        <Input type='number' defaultValue={1000} />
      </div>

      <Separator />

      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <Label className='text-base'>首单审核</Label>
          <p className='text-muted-foreground text-sm'>新用户首单需人工审核</p>
        </div>
        <Switch />
      </div>

      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <Label className='text-base'>异常订单审核</Label>
          <p className='text-muted-foreground text-sm'>系统检测到异常的订单需人工审核</p>
        </div>
        <Switch defaultChecked />
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'dispatch':
        return renderDispatchSettings()
      case 'timeout':
        return renderTimeoutSettings()
      case 'matching':
        return renderMatchingSettings()
      case 'area':
        return renderAreaSettings()
      case 'notify':
        return renderNotifySettings()
      case 'verify':
        return renderVerifySettings()
      default:
        return null
    }
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

      <Main fixed>
        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              接单设置
            </h1>
            <p className='text-muted-foreground'>
              配置订单派发、匹配、超时等规则
            </p>
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
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav
              items={settingSections}
              activeId={activeSection}
              onSelect={setActiveSection}
            />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            {currentSection && (
              <ContentSection title={currentSection.title} desc={currentSection.desc}>
                {renderContent()}
              </ContentSection>
            )}
          </div>
        </div>
      </Main>
    </>
  )
}
