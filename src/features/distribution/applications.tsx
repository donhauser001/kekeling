import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileCheck,
  Search as SearchIcon,
  Loader2,
  AlertCircle,
  Check,
  X,
  Crown,
  Award,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { MessageButton } from '@/components/message-button'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SimplePagination } from '@/components/simple-pagination'
import { distributionApi, type PromotionApplication } from '@/lib/api'

// 状态配置
const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '已通过', color: 'bg-green-100 text-green-800' },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
}

// 等级名称
const levelNames: Record<number, string> = {
  1: '城市合伙人',
  2: '团队长',
  3: '普通成员',
}

export function DistributionApplications() {
  const queryClient = useQueryClient()

  // 筛选状态
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // 对话框状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<PromotionApplication | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewNote, setReviewNote] = useState('')

  // 获取申请列表
  const { data, isLoading, error } = useQuery({
    queryKey: ['distribution-applications', statusFilter, page, pageSize],
    queryFn: () =>
      distributionApi.getApplications({
        status: statusFilter || undefined,
        page,
        pageSize,
      }),
  })

  // 审核申请
  const reviewMutation = useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: 'approve' | 'reject'; note?: string }) =>
      distributionApi.reviewApplication(id, action, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-applications'] })
      queryClient.invalidateQueries({ queryKey: ['distribution-stats'] })
      queryClient.invalidateQueries({ queryKey: ['distribution-members'] })
      toast.success(reviewAction === 'approve' ? '已通过申请' : '已拒绝申请')
      setReviewDialogOpen(false)
      setSelectedApplication(null)
      setReviewNote('')
    },
    onError: (err: any) => {
      toast.error(err.message || '操作失败')
    },
  })

  const applications = data?.data || []
  const total = data?.total || 0

  const openReviewDialog = (application: PromotionApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application)
    setReviewAction(action)
    setReviewNote('')
    setReviewDialogOpen(true)
  }

  const openDetailDialog = (application: PromotionApplication) => {
    setSelectedApplication(application)
    setDetailDialogOpen(true)
  }

  const handleReview = () => {
    if (selectedApplication) {
      reviewMutation.mutate({
        id: selectedApplication.id,
        action: reviewAction,
        note: reviewNote || undefined,
      })
    }
  }

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
          <h1 className="text-2xl font-bold tracking-tight">晋升审核</h1>
          <p className="text-muted-foreground">审核陪诊员的分销等级晋升申请</p>
        </div>

        {/* 筛选栏 */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v === 'all' ? '' : v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待审核</SelectItem>
              <SelectItem value="approved">已通过</SelectItem>
              <SelectItem value="rejected">已拒绝</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 申请列表 */}
        <Card>
          <CardHeader>
            <CardTitle>晋升申请</CardTitle>
            <CardDescription>团队长晋升城市合伙人需要平台审核</CardDescription>
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
            ) : applications.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2">
                <FileCheck className="text-muted-foreground h-12 w-12" />
                <p className="text-muted-foreground">暂无晋升申请</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申请人</TableHead>
                      <TableHead>晋升目标</TableHead>
                      <TableHead>申请数据</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>申请时间</TableHead>
                      <TableHead className="w-[150px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => {
                      const statusInfo =
                        statusConfig[application.status] || statusConfig.pending
                      return (
                        <TableRow key={application.id}>
                          <TableCell>
                            {application.escort ? (
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={application.escort.avatar || undefined} />
                                  <AvatarFallback>
                                    {application.escort.name.slice(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{application.escort.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {application.escort.phone}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {levelNames[application.fromLevel] || `L${application.fromLevel}`}
                              </Badge>
                              <span>→</span>
                              <Badge className="bg-amber-500 text-white">
                                <Crown className="mr-1 h-3 w-3" />
                                {levelNames[application.toLevel] || `L${application.toLevel}`}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div>
                                团队: {application.applicationData.teamSize} 人
                              </div>
                              <div>
                                月订单: {application.applicationData.teamMonthlyOrders} 单
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(application.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDetailDialog(application)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {application.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => openReviewDialog(application, 'approve')}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => openReviewDialog(application, 'reject')}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
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

      {/* 审核对话框 */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? '通过申请' : '拒绝申请'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? '确认通过该晋升申请？'
                : '确认拒绝该晋升申请？'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>审核备注</Label>
              <Textarea
                placeholder={
                  reviewAction === 'approve'
                    ? '可选，输入通过理由...'
                    : '请输入拒绝原因...'
                }
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleReview}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewAction === 'approve' ? '确认通过' : '确认拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>申请详情</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              {/* 申请人信息 */}
              {selectedApplication.escort && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedApplication.escort.avatar || undefined} />
                    <AvatarFallback>
                      {selectedApplication.escort.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedApplication.escort.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedApplication.escort.phone}
                    </div>
                  </div>
                </div>
              )}

              {/* 晋升目标 */}
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    <Award className="mr-2 h-4 w-4" />
                    {levelNames[selectedApplication.fromLevel]}
                  </Badge>
                </div>
                <span className="text-2xl">→</span>
                <div className="text-center">
                  <Badge className="bg-amber-500 text-white text-lg px-4 py-2">
                    <Crown className="mr-2 h-4 w-4" />
                    {levelNames[selectedApplication.toLevel]}
                  </Badge>
                </div>
              </div>

              {/* 申请数据 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">申请时数据快照</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">完成订单:</span>
                      <span className="ml-2 font-medium">
                        {selectedApplication.applicationData.orderCount} 单
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">评分:</span>
                      <span className="ml-2 font-medium">
                        {selectedApplication.applicationData.rating}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">直属团队:</span>
                      <span className="ml-2 font-medium">
                        {selectedApplication.applicationData.teamSize} 人
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">总团队:</span>
                      <span className="ml-2 font-medium">
                        {selectedApplication.applicationData.totalTeamSize} 人
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">团队月订单:</span>
                      <span className="ml-2 font-medium">
                        {selectedApplication.applicationData.teamMonthlyOrders} 单
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">个人月订单:</span>
                      <span className="ml-2 font-medium">
                        {selectedApplication.applicationData.personalMonthlyOrders} 单
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 审核信息 */}
              {selectedApplication.status !== 'pending' && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">审核信息</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>
                      <span className="text-muted-foreground">审核结果:</span>
                      <Badge
                        className={`ml-2 ${statusConfig[selectedApplication.status]?.color}`}
                      >
                        {statusConfig[selectedApplication.status]?.label}
                      </Badge>
                    </div>
                    {selectedApplication.reviewedAt && (
                      <div>
                        <span className="text-muted-foreground">审核时间:</span>
                        <span className="ml-2">
                          {new Date(selectedApplication.reviewedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedApplication.reviewNote && (
                      <div>
                        <span className="text-muted-foreground">审核备注:</span>
                        <span className="ml-2">{selectedApplication.reviewNote}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
