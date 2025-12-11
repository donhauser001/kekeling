/**
 * 手机外框组件
 */

import { Sun, Moon, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhoneFrameProps {
  children: React.ReactNode
  className?: string
  isDarkMode?: boolean
  onToggleDarkMode?: () => void
  onRefresh?: () => void
}

export function PhoneFrame({
  children,
  className,
  isDarkMode = false,
  onToggleDarkMode,
  onRefresh,
}: PhoneFrameProps) {
  return (
    <div className={cn('w-[375px] flex-shrink-0', className)}>
      <div className='rounded-[40px] border-[8px] border-gray-800 bg-gray-800 shadow-xl'>
        {/* 顶部工具栏 - 深色/浅色模式切换 & 刷新 */}
        <div className='flex items-center justify-center gap-2 py-2'>
          <button
            onClick={onToggleDarkMode}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all',
              isDarkMode
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-600 text-white'
            )}
          >
            {isDarkMode ? (
              <>
                <Moon className='h-3.5 w-3.5' />
                <span>深色</span>
              </>
            ) : (
              <>
                <Sun className='h-3.5 w-3.5' />
                <span>浅色</span>
              </>
            )}
          </button>
          <button
            onClick={onRefresh}
            className='flex items-center gap-1.5 rounded-full bg-gray-600 px-3 py-1 text-xs text-white transition-all hover:bg-gray-500 active:scale-95'
            title='刷新预览'
          >
            <RefreshCw className='h-3.5 w-3.5' />
            <span>刷新</span>
          </button>
        </div>
        {/* 手机屏幕 */}
        <div className='overflow-hidden rounded-b-[32px]'>
          {children}
        </div>
      </div>
      <p className='mt-2 text-center text-xs text-muted-foreground'>
        全局终端预览器
      </p>
    </div>
  )
}
