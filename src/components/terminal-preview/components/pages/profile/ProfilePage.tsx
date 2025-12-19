/**
 * 个人中心页
 * 按《小程序页面改造规范》改造
 * 已拆分为模块化组件
 */

import { useState, useEffect } from 'react'
import { Box } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'
import { BannerSection } from '../../BannerSection'

// 类型和常量
import type { ProfilePageProps, UserProfile, ThemeColors } from './types'
import { ORDER_ENTRIES, MENU_ITEMS, getThemeColors } from './constants'

// 子组件
import {
  UserHeader,
  OrderSection,
  MenuSection,
  EscortCard,
  ServiceCard,
} from './components'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function ProfilePage({
  themeSettings,
  isDarkMode = false,
  effectiveViewerRole = 'user',
  onEscortEntryClick,
  onWorkbenchClick,
  onExitEscortMode,
  onNavigate,
  bannerDataOverride,
}: ProfilePageProps) {
  // ============================================================================
  // 状态管理
  // ============================================================================

  const [bannerData, setBannerData] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined)

  // ============================================================================
  // 数据获取
  // ============================================================================

  useEffect(() => {
    // 获取轮播图数据
    previewApi.getBanners('profile').then(setBannerData).catch(console.error)
    // 获取用户资料
    previewApi.getUserProfile().then(setUserProfile).catch(console.error)
  }, [])

  // ============================================================================
  // 派生数据
  // ============================================================================

  const colors: ThemeColors = getThemeColors(isDarkMode)
  const primaryColor = themeSettings.primaryColor
  const isEscort = effectiveViewerRole === 'escort'

  // 优先使用覆盖数据
  const effectiveBannerData = bannerDataOverride !== undefined ? bannerDataOverride : bannerData

  // ============================================================================
  // 事件处理
  // ============================================================================

  const handleMenuItemClick = (key: string) => {
    switch (key) {
      case 'patients':
        onNavigate?.('patients')
        break
      case 'membership':
        onNavigate?.('membership')
        break
      case 'coupons':
        onNavigate?.('coupons')
        break
      case 'points':
        onNavigate?.('points')
        break
      case 'address':
        onNavigate?.('address-list')
        break
      case 'help':
        onNavigate?.('help-center')
        break
      case 'about':
        onNavigate?.('cms-page', { slug: 'about' })
        break
    }
  }

  // ============================================================================
  // 渲染
  // ============================================================================

  return (
    <Box
      style={{
        minHeight: '100vh',
        paddingBottom: 16 * wxScale,
        backgroundColor: colors.bgColor,
      }}
    >
      {/* 用户头部 */}
      <UserHeader
        userProfile={userProfile}
        isEscort={isEscort}
        primaryColor={primaryColor}
        onSettingsClick={() => onNavigate?.('user-profile-edit')}
        onExitEscortMode={onExitEscortMode}
      />

      {/* 订单统计 */}
      <OrderSection
        orderEntries={ORDER_ENTRIES}
        colors={colors}
        onViewAll={() => onNavigate?.('user-orders')}
        onOrderClick={(status) => onNavigate?.('user-orders', { status })}
      />

      {/* 个人中心轮播图 */}
      {effectiveBannerData && effectiveBannerData.enabled && effectiveBannerData.items?.length > 0 && (
        <Box style={{ marginTop: 12 * wxScale }}>
          <BannerSection
            bannerData={effectiveBannerData}
            themeSettings={themeSettings}
            autoPlayInterval={4000}
          />
        </Box>
      )}

      {/* 功能菜单 */}
      <MenuSection
        menuItems={MENU_ITEMS}
        colors={colors}
        onItemClick={handleMenuItemClick}
      />

      {/* 陪诊员入口卡片 */}
      <EscortCard
        isEscort={isEscort}
        colors={colors}
        primaryColor={primaryColor}
        onEscortEntryClick={onEscortEntryClick}
        onWorkbenchClick={onWorkbenchClick}
      />

      {/* 客服卡片 */}
      <ServiceCard colors={colors} />
    </Box>
  )
}

