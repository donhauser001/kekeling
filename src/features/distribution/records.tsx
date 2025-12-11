import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign,
  Search as SearchIcon,
  Loader2,
  AlertCircle,
  Gift,
  TrendingUp,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { MessageButton } from '@/components/message-button'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { SimplePagination } from '@/components/simple-pagination'
import { distributionApi, type DistributionRecord } from '@/lib/api'

// 状态配置
const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待结算', color: 'bg-yellow-100 text-yellow-800' },
  settled: { label: '已结算', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
}

// 类型配置
const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  order: { label: '订单分润', icon: <TrendingUp className="h-4 w-4" /> },
  bonus: { label: '直推奖励', icon: <Gift className="h-4 w-4" /> },
}

// 关系层级
const relationLabels: Record<number, string> = {
  1: '直接下级',
  2: '二级下级',
  3: '三级下级',
}

export function DistributionRecords() {
  // 筛选状态
  const [type, setType] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // 获取记录列表
  const { data, isLoading, error } = useQuery({
    queryKey: ['distribution-records', type, status, page, pageSize],
    queryFn: () =>
      distributionApi.getRecords({
        type: type || undefined,
        status: status || undefined,
        page,
        pageSize,
      }),
  })

  const records = data?.data || []
  const total = data?.total || 0

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">分润记录</h1>
          <p className="text-muted-foreground">查看所有分销分润明细</p>
        </div>

        {/* 筛选栏 */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v === 'all' ? '' : v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="全部类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="order">订单分润</SelectItem>
              <SelectItem value="bonus">直推奖励</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v === 'all' ? '' : v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待结算</SelectItem>
              <SelectItem value="settled">已结算</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 记录列表 */}
        <Card>
          <CardHeader>
            <CardTitle>分润明细</CardTitle>
            <CardDescription>订单完成后7天自动结算</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-muted-foreground">加载失败，请刷新重试</p>
              </div>
            ) : records.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2">
                <DollarSign className="text-muted-foreground h-12 w-12" />
                <p className="text-muted-foreground">暂无分润记录</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>类型</TableHead>
                      <TableHead>受益人</TableHead>
                      <TableHead>来源陪诊员</TableHead>
                      <TableHead>关系</TableHead>
                      <TableHead>订单金额</TableHead>
                      <TableHead>分润比例</TableHead>
                      <TableHead>分润金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => {
                      const typeInfo = typeConfig[record.type] || typeConfig.order
                      const statusInfo = statusConfig[record.status] || statusConfig.pending
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {typeInfo.icon}
                              <span>{typeInfo.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.beneficiary ? (
                              <div>
                                <div className="font-medium">{record.beneficiary.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {record.beneficiary.phone}
                                </div>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {record.sourceEscort ? (
                              <div>
                                <div className="font-medium">{record.sourceEscort.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {record.sourceEscort.phone}
                                </div>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {relationLabels[record.relationLevel] || `${record.relationLevel}级`}
                            </Badge>
                          </TableCell>
                          <TableCell>¥{record.orderAmount.toFixed(2)}</TableCell>
                          <TableCell>{record.rate}%</TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">
                              ¥{record.amount.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(record.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* 分页 */}
                {total > 0 && (
                  <div className="mt-4">
                    <SimplePagination
                      page={page}
                      pageSize={pageSize}
                      total={total}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
