/**
 * 手机外框组件
 */

import { cn } from '@/lib/utils'

interface PhoneFrameProps {
  children: React.ReactNode
  className?: string
}

export function PhoneFrame({ children, className }: PhoneFrameProps) {
  return (
    <div className={cn('w-[375px] flex-shrink-0', className)}>
      <div className='rounded-[40px] border-[8px] border-gray-800 bg-gray-800 shadow-xl'>
        {/* 手机顶部刘海 */}
        <div className='flex justify-center py-2'>
          <div className='h-6 w-24 rounded-full bg-gray-900' />
        </div>
        {/* 手机屏幕 */}
        <div className='overflow-hidden rounded-b-[32px]'>
          {children}
        </div>
      </div>
      <p className='mt-2 text-center text-xs text-muted-foreground'>
        iPhone 14 Pro · 首页预览
      </p>
    </div>
  )
}
