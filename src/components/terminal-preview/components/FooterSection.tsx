/**
 * 底部信息区组件
 */

import { Phone } from 'lucide-react'
import type { ThemeSettings } from '../types'
import { BrandSection } from './BrandSection'

interface FooterSectionProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
}

export function FooterSection({ themeSettings, isDarkMode }: FooterSectionProps) {
  return (
    <div className='relative z-10 bg-gray-50 px-4 py-6 text-center'>
      <BrandSection
        layout={themeSettings.footerLayout}
        lightLogo={themeSettings.footerLogo || themeSettings.headerLogo}
        darkLogo={themeSettings.footerLogoDark || themeSettings.headerLogoDark}
        themeSettings={themeSettings}
        isDarkMode={isDarkMode}
        isFooter
      />
      <div className='mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400'>
        <Phone className='h-3.5 w-3.5' />
        <span>客服热线：400-123-4567</span>
      </div>
    </div>
  )
}
