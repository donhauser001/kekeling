/**
 * 陪诊员申请审核页面
 */

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { escortApplicationApi, type EscortApplication } from '@/lib/api'

// 状态配置
const statusConfig = {
  pending: {
    label: '待审核',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    icon: Clock,
  },
  approved: {
    label: '已通过',
    color: 'bg-green-50 text-green-600 border-green-200',
    icon: CheckCircle,
  },
  rejected: {
    label: '已驳回',
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: XCircle,
  },
}

// 性别配置
const genderMap = {
  male: '男',
  female: '女',
  unknown: '未知',
}

export function EscortApplications() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<EscortApplication | null>(null)

  // 审核弹窗
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [rejectReason, setRejectReason] = useState('')

  // 获取申请列表
  const { data, isLoading } = useQuery({
    queryKey: ['escort-applications', statusFilter, keyword, page, pageSize],
    queryFn: () =>
      escortApplicationApi.getApplications({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        keyword: keyword || undefined,
        page,
        pageSize,
      }),
  })

  // 审核申请
  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
      rejectReason,
    }: {
      id: string
      action: 'approve' | 'reject'
      rejectReason?: string
    }) => escortApplicationApi.reviewApplication(id, action, rejectReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escort-applications'] })
      toast.success(reviewAction === 'approve' ? '申请已通过' : '申请已驳回')
      setReviewOpen(false)
      setSelectedApplication(null)
      setRejectReason('')
    },
    onError: (error: any) => {
      toast.error(error.message || '操作失败')
    },
  })

  // 统计数据
  const stats = useMemo(() => {
    if (!data?.data) return { pending: 0, approved: 0, rejected: 0 }
    // 这里应该从后端获取统计，暂时用列表数据估算
    return {
      pending: data.data.filter((a) => a.status === 'pending').length,
      approved: data.data.filter((a) => a.status === 'approved').length,
      rejected: data.data.filter((a) => a.status === 'rejected').length,
    }
  }, [data])

  const handleViewDetail = (application: EscortApplication) => {
    setSelectedApplication(application)
    setDetailOpen(true)
  }

  const handleReview = (application: EscortApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application)
    setReviewAction(action)
    setReviewOpen(true)
  }

  const handleConfirmReview = () => {
    if (!selectedApplication) return
    if (reviewAction === 'reject' && !rejectReason.trim()) {
      toast.error('请填写驳回原因')
      return
    }
    reviewMutation.mutate({
      id: selectedApplication.id,
      action: reviewAction,
      rejectReason: reviewAction === 'reject' ? rejectReason : undefined,
    })
  }

  return (
    <>
      <Header>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">陪诊员申请</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeSwitch />
          <MessageButton />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待审核</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已通过</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已驳回</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="pending">待审核</TabsTrigger>
              <TabsTrigger value="approved">已通过</TabsTrigger>
              <TabsTrigger value="rejected">已驳回</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索姓名或手机号"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* 申请列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.data?.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onViewDetail={() => handleViewDetail(application)}
                onApprove={() => handleReview(application, 'approve')}
                onReject={() => handleReview(application, 'reject')}
              />
            ))}

            {(!data?.data || data.data.length === 0) && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                暂无申请记录
              </div>
            )}
          </div>
        )}

        {/* 分页 */}
        {data && data.total > pageSize && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              {page} / {Math.ceil(data.total / pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(data.total / pageSize)}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        )}
      </Main>

      {/* 详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>申请详情</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <ApplicationDetail application={selectedApplication} />
          )}
        </DialogContent>
      </Dialog>

      {/* 审核弹窗 */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? '通过申请' : '驳回申请'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? `确定通过 ${selectedApplication?.name} 的陪诊员申请吗？`
                : `请填写驳回 ${selectedApplication?.name} 申请的原因`}
            </DialogDescription>
          </DialogHeader>

          {reviewAction === 'reject' && (
            <Textarea
              placeholder="请输入驳回原因..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleConfirmReview}
              disabled={reviewMutation.isPending}
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
            >
              {reviewMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {reviewAction === 'approve' ? '确认通过' : '确认驳回'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// 申请卡片组件
function ApplicationCard({
  application,
  onViewDetail,
  onApprove,
  onReject,
}: {
  application: EscortApplication
  onViewDetail: () => void
  onApprove: () => void
  onReject: () => void
}) {
  const status = statusConfig[application.status]
  const StatusIcon = status.icon

  return (
    <Card>
      <CardContent className="pt-6">
        {/* 头部 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={application.avatar || application.user?.avatar} />
              <AvatarFallback>{application.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{application.name}</p>
              <p className="text-sm text-muted-foreground">{application.phone}</p>
            </div>
          </div>
          <Badge variant="outline" className={status.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* 信息 */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">性别</span>
            <span>{genderMap[application.gender as keyof typeof genderMap] || '未知'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">申请时间</span>
            <span>{new Date(application.createdAt).toLocaleDateString()}</span>
          </div>
          {application.inviter && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">邀请人</span>
              <span>{application.inviter.name}</span>
            </div>
          )}
          {application.rejectReason && (
            <div className="pt-2 border-t">
              <span className="text-muted-foreground">驳回原因：</span>
              <span className="text-red-600">{application.rejectReason}</span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewDetail}
          >
            <Eye className="h-4 w-4 mr-1" />
            查看
          </Button>
          {application.status === 'pending' && (
            <>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={onApprove}
              >
                <Check className="h-4 w-4 mr-1" />
                通过
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={onReject}
              >
                <X className="h-4 w-4 mr-1" />
                驳回
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 申请详情组件
function ApplicationDetail({ application }: { application: EscortApplication }) {
  return (
    <div className="space-y-4">
      {/* 头像和基本信息 */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={application.avatar || application.user?.avatar} />
          <AvatarFallback className="text-lg">{application.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-medium">{application.name}</p>
          <p className="text-muted-foreground">{application.phone}</p>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">身份证号</p>
          <p className="font-medium">{application.idCard}</p>
        </div>
        <div>
          <p className="text-muted-foreground">性别</p>
          <p className="font-medium">
            {genderMap[application.gender as keyof typeof genderMap] || '未知'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">紧急联系人</p>
          <p className="font-medium">{application.emergencyContact || '-'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">紧急联系人电话</p>
          <p className="font-medium">{application.emergencyPhone || '-'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">邀请码</p>
          <p className="font-medium">{application.inviteCode || '-'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">邀请人</p>
          <p className="font-medium">{application.inviter?.name || '-'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">申请时间</p>
          <p className="font-medium">
            {new Date(application.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">状态</p>
          <Badge variant="outline" className={statusConfig[application.status].color}>
            {statusConfig[application.status].label}
          </Badge>
        </div>
      </div>

      {/* 驳回原因 */}
      {application.rejectReason && (
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">驳回原因</p>
          <p className="text-red-600">{application.rejectReason}</p>
        </div>
      )}
    </div>
  )
}
