/**
 * 滚动指示器组件
 *
 * 使用跨宿主原语组件实现，支持 Web 和小程序环境
 */

import { cn } from '@/lib/utils'
import { Box } from '../ui/primitives'
import type { ThemeSettings } from '../types'

interface ScrollIndicatorProps {
  show: boolean
  progress: number
  themeSettings: ThemeSettings
}

export function ScrollIndicator({ show, progress, themeSettings }: ScrollIndicatorProps) {
  return (
    <Box
      className={cn(
        'absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-300',
        show ? 'opacity-100' : 'opacity-0'
      )}
    >
      <Box className='flex flex-col gap-1'>
        {[0, 0.25, 0.5, 0.75, 1].map((pos, i) => (
          <Box
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
      </Box>
    </Box>
  )
}
