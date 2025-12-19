/**
 * 品牌区域组件
 */

import type { BrandLayout, ThemeSettings } from '../types'
import { getResourceUrl } from '../utils'
import { isWxEnvironment } from '../platform/env'
import { Box, Image, Text } from '../ui/primitives'

// 小程序环境的缩放比例
const wxScale = isWxEnvironment() ? 1.1 : 1

interface BrandSectionProps {
  layout: BrandLayout
  lightLogo: string
  darkLogo: string
  themeSettings: ThemeSettings
  isDarkMode: boolean
  isFooter?: boolean
}

// 根据当前主题获取对应的 Logo
function getThemeLogo(lightLogo: string, darkLogo: string, isDarkMode: boolean): string {
  if (isDarkMode) {
    return darkLogo || lightLogo // 深色模式：优先用深色 Logo，没有则用浅色
  }
  return lightLogo || darkLogo // 浅色模式：优先用浅色 Logo，没有则用深色
}

export function BrandSection({
  layout,
  lightLogo,
  darkLogo,
  themeSettings,
  isDarkMode,
  isFooter = false,
}: BrandSectionProps) {
  const hasLogo = layout.includes('logo')
  const hasName = layout.includes('name') && layout !== 'logo-slogan'
  const hasSlogan = layout.includes('slogan')
  // 首页顶部（非 footer）始终使用深色 logo（适合浅色背景上的渐变顶部），底部根据深浅色模式切换
  const selectedLogo = isFooter ? getThemeLogo(lightLogo, darkLogo, isDarkMode) : (darkLogo || lightLogo)
  const logoUrl = getResourceUrl(selectedLogo)

  // 调试日志
  console.log('[BrandSection] Logo 状态:', {
    lightLogo,
    darkLogo,
    selectedLogo,
    logoUrl,
    hasLogo,
    isFooter,
  })

  if (isFooter) {
    return (
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {hasLogo && (
          logoUrl ? (
            // 底部 logo: 24px x 48px (小程序需要明确宽度)
            <Image
              src={logoUrl}
              alt='Logo'
              style={{ height: 24, width: 48, objectFit: 'contain' }}
              mode="aspectFit"
            />
          ) : (
            <Box style={{ display: 'flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: 'rgba(229,231,235,0.8)' }}>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                医
              </Text>
            </Box>
          )
        )}
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {hasName && (
            <Text style={{ fontSize: 14, fontWeight: 600, color: '#4b5563' }}>
              {themeSettings.brandName}
            </Text>
          )}
          {hasSlogan && (
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>
              {themeSettings.brandSlogan}
            </Text>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 16 * wxScale }}>
      {hasLogo && (
        logoUrl ? (
          // 顶部 logo (小程序需要明确宽度，并应用缩放)
          <Image
            src={logoUrl}
            alt='Logo'
            style={{ height: 72 * wxScale, width: 120 * wxScale, objectFit: 'contain' }}
            mode="aspectFit"
          />
        ) : (
          <Box style={{ display: 'flex', width: 48 * wxScale, height: 48 * wxScale, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={{ fontSize: 16 * wxScale, color: '#ffffff' }}>
              医
            </Text>
          </Box>
        )
      )}
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 * wxScale }}>
        {hasName && (
          <Text style={{ fontSize: 28 * wxScale, fontWeight: 700, letterSpacing: 1, color: '#ffffff' }}>
            {themeSettings.brandName}
          </Text>
        )}
        {hasSlogan && (
          <Text style={{ fontSize: 15 * wxScale, letterSpacing: 0.5, color: 'rgba(255,255,255,0.85)' }}>
            {themeSettings.brandSlogan}
          </Text>
        )}
      </Box>
    </Box>
  )
}
