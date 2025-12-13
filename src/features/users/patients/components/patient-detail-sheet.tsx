import {
  Phone,
  CreditCard,
  User,
  Users,
  Calendar,
  Star,
  ShoppingCart,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import type { PatientDetail } from '@/lib/api'

interface PatientDetailSheetProps {
  patient: PatientDetail | null
  isLoading?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientDetailSheet({
  patient,
  isLoading,
  open,
  onOpenChange,
}: PatientDetailSheetProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-lg overflow-y-auto'>
        {isLoading ? (
          <div className='space-y-6 py-4'>
            <div className='flex items-center gap-4'>
              <Skeleton className='h-16 w-16 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-32' />
                <Skeleton className='h-4 w-24' />
              </div>
            </div>
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-32 w-full' />
          </div>
        ) : patient ? (
          <>
            <SheetHeader className='pb-4'>
              <div className='flex items-start gap-4'>
                <div className='bg-muted flex h-16 w-16 items-center justify-center rounded-full'>
                  <User className='h-8 w-8 text-muted-foreground' />
                </div>
                <div className='flex-1 space-y-1'>
                  <SheetTitle className='flex items-center gap-2'>
                    {patient.name}
                    {patient.isDefault && (
                      <Badge variant='secondary' className='bg-amber-50 text-amber-700'>
                        <Star className='mr-1 h-3 w-3' />
                        默认
                      </Badge>
                    )}
                  </SheetTitle>
                  <SheetDescription className='flex items-center gap-4'>
                    <Badge variant='outline' className={patient.gender === 'male' ? 'border-blue-200 text-blue-700' : 'border-pink-200 text-pink-700'}>
                      {patient.gender === 'male' ? '男' : '女'}
                    </Badge>
                    <span>{patient.age}岁</span>
                    <Badge variant='outline'>{patient.relation}</Badge>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <Separator className='my-4' />

            <ScrollArea className='h-[calc(100vh-180px)]'>
              <div className='space-y-6 pr-4'>
                {/* 联系信息 */}
                <div className='space-y-3'>
                  <h4 className='flex items-center gap-2 text-sm font-medium'>
                    <Phone className='h-4 w-4' />
                    联系信息
                  </h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>手机号</span>
                      <span className='font-mono'>{patient.phone}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>身份证号</span>
                      <span className='font-mono'>{patient.idCard || '-'}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 所属用户 */}
                {patient.user && (
                  <>
                    <div className='space-y-3'>
                      <h4 className='flex items-center gap-2 text-sm font-medium'>
                        <Users className='h-4 w-4' />
                        所属用户
                      </h4>
                      <div className='rounded-lg border p-3'>
                        <div className='flex items-center justify-between'>
                          <span className='font-medium'>
                            {patient.user.nickname || '微信用户'}
                          </span>
                          <span className='text-muted-foreground text-sm font-mono'>
                            {patient.user.phone || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />
                  </>
                )}

                {/* 订单历史 */}
                <div className='space-y-3'>
                  <h4 className='flex items-center gap-2 text-sm font-medium'>
                    <ShoppingCart className='h-4 w-4' />
                    最近订单 ({patient.orderCount || 0})
                  </h4>
                  {patient.orders && patient.orders.length > 0 ? (
                    <div className='space-y-2'>
                      {patient.orders.slice(0, 5).map(order => (
                        <div
                          key={order.id}
                          className='flex items-center justify-between rounded-lg border p-3'
                        >
                          <div>
                            <div className='font-medium'>
                              {order.service?.name || '服务'}
                            </div>
                            <div className='text-muted-foreground text-sm'>
                              {order.hospital?.name || '-'}
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='font-medium'>¥{order.totalAmount}</div>
                            <div className='text-muted-foreground text-xs'>
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-sm'>暂无订单</p>
                  )}
                </div>

                <Separator />

                {/* 时间信息 */}
                <div className='space-y-3'>
                  <h4 className='flex items-center gap-2 text-sm font-medium'>
                    <Calendar className='h-4 w-4' />
                    时间信息
                  </h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>创建时间</span>
                      <span>{formatDate(patient.createdAt)}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>更新时间</span>
                      <span>{formatDate(patient.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
