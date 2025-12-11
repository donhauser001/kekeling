/**
 * 底部信息区组件
 */

import { Phone } from 'lucide-react'
import type { ThemeSettings, FooterVisiblePage } from '../types'
import { BrandSection } from './BrandSection'

interface FooterSectionProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  currentPage?: FooterVisiblePage
}

export function FooterSection({ themeSettings, isDarkMode, currentPage = 'home' }: FooterSectionProps) {
  // 如果页脚组件被禁用，不显示
  if (themeSettings.footerEnabled === false) {
    return null
  }

  // 如果当前页面不在显示列表中，不显示
  const visiblePages = themeSettings.footerVisiblePages || ['home']
  if (!visiblePages.includes(currentPage)) {
    return null
  }

  const servicePhone = themeSettings.servicePhone || '400-888-8888'
  const showPhone = themeSettings.servicePhoneEnabled !== false

  return (
    <div
      className='relative z-10 px-4 py-6 text-center'
      style={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#f9fafb' }}
    >
      <BrandSection
        layout={themeSettings.footerLayout}
        lightLogo={themeSettings.footerLogo || themeSettings.headerLogo}
        darkLogo={themeSettings.footerLogoDark || themeSettings.headerLogoDark}
        themeSettings={themeSettings}
        isDarkMode={isDarkMode}
        isFooter
      />
      {showPhone && (
        <div
          className='mt-3 flex items-center justify-center gap-1.5 text-xs'
          style={{ color: isDarkMode ? '#6b7280' : '#9ca3af' }}
        >
          <Phone className='h-3.5 w-3.5' />
          <span>客服热线：{servicePhone}</span>
        </div>
      )}
    </div>
  )
}
