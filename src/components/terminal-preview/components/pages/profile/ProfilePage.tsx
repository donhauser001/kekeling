/**
 * 个人中心页
 * 按《小程序页面改造规范》改造
 * 已拆分为模块化组件
 *
 * 陪诊员视角逻辑：
 * - effectiveViewerRole 由 escortToken 推导（useViewerRole hook）
 * - 退出陪诊员模式 = 清除 escortToken → effectiveViewerRole 自动变成 'user'
 * - 服务详情页等根据 effectiveViewerRole 自动隐藏陪诊员专属内容
 * - 再次进入工作台需要重新登录获取 escortToken
 */

import { useState, useEffect, useMemo } from 'react'
import { Box } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'
import { BannerSection } from '../../BannerSection'
import type { MarketingSettings } from '../../../api/types'

// 类型和常量
import type { ProfilePageProps, UserProfile, ThemeColors, OrderEntry, MenuItem } from './types'
import { ORDER_ENTRY_CONFIG, MENU_ITEMS, getThemeColors } from './constants'

/**
 * 菜单项与营销设置的映射关系
 * key: 菜单项 key
 * value: 对应的营销设置字段
 */
const MENU_FEATURE_MAP: Record<string, keyof MarketingSettings> = {
  membership: 'membershipEnabled',
  coupons: 'couponsEnabled',
  points: 'pointsEnabled',
}

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
  const [marketingSettings, setMarketingSettings] = useState<MarketingSettings>({
    membershipEnabled: true,
    pointsEnabled: true,
    couponsEnabled: true,
    referralsEnabled: true,
    campaignsEnabled: true,
  })

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
    // 获取营销设置（控制功能入口显示/隐藏）
    previewApi.getMarketingSettings().then(setMarketingSettings).catch(console.error)
  }, [])

  // ============================================================================
  // 派生数据
  // ============================================================================

  const colors: ThemeColors = getThemeColors(isDarkMode)
  const primaryColor = themeSettings.primaryColor

  // 是否处于陪诊员视角（由 escortToken 推导）
  const isEscortMode = effectiveViewerRole === 'escort'

  // 是否有陪诊员资质（后端返回，审核通过）
  const hasEscortQualification = userProfile?.isEscort === true

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

  // 根据营销设置过滤菜单项，并动态设置 badge（优惠券数量）
  const menuItemsWithBadge: MenuItem[] = useMemo(() => {
    return MENU_ITEMS
      // 根据营销设置过滤菜单项
      .filter(item => {
        const featureKey = MENU_FEATURE_MAP[item.key]
        // 如果没有映射关系，说明不受营销设置控制，始终显示
        if (!featureKey) return true
        // 根据营销设置决定是否显示
        return marketingSettings[featureKey] !== false
      })
      // 动态设置 badge
      .map(item => {
        if (item.key === 'coupons' && couponCount > 0) {
          return { ...item, badge: couponCount > 99 ? '99+' : String(couponCount) }
        }
        return item
      })
  }, [couponCount, marketingSettings])

  // ============================================================================
  // 事件处理
  // ============================================================================

  const handleMenuItemClick = (key: string) => {
    switch (key) {
      case 'favorites':
        onNavigate?.('favorites')
        break
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
        isEscortMode={isEscortMode}
        hasEscortQualification={hasEscortQualification}
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
        hasEscortQualification={hasEscortQualification}
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
