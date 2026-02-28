import { useState } from 'react'
import {
  Search as SearchIcon,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  User,
  ReceiptText,
} from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function FinanceInvoices() {
  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* 标题 */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>发票管理</h1>
          <p className='text-muted-foreground'>管理用户的发票申请</p>
        </div>

        {/* 统计卡片 */}
        <div className='mb-6 grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-yellow-50 p-3'>
                <Clock className='h-5 w-5 text-yellow-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>待处理</p>
                <p className='text-2xl font-bold'>0</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-blue-50 p-3'>
                <FileText className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>处理中</p>
                <p className='text-2xl font-bold'>0</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-green-50 p-3'>
                <CheckCircle className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>已开票</p>
                <p className='text-2xl font-bold'>0</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-purple-50 p-3'>
                <ReceiptText className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>总申请</p>
                <p className='text-2xl font-bold'>0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <div className='mb-4 flex flex-wrap items-center gap-4'>
          <div className='relative flex-1 md:max-w-sm'>
            <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='搜索发票抬头、用户手机号...'
              className='pl-9'
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='全部状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              <SelectItem value='pending'>待处理</SelectItem>
              <SelectItem value='processing'>处理中</SelectItem>
              <SelectItem value='completed'>已开票</SelectItem>
              <SelectItem value='rejected'>已驳回</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 空状态 */}
        <Card className='p-12'>
          <div className='flex flex-col items-center justify-center text-center'>
            <div className='rounded-full bg-muted p-4 mb-4'>
              <FileText className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>暂无发票申请</h3>
            <p className='text-muted-foreground text-sm max-w-sm'>
              用户提交的发票申请将显示在这里。您可以在此处理开票请求、上传发票文件或驳回申请。
            </p>
            <div className='mt-6 grid grid-cols-2 gap-4 text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <User className='h-4 w-4' />
                <span>个人发票</span>
              </div>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Building2 className='h-4 w-4' />
                <span>企业发票</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 说明卡片 */}
        <Card className='mt-6'>
          <CardContent className='p-6'>
            <h3 className='font-semibold mb-4'>发票管理说明</h3>
            <div className='grid gap-4 md:grid-cols-2 text-sm text-muted-foreground'>
              <div>
                <h4 className='font-medium text-foreground mb-2'>支持的发票类型</h4>
                <ul className='list-disc list-inside space-y-1'>
                  <li>个人普通发票</li>
                  <li>企业增值税普通发票</li>
                  <li>企业增值税专用发票</li>
                </ul>
              </div>
              <div>
                <h4 className='font-medium text-foreground mb-2'>开票流程</h4>
                <ul className='list-disc list-inside space-y-1'>
                  <li>用户提交开票申请</li>
                  <li>审核开票信息</li>
                  <li>开具电子发票</li>
                  <li>发送至用户邮箱</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
