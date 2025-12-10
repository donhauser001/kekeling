/**
 * 轮播图区域组件
 */

import { Image as ImageIcon } from 'lucide-react'
import type { BannerAreaData, ThemeSettings } from '../types'
import { getResourceUrl } from '../utils'

interface BannerSectionProps {
  bannerData: BannerAreaData | null
  themeSettings: ThemeSettings
}

export function BannerSection({ bannerData, themeSettings }: BannerSectionProps) {
  return (
    <div className='relative z-10 px-3 pb-3'>
      {bannerData?.enabled && bannerData.items.length > 0 ? (
        <div
          className='overflow-hidden rounded-xl'
          style={{
            aspectRatio: `${bannerData.width}/${bannerData.height}`,
          }}
        >
          <img
            src={getResourceUrl(bannerData.items[0].imageUrl)}
            alt={bannerData.items[0].title || '轮播图'}
            className='h-full w-full object-cover'
          />
        </div>
      ) : (
        <div
          className='flex h-20 items-center justify-center rounded-xl'
          style={{
            background: `linear-gradient(135deg, ${themeSettings.primaryColor}20 0%, ${themeSettings.primaryColor}40 100%)`,
          }}
        >
          <div className='flex flex-col items-center' style={{ color: `${themeSettings.primaryColor}80` }}>
            <ImageIcon className='h-6 w-6' />
            <span className='mt-1 text-[9px]'>轮播图区域</span>
          </div>
        </div>
      )}
    </div>
  )
}
