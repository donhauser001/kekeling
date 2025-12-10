/**
 * 滚动指示器组件
 */

import { cn } from '@/lib/utils'
import type { ThemeSettings } from '../types'

interface ScrollIndicatorProps {
  show: boolean
  progress: number
  themeSettings: ThemeSettings
}

export function ScrollIndicator({ show, progress, themeSettings }: ScrollIndicatorProps) {
  return (
    <div
      className={cn(
        'absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className='flex flex-col gap-1'>
        {[0, 0.25, 0.5, 0.75, 1].map((pos, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-all duration-200',
              Math.abs(progress - pos) < 0.15
                ? 'scale-125'
                : 'scale-100'
            )}
            style={{
              backgroundColor: Math.abs(progress - pos) < 0.15
                ? themeSettings.primaryColor
                : 'rgba(156, 163, 175, 0.5)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
