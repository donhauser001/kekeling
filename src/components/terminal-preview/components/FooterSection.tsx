/**
 * 底部信息区组件
 *
 * 使用跨宿主原语组件，支持 Web 和小程序
 * 
 * #23 排版调整：三行布局
 * - 第一行：品牌名
 * - 第二行：品牌口号
 * - 第三行：客服热线
 */

import { Box, Text, Image, Icon } from '../ui/primitives'
import type { ThemeSettings, FooterVisiblePage } from '../types'
import { getResourceUrl } from '../utils'
import { isWxEnvironment } from '../platform/env'

// 小程序环境的缩放比例
const wxScale = isWxEnvironment() ? 1.1 : 1

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
  const textColor = isDarkMode ? '#9ca3af' : '#6b7280'
  const brandNameColor = isDarkMode ? '#e5e7eb' : '#374151'

  // Logo - 优先使用独立开关，向后兼容 footerLayout（#34）
  const lightLogo = themeSettings.footerLogo || themeSettings.headerLogo
  const darkLogo = themeSettings.footerLogoDark || themeSettings.headerLogoDark
  const selectedLogo = isDarkMode ? (darkLogo || lightLogo) : (lightLogo || darkLogo)
  const logoUrl = getResourceUrl(selectedLogo)
  // 如果 footerShowLogo 显式设置，使用它；否则从 footerLayout 推断
  const showLogo = themeSettings.footerShowLogo !== undefined
    ? themeSettings.footerShowLogo
    : themeSettings.footerLayout?.includes('logo')
  const hasLogo = showLogo && logoUrl
  // 品牌名显示开关：显式设置或从 footerLayout 推断
  const showName = themeSettings.footerShowName !== undefined
    ? themeSettings.footerShowName
    : (themeSettings.footerLayout?.includes('name') || themeSettings.footerLayout === 'logo-slogan' ? false : true)
  // 品牌口号显示开关
  const showSlogan = themeSettings.footerShowSlogan !== undefined
    ? themeSettings.footerShowSlogan
    : themeSettings.footerLayout?.includes('slogan')

  return (
    <Box
      className='relative z-10 px-4 py-6 text-center'
      style={{
        position: 'relative',
        zIndex: 10,
        paddingLeft: 16 * wxScale,
        paddingRight: 16 * wxScale,
        paddingTop: 24 * wxScale,
        paddingBottom: 24 * wxScale,
        textAlign: 'center',
        backgroundColor: isDarkMode ? '#1f1f1f' : '#f9fafb',
      }}
    >
      {/* #23: 三行排版布局 */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8 * wxScale,
        }}
      >
        {/* 第一行：Logo + 品牌名（根据开关独立控制） */}
        {(hasLogo || showName) && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8 * wxScale,
            }}
          >
            {hasLogo && (
              <Image
                src={logoUrl}
                alt='Logo'
                style={{ height: 24 * wxScale, width: 48 * wxScale, objectFit: 'contain' }}
                mode="aspectFit"
              />
            )}
            {showName && (
              <Text
                style={{
                  fontSize: 16 * wxScale,
                  fontWeight: 600,
                  color: brandNameColor,
                }}
              >
                {themeSettings.brandName || '科科灵陪诊'}
              </Text>
            )}
          </Box>
        )}

        {/* 第二行：品牌口号（根据开关控制） */}
        {showSlogan && themeSettings.brandSlogan && (
          <Text
            style={{
              fontSize: 13 * wxScale,
              color: textColor,
            }}
          >
            {themeSettings.brandSlogan}
          </Text>
        )}

        {/* 第三行：客服热线 */}
        {showPhone && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4 * wxScale,
              marginTop: 4 * wxScale,
            }}
          >
            <Icon name="phone-telephone" size={12 * wxScale} color={textColor} />
            <Text style={{ fontSize: 12 * wxScale, color: textColor }}>
              客服热线：{servicePhone}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}
