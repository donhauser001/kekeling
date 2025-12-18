/**
 * 底部信息区组件
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 */

import { Box, Text } from '../ui/primitives'
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
    <Box
      className='relative z-10 px-4 py-6 text-center'
      style={{
        position: 'relative',
        zIndex: 10,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 24,
        paddingBottom: 24,
        textAlign: 'center',
        backgroundColor: isDarkMode ? '#1f1f1f' : '#f9fafb',
      }}
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
        <Box
          className='mt-3 flex items-center justify-center gap-1.5 text-xs'
          style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 12, color: isDarkMode ? '#6b7280' : '#9ca3af' }}>📞</Text>
          <Text style={{ fontSize: 12, color: isDarkMode ? '#6b7280' : '#9ca3af' }}>
            客服热线：{servicePhone}
          </Text>
        </Box>
      )}
    </Box>
  )
}
