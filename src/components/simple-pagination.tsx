import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SimplePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function SimplePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 12, 20, 30, 50],
  className,
}: SimplePaginationProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-2',
        'max-lg:flex-col',
        className
      )}
    >
      <div className='flex w-full items-center justify-between gap-4'>
        <div className='text-muted-foreground text-sm'>
          共 {totalItems} 条记录
        </div>
        {onPageSizeChange && (
          <div className='flex items-center gap-2'>
            <p className='hidden text-sm font-medium sm:block'>每页显示</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                onPageSizeChange(Number(value))
              }}
            >
              <SelectTrigger className='h-8 w-[70px]'>
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side='top'>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className='flex items-center gap-2'>
        <div className='hidden whitespace-nowrap text-sm font-medium lg:block'>
          第 <span className='font-bold'>{currentPage}</span> / {totalPages} 页
        </div>
        <div className='flex items-center space-x-1'>
          <Button
            variant='outline'
            className='size-8 p-0 max-sm:hidden'
            onClick={() => onPageChange(1)}
            disabled={!canPreviousPage}
          >
            <span className='sr-only'>跳转到第一页</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canPreviousPage}
          >
            <span className='sr-only'>上一页</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>

          {/* Page number buttons */}
          <div className='hidden items-center space-x-1 sm:flex'>
            {pageNumbers.map((pageNumber, index) => (
              <div key={`${pageNumber}-${index}`} className='flex items-center'>
                {pageNumber === '...' ? (
                  <span className='text-muted-foreground px-1 text-sm'>...</span>
                ) : (
                  <Button
                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                    className='h-8 min-w-8 px-2'
                    onClick={() => onPageChange(pageNumber as number)}
                  >
                    <span className='sr-only'>跳转到第 {pageNumber} 页</span>
                    {pageNumber}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Mobile page indicator */}
          <span className='text-muted-foreground px-2 text-sm sm:hidden'>
            {currentPage} / {totalPages}
          </span>

          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canNextPage}
          >
            <span className='sr-only'>下一页</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0 max-sm:hidden'
            onClick={() => onPageChange(totalPages)}
            disabled={!canNextPage}
          >
            <span className='sr-only'>跳转到最后一页</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}

