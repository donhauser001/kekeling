/**
 * 品牌区域组件
 */

import { Hospital } from 'lucide-react'
import type { BrandLayout, ThemeSettings } from '../types'
import { getResourceUrl } from '../utils'

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
    return darkLogo || lightLogo // 暗色模式：优先用暗色 Logo，没有则用亮色
  }
  return lightLogo || darkLogo // 亮色模式：优先用亮色 Logo，没有则用暗色
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
  const logoUrl = getResourceUrl(
    isFooter ? getThemeLogo(lightLogo, darkLogo, isDarkMode) : (darkLogo || lightLogo)
  )

  if (isFooter) {
    return (
      <div className='flex items-center justify-center gap-2.5'>
        {hasLogo && (
          logoUrl ? (
            // 底部 logo: 24px x 24px (48rpx / 2)
            <img src={logoUrl} alt='Logo' className='h-6 w-auto max-w-[48px] object-contain' />
          ) : (
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200/80'>
              <Hospital className='h-4 w-4 text-gray-500' />
            </div>
          )
        )}
        <div className='flex flex-col items-start'>
          {hasName && (
            <span className='text-sm font-semibold text-gray-600'>
              {themeSettings.brandName}
            </span>
          )}
          {hasSlogan && (
            <span className='text-xs text-gray-400'>
              {themeSettings.brandSlogan}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-3'>
      {hasLogo && (
        logoUrl ? (
          // 顶部 logo: 60px height, 100px max-width (120rpx x 200rpx / 2)
          <img
            src={logoUrl}
            alt='Logo'
            className='h-[60px] w-auto max-w-[100px] object-contain'
          />
        ) : (
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
            <Hospital className='h-5 w-5 text-white' />
          </div>
        )
      )}
      <div className='flex flex-col gap-1'>
        {hasName && (
          <span className='text-2xl font-bold tracking-wider text-white'>
            {themeSettings.brandName}
          </span>
        )}
        {hasSlogan && (
          <span className='text-[13px] tracking-wide text-white/85'>
            {themeSettings.brandSlogan}
          </span>
        )}
      </div>
    </div>
  )
}
