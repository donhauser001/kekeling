/**
 * 服务详情页预览组件
 */

import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Clock,
  Shield,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  ChevronRight,
  CheckCircle,
  Stethoscope,
  Users,
  GitBranch,
  FileText,
  ImageIcon,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'
import { getResourceUrl } from '../../utils'
import { BannerSection } from '../BannerSection'

interface ServiceDetailPageProps {
  serviceId: string
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
}

// 选项卡类型
type InfoTabType = 'highlights' | 'workflow' | 'notice'

export function ServiceDetailPage({
  serviceId,
  themeSettings,
  isDarkMode = false,
  onBack,
}: ServiceDetailPageProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTabType>('highlights')

  // 流程横向拖动
  const workflowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleWorkflowMouseDown = (e: React.MouseEvent) => {
    if (!workflowRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - workflowRef.current.offsetLeft)
    setScrollLeft(workflowRef.current.scrollLeft)
  }

  const handleWorkflowMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !workflowRef.current) return
    e.preventDefault()
    const x = e.pageX - workflowRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    workflowRef.current.scrollLeft = scrollLeft - walk
  }

  const handleWorkflowMouseUp = () => setIsDragging(false)
  const handleWorkflowMouseLeave = () => setIsDragging(false)

  const handleWorkflowTouchStart = (e: React.TouchEvent) => {
    if (!workflowRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - workflowRef.current.offsetLeft)
    setScrollLeft(workflowRef.current.scrollLeft)
  }

  const handleWorkflowTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !workflowRef.current) return
    const x = e.touches[0].pageX - workflowRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    workflowRef.current.scrollLeft = scrollLeft - walk
  }

  const handleWorkflowTouchEnd = () => setIsDragging(false)

  // 获取服务详情
  const { data: service, isLoading } = useQuery({
    queryKey: ['preview', 'serviceDetail', serviceId],
    queryFn: () => previewApi.getServiceDetail(serviceId),
    enabled: !!serviceId,
    staleTime: 60 * 1000,
  })

  // 获取服务详情页轮播图
  const { data: bannerData } = useQuery({
    queryKey: ['preview', 'banners', 'service-detail'],
    queryFn: () => previewApi.getBanners('service-detail'),
    staleTime: 60 * 1000,
  })

  // 获取推荐服务（排除当前服务，最多5个）
  const { data: recommendedData } = useQuery({
    queryKey: ['preview', 'recommendedServices', serviceId],
    queryFn: () => previewApi.getServices({ pageSize: 6 }),
    enabled: !!serviceId,
    staleTime: 60 * 1000,
  })

  const recommendedServices = (recommendedData?.data || []).filter(s => s.id !== serviceId).slice(0, 5)

  // 推荐服务横向拖动
  const recommendRef = useRef<HTMLDivElement>(null)
  const [isRecommendDragging, setIsRecommendDragging] = useState(false)
  const [recommendStartX, setRecommendStartX] = useState(0)
  const [recommendScrollLeft, setRecommendScrollLeft] = useState(0)

  const handleRecommendMouseDown = (e: React.MouseEvent) => {
    if (!recommendRef.current) return
    setIsRecommendDragging(true)
    setRecommendStartX(e.pageX - recommendRef.current.offsetLeft)
    setRecommendScrollLeft(recommendRef.current.scrollLeft)
  }

  const handleRecommendMouseMove = (e: React.MouseEvent) => {
    if (!isRecommendDragging || !recommendRef.current) return
    e.preventDefault()
    const x = e.pageX - recommendRef.current.offsetLeft
    const walk = (x - recommendStartX) * 1.5
    recommendRef.current.scrollLeft = recommendScrollLeft - walk
  }

  const handleRecommendMouseUp = () => setIsRecommendDragging(false)
  const handleRecommendMouseLeave = () => setIsRecommendDragging(false)

  const handleRecommendTouchStart = (e: React.TouchEvent) => {
    if (!recommendRef.current) return
    setIsRecommendDragging(true)
    setRecommendStartX(e.touches[0].pageX - recommendRef.current.offsetLeft)
    setRecommendScrollLeft(recommendRef.current.scrollLeft)
  }

  const handleRecommendTouchMove = (e: React.TouchEvent) => {
    if (!isRecommendDragging || !recommendRef.current) return
    const x = e.touches[0].pageX - recommendRef.current.offsetLeft
    const walk = (x - recommendStartX) * 1.5
    recommendRef.current.scrollLeft = recommendScrollLeft - walk
  }

  const handleRecommendTouchEnd = () => setIsRecommendDragging(false)

  // 深色模式颜色
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const headerBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  // 服务亮点（示例数据）
  const highlights = service?.features || [
    '专业陪诊团队',
    '全程一对一服务',
    '熟悉医院流程',
    '贴心关怀照顾',
  ]

  // 服务流程（示例数据，后续可从流程管理获取）
  const workflowSteps = [
    { id: '1', name: '下单预约', type: 'start' as const },
    { id: '2', name: '陪诊员接单', type: 'action' as const },
    { id: '3', name: '到达医院', type: 'action' as const },
    { id: '4', name: '全程陪诊', type: 'action' as const },
    { id: '5', name: '服务完成', type: 'end' as const },
  ]

  // 流程步骤类型颜色
  const stepTypeColors = {
    start: { bg: isDarkMode ? '#166534' : '#dcfce7', text: isDarkMode ? '#86efac' : '#166534' },
    action: { bg: isDarkMode ? '#1e40af' : '#dbeafe', text: isDarkMode ? '#93c5fd' : '#1e40af' },
    condition: { bg: isDarkMode ? '#92400e' : '#fef3c7', text: isDarkMode ? '#fcd34d' : '#92400e' },
    end: { bg: isDarkMode ? '#6b21a8' : '#f3e8ff', text: isDarkMode ? '#d8b4fe' : '#6b21a8' },
  }

  // 服务须知（示例数据）
  const notices = [
    '请提前一天预约服务',
    '服务当天请携带有效身份证件',
    '如需取消请提前4小时通知',
    '服务时间以实际就诊时长为准',
  ]

  // 信息选项卡配置
  const infoTabs: { key: InfoTabType; label: string; icon: React.ReactNode }[] = [
    { key: 'highlights', label: '服务亮点', icon: <Sparkles className='h-3.5 w-3.5' /> },
    { key: 'workflow', label: '服务流程', icon: <GitBranch className='h-3.5 w-3.5' /> },
    { key: 'notice', label: '服务须知', icon: <AlertCircle className='h-3.5 w-3.5' /> },
  ]

  if (isLoading) {
    return (
      <div style={{ backgroundColor: bgColor }} className='min-h-full flex items-center justify-center'>
        <div className='flex flex-col items-center'>
          <div
            className='h-8 w-8 animate-spin rounded-full border-2 border-t-transparent'
            style={{ borderColor: `${themeSettings.primaryColor} transparent` }}
          />
          <p className='mt-3 text-sm' style={{ color: textMuted }}>加载中...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div style={{ backgroundColor: bgColor }} className='min-h-full flex items-center justify-center'>
        <div className='flex flex-col items-center'>
          <Stethoscope className='h-12 w-12' style={{ color: textMuted }} />
          <p className='mt-3 text-sm' style={{ color: textMuted }}>服务不存在</p>
          <button
            className='mt-4 px-4 py-2 rounded-full text-sm'
            style={{ backgroundColor: themeSettings.primaryColor, color: '#fff' }}
            onClick={onBack}
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  // 图片列表
  const images = service.images?.length ? service.images : (service.coverImage ? [service.coverImage] : [])

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full'>
      {/* 顶部导航栏 */}
      <div
        className='sticky top-0 z-20 flex items-center justify-between px-3 py-3'
        style={{ backgroundColor: headerBg }}
      >
        <button
          onClick={onBack}
          className='flex items-center gap-1 text-sm'
          style={{ color: textPrimary }}
        >
          <ArrowLeft className='h-5 w-5' />
          <span>返回</span>
        </button>
        <div className='flex items-center gap-3'>
          <button onClick={() => setIsFavorite(!isFavorite)}>
            <Heart
              className='h-5 w-5 transition-colors'
              style={{
                color: isFavorite ? '#ff4d4f' : textMuted,
                fill: isFavorite ? '#ff4d4f' : 'transparent',
              }}
            />
          </button>
          <Share2 className='h-5 w-5' style={{ color: textMuted }} />
        </div>
      </div>

      {/* 服务图片/轮播 */}
      {images.length > 0 ? (
        <div className='relative'>
          <div
            className='h-56 flex items-center justify-center'
            style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
          >
            <img
              src={getResourceUrl(images[activeImageIndex])}
              alt={service.name}
              className='h-full w-full object-cover'
            />
          </div>
          {/* 图片指示器 */}
          {images.length > 1 && (
            <div className='absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5'>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    index === activeImageIndex ? 'w-4' : 'w-1.5'
                  )}
                  style={{
                    backgroundColor: index === activeImageIndex
                      ? themeSettings.primaryColor
                      : 'rgba(255, 255, 255, 0.6)',
                  }}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className='h-40 flex items-center justify-center'
          style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
        >
          <Stethoscope className='h-16 w-16' style={{ color: themeSettings.primaryColor }} />
        </div>
      )}

      {/* 服务详情页轮播图 */}
      {bannerData?.enabled && bannerData.items && bannerData.items.length > 0 && (
        <div className='mt-3'>
          <BannerSection
            bannerData={bannerData}
            themeSettings={themeSettings}
            autoPlayInterval={4000}
          />
        </div>
      )}

      {/* 服务信息卡片 */}
      <div className='mx-3 -mt-6 relative z-10 rounded-xl p-4' style={{ backgroundColor: cardBg }}>
        {/* 分类标签 */}
        {service.category && (
          <span
            className='inline-block px-2 py-0.5 rounded text-xs mb-2'
            style={{
              backgroundColor: `${themeSettings.primaryColor}15`,
              color: themeSettings.primaryColor,
            }}
          >
            {service.category.name}
          </span>
        )}

        {/* 服务名称 */}
        <h1 className='text-lg font-bold' style={{ color: textPrimary }}>
          {service.name}
        </h1>

        {/* 简介 */}
        {service.description && (
          <p className='mt-2 text-sm' style={{ color: textSecondary }}>
            {service.description}
          </p>
        )}

        {/* 价格和统计 */}
        <div className='mt-4 flex items-end justify-between'>
          <div className='flex items-baseline gap-1'>
            <span className='text-sm' style={{ color: themeSettings.primaryColor }}>¥</span>
            <span className='text-2xl font-bold' style={{ color: themeSettings.primaryColor }}>
              {service.price}
            </span>
            {service.unit && (
              <span className='text-sm' style={{ color: textMuted }}>/{service.unit}</span>
            )}
            {service.originalPrice && service.originalPrice > service.price && (
              <span className='ml-2 text-sm line-through' style={{ color: textMuted }}>
                ¥{service.originalPrice}
              </span>
            )}
          </div>
          <div className='flex items-center gap-3 text-xs' style={{ color: textMuted }}>
            <div className='flex items-center gap-1'>
              <Star className='h-3.5 w-3.5 text-amber-400' />
              <span>{service.rating}%好评</span>
            </div>
            <div className='flex items-center gap-1'>
              <Users className='h-3.5 w-3.5' />
              <span>{service.orderCount.toLocaleString()}人购</span>
            </div>
          </div>
        </div>

        {/* 服务时长 */}
        {service.duration && (
          <div
            className='mt-4 flex items-center gap-2 px-3 py-2 rounded-lg'
            style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}
          >
            <Clock className='h-4 w-4' style={{ color: themeSettings.primaryColor }} />
            <span className='text-sm' style={{ color: textSecondary }}>
              预计服务时长：{service.duration}
            </span>
          </div>
        )}
      </div>

      {/* 信息选项卡 */}
      <div className='mx-3 mt-3 rounded-xl overflow-hidden' style={{ backgroundColor: cardBg }}>
        {/* 选项卡头部 */}
        <div
          className='flex border-b'
          style={{ borderColor: isDarkMode ? '#3a3a3a' : '#e5e7eb' }}
        >
          {infoTabs.map((tab) => (
            <button
              key={tab.key}
              className='flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors relative'
              style={{
                color: activeInfoTab === tab.key ? themeSettings.primaryColor : textMuted,
              }}
              onClick={() => setActiveInfoTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
              {activeInfoTab === tab.key && (
                <div
                  className='absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full'
                  style={{ backgroundColor: themeSettings.primaryColor }}
                />
              )}
            </button>
          ))}
        </div>

        {/* 选项卡内容 */}
        <div className='p-4'>
          {/* 服务亮点 */}
          {activeInfoTab === 'highlights' && (
            <div className='grid grid-cols-2 gap-2'>
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className='flex items-center gap-2 px-3 py-2 rounded-lg'
                  style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}
                >
                  <CheckCircle className='h-4 w-4 flex-shrink-0' style={{ color: '#10b981' }} />
                  <span className='text-xs' style={{ color: textSecondary }}>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* 服务流程 */}
          {activeInfoTab === 'workflow' && (
            <div
              ref={workflowRef}
              className='overflow-x-auto cursor-grab active:cursor-grabbing select-none'
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              onMouseDown={handleWorkflowMouseDown}
              onMouseMove={handleWorkflowMouseMove}
              onMouseUp={handleWorkflowMouseUp}
              onMouseLeave={handleWorkflowMouseLeave}
              onTouchStart={handleWorkflowTouchStart}
              onTouchMove={handleWorkflowTouchMove}
              onTouchEnd={handleWorkflowTouchEnd}
            >
              <style>{`
                div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }
              `}</style>
              <div className='flex items-center gap-1 py-1'>
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className='flex items-center'>
                    <div
                      className='rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap font-medium'
                      style={{
                        backgroundColor: stepTypeColors[step.type].bg,
                        color: stepTypeColors[step.type].text,
                      }}
                    >
                      {step.name}
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <ArrowRight
                        className='mx-1 h-3.5 w-3.5 flex-shrink-0'
                        style={{ color: textMuted }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 服务须知 */}
          {activeInfoTab === 'notice' && (
            <div className='space-y-2'>
              {(service.notes ? service.notes.split('\n') : notices).map((item, index) => (
                <div key={index} className='flex items-start gap-2'>
                  <div
                    className='mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0'
                    style={{ backgroundColor: themeSettings.primaryColor }}
                  />
                  <span className='text-xs' style={{ color: textSecondary }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 服务内容（富文本区域） */}
      <div className='mx-3 mt-3 rounded-xl p-4' style={{ backgroundColor: cardBg }}>
        {service.content ? (
          <div
            className='rich-content text-sm leading-relaxed'
            style={{ color: textSecondary }}
          >
            {/* 富文本渲染 */}
            <style>{`
              .rich-content img {
                max-width: 100%;
                border-radius: 8px;
                margin: 8px 0;
              }
              .rich-content p {
                margin-bottom: 8px;
              }
              .rich-content ul, .rich-content ol {
                padding-left: 16px;
                margin-bottom: 8px;
              }
              .rich-content li {
                margin-bottom: 4px;
              }
              .rich-content h1, .rich-content h2, .rich-content h3 {
                font-weight: 600;
                margin: 12px 0 8px;
              }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: service.content }} />
          </div>
        ) : (
          <div
            className='flex flex-col items-center justify-center py-8 rounded-lg'
            style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}
          >
            <div className='flex items-center gap-3 mb-2'>
              <FileText className='h-6 w-6' style={{ color: textMuted }} />
              <ImageIcon className='h-6 w-6' style={{ color: textMuted }} />
            </div>
            <p className='text-xs' style={{ color: textMuted }}>
              服务详细内容
            </p>
            <p className='text-[10px] mt-1' style={{ color: textMuted }}>
              可在服务管理中添加图文介绍
            </p>
          </div>
        )}
      </div>

      {/* 服务保障 */}
      <div className='mx-3 mt-3 rounded-xl p-4' style={{ backgroundColor: cardBg }}>
        <h3 className='text-sm font-semibold mb-3' style={{ color: textPrimary }}>
          服务保障
        </h3>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1.5'>
            <Shield className='h-4 w-4' style={{ color: '#10b981' }} />
            <span className='text-xs' style={{ color: textSecondary }}>平台担保</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <CheckCircle className='h-4 w-4' style={{ color: '#10b981' }} />
            <span className='text-xs' style={{ color: textSecondary }}>先服务后付款</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <Star className='h-4 w-4' style={{ color: '#10b981' }} />
            <span className='text-xs' style={{ color: textSecondary }}>好评返现</span>
          </div>
        </div>
      </div>

      {/* 推荐服务 */}
      {recommendedServices.length > 0 && (
        <div className='mt-3' style={{ backgroundColor: cardBg }}>
          <div className='flex items-center justify-between px-4 pt-4 pb-2'>
            <h3 className='text-sm font-semibold' style={{ color: textPrimary }}>
              推荐服务
            </h3>
          </div>
          <div
            ref={recommendRef}
            className='overflow-x-auto cursor-grab active:cursor-grabbing select-none pb-4'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onMouseDown={handleRecommendMouseDown}
            onMouseMove={handleRecommendMouseMove}
            onMouseUp={handleRecommendMouseUp}
            onMouseLeave={handleRecommendMouseLeave}
            onTouchStart={handleRecommendTouchStart}
            onTouchMove={handleRecommendTouchMove}
            onTouchEnd={handleRecommendTouchEnd}
          >
            <style>{`
              div[class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }
            `}</style>
            <div className='flex gap-2.5 px-4'>
              {recommendedServices.map((item) => (
                <div
                  key={item.id}
                  className='w-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg active:scale-[0.98]'
                  style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}
                >
                  {/* 封面 */}
                  <div
                    className='h-20 flex items-center justify-center'
                    style={{ backgroundColor: isDarkMode ? '#4a4a4a' : '#e5e7eb' }}
                  >
                    {item.coverImage ? (
                      <img
                        src={getResourceUrl(item.coverImage)}
                        alt={item.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <Stethoscope className='h-8 w-8' style={{ color: textMuted }} />
                    )}
                  </div>
                  {/* 信息 */}
                  <div className='p-2'>
                    <p className='text-xs font-semibold truncate' style={{ color: textPrimary }}>
                      {item.name}
                    </p>
                    <div className='mt-1.5 flex items-baseline gap-0.5'>
                      <span className='text-[10px]' style={{ color: themeSettings.primaryColor }}>¥</span>
                      <span className='text-sm font-bold' style={{ color: themeSettings.primaryColor }}>
                        {item.price}
                      </span>
                    </div>
                    <p className='text-[10px] mt-0.5' style={{ color: textMuted }}>
                      {item.orderCount.toLocaleString()}人购
                    </p>
                  </div>
                </div>
              ))}
              {/* 查看更多卡片 */}
              <div
                className='w-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] flex flex-col items-center justify-center'
                style={{
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb',
                  minHeight: '140px',
                }}
              >
                <div
                  className='w-10 h-10 rounded-full flex items-center justify-center mb-2'
                  style={{ backgroundColor: `${themeSettings.primaryColor}15` }}
                >
                  <ChevronRight className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
                </div>
                <span className='text-xs font-medium' style={{ color: themeSettings.primaryColor }}>
                  查看更多
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部操作栏 */}
      <div
        className='sticky bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-3 border-t z-30 mt-3'
        style={{ backgroundColor: cardBg, borderColor }}
      >
        {/* 客服按钮 */}
        <div className='flex flex-col items-center cursor-pointer'>
          <MessageCircle className='h-5 w-5' style={{ color: textMuted }} />
          <span className='text-[10px] mt-0.5' style={{ color: textMuted }}>客服</span>
        </div>

        {/* 电话按钮 */}
        <div className='flex flex-col items-center cursor-pointer'>
          <Phone className='h-5 w-5' style={{ color: textMuted }} />
          <span className='text-[10px] mt-0.5' style={{ color: textMuted }}>电话</span>
        </div>

        {/* 立即预约按钮 */}
        <button
          className='flex-1 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]'
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          立即预约
        </button>
      </div>
    </div>
  )
}
