/**
 * 服务页预览组件
 * 
 * 使用跨平台 UI 原语，支持 Web 和小程序
 * 
 * 样式规范：
 * - 规则 1：布局属性必须在 style 中完整表达
 * - 规则 2：className 只承载 Web 优化，不作为唯一来源
 * - 规则 3：wxScale 只作用于视觉尺寸，不作用于逻辑布局
 */

import { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Rocket,
  Percent,
} from '../../ui/lucide-compat'
import { cn } from '@/lib/utils'
import { Box, Text, Button, Image, Icon } from '../../ui/primitives'
import { isWxEnvironment } from '../../platform/env'
import type { ThemeSettings, ServiceListItem, BannerAreaData, PreviewViewerRole } from '../../types'
import { previewApi } from '../../api'
import { formatCount } from '../../utils'
import { getResourceUrl } from '../../utils'
import { BannerSection } from '../BannerSection'

// 小程序缩放比例（规则 3：只用于视觉尺寸）
const wxScale = isWxEnvironment() ? 1.1 : 1

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

// 排序选项配置（纯文字，无图标）
const sortOptionConfigs: { value: SortType; label: string }[] = [
  { value: 'default', label: '综合' },
  { value: 'sales', label: '销量' },
  { value: 'rating', label: '好评' },
  { value: 'price-asc', label: '价格↑' },
  { value: 'price-desc', label: '价格↓' },
]

export function ServicesPage({ themeSettings, isDarkMode = false, bannerData: bannerDataOverride, onServiceClick, effectiveViewerRole = 'user' }: ServicesPageProps) {
  // 调试日志
  console.log('[ServicesPage] 组件渲染')

  // 是否为陪诊员视角
  const isEscort = effectiveViewerRole === 'escort'
  const [activeCategory, setActiveCategory] = useState('all')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid')
  const [sortType, setSortType] = useState<SortType>('default')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // ============================================================================
  // 数据获取（使用 useState + useEffect 绕过 React Query 兼容性问题）
  // TODO: 后续排查 React Query 在小程序中的问题后，改回 useQuery
  // ============================================================================

  // 轮播图数据
  const [fetchedBannerData, setFetchedBannerData] = useState<BannerAreaData | null>(null)

  // 分类数据
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  // 服务列表数据
  const [services, setServices] = useState<ServiceListItem[]>([])
  const [_servicesLoading, setServicesLoading] = useState(true)
  void _servicesLoading // 保留用于未来加载状态显示

  // 获取轮播图
  useEffect(() => {
    previewApi.getBanners('services')
      .then(data => setFetchedBannerData(data))
      .catch(err => console.error('[ServicesPage] 轮播图加载失败:', err))
  }, [])

  // 获取分类
  useEffect(() => {
    previewApi.getCategories()
      .then(data => {
        console.log('[ServicesPage] 分类加载成功:', data?.length)
        setCategories(data || [])
      })
      .catch(err => console.error('[ServicesPage] 分类加载失败:', err))
  }, [])

  // 获取服务列表（依赖 activeCategory）
  useEffect(() => {
    setServicesLoading(true)
    console.log('[ServicesPage] 🚀 请求服务列表, categoryId:', activeCategory)
    previewApi.getServices({
      categoryId: activeCategory === 'all' ? undefined : activeCategory,
      pageSize: 20,
    })
      .then(result => {
        console.log('[ServicesPage] ✅ 服务列表加载成功:', result?.data?.length, '条')
        setServices(result?.data || [])
      })
      .catch(err => console.error('[ServicesPage] ❌ 服务列表加载失败:', err))
      .finally(() => setServicesLoading(false))
  }, [activeCategory])

  const bannerData = bannerDataOverride ?? fetchedBannerData ?? null

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
  const handleShare = (_service: ServiceListItem, e: React.MouseEvent) => {
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
    <Box
      className='min-h-full pb-14'
      style={{
        minHeight: '100%',
        paddingBottom: 56 * wxScale,
        backgroundColor: bgColor,
      }}
    >
      {/* 搜索框（顶部留出小程序胶囊按钮空间） */}
      <Box
        className='px-3 pt-3 pb-2'
        style={{
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 88 * wxScale, // 状态栏(44) + 胶囊按钮高度(32) + 间距(12)
          paddingBottom: 8 * wxScale,
          backgroundColor: headerBg,
        }}
      >
        <Box
          className='flex items-center gap-2 rounded-full px-4 py-2.5 cursor-pointer transition-all hover:shadow-md active:scale-[0.98]'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
            borderRadius: 9999,
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 10 * wxScale,
            paddingBottom: 10 * wxScale,
            backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
          }}
        >
          <Search size={16 * wxScale} color={textMuted} />
          <Text
            className='text-sm'
            style={{ fontSize: 14 * wxScale, color: textMuted }}
          >
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

      {/* 分类 Tab（隐藏滚动条，增加上下边距） */}
      <Box
        className='services-category-scroll sticky top-0 z-10 px-3'
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          marginTop: 4 * wxScale,
          marginBottom: 4 * wxScale,
          backgroundColor: headerBg,
          overflowX: 'auto',
        }}
      >
        <Box
          className='flex gap-2'
          style={{
            display: 'flex',
            gap: 8 * wxScale,
          }}
        >
          {categoryList.map(cat => (
            <Box
              key={cat.id}
              className={cn(
                'flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm cursor-pointer transition-all',
                activeCategory === cat.id ? 'font-medium' : ''
              )}
              style={{
                flexShrink: 0,
                paddingLeft: 14 * wxScale,
                paddingRight: 14 * wxScale,
                paddingTop: 10 * wxScale,
                paddingBottom: 10 * wxScale,
                borderRadius: 9999,
                fontSize: 14 * wxScale,
                backgroundColor: activeCategory === cat.id
                  ? `${themeSettings.primaryColor}15`
                  : isDarkMode ? '#3a3a3a' : '#f3f4f6',
                color: activeCategory === cat.id
                  ? themeSettings.primaryColor
                  : textSecondary,
                fontWeight: activeCategory === cat.id ? 500 : 400,
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              <Text style={{ fontSize: 14 * wxScale }}>{cat.name}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 工具栏：排序 + 布局切换 */}
      <Box
        className='flex items-center justify-between px-3 py-2'
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 8 * wxScale,
          paddingBottom: 8 * wxScale,
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          borderBottomStyle: 'solid',
        }}
      >
        {/* 排序选择（优化后的样式） */}
        <Box className='relative' style={{ position: 'relative' }}>
          <Button
            className='flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4 * wxScale,
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              paddingTop: 4 * wxScale,
              paddingBottom: 4 * wxScale,
              borderRadius: 4 * wxScale,
              fontSize: 12 * wxScale,
              color: textSecondary,
            }}
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            <Text style={{ fontSize: 12 * wxScale }}>{sortOptionConfigs.find(s => s.value === sortType)?.label}</Text>
            <Icon
              name="down"
              size={12 * wxScale}
              color={textMuted}
              style={{ transform: showSortMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </Button>
          {showSortMenu && (
            <Box
              className='absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg z-20'
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 4 * wxScale,
                paddingTop: 6 * wxScale,
                paddingBottom: 6 * wxScale,
                borderRadius: 8 * wxScale,
                zIndex: 20,
                minWidth: 90 * wxScale,
                backgroundColor: cardBg,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {sortOptionConfigs.map(option => {
                const isActive = sortType === option.value
                const itemColor = isActive ? themeSettings.primaryColor : textSecondary
                return (
                  <Button
                    key={option.value}
                    className='flex items-center gap-2 w-full transition-colors'
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6 * wxScale,
                      width: '100%',
                      paddingLeft: 12 * wxScale,
                      paddingRight: 12 * wxScale,
                      paddingTop: 8 * wxScale,
                      paddingBottom: 8 * wxScale,
                      fontSize: 13 * wxScale,
                      color: itemColor,
                      backgroundColor: isActive ? `${themeSettings.primaryColor}08` : 'transparent',
                      fontWeight: isActive ? 500 : 400,
                    }}
                    onClick={() => {
                      setSortType(option.value)
                      setShowSortMenu(false)
                    }}
                  >
                    <Text style={{ fontSize: 13 * wxScale }}>{option.label}</Text>
                  </Button>
                )
              })}
            </Box>
          )}
        </Box>

        {/* 布局切换（缩小尺寸，与首页保持一致） */}
        <Box
          className='flex items-center gap-1'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2 * wxScale,
          }}
        >
          <Button
            onClick={() => setLayoutMode('grid')}
            style={{
              backgroundColor: layoutMode === 'grid' ? `${themeSettings.primaryColor}15` : 'transparent',
              padding: 4 * wxScale,
              borderRadius: 4,
              width: 24 * wxScale,
              height: 24 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              name="grid-four"
              size={14 * wxScale}
              color={layoutMode === 'grid' ? themeSettings.primaryColor : textMuted}
            />
          </Button>
          <Button
            onClick={() => setLayoutMode('list')}
            style={{
              backgroundColor: layoutMode === 'list' ? `${themeSettings.primaryColor}15` : 'transparent',
              padding: 4 * wxScale,
              borderRadius: 4,
              width: 24 * wxScale,
              height: 24 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              name="list"
              size={14 * wxScale}
              color={layoutMode === 'list' ? themeSettings.primaryColor : textMuted}
            />
          </Button>
        </Box>
      </Box>

      {/* 服务列表 */}
      <Box
        className={cn(
          'px-3 pt-3',
          layoutMode === 'grid' ? 'grid grid-cols-2 gap-2.5' : 'space-y-3'
        )}
        style={{
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 12 * wxScale,
          ...(layoutMode === 'grid' ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10 * wxScale,
          } : {
            display: 'flex',
            flexDirection: 'column',
            gap: 12 * wxScale,
          }),
        }}
      >
        {sortedServices.map(service => (
          layoutMode === 'grid' ? (
            // 网格布局
            <Box
              key={service.id}
              className='rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98]'
              style={{
                borderRadius: 12 * wxScale,
                overflow: 'hidden',
                backgroundColor: cardBg,
              }}
              onClick={() => onServiceClick?.(service.id)}
            >
              {/* 封面 */}
              <Box
                className='h-28 relative flex items-center justify-center'
                style={{
                  height: 112 * wxScale,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                }}
              >
                {service.coverImage ? (
                  <Image
                    src={getResourceUrl(service.coverImage)}
                    alt={service.name}
                    className='w-full h-full object-cover'
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    mode="aspectFill"
                  />
                ) : (
                  <Icon name="stethoscope" size={40 * wxScale} color={themeSettings.primaryColor} />
                )}
                {/* 热门标签 */}
                {service.orderCount > 5000 && (
                  <Box
                    className='absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-[10px]'
                    style={{
                      position: 'absolute',
                      top: 8 * wxScale,
                      left: 8 * wxScale,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2 * wxScale,
                      paddingLeft: 6 * wxScale,
                      paddingRight: 6 * wxScale,
                      paddingTop: 2 * wxScale,
                      paddingBottom: 2 * wxScale,
                      borderRadius: 9999,
                      backgroundColor: '#ff4d4f',
                    }}
                  >
                    <Rocket size={10 * wxScale} color="#fff" />
                    <Text style={{ fontSize: 10 * wxScale, color: '#fff' }}>热门</Text>
                  </Box>
                )}
                {/* 操作按钮（圆形收藏按钮） */}
                <Box
                  className='absolute top-2 right-2'
                  style={{
                    position: 'absolute',
                    top: 8 * wxScale,
                    right: 8 * wxScale,
                  }}
                >
                  <Box
                    onClick={(e: any) => toggleFavorite(service.id, e)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      name="like"
                      size={12}
                      color={favorites.has(service.id) ? '#ff4d4f' : '#fff'}
                    />
                  </Box>
                </Box>
              </Box>
              {/* 信息 */}
              <Box
                className='p-2.5'
                style={{
                  padding: 10 * wxScale,
                }}
              >
                <Text
                  className='text-xs font-semibold truncate'
                  style={{
                    fontSize: 12 * wxScale,
                    fontWeight: 600,
                    color: textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {service.name}
                </Text>
                <Box
                  className='mt-1.5 flex items-center gap-2 text-[10px]'
                  style={{
                    marginTop: 6 * wxScale,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6 * wxScale,
                    color: textMuted,
                  }}
                >
                  <Box
                    className='flex items-center gap-0.5'
                    style={{ display: 'flex', alignItems: 'center', gap: 2 * wxScale }}
                  >
                    <Icon name="good-one" size={10 * wxScale} color="#fbbf24" />
                    <Text style={{ fontSize: 10 * wxScale, color: textMuted }}>{service.rating}%</Text>
                  </Box>
                  <Text style={{ fontSize: 10 * wxScale, color: textMuted }}>{formatCount(service.orderCount)}人购</Text>
                </Box>
                <Box
                  className='mt-1.5 flex items-center justify-between'
                  style={{
                    marginTop: 6 * wxScale,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box
                    className='flex items-baseline gap-0.5'
                    style={{ display: 'flex', alignItems: 'baseline', gap: 2 * wxScale }}
                  >
                    <Text style={{ fontSize: 10 * wxScale, color: themeSettings.primaryColor }}>¥</Text>
                    <Text style={{ fontSize: 14 * wxScale, fontWeight: 700, color: themeSettings.primaryColor }}>
                      {service.price}
                    </Text>
                    {service.originalPrice && service.originalPrice > service.price && (
                      <Text
                        className='line-through'
                        style={{ fontSize: 10 * wxScale, color: textMuted, textDecoration: 'line-through' }}
                      >
                        ¥{service.originalPrice}
                      </Text>
                    )}
                  </Box>
                  {/* 陪诊员视角：分成比例 */}
                  {isEscort && (
                    <Box
                      className='flex items-center gap-0.5 px-1.5 py-0.5 rounded'
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2 * wxScale,
                        paddingLeft: 6 * wxScale,
                        paddingRight: 6 * wxScale,
                        paddingTop: 2 * wxScale,
                        paddingBottom: 2 * wxScale,
                        borderRadius: 4 * wxScale,
                        backgroundColor: `${themeSettings.primaryColor}15`,
                      }}
                    >
                      <Percent size={10 * wxScale} color={themeSettings.primaryColor} />
                      <Text style={{ fontSize: 10 * wxScale, fontWeight: 500, color: themeSettings.primaryColor }}>
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
              style={{
                borderRadius: 12 * wxScale,
                overflow: 'hidden',
                backgroundColor: cardBg,
              }}
              onClick={() => onServiceClick?.(service.id)}
            >
              <Box
                className='flex'
                style={{ display: 'flex' }}
              >
                {/* 左侧封面 */}
                <Box
                  className='w-28 h-28 flex-shrink-0 relative flex items-center justify-center'
                  style={{
                    width: 112 * wxScale,
                    height: 112 * wxScale,
                    flexShrink: 0,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                  }}
                >
                  {service.coverImage ? (
                    <Image
                      src={getResourceUrl(service.coverImage)}
                      alt={service.name}
                      className='w-full h-full object-cover'
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      mode="aspectFill"
                    />
                  ) : (
                    <Icon name="stethoscope" size={40 * wxScale} color={themeSettings.primaryColor} />
                  )}
                  {/* 热门标签 */}
                  {service.orderCount > 5000 && (
                    <Box
                      className='absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-white text-[10px]'
                      style={{
                        position: 'absolute',
                        top: 8 * wxScale,
                        left: 8 * wxScale,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2 * wxScale,
                        paddingLeft: 6 * wxScale,
                        paddingRight: 6 * wxScale,
                        paddingTop: 2 * wxScale,
                        paddingBottom: 2 * wxScale,
                        borderRadius: 9999,
                        backgroundColor: '#ff4d4f',
                      }}
                    >
                      <Rocket size={10 * wxScale} color="#fff" />
                      <Text style={{ fontSize: 10 * wxScale, color: '#fff' }}>热门</Text>
                    </Box>
                  )}
                </Box>
                {/* 右侧信息 */}
                <Box
                  className='flex-1 p-3 flex flex-col justify-between'
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: 12 * wxScale,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                  }}
                >
                  <Box>
                    <Box
                      className='flex items-start justify-between'
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        className='text-sm font-semibold'
                        style={{
                          fontSize: 14 * wxScale,
                          fontWeight: 600,
                          flex: 1,
                          color: textPrimary,
                          lineHeight: 1.3,
                          wordBreak: 'break-word',
                        }}
                      >
                        {service.name}
                      </Text>
                      {/* 操作按钮 */}
                      <Box
                        className='flex gap-1 ml-2'
                        style={{
                          display: 'flex',
                          flexShrink: 0,
                          gap: 4 * wxScale,
                          marginLeft: 8 * wxScale,
                        }}
                      >
                        <Button
                          onClick={(e) => toggleFavorite(service.id, e)}
                          className='transition-colors'
                          style={{ padding: 4 * wxScale }}
                        >
                          <Icon
                            name="like"
                            size={14 * wxScale}
                            color={favorites.has(service.id) ? '#ff4d4f' : textMuted}
                          />
                        </Button>
                        <Button
                          onClick={(e) => handleShare(service, e)}
                          className='transition-colors'
                          style={{ padding: 4 * wxScale }}
                        >
                          <Icon name="share-three" size={14 * wxScale} color={textMuted} />
                        </Button>
                      </Box>
                    </Box>
                    <Text
                      className='mt-1 text-xs'
                      style={{
                        marginTop: 4 * wxScale,
                        fontSize: 12 * wxScale,
                        color: textSecondary,
                      }}
                    >
                      {(() => {
                        const desc = service.description || '专业陪诊服务'
                        const maxLen = 14
                        return desc.length > maxLen ? desc.slice(0, maxLen) + '…' : desc
                      })()}
                    </Text>
                  </Box>
                  <Box style={{ marginTop: 8 * wxScale }}>
                    <Box
                      className='flex items-center text-xs'
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        gap: 8 * wxScale,
                        color: textMuted,
                        overflow: 'hidden',
                      }}
                    >
                      {service.duration && (
                        <Box
                          className='flex items-center gap-1'
                          style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 2 * wxScale }}
                        >
                          <Icon name="time" size={10 * wxScale} color={textMuted} />
                          <Text style={{ fontSize: 11 * wxScale, color: textMuted, whiteSpace: 'nowrap' }}>{service.duration}</Text>
                        </Box>
                      )}
                      <Box
                        className='flex items-center gap-1'
                        style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 2 * wxScale }}
                      >
                        <Icon name="good-one" size={10 * wxScale} color="#fbbf24" />
                        <Text style={{ fontSize: 11 * wxScale, color: textMuted, whiteSpace: 'nowrap' }}>{service.rating}%</Text>
                      </Box>
                      <Text style={{ fontSize: 11 * wxScale, color: textMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>{formatCount(service.orderCount)}人购</Text>
                    </Box>
                    <Box
                      className='mt-1.5 flex items-center justify-between'
                      style={{
                        marginTop: 6 * wxScale,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box
                        className='flex items-baseline gap-1'
                        style={{ display: 'flex', alignItems: 'baseline', gap: 4 * wxScale }}
                      >
                        <Text style={{ fontSize: 12 * wxScale, color: themeSettings.primaryColor }}>¥</Text>
                        <Text style={{ fontSize: 16 * wxScale, fontWeight: 700, color: themeSettings.primaryColor }}>
                          {service.price}
                        </Text>
                        {service.originalPrice && service.originalPrice > service.price && (
                          <Text
                            className='line-through'
                            style={{ fontSize: 12 * wxScale, color: textMuted, textDecoration: 'line-through' }}
                          >
                            ¥{service.originalPrice}
                          </Text>
                        )}
                      </Box>
                      {/* 陪诊员视角：分成比例 */}
                      {isEscort && (
                        <Box
                          className='flex items-center gap-1 px-2 py-1 rounded'
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4 * wxScale,
                            paddingLeft: 8 * wxScale,
                            paddingRight: 8 * wxScale,
                            paddingTop: 4 * wxScale,
                            paddingBottom: 4 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: `${themeSettings.primaryColor}15`,
                          }}
                        >
                          <Percent size={12 * wxScale} color={themeSettings.primaryColor} />
                          <Text style={{ fontSize: 12 * wxScale, fontWeight: 500, color: themeSettings.primaryColor }}>
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
          <Box
            className={cn('py-12 text-center', layoutMode === 'grid' && 'col-span-2')}
            style={{
              paddingTop: 48 * wxScale,
              paddingBottom: 48 * wxScale,
              textAlign: 'center',
              ...(layoutMode === 'grid' && { gridColumn: 'span 2' }),
            }}
          >
            <Icon
              name="stethoscope"
              size={48 * wxScale}
              color={textMuted}
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: 12 * wxScale,
              }}
            />
            <Text style={{ fontSize: 14 * wxScale, color: textMuted }}>暂无服务</Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}
