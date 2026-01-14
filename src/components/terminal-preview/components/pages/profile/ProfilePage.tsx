/**
 * 个人中心页
 * 按《小程序页面改造规范》改造
 * 已拆分为模块化组件
 */

import { useState, useEffect, useMemo } from 'react'
import { Box } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'
import { BannerSection } from '../../BannerSection'

// 类型和常量
import type { ProfilePageProps, UserProfile, ThemeColors, OrderEntry, MenuItem } from './types'
import { ORDER_ENTRY_CONFIG, MENU_ITEMS, getThemeColors } from './constants'

// 子组件
import {
  UserHeader,
  OrderSection,
  MenuSection,
  EscortCard,
  ServiceCard,
} from './components'

const wxScale = isWxEnvironment() ? 1.1 : 1

/** 订单统计数据 */
interface OrderStats {
  pending: number
  confirmed: number
  inProgress: number
  completed: number
}

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
  const [orderStats, setOrderStats] = useState<OrderStats>({ pending: 0, confirmed: 0, inProgress: 0, completed: 0 })
  const [couponCount, setCouponCount] = useState<number>(0)

  // ============================================================================
  // 数据获取
  // ============================================================================

  useEffect(() => {
    // 获取轮播图数据
    previewApi.getBanners('profile').then(setBannerData).catch(console.error)
    // 获取用户资料
    previewApi.getUserProfile().then((data) => {
      setUserProfile(data || undefined)
    }).catch(console.error)
    // 获取订单统计
    previewApi.getOrderStats().then(setOrderStats).catch(console.error)
    // 获取优惠券数量
    previewApi.getMyCoupons().then((data) => {
      // 只统计可用状态的优惠券
      const availableCount = data.items.filter(c => c.status === 'available').length
      setCouponCount(availableCount)
    }).catch(console.error)
  }, [])

  // ============================================================================
  // 派生数据
  // ============================================================================

  const colors: ThemeColors = getThemeColors(isDarkMode)
  const primaryColor = themeSettings.primaryColor
  // 是否有有效的 escortToken（用于决定是否需要登录）
  const hasEscortToken = effectiveViewerRole === 'escort'
  // 是否是陪诊员（用于决定显示"进入工作台"还是"成为陪诊员"）
  // 优先看 userProfile.isEscort（后端返回），如果后端说是陪诊员就显示工作台入口
  const isEscort = userProfile?.isEscort === true || hasEscortToken

  // 优先使用覆盖数据
  const effectiveBannerData = bannerDataOverride !== undefined ? bannerDataOverride : bannerData

  // 合并订单统计数据与静态配置
  const orderEntries: OrderEntry[] = useMemo(() => {
    const statsMap: Record<string, number> = {
      pending: orderStats.pending,
      confirmed: orderStats.confirmed,
      in_progress: orderStats.inProgress,
      completed: orderStats.completed,
    }
    return ORDER_ENTRY_CONFIG.map(entry => ({
      ...entry,
      count: statsMap[entry.key] || 0,
    }))
  }, [orderStats])

  // 动态设置菜单项 badge（优惠券数量）
  const menuItemsWithBadge: MenuItem[] = useMemo(() => {
    return MENU_ITEMS.map(item => {
      if (item.key === 'coupons' && couponCount > 0) {
        return { ...item, badge: couponCount > 99 ? '99+' : String(couponCount) }
      }
      return item
    })
  }, [couponCount])

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
      case 'my-reviews':
        onNavigate?.('my-reviews')
        break
      case 'feedback':
        onNavigate?.('feedback')
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
        orderEntries={orderEntries}
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
        menuItems={menuItemsWithBadge}
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
      <ServiceCard colors={colors} primaryColor={primaryColor} onClick={() => onNavigate?.('customer-service')} />
    </Box>
  )
}

