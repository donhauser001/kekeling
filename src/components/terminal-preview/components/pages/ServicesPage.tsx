/**
 * 服务页预览组件
 * 
 * 使用跨平台 UI 原语，支持 Web 和小程序
 */

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Clock,
  Star,
  Rocket,
  Stethoscope,
  LayoutGrid,
  List,
  ChevronDown,
  Heart,
  Share2,
  ArrowUpDown,
  TrendingUp,
  ThumbsUp,
  DollarSign,
  Percent,
} from '../../ui/lucide-compat'
import { cn } from '@/lib/utils'
import { Box, Text, Button, Image } from '../../ui/primitives'
import type { ThemeSettings, ServiceListItem, BannerAreaData, PreviewViewerRole } from '../../types'
import { previewApi } from '../../api'
import { formatCount } from '../../utils'
import { getResourceUrl } from '../../utils'
import { BannerSection } from '../BannerSection'

type LayoutMode = 'grid' | 'list'
type SortType = 'default' | 'sales' | 'rating' | 'price-asc' | 'price-desc'

interface ServicesPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  /** 轮播图数据覆盖 */
  bannerData?: BannerAreaData | null
  /** 服务点击回调 */
  onServiceClick?: (serviceId: string) => void
  /** 当前视角角色（用于显示陪诊员专属信息） */
  effectiveViewerRole?: PreviewViewerRole
}

// 排序选项
const sortOptions: { value: SortType; label: string; icon: React.ReactNode }[] = [
  { value: 'default', label: '综合', icon: <ArrowUpDown className='h-3 w-3' /> },
  { value: 'sales', label: '销量', icon: <TrendingUp className='h-3 w-3' /> },
  { value: 'rating', label: '好评', icon: <ThumbsUp className='h-3 w-3' /> },
  { value: 'price-asc', label: '价格↑', icon: <DollarSign className='h-3 w-3' /> },
  { value: 'price-desc', label: '价格↓', icon: <DollarSign className='h-3 w-3' /> },
]

export function ServicesPage({ themeSettings, isDarkMode = false, bannerData: bannerDataOverride, onServiceClick, effectiveViewerRole = 'user' }: ServicesPageProps) {
  // 是否为陪诊员视角
  const isEscort = effectiveViewerRole === 'escort'
  const [activeCategory, setActiveCategory] = useState('all')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid')
  const [sortType, setSortType] = useState<SortType>('default')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // 获取服务页轮播图
  const { data: fetchedBannerData } = useQuery({
    queryKey: ['preview', 'banners', 'services'],
    queryFn: () => previewApi.getBanners('services'),
    staleTime: 60 * 1000,
  })

  const bannerData = bannerDataOverride ?? fetchedBannerData ?? null

  // 获取服务分类
  const { data: categories = [] } = useQuery({
    queryKey: ['preview', 'serviceCategories'],
    queryFn: previewApi.getCategories,
    staleTime: 60 * 1000,
  })

  // 获取服务列表
  const { data: servicesData } = useQuery({
    queryKey: ['preview', 'servicesList', activeCategory],
    queryFn: () => previewApi.getServices({
      categoryId: activeCategory === 'all' ? undefined : activeCategory,
      pageSize: 20,
    }),
    staleTime: 60 * 1000,
  })

  const services = servicesData?.data || []

  // 分类列表（添加"全部"选项）
  const categoryList = useMemo(() => {
    return [{ id: 'all', name: '全部' }, ...categories]
  }, [categories])

  // 客户端排序
  const sortedServices = useMemo(() => {
    const list = [...services]
    switch (sortType) {
      case 'sales':
        return list.sort((a, b) => b.orderCount - a.orderCount)
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating)
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price)
      default:
        return list
    }
  }, [services, sortType])

  // 切换收藏
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 分享
  const handleShare = (service: ServiceListItem, e: React.MouseEvent) => {
    e.stopPropagation()
    // 预览器中只做 UI 展示
  }

  // 深色模式颜色
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const headerBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  return (
    <Box style={{ backgroundColor: bgColor }} className='min-h-full pb-14'>
      {/* 搜索框 */}
      <Box className='px-3 pt-3 pb-2' style={{ backgroundColor: headerBg }}>
        <Box
          className='flex items-center gap-2 rounded-full px-4 py-2.5 cursor-pointer transition-all hover:shadow-md active:scale-[0.98]'
          style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
        >
          <Search className='h-4 w-4' style={{ color: textMuted }} />
          <Text className='text-sm' style={{ color: textMuted }}>
            搜索服务
          </Text>
        </Box>
      </Box>

      {/* 轮播图区域 */}
      {bannerData?.enabled && bannerData.items && bannerData.items.length > 0 && (
        <Box style={{ backgroundColor: headerBg }}>
          <BannerSection
            bannerData={bannerData}
            themeSettings={themeSettings}
            autoPlayInterval={3000}
            className='pb-3'
          />
        </Box>
      )}

      {/* 分类 Tab */}
      <Box
        className='sticky top-0 z-10 overflow-x-auto px-3 py-2'
        style={{ backgroundColor: headerBg }}
      >
        <Box className='category-scroll flex gap-2 overflow-x-auto'>
          {categoryList.map(cat => (
            <Box
              key={cat.id}
              className={cn(
                'flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm cursor-pointer transition-all',
                activeCategory === cat.id ? 'font-medium' : ''
              )}
              style={{
                backgroundColor: activeCategory === cat.id
                  ? `${themeSettings.primaryColor}15`
                  : isDarkMode ? '#3a3a3a' : '#f3f4f6',
                color: activeCategory === cat.id
                  ? themeSettings.primaryColor
                  : textSecondary,
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              <Text>{cat.name}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 工具栏：排序 + 布局切换 */}
      <Box
        className='flex items-center justify-between px-3 py-2'
        style={{ backgroundColor: headerBg, borderBottom: `1px solid ${borderColor}` }}
      >
        {/* 排序选择 */}
        <Box className='relative'>
          <Button
            className='flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors'
            style={{ color: textSecondary }}
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            {sortOptions.find(s => s.value === sortType)?.icon}
            <Text>{sortOptions.find(s => s.value === sortType)?.label}</Text>
            <ChevronDown className={cn('h-3 w-3 transition-transform', showSortMenu && 'rotate-180')} />
          </Button>
          {showSortMenu && (
            <Box
              className='absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg z-20 min-w-[100px]'
              style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
            >
              {sortOptions.map(option => (
                <Button
                  key={option.value}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors',
                    sortType === option.value ? 'font-medium' : ''
                  )}
                  style={{
                    color: sortType === option.value ? themeSettings.primaryColor : textSecondary,
                    backgroundColor: sortType === option.value ? `${themeSettings.primaryColor}10` : 'transparent',
                  }}
                  onClick={() => {
                    setSortType(option.value)
                    setShowSortMenu(false)
                  }}
                >
                  {option.icon}
                  <Text>{option.label}</Text>
                </Button>
              ))}
            </Box>
          )}
        </Box>

        {/* 布局切换 */}
        <Box className='flex items-center gap-1'>
          <Button
            onClick={() => setLayoutMode('grid')}
            className='rounded p-1.5 transition-colors'
            style={{
              backgroundColor: layoutMode === 'grid' ? `${themeSettings.primaryColor}20` : 'transparent',
              color: layoutMode === 'grid' ? themeSettings.primaryColor : textMuted,
            }}
          >
            <LayoutGrid className='h-4 w-4' />
          </Button>
          <Button
            onClick={() => setLayoutMode('list')}
            className='rounded p-1.5 transition-colors'
            style={{
              backgroundColor: layoutMode === 'list' ? `${themeSettings.primaryColor}20` : 'transparent',
              color: layoutMode === 'list' ? themeSettings.primaryColor : textMuted,
            }}
          >
            <List className='h-4 w-4' />
          </Button>
        </Box>
      </Box>

      {/* 服务列表 */}
      <Box className={cn(
        'px-3 pt-3',
        layoutMode === 'grid' ? 'grid grid-cols-2 gap-2.5' : 'space-y-3'
      )}>
        {sortedServices.map(service => (
          layoutMode === 'grid' ? (
            // 网格布局
            <Box
              key={service.id}
              className='rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98]'
              style={{ backgroundColor: cardBg }}
              onClick={() => onServiceClick?.(service.id)}
            >
              {/* 封面 */}
              <Box
                className='h-28 relative flex items-center justify-center'
                style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
              >
                {service.coverImage ? (
                  <Image
                    src={getResourceUrl(service.coverImage)}
                    alt={service.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <Stethoscope className='h-10 w-10' style={{ color: themeSettings.primaryColor }} />
                )}
                {/* 热门标签 */}
                {service.orderCount > 5000 && (
                  <Box
                    className='absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-[10px]'
                    style={{ backgroundColor: '#ff4d4f' }}
                  >
                    <Rocket className='h-2.5 w-2.5' />
                    <Text>热门</Text>
                  </Box>
                )}
                {/* 操作按钮 */}
                <Box className='absolute top-2 right-2 flex gap-1'>
                  <Button
                    onClick={(e) => toggleFavorite(service.id, e)}
                    className='p-1 rounded-full backdrop-blur-sm transition-colors'
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                  >
                    <Heart
                      className='h-3.5 w-3.5'
                      style={{
                        color: favorites.has(service.id) ? '#ff4d4f' : '#fff',
                        fill: favorites.has(service.id) ? '#ff4d4f' : 'transparent',
                      }}
                    />
                  </Button>
                </Box>
              </Box>
              {/* 信息 */}
              <Box className='p-2.5'>
                <Text className='text-xs font-semibold truncate' style={{ color: textPrimary }}>
                  {service.name}
                </Text>
                <Box className='mt-1.5 flex items-center gap-2 text-[10px]' style={{ color: textMuted }}>
                  <Box className='flex items-center gap-0.5'>
                    <Star className='h-2.5 w-2.5 text-amber-400' />
                    <Text>{service.rating}%</Text>
                  </Box>
                  <Text>{formatCount(service.orderCount)}人购</Text>
                </Box>
                <Box className='mt-1.5 flex items-center justify-between'>
                  <Box className='flex items-baseline gap-0.5'>
                    <Text className='text-[10px]' style={{ color: themeSettings.primaryColor }}>¥</Text>
                    <Text className='text-sm font-bold' style={{ color: themeSettings.primaryColor }}>
                      {service.price}
                    </Text>
                    {service.originalPrice && service.originalPrice > service.price && (
                      <Text className='text-[10px] line-through' style={{ color: textMuted }}>
                        ¥{service.originalPrice}
                      </Text>
                    )}
                  </Box>
                  {/* 陪诊员视角：分成比例 */}
                  {isEscort && (
                    <Box
                      className='flex items-center gap-0.5 px-1.5 py-0.5 rounded'
                      style={{
                        backgroundColor: `${themeSettings.primaryColor}15`,
                      }}
                    >
                      <Percent className='h-2.5 w-2.5' style={{ color: themeSettings.primaryColor }} />
                      <Text className='text-[10px] font-medium' style={{ color: themeSettings.primaryColor }}>
                        {service.commissionRate ?? 70}%
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            // 列表布局
            <Box
              key={service.id}
              className='rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98]'
              style={{ backgroundColor: cardBg }}
              onClick={() => onServiceClick?.(service.id)}
            >
              <Box className='flex'>
                {/* 左侧封面 */}
                <Box
                  className='w-28 h-28 flex-shrink-0 relative flex items-center justify-center'
                  style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
                >
                  {service.coverImage ? (
                    <Image
                      src={getResourceUrl(service.coverImage)}
                      alt={service.name}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <Stethoscope className='h-10 w-10' style={{ color: themeSettings.primaryColor }} />
                  )}
                  {/* 热门标签 */}
                  {service.orderCount > 5000 && (
                    <Box
                      className='absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-[10px]'
                      style={{ backgroundColor: '#ff4d4f' }}
                    >
                      <Rocket className='h-2.5 w-2.5' />
                      <Text>热门</Text>
                    </Box>
                  )}
                </Box>
                {/* 右侧信息 */}
                <Box className='flex-1 p-3 flex flex-col justify-between'>
                  <Box>
                    <Box className='flex items-start justify-between'>
                      <Text className='text-sm font-semibold flex-1 truncate' style={{ color: textPrimary }}>
                        {service.name}
                      </Text>
                      {/* 操作按钮 */}
                      <Box className='flex gap-1 ml-2'>
                        <Button
                          onClick={(e) => toggleFavorite(service.id, e)}
                          className='p-1 transition-colors'
                        >
                          <Heart
                            className='h-4 w-4'
                            style={{
                              color: favorites.has(service.id) ? '#ff4d4f' : textMuted,
                              fill: favorites.has(service.id) ? '#ff4d4f' : 'transparent',
                            }}
                          />
                        </Button>
                        <Button
                          onClick={(e) => handleShare(service, e)}
                          className='p-1 transition-colors'
                        >
                          <Share2 className='h-4 w-4' style={{ color: textMuted }} />
                        </Button>
                      </Box>
                    </Box>
                    <Text className='mt-1 text-xs line-clamp-2' style={{ color: textSecondary }}>
                      {service.description || '专业陪诊服务'}
                    </Text>
                  </Box>
                  <Box className='mt-2'>
                    <Box className='flex items-center gap-3 text-xs' style={{ color: textMuted }}>
                      {service.duration && (
                        <Box className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          <Text>{service.duration}</Text>
                        </Box>
                      )}
                      <Box className='flex items-center gap-1'>
                        <Star className='h-3 w-3 text-amber-400' />
                        <Text>{service.rating}%</Text>
                      </Box>
                      <Text>{formatCount(service.orderCount)}人购</Text>
                    </Box>
                    <Box className='mt-1.5 flex items-center justify-between'>
                      <Box className='flex items-baseline gap-1'>
                        <Text className='text-xs' style={{ color: themeSettings.primaryColor }}>¥</Text>
                        <Text className='text-base font-bold' style={{ color: themeSettings.primaryColor }}>
                          {service.price}
                        </Text>
                        {service.originalPrice && service.originalPrice > service.price && (
                          <Text className='text-xs line-through' style={{ color: textMuted }}>
                            ¥{service.originalPrice}
                          </Text>
                        )}
                      </Box>
                      {/* 陪诊员视角：分成比例 */}
                      {isEscort && (
                        <Box
                          className='flex items-center gap-1 px-2 py-1 rounded'
                          style={{
                            backgroundColor: `${themeSettings.primaryColor}15`,
                          }}
                        >
                          <Percent className='h-3 w-3' style={{ color: themeSettings.primaryColor }} />
                          <Text className='text-xs font-medium' style={{ color: themeSettings.primaryColor }}>
                            分成 {service.commissionRate ?? 70}%
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )
        ))}

        {/* 无数据状态 */}
        {sortedServices.length === 0 && (
          <Box className={cn('py-12 text-center', layoutMode === 'grid' && 'col-span-2')}>
            <Stethoscope className='h-12 w-12 mx-auto mb-3' style={{ color: textMuted }} />
            <Text className='text-sm' style={{ color: textMuted }}>暂无服务</Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}
