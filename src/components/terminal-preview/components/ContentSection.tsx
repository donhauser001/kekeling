/**
 * 内容区组件
 */

import type { HomePageSettings } from '../types'

interface ContentSectionProps {
  homeSettings: HomePageSettings
}

export function ContentSection({ homeSettings }: ContentSectionProps) {
  if (!homeSettings.content.enabled || !homeSettings.content.code) {
    return null
  }

  return (
    <div className='relative z-10 bg-white px-3 py-3'>
      <div
        className='prose prose-sm max-w-none [&_*]:!m-0 [&_*]:!p-0 [&_*]:!text-xs [&_*]:!leading-relaxed [&_h1]:!text-base [&_h2]:!text-sm [&_h3]:!text-xs [&_p]:!my-1'
        dangerouslySetInnerHTML={{ __html: homeSettings.content.code }}
      />
    </div>
  )
}
