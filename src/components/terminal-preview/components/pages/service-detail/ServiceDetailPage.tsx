/**
 * 服务详情页预览组件（重构版）
 * 按《小程序页面改造规范》改造
 *
 * 模块化拆分：
 * - hooks/ - 数据获取、主题颜色、拖动逻辑
 * - components/ - 各功能区块子组件
 * - types.ts - 类型定义
 */

import { useState, useEffect, useCallback } from 'react'
import { Box } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { BannerSection } from '../../BannerSection'
import { useThemeColors, useServiceDetailData } from './hooks'
import { previewApi } from '../../../api'
import { getWxBridge } from '../../../bridge/wx-bridge'
import {
  ServiceHeader,
  ServiceImageCarousel,
  ServiceInfoCard,
  EscortInfoSection,
  ServiceInfoTabs,
  ServiceRichContent,
  ServiceGuarantees,
  GuaranteeDetailModal,
  RecommendedServices,
  BottomActionBar,
  LoadingState,
  EmptyState,
} from './components'
import type { ServiceDetailPageProps, GuaranteeItem } from './types'

const wxScale = isWxEnvironment() ? 1.1 : 1

export function ServiceDetailPage({
  serviceId,
  themeSettings,
  isDarkMode = false,
  onBack,
  onServiceClick,
  onNavigate,
  effectiveViewerRole = 'user',
  onCustomerService,
  onPhoneCall,
}: ServiceDetailPageProps) {
  // 是否为陪诊员视角
  const isEscort = effectiveViewerRole === 'escort'

  // 状态
  const [isFavorite, setIsFavorite] = useState(false)
  const [showGuaranteeDetail, setShowGuaranteeDetail] = useState(false)
  const [selectedGuarantee, setSelectedGuarantee] = useState<GuaranteeItem | null>(null)

  // 数据获取
  const { service, isLoading, bannerData, recommendedServices } = useServiceDetailData(serviceId)

  // 检查是否已收藏
  useEffect(() => {
    if (serviceId) {
      previewApi.checkFavorite(serviceId)
        .then(result => setIsFavorite(result))
        .catch(err => console.error('[ServiceDetailPage] 检查收藏状态失败:', err))
    }
  }, [serviceId])

  // 切换收藏
  const handleFavoriteToggle = useCallback(async () => {
    const wxBridge = getWxBridge()

    // 乐观更新
    setIsFavorite(prev => !prev)

    try {
      if (isFavorite) {
        const result = await previewApi.removeFavorite(serviceId)
        wxBridge.showToast({ title: result.message || '已取消收藏', icon: 'none' })
      } else {
        const result = await previewApi.addFavorite(serviceId)
        wxBridge.showToast({ title: result.message || '收藏成功', icon: 'success' })
      }
    } catch (err) {
      // 失败时回滚
      setIsFavorite(prev => !prev)
      wxBridge.showToast({ title: '操作失败', icon: 'none' })
    }
  }, [serviceId, isFavorite])

  // 主题颜色
  const colors = useThemeColors(isDarkMode)

  // 加载中
  if (isLoading) {
    return <LoadingState themeSettings={themeSettings} colors={colors} />
  }

  // 服务不存在
  if (!service) {
    return <EmptyState themeSettings={themeSettings} colors={colors} onBack={onBack} />
  }

  // 图片列表
  const images = service.detailImages?.length
    ? service.detailImages
    : (service.coverImage ? [service.coverImage] : [])

  // 服务保障
  const guarantees: GuaranteeItem[] = service?.guarantees?.length
    ? service.guarantees.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      description: g.description,
    }))
    : [
      { id: '1', name: '平台担保', icon: 'shield', description: '平台提供资金担保，确保服务交易安全可靠。' },
      { id: '2', name: '先服务后付款', icon: 'check', description: '服务完成后再确认付款，保障您的消费权益。' },
      { id: '3', name: '好评返现', icon: 'star', description: '服务完成后给予好评，可获得现金返还。' },
    ]

  const handleGuaranteeClick = (item: GuaranteeItem) => {
    setSelectedGuarantee(item)
    setShowGuaranteeDetail(true)
  }

  const pageBottomPadding = isWxEnvironment()
    ? `calc(${96 * wxScale}px + env(safe-area-inset-bottom))`
    : 0

  return (
    <Box
      className='min-h-full'
      style={{
        minHeight: '100%',
        paddingBottom: pageBottomPadding,
        backgroundColor: colors.bgColor,
      }}
    >
      {/* 顶部导航栏 */}
      <ServiceHeader
        service={service}
        serviceId={serviceId}
        themeSettings={themeSettings}
        colors={colors}
        isDarkMode={isDarkMode}
        isFavorite={isFavorite}
        onFavoriteToggle={handleFavoriteToggle}
        onBack={onBack}
      />

      {/* 服务图片轮播 */}
      <ServiceImageCarousel
        images={images}
        serviceName={service.name}
        primaryColor={themeSettings.primaryColor}
        isDarkMode={isDarkMode}
      />

      {/* 服务信息卡片 */}
      <ServiceInfoCard
        service={service}
        themeSettings={themeSettings}
        colors={colors}
        isDarkMode={isDarkMode}
      />

      {/* 陪诊员专属区块 */}
      {isEscort && (
        <EscortInfoSection
          service={service}
          themeSettings={themeSettings}
          colors={colors}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 信息选项卡（亮点/流程/须知） */}
      <ServiceInfoTabs
        service={service}
        themeSettings={themeSettings}
        colors={colors}
        isDarkMode={isDarkMode}
      />

      {/* 服务详情页轮播图 */}
      {bannerData?.enabled && bannerData.items && bannerData.items.length > 0 && (
        <Box style={{ marginTop: 12 * wxScale }}>
          <BannerSection
            bannerData={bannerData}
            themeSettings={themeSettings}
            autoPlayInterval={4000}
          />
        </Box>
      )}

      {/* 服务内容（富文本） */}
      <ServiceRichContent
        content={service.content ?? null}
        themeSettings={themeSettings}
        colors={colors}
        isDarkMode={isDarkMode}
      />

      {/* 服务保障 */}
      <ServiceGuarantees
        guarantees={guarantees}
        colors={colors}
        isDarkMode={isDarkMode}
        onGuaranteeClick={handleGuaranteeClick}
      />

      {/* 保障详情弹窗 */}
      <GuaranteeDetailModal
        guarantee={selectedGuarantee}
        isOpen={showGuaranteeDetail}
        onClose={() => setShowGuaranteeDetail(false)}
        themeSettings={themeSettings}
        colors={colors}
      />

      {/* 推荐服务 */}
      <RecommendedServices
        services={recommendedServices}
        themeSettings={themeSettings}
        colors={colors}
        isDarkMode={isDarkMode}
        onServiceClick={onServiceClick}
        onNavigate={onNavigate}
      />

      {/* 底部操作栏 */}
      <BottomActionBar
        serviceId={serviceId}
        themeSettings={themeSettings}
        colors={colors}
        servicePhone={themeSettings.servicePhone}
        onNavigate={onNavigate}
        onCustomerService={onCustomerService}
        onPhoneCall={onPhoneCall}
      />
    </Box>
  )
}
