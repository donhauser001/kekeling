/**
 * 提现记录导出按钮
 *
 * @see docs/资金安全提现体系/03-任务卡拆解.md - CARD ADMIN-WD-03
 *
 * 验收标准：
 * - 导出文件与当前筛选条件一致
 * - 导出走后端 API，禁止前端拼 CSV
 * - 前端有 loading 状态
 * - 导出失败有错误提示
 * - 敏感字段已脱敏（后端处理）
 */

import { useState } from 'react'
import { Download, Loader2, FileSpreadsheet, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminEscortWithdrawApi, type AdminEscortWithdrawRecordQuery } from '@/lib/api'

interface WithdrawExportButtonProps {
  /** 当前筛选条件 */
  filters: Omit<AdminEscortWithdrawRecordQuery, 'page' | 'pageSize'>
  /** 是否禁用 */
  disabled?: boolean
  /** 样式类名 */
  className?: string
}

export function WithdrawExportButton({
  filters,
  disabled = false,
  className,
}: WithdrawExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | null>(null)

  /**
   * 处理导出
   * - 走后端 API，禁止前端拼 CSV
   * - 使用 fetch 下载文件流
   */
  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (isExporting) return

    setIsExporting(true)
    setExportFormat(format)

    try {
      // 调用后端导出 API
      const blob = await adminEscortWithdrawApi.export(filters, format)

      // 生成文件名
      const dateStr = format(new Date(), 'yyyyMMdd_HHmmss')
      const filename = `提现记录_${dateStr}.${format}`

      // 触发下载
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('导出成功', {
        description: `文件 ${filename} 已开始下载`,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('导出失败', {
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled || isExporting}
          className={className}
        >
          {isExporting ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Download className='mr-2 h-4 w-4' />
          )}
          {isExporting ? '导出中...' : '导出'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
        >
          <FileText className='mr-2 h-4 w-4' />
          导出 CSV
          {exportFormat === 'csv' && (
            <Loader2 className='ml-2 h-4 w-4 animate-spin' />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('xlsx')}
          disabled={isExporting}
        >
          <FileSpreadsheet className='mr-2 h-4 w-4' />
          导出 Excel
          {exportFormat === 'xlsx' && (
            <Loader2 className='ml-2 h-4 w-4 animate-spin' />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
