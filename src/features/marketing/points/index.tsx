import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { pointApi, type PointRule } from '@/lib/api'
import { PointsTable } from './components/points-table'
import { PointsActionDialog } from './components/points-action-dialog'
import { PointsDetailSheet } from './components/points-detail-sheet'

const topNav = [
  { title: '积分规则', url: '/marketing/points' },
  { title: '用户积分', url: '/marketing/points/users' },
  { title: '积分记录', url: '/marketing/points/records' },
]

export function Points() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 弹窗状态
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<PointRule | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['point-rules', page, pageSize],
    queryFn: () => pointApi.getRules({ page, pageSize }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pointApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['point-rules'] })
      setDeleteDialogOpen(false)
      setCurrentRow(null)
      toast.success('删除成功')
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const handleCreate = () => {
    setCurrentRow(null)
    setActionDialogOpen(true)
  }

  const handleView = (rule: PointRule) => {
    setCurrentRow(rule)
    setDetailSheetOpen(true)
  }

  const handleEdit = (rule: PointRule) => {
    setCurrentRow(rule)
    setActionDialogOpen(true)
  }

  const handleDelete = (rule: PointRule) => {
    setCurrentRow(rule)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (currentRow) {
      deleteMutation.mutate(currentRow.id)
    }
  }

  return (
    <>
      <Header fixed>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <MessageButton />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>积分规则管理</h2>
            <p className='text-muted-foreground'>管理积分获取和消耗规则</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            新建规则
          </Button>
        </div>

        <PointsTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </Main>

      {/* 新建/编辑弹窗 */}
      <PointsActionDialog
        key={currentRow ? `edit-${currentRow.id}` : 'create'}
        open={actionDialogOpen}
        onOpenChange={(open) => {
          setActionDialogOpen(open)
          if (!open) {
            setTimeout(() => setCurrentRow(null), 300)
          }
        }}
        currentRow={currentRow ?? undefined}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title='删除积分规则'
        desc={`确定要删除规则「${currentRow?.name}」吗？此操作无法撤销。`}
        confirmText='删除'
        destructive
      />

      {/* 详情抽屉 */}
      <PointsDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        rule={currentRow}
        onEdit={handleEdit}
      />
    </>
  )
}
