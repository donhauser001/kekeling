/**
 * 服务详情页顶部导航栏
 * 按《小程序页面改造规范》改造
 */

import { ArrowLeft, Heart, Share2 } from '../../../../ui/lucide-compat'
import { Box, Text, Button } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { getWxBridge } from '../../../../bridge'
import { getResourceUrl } from '../../../../utils'
import type { ServiceHeaderProps } from '../types'

const wxScale = isWxEnvironment() ? 1.15 : 1

export function ServiceHeader({
  service,
  serviceId,
  themeSettings,
  colors,
  isFavorite,
  onFavoriteToggle,
  onBack,
}: ServiceHeaderProps) {
  const { headerBg, textPrimary, textMuted } = colors

  const handleShare = () => {
    const wxBridge = getWxBridge()
    wxBridge.share({
      title: service?.name || '服务详情',
      desc: service?.description || '查看服务详情',
      path: `/pages/service/detail?id=${serviceId}`,
      imageUrl: service?.coverImage ? getResourceUrl(service.coverImage) : undefined,
    })
  }

  return (
    <Box
      className='sticky top-0 z-20 flex items-center justify-between px-3 py-3'
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 12 * wxScale,
        paddingRight: 12 * wxScale,
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale,
        backgroundColor: headerBg,
      }}
    >
      <Button
        onClick={onBack}
        className='flex items-center gap-1 text-sm'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4 * wxScale,
          fontSize: 14 * wxScale,
          color: textPrimary,
        }}
      >
        <ArrowLeft size={20 * wxScale} color={textPrimary} />
        <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>返回</Text>
      </Button>
      <Box
        className='flex items-center gap-3'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12 * wxScale,
        }}
      >
        <Box
          onClick={onFavoriteToggle}
          style={{
            width: 28 * wxScale,
            height: 28 * wxScale,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Heart
            size={20 * wxScale}
            color={isFavorite ? '#ff4d4f' : textMuted}
          />
        </Box>
        <Box
          onClick={handleShare}
          style={{
            width: 28 * wxScale,
            height: 28 * wxScale,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Share2 size={20 * wxScale} color={textMuted} />
        </Box>
      </Box>
    </Box>
  )
}
