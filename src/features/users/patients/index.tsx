import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import {
  Users as UsersIcon,
  UserPlus,
  CreditCard,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import {
  DataTablePagination,
  DataTableToolbar,
  DataTableViewOptions,
} from '@/components/data-table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MessageButton } from '@/components/message-button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  usePatients,
  usePatientStats,
  usePatient,
  useUpdatePatient,
  useDeletePatient,
  useSetPatientDefault,
} from '@/hooks/use-api'
import type { Patient, CreatePatientData } from '@/lib/api'

import {
  getPatientsColumns,
  PatientsTable,
  PatientFormDialog,
  PatientDeleteDialog,
  PatientDetailSheet,
} from './components'

export function Patients() {
  // 分页和筛选状态
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // 从筛选状态获取 keyword
  const keyword = useMemo(() => {
    const filter = columnFilters.find(f => f.id === 'name')
    return (filter?.value as string) || globalFilter || ''
  }, [columnFilters, globalFilter])

  // 对话框状态
  const [detailOpen, setDetailOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  // API hooks
  const { data, isLoading } = usePatients({
    keyword: keyword || undefined,
    page,
    pageSize,
  })
  const { data: stats } = usePatientStats()
  const { data: patientDetail, isLoading: detailLoading } = usePatient(selectedPatientId || '')
  const updateMutation = useUpdatePatient()
  const deleteMutation = useDeletePatient()
  const setDefaultMutation = useSetPatientDefault()

  const patients = data?.data || []
  const total = data?.total || 0

  // 查看详情
  const handleView = (patient: Patient) => {
    setSelectedPatientId(patient.id)
    setDetailOpen(true)
  }

  // 打开编辑
  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormDialogOpen(true)
  }

  // 打开删除确认
  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient)
    setDeleteDialogOpen(true)
  }

  // 设为默认
  const handleSetDefault = async (patient: Patient) => {
    try {
      await setDefaultMutation.mutateAsync(patient.id)
      toast.success(`已将 ${patient.name} 设为默认就诊人`)
    } catch (err: any) {
      toast.error(err.message || '设置失败')
    }
  }

  // 保存编辑
  const handleSavePatient = async (formData: CreatePatientData) => {
    try {
      if (selectedPatient) {
        await updateMutation.mutateAsync({
          id: selectedPatient.id,
          data: formData,
        })
        toast.success('更新成功')
      }
      setFormDialogOpen(false)
      setSelectedPatient(null)
    } catch (err: any) {
      toast.error(err.message || '保存失败')
    }
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!selectedPatient) return
    try {
      await deleteMutation.mutateAsync(selectedPatient.id)
      toast.success('删除成功')
      setDeleteDialogOpen(false)
      setSelectedPatient(null)
    } catch (err: any) {
      toast.error(err.message || '删除失败')
    }
  }

  // 列定义
  const columns = useMemo(
    () => getPatientsColumns({
      onView: handleView,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onSetDefault: handleSetDefault,
    }),
    []
  )

  // useReactTable 配置（服务端分页）
  const table = useReactTable({
    data: patients,
    columns,
    pageCount: Math.ceil(total / pageSize),
    state: {
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: page - 1, pageSize })
        setPage(newState.pageIndex + 1)
        setPageSize(newState.pageSize)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    rowCount: total,
  })

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

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* 标题 */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>就诊人管理</h1>
            <p className='text-muted-foreground'>管理用户的就诊人信息</p>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-blue-50 p-3 dark:bg-blue-950'>
                  <UsersIcon className='h-5 w-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>总就诊人</p>
                  <p className='text-2xl font-bold'>{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='flex items-center gap-4 p-4'>
                <div className='rounded-full bg-green-50 p-3 dark:bg-green-950'>
                  <CreditCard className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>已实名</p>
                  <p className='text-2xl font-bold'>{stats.withIdCard}</p>
                  <p className='text-muted-foreground text-xs'>
                    占比 {stats.withIdCardRate}%
                  </p>
                </div>
              </CardContent>
            </Card>
            {stats.relationStats?.slice(0, 2).map(item => (
              <Card key={item.relation}>
                <CardContent className='flex items-center gap-4 p-4'>
                  <div className='rounded-full bg-purple-50 p-3 dark:bg-purple-950'>
                    <UserPlus className='h-5 w-5 text-purple-600' />
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>{item.relation}</p>
                    <p className='text-2xl font-bold'>{item.count}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 工具栏 */}
        <div className='flex flex-wrap items-center gap-4'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='搜索姓名、手机号...'
            searchKey='name'
            showViewOptions={false}
          />
          <DataTableViewOptions table={table} />
        </div>

        {/* 就诊人表格 */}
        <PatientsTable
          table={table}
          isLoading={isLoading}
          onRowClick={handleView}
        />

        {/* 分页 */}
        <DataTablePagination table={table} className='mt-auto' />
      </Main>

      {/* 就诊人详情抽屉 */}
      <PatientDetailSheet
        patient={patientDetail || null}
        isLoading={detailLoading}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* 编辑对话框 */}
      <PatientFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        patient={selectedPatient}
        onSubmit={handleSavePatient}
        isLoading={updateMutation.isPending}
      />

      {/* 删除确认对话框 */}
      <PatientDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        patient={selectedPatient}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
