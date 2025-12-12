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
import { membershipApi, type MembershipLevel } from '@/lib/api'
import { MembershipTable } from './components/membership-table'
import { MembershipActionDialog } from './components/membership-action-dialog'
import { MembershipDetailSheet } from './components/membership-detail-sheet'

const topNav = [
  { title: '会员等级', url: '/marketing/membership' },
  { title: '会员方案', url: '/marketing/membership/plans' },
  { title: '用户会员', url: '/marketing/membership/users' },
]

export function Membership() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // 弹窗状态
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<MembershipLevel | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['membership-levels', page, pageSize],
    queryFn: () => membershipApi.getLevels({ page, pageSize }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => membershipApi.deleteLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-levels'] })
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

  const handleView = (level: MembershipLevel) => {
    setCurrentRow(level)
    setDetailSheetOpen(true)
  }

  const handleEdit = (level: MembershipLevel) => {
    setCurrentRow(level)
    setActionDialogOpen(true)
  }

  const handleDelete = (level: MembershipLevel) => {
    setCurrentRow(level)
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
            <h2 className='text-2xl font-bold tracking-tight'>会员等级管理</h2>
            <p className='text-muted-foreground'>管理会员等级和权益配置</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className='mr-2 h-4 w-4' />
            新建等级
          </Button>
        </div>

        <MembershipTable
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
      <MembershipActionDialog
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
        title='删除会员等级'
        desc={`确定要删除等级「${currentRow?.name}」吗？此操作无法撤销。`}
        confirmText='删除'
        destructive
      />

      {/* 详情抽屉 */}
      <MembershipDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        level={currentRow}
        onEdit={handleEdit}
      />
    </>
  )
}
