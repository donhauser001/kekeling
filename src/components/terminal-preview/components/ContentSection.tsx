/**
 * 内容区组件
 */

import { SafeHTML } from '@/components/ui/safe-html'
import type { HomePageSettings } from '../types'

interface ContentSectionProps {
  homeSettings: HomePageSettings
  isDarkMode?: boolean
}

export function ContentSection({ homeSettings, isDarkMode = false }: ContentSectionProps) {
  if (!homeSettings.content.enabled || !homeSettings.content.code) {
    return null
  }

  return (
    <div
      className='relative z-10 px-3 py-3'
      style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
    >
      <SafeHTML
        html={homeSettings.content.code}
        prose
        className='max-w-none [&_*]:!m-0 [&_*]:!p-0 [&_*]:!text-xs [&_*]:!leading-relaxed [&_h1]:!text-base [&_h2]:!text-sm [&_h3]:!text-xs [&_p]:!my-1'
      />
    </div>
  )
}
