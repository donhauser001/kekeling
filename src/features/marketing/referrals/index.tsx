import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { referralApi, type ReferralRule } from '@/lib/api'
import { ReferralRulesTable } from './components/referral-rules-table'
import { ReferralRecordsTable } from './components/referral-records-table'
import { ReferralRulesActionDialog } from './components/referral-rules-action-dialog'

export function Referrals() {
  const [activeTab, setActiveTab] = useState('rules')

  // 规则分页
  const [rulesPage, setRulesPage] = useState(1)
  const [rulesPageSize, setRulesPageSize] = useState(10)

  // 记录分页
  const [recordsPage, setRecordsPage] = useState(1)
  const [recordsPageSize, setRecordsPageSize] = useState(10)

  // 弹窗状态
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<ReferralRule | null>(null)

  const queryClient = useQueryClient()

  // 规则数据
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['referral-rules', rulesPage, rulesPageSize],
    queryFn: () => referralApi.getRules({ page: rulesPage, pageSize: rulesPageSize }),
  })

  // 记录数据
  const { data: recordsData, isLoading: recordsLoading } = useQuery({
    queryKey: ['referral-records', recordsPage, recordsPageSize],
    queryFn: () => referralApi.getRecords({ page: recordsPage, pageSize: recordsPageSize }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => referralApi.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-rules'] })
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

  const handleEdit = (rule: ReferralRule) => {
    setCurrentRow(rule)
    setActionDialogOpen(true)
  }

  const handleDelete = (rule: ReferralRule) => {
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
        <TopNav links={[]} />
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
            <h2 className='text-2xl font-bold tracking-tight'>邀请管理</h2>
            <p className='text-muted-foreground'>管理邀请规则和记录</p>
          </div>
          {activeTab === 'rules' && (
            <Button onClick={handleCreate}>
              <Plus className='mr-2 h-4 w-4' />
              新建规则
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-1 flex-col'>
          <TabsList className='w-fit'>
            <TabsTrigger value='rules'>邀请规则</TabsTrigger>
            <TabsTrigger value='records'>邀请记录</TabsTrigger>
          </TabsList>

          <TabsContent value='rules' className='flex flex-1 flex-col'>
            <ReferralRulesTable
              data={rulesData?.data ?? []}
              total={rulesData?.total ?? 0}
              page={rulesPage}
              pageSize={rulesPageSize}
              onPageChange={setRulesPage}
              onPageSizeChange={setRulesPageSize}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={rulesLoading}
            />
          </TabsContent>

          <TabsContent value='records' className='flex flex-1 flex-col'>
            <ReferralRecordsTable
              data={recordsData?.data ?? []}
              total={recordsData?.total ?? 0}
              page={recordsPage}
              pageSize={recordsPageSize}
              onPageChange={setRecordsPage}
              onPageSizeChange={setRecordsPageSize}
              isLoading={recordsLoading}
            />
          </TabsContent>
        </Tabs>
      </Main>

      {/* 新建/编辑弹窗 */}
      <ReferralRulesActionDialog
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
        title='删除邀请规则'
        desc={`确定要删除规则「${currentRow?.name}」吗？此操作无法撤销。`}
        confirmText='删除'
        destructive
      />
    </>
  )
}
