import { useState } from 'react'
import {
  Search as SearchIcon,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Wallet,
  Snowflake,
  Sun,
} from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SimplePagination } from '@/components/simple-pagination'
import { useQuery } from '@tanstack/react-query'
import { request, type PaginatedData } from '@/lib/api'

// 流水类型
type TransactionType = 'income' | 'withdraw' | 'refund' | 'frozen' | 'unfrozen'

interface WalletTransaction {
  id: string
  walletId: string
  type: TransactionType
  amount: string
  balanceAfter: string
  orderId: string | null
  withdrawId: string | null
  title: string
  remark: string | null
  unfreezeAt: string | null
  unfrozen: boolean
  createdAt: string
  wallet?: {
    id: string
    escortId: string
    escort?: {
      id: string
      name: string
      phone: string
      avatar: string | null
    }
  }
}

// 类型配置
const typeConfig: Record<TransactionType, { label: string; color: string; icon: React.ElementType }> = {
  income: { label: '收入', color: 'bg-green-100 text-green-800', icon: ArrowDownLeft },
  withdraw: { label: '提现', color: 'bg-blue-100 text-blue-800', icon: ArrowUpRight },
  refund: { label: '退款扣回', color: 'bg-red-100 text-red-800', icon: ArrowUpRight },
  frozen: { label: '冻结', color: 'bg-cyan-100 text-cyan-800', icon: Snowflake },
  unfrozen: { label: '解冻', color: 'bg-orange-100 text-orange-800', icon: Sun },
}

// API
const transactionApi = {
  getList: (query: {
    page?: number
    pageSize?: number
    type?: string
    keyword?: string
  }) =>
    request<PaginatedData<WalletTransaction>>('/admin/finance/transactions', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),
}

export function FinanceTransactions() {
  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 获取流水列表
  const { data, isLoading } = useQuery({
    queryKey: ['finance-transactions', keyword, typeFilter, page, pageSize],
    queryFn: () => transactionApi.getList({
      keyword: keyword || undefined,
      type: typeFilter || undefined,
      page,
      pageSize,
    }),
  })

  const transactions = data?.data || []
  const total = data?.total || 0

  // 计算统计数据
  const stats = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
    totalWithdraw: transactions.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0),
    frozenCount: transactions.filter(t => t.type === 'frozen' && !t.unfrozen).length,
  }

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
          <h1 className='text-2xl font-bold tracking-tight'>收支明细</h1>
          <p className='text-muted-foreground'>查看所有陪诊员的钱包流水记录</p>
        </div>

        {/* 统计卡片 */}
        <div className='mb-6 grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-green-50 p-3'>
                <DollarSign className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>本页收入</p>
                <p className='text-2xl font-bold'>¥{stats.totalIncome.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-blue-50 p-3'>
                <TrendingUp className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>本页提现</p>
                <p className='text-2xl font-bold'>¥{stats.totalWithdraw.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-cyan-50 p-3'>
                <Snowflake className='h-5 w-5 text-cyan-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>待解冻</p>
                <p className='text-2xl font-bold'>{stats.frozenCount}</p>
                <p className='text-xs text-muted-foreground'>笔</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='flex items-center gap-4 p-4'>
              <div className='rounded-full bg-purple-50 p-3'>
                <Wallet className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>总记录</p>
                <p className='text-2xl font-bold'>{total}</p>
                <p className='text-xs text-muted-foreground'>条</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <div className='mb-4 flex flex-wrap items-center gap-4'>
          <div className='relative flex-1 md:max-w-sm'>
            <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='搜索陪诊员姓名、手机号...'
              className='pl-9'
              value={keyword}
              onChange={e => {
                setKeyword(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={v => {
              setTypeFilter(v === 'all' ? '' : v)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='全部类型' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部类型</SelectItem>
              <SelectItem value='income'>收入</SelectItem>
              <SelectItem value='withdraw'>提现</SelectItem>
              <SelectItem value='refund'>退款扣回</SelectItem>
              <SelectItem value='frozen'>冻结</SelectItem>
              <SelectItem value='unfrozen'>解冻</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 流水表格 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>陪诊员</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className='text-right'>金额</TableHead>
                <TableHead className='text-right'>余额</TableHead>
                <TableHead>解冻时间</TableHead>
                <TableHead>时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-32 text-center'>
                    <Loader2 className='mx-auto h-6 w-6 animate-spin' />
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-32 text-center text-muted-foreground'>
                    暂无流水记录
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map(item => {
                  const TypeIcon = typeConfig[item.type]?.icon || DollarSign
                  const isPositive = item.type === 'income' || item.type === 'unfrozen'
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-8 w-8'>
                            <AvatarImage src={item.wallet?.escort?.avatar || undefined} />
                            <AvatarFallback>
                              {item.wallet?.escort?.name?.slice(0, 1) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='font-medium'>{item.wallet?.escort?.name || '-'}</div>
                            <div className='text-muted-foreground text-xs'>
                              {item.wallet?.escort?.phone || '-'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeConfig[item.type]?.color || ''}>
                          <TypeIcon className='mr-1 h-3 w-3' />
                          {typeConfig[item.type]?.label || item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-[200px]'>
                          <div className='font-medium truncate'>{item.title}</div>
                          {item.remark && (
                            <div className='text-muted-foreground text-xs truncate'>{item.remark}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'}¥{Math.abs(Number(item.amount)).toFixed(2)}
                      </TableCell>
                      <TableCell className='text-right text-muted-foreground'>
                        ¥{Number(item.balanceAfter).toFixed(2)}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {item.type === 'frozen' && item.unfreezeAt ? (
                          <span className={item.unfrozen ? 'line-through' : ''}>
                            {new Date(item.unfreezeAt).toLocaleDateString()}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {new Date(item.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* 分页 */}
        <div className='mt-4'>
          <SimplePagination
            currentPage={page}
            totalPages={Math.ceil(total / pageSize) || 1}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setPage}
            onPageSizeChange={size => {
              setPageSize(size)
              setPage(1)
            }}
          />
        </div>
      </Main>
    </>
  )
}

