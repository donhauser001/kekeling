/**
 * 搜索页面组件
 * 
 * 支持服务搜索，显示搜索结果列表
 * 遵循《小程序页面改造规范》
 */

import { useState, useEffect, useCallback } from 'react'
import { Box, Text, Button, Image, Icon, Input, ScrollView } from '../../ui/primitives'
import { isWxEnvironment, isBrowserEnvironment } from '../../platform/env'
import type { ThemeSettings, ServiceListItem } from '../../types'
import type { SearchServiceItem, SearchHospitalItem, SearchDoctorItem } from '../../api/user-api'
import { previewApi } from '../../api'
import { getResourceUrl, formatCount } from '../../utils'

// ============================================================================
// 平台兼容存储
// ============================================================================

const STORAGE_KEY = 'search_history'

function getStorage(key: string): string | null {
  try {
    if (isWxEnvironment() && typeof wx !== 'undefined') {
      return wx.getStorageSync(key) || null
    }
    if (isBrowserEnvironment() && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  } catch {
    return null
  }
}

function setStorage(key: string, value: string): void {
  try {
    if (isWxEnvironment() && typeof wx !== 'undefined') {
      wx.setStorageSync(key, value)
    } else if (isBrowserEnvironment() && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value)
    }
  } catch (e) {
    console.warn('[SearchPage] 存储失败:', e)
  }
}

function removeStorage(key: string): void {
  try {
    if (isWxEnvironment() && typeof wx !== 'undefined') {
      wx.removeStorageSync(key)
    } else if (isBrowserEnvironment() && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
  } catch (e) {
    console.warn('[SearchPage] 删除存储失败:', e)
  }
}

// ============================================================================
// 类型定义
// ============================================================================

export interface SearchPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  /** 初始搜索关键词 */
  initialKeyword?: string
  /** 返回回调 */
  onBack?: () => void
  /** 服务点击回调 */
  onServiceClick?: (serviceId: string) => void
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1

// 小程序头部参数（规则 11）
const WX_STATUS_BAR_HEIGHT = 44
const WX_CAPSULE_TOP = 6
const WX_CAPSULE_HEIGHT = 32
const WX_CAPSULE_RIGHT = 7  // 胶囊距右边距
const WX_CAPSULE_WIDTH = 87  // 胶囊宽度

// 计算头部安全区域
const wxSafeAreaTop = isWxEnvironment() ? WX_STATUS_BAR_HEIGHT : 0
// 头部右侧安全距离（避开胶囊）
const wxSafeAreaRight = isWxEnvironment() ? WX_CAPSULE_WIDTH + WX_CAPSULE_RIGHT + 8 : 0

// 热门关键词类型
interface HotKeyword {
  keyword: string
  hot: boolean
  type?: 'hot' | 'guess'
}

// 默认热门搜索关键词（API 加载前的兜底）
const DEFAULT_HOT_KEYWORDS: HotKeyword[] = [
  { keyword: '陪诊', hot: true },
  { keyword: '代取报告', hot: true },
  { keyword: '代开检查单', hot: false },
  { keyword: '代办病历打印', hot: false },
]

// 默认猜你想找关键词（API 加载前的兜底）
const DEFAULT_GUESS_KEYWORDS: string[] = [
  '北京协和医院', '阜外医院', '儿童医院',
  '上门护理', '住院陪护', '异地就医',
]

// ============================================================================
// 骨架屏组件
// ============================================================================

function SearchSkeleton({ isDarkMode }: { isDarkMode: boolean }) {
  const skeletonBg = isDarkMode ? '#374151' : '#e5e7eb'
  
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          style={{
            display: 'flex',
            gap: 12 * wxScale,
            padding: 12 * wxScale,
            borderRadius: 12 * wxScale,
            backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
          }}
        >
          {/* 图片骨架 */}
          <Box
            style={{
              width: 88 * wxScale,
              height: 88 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: skeletonBg,
            }}
          />
          {/* 文字骨架 */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
            <Box style={{ width: '70%', height: 18 * wxScale, borderRadius: 4 * wxScale, backgroundColor: skeletonBg }} />
            <Box style={{ width: '100%', height: 14 * wxScale, borderRadius: 4 * wxScale, backgroundColor: skeletonBg }} />
            <Box style={{ width: '50%', height: 14 * wxScale, borderRadius: 4 * wxScale, backgroundColor: skeletonBg }} />
            <Box style={{ width: '40%', height: 20 * wxScale, borderRadius: 4 * wxScale, backgroundColor: skeletonBg, marginTop: 'auto' }} />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

// ============================================================================
// 服务卡片组件
// ============================================================================

interface ServiceCardProps {
  service: ServiceListItem
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onClick: () => void
}

function ServiceCard({ service, themeSettings, isDarkMode, onClick }: ServiceCardProps) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const primaryColor = themeSettings.primaryColor
  const tagBg = isDarkMode ? '#374151' : '#fef3c7'
  const tagColor = isDarkMode ? '#fbbf24' : '#d97706'

  return (
    <Button
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 12 * wxScale,
        padding: 12 * wxScale,
        borderRadius: 12 * wxScale,
        backgroundColor: cardBg,
        boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
        textAlign: 'left',
        width: '100%',
      }}
    >
      {/* 服务图片 */}
      <Box style={{ position: 'relative', flexShrink: 0 }}>
        <Image
          src={getResourceUrl(service.coverImage || '')}
          mode="aspectFill"
          style={{
            width: 88 * wxScale,
            height: 88 * wxScale,
            borderRadius: 8 * wxScale,
            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          }}
        />
        {/* 折扣标签 */}
        {service.originalPrice && service.originalPrice > service.price && (
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              paddingLeft: 6 * wxScale,
              paddingRight: 6 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              borderTopLeftRadius: 8 * wxScale,
              borderBottomRightRadius: 8 * wxScale,
              backgroundColor: '#ef4444',
            }}
          >
            <Text style={{ fontSize: 10 * wxScale, color: '#ffffff', fontWeight: 600 }}>
              {Math.round((1 - service.price / service.originalPrice) * 100)}%OFF
            </Text>
          </Box>
        )}
      </Box>

      {/* 服务信息 */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 88 * wxScale }}>
        {/* 标题行 */}
        <Text
          numberOfLines={1}
          style={{
            display: 'block',
            fontSize: 15 * wxScale,
            fontWeight: 600,
            color: textPrimary,
            lineHeight: 1.4,
          }}
        >
          {service.name}
        </Text>
        
        {/* 描述 */}
        {service.description && (
          <Text
            numberOfLines={2}
            style={{
              display: 'block',
              fontSize: 12 * wxScale,
              color: textSecondary,
              lineHeight: 1.5,
              marginTop: 4 * wxScale,
            }}
          >
            {service.description}
          </Text>
        )}

        {/* 标签行 */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: 6 * wxScale, marginTop: 6 * wxScale }}>
          {service.category?.name && (
            <Box
              style={{
                paddingLeft: 6 * wxScale,
                paddingRight: 6 * wxScale,
                paddingTop: 2 * wxScale,
                paddingBottom: 2 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: `${primaryColor}15`,
              }}
            >
              <Text style={{ fontSize: 10 * wxScale, color: primaryColor }}>
                {service.category.name}
              </Text>
            </Box>
          )}
          {service.duration && (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2 * wxScale,
              }}
            >
              <Icon name="time" size={10 * wxScale} color={textMuted} />
              <Text style={{ fontSize: 10 * wxScale, color: textMuted }}>
                {service.duration}分钟
              </Text>
            </Box>
          )}
        </Box>

        {/* 价格行 */}
        <Box style={{ display: 'flex', alignItems: 'baseline', gap: 4 * wxScale, marginTop: 'auto' }}>
          <Text style={{ fontSize: 12 * wxScale, color: primaryColor, fontWeight: 500 }}>¥</Text>
          <Text style={{ fontSize: 20 * wxScale, fontWeight: 700, color: primaryColor }}>
            {service.price}
          </Text>
          <Text style={{ fontSize: 12 * wxScale, color: textMuted }}>起</Text>
          {service.originalPrice && service.originalPrice > service.price && (
            <Text
              style={{
                fontSize: 12 * wxScale,
                color: textMuted,
                textDecoration: 'line-through',
                marginLeft: 4 * wxScale,
              }}
            >
              ¥{service.originalPrice}
            </Text>
          )}
          {service.orderCount !== undefined && service.orderCount > 0 && (
            <Text style={{ fontSize: 11 * wxScale, color: textMuted, marginLeft: 'auto' }}>
              已售 {formatCount(service.orderCount)}
            </Text>
          )}
        </Box>
      </Box>
    </Button>
  )
}

// ============================================================================
// 主组件
// ============================================================================

export function SearchPage({
  themeSettings,
  isDarkMode = false,
  initialKeyword = '',
  onBack,
  onServiceClick,
}: SearchPageProps) {
  console.log('[SearchPage Component] 开始渲染, themeSettings:', themeSettings)
  const [keyword, setKeyword] = useState(initialKeyword)
  const [searchResults, setSearchResults] = useState<{
    services: SearchServiceItem[]
    hospitals: SearchHospitalItem[]
    doctors: SearchDoctorItem[]
  }>({ services: [], hospitals: [], doctors: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>(DEFAULT_HOT_KEYWORDS)
  const [guessKeywords, setGuessKeywords] = useState<string[]>(DEFAULT_GUESS_KEYWORDS)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#0f0f0f' : '#f5f7fa'
  const cardBg = isDarkMode ? '#1a1a1a' : '#ffffff'
  const headerBg = isDarkMode ? '#1a1a1a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const inputBg = isDarkMode ? '#262626' : '#f3f4f6'
  const borderColor = isDarkMode ? '#262626' : '#f0f0f0'

  // 加载搜索历史
  useEffect(() => {
    try {
      const history = getStorage(STORAGE_KEY)
      if (history) {
        setSearchHistory(JSON.parse(history))
      }
    } catch (e) {
      console.warn('[SearchPage] 加载搜索历史失败:', e)
    }
  }, [])

  // 加载热门搜索关键词（type=hot）
  useEffect(() => {
    previewApi.getHotKeywords('hot', 10)
      .then((keywords) => {
        if (keywords && keywords.length > 0) {
          setHotKeywords(keywords)
        }
      })
      .catch((err) => {
        console.warn('[SearchPage] 加载热门搜索失败:', err)
        // 失败时保留默认关键词
      })
  }, [])

  // 加载猜你想找关键词（type=guess）
  useEffect(() => {
    previewApi.getHotKeywords('guess', 10)
      .then((keywords) => {
        if (keywords && keywords.length > 0) {
          setGuessKeywords(keywords.map(k => k.keyword))
        }
      })
      .catch((err) => {
        console.warn('[SearchPage] 加载猜你想找失败:', err)
        // 失败时保留默认关键词
      })
  }, [])

  // 保存搜索历史
  const saveHistory = useCallback((kw: string) => {
    if (!kw.trim()) return
    const newHistory = [kw, ...searchHistory.filter(h => h !== kw)].slice(0, 10)
    setSearchHistory(newHistory)
    setStorage(STORAGE_KEY, JSON.stringify(newHistory))
  }, [searchHistory])

  // 清除搜索历史
  const clearHistory = useCallback(() => {
    setSearchHistory([])
    removeStorage(STORAGE_KEY)
  }, [])

  // 删除单条历史记录
  const deleteHistoryItem = useCallback((item: string) => {
    const newHistory = searchHistory.filter(h => h !== item)
    setSearchHistory(newHistory)
    if (newHistory.length > 0) {
      setStorage(STORAGE_KEY, JSON.stringify(newHistory))
    } else {
      removeStorage(STORAGE_KEY)
    }
  }, [searchHistory])

  // 执行搜索（综合搜索：服务+医院+医生）
  const doSearch = useCallback(async (searchKeyword: string) => {
    if (!searchKeyword.trim()) return
    
    setIsSearching(true)
    setHasSearched(true)
    saveHistory(searchKeyword)
    
    try {
      const result = await previewApi.search(searchKeyword, 20)
      setSearchResults({
        services: result?.services || [],
        hospitals: result?.hospitals || [],
        doctors: result?.doctors || [],
      })
    } catch (error) {
      console.error('[SearchPage] 搜索失败:', error)
      setSearchResults({ services: [], hospitals: [], doctors: [] })
    } finally {
      setIsSearching(false)
    }
  }, [saveHistory])

  // 处理搜索提交
  const handleSearch = useCallback(() => {
    doSearch(keyword)
  }, [keyword, doSearch])

  // 处理热门关键词点击
  const handleHotKeywordClick = useCallback((kw: string) => {
    setKeyword(kw)
    doSearch(kw)
  }, [doSearch])

  // 处理历史记录点击
  const handleHistoryClick = useCallback((kw: string) => {
    setKeyword(kw)
    doSearch(kw)
  }, [doSearch])

  // 处理服务点击
  const handleServiceClick = useCallback((serviceId: string) => {
    onServiceClick?.(serviceId)
  }, [onServiceClick])

  // 清空搜索
  const handleClearSearch = useCallback(() => {
    setKeyword('')
    setHasSearched(false)
    setSearchResults({ services: [], hospitals: [], doctors: [] })
  }, [])

  // 如果有初始关键词，自动搜索
  useEffect(() => {
    if (initialKeyword) {
      doSearch(initialKeyword)
    }
  }, [initialKeyword])

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      {/* ========== 搜索头部 ========== */}
      {/* 规则 11：小程序头部安全区域，右侧避开胶囊 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: headerBg,
          paddingTop: wxSafeAreaTop,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
            paddingTop: 8 * wxScale,
            paddingBottom: 8 * wxScale,
            paddingLeft: 12 * wxScale,
            // 右侧留出胶囊按钮的空间
            paddingRight: isWxEnvironment() ? wxSafeAreaRight : 12 * wxScale,
          }}
        >
          {/* 返回按钮 */}
          <Box
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32 * wxScale,
              height: 32 * wxScale,
              flexShrink: 0,
            }}
          >
            <Icon name="left" size={22 * wxScale} color={textPrimary} />
          </Box>

          {/* 搜索输入框 */}
          <Box
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 8 * wxScale,
              height: 36 * wxScale,
              borderRadius: 18 * wxScale,
              backgroundColor: inputBg,
            }}
          >
            <Icon name="search" size={16 * wxScale} color={textMuted} />
            <Input
              value={keyword}
              onChange={(value) => setKeyword(value)}
              placeholder="搜索服务、医院、医生"
              autoFocus
              style={{
                flex: 1,
                fontSize: 14 * wxScale,
                color: textPrimary,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
              }}
            />
            {keyword && (
              <Box
                onClick={handleClearSearch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20 * wxScale,
                  height: 20 * wxScale,
                  borderRadius: 10 * wxScale,
                  backgroundColor: isDarkMode ? '#4b5563' : '#d1d5db',
                }}
              >
                <Icon name="close" size={12 * wxScale} color={textMuted} />
              </Box>
            )}
          </Box>

          {/* 搜索/取消按钮 - 避开胶囊区域 */}
          <Box
            onClick={keyword ? handleSearch : onBack}
            style={{
              paddingLeft: 12 * wxScale,
              paddingRight: 4 * wxScale,
              height: 36 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text
              style={{
                fontSize: 15 * wxScale,
                color: keyword ? primaryColor : textSecondary,
                fontWeight: keyword ? 500 : 400,
              }}
            >
              {keyword ? '搜索' : '取消'}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* ========== 内容区域 ========== */}
      <ScrollView
        style={{
          flex: 1,
        }}
      >
        <Box
          style={{
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 16 * wxScale,
          }}
        >
          {/* 搜索中 - 骨架屏 */}
          {isSearching && <SearchSkeleton isDarkMode={isDarkMode} />}

          {/* 搜索结果 */}
          {!isSearching && hasSearched && (
            <>
              {(searchResults.services.length > 0 || searchResults.hospitals.length > 0 || searchResults.doctors.length > 0) ? (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 * wxScale }}>
                  {/* 结果统计 */}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4 * wxScale,
                    }}
                  >
                    <Icon name="check-one" size={14 * wxScale} color={primaryColor} />
                    <Text style={{ fontSize: 13 * wxScale, color: textSecondary }}>
                      找到 <Text style={{ color: primaryColor, fontWeight: 600 }}>{searchResults.services.length + searchResults.hospitals.length + searchResults.doctors.length}</Text> 个相关结果
                    </Text>
                  </Box>

                  {/* 医院结果 */}
                  {searchResults.hospitals.length > 0 && (
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 6 * wxScale }}>
                        <Icon name="hospital" size={16 * wxScale} color="#10b981" />
                        <Text style={{ fontSize: 14 * wxScale, fontWeight: 600, color: textPrimary }}>
                          医院 ({searchResults.hospitals.length})
                        </Text>
                      </Box>
                      {searchResults.hospitals.map((hospital) => (
                        <Box
                          key={hospital.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12 * wxScale,
                            padding: 12 * wxScale,
                            borderRadius: 10 * wxScale,
                            backgroundColor: cardBg,
                            boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                          }}
                        >
                          <Box
                            style={{
                              width: 48 * wxScale,
                              height: 48 * wxScale,
                              borderRadius: 8 * wxScale,
                              backgroundColor: '#10b98115',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon name="hospital" size={24 * wxScale} color="#10b981" />
                          </Box>
                          <Box style={{ flex: 1 }}>
                            <Text style={{ display: 'block', fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>
                              {hospital.name}
                            </Text>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale, marginTop: 4 * wxScale }}>
                              <Text style={{
                                fontSize: 11 * wxScale,
                                color: '#10b981',
                                backgroundColor: '#10b98115',
                                paddingLeft: 6 * wxScale,
                                paddingRight: 6 * wxScale,
                                paddingTop: 2 * wxScale,
                                paddingBottom: 2 * wxScale,
                                borderRadius: 4 * wxScale,
                              }}>
                                {hospital.level}
                              </Text>
                              <Text style={{ fontSize: 12 * wxScale, color: textSecondary }} numberOfLines={1}>
                                {hospital.address}
                              </Text>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* 医生结果 */}
                  {searchResults.doctors.length > 0 && (
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 6 * wxScale }}>
                        <Icon name="user" size={16 * wxScale} color="#6366f1" />
                        <Text style={{ fontSize: 14 * wxScale, fontWeight: 600, color: textPrimary }}>
                          医生 ({searchResults.doctors.length})
                        </Text>
                      </Box>
                      {searchResults.doctors.map((doctor) => (
                        <Box
                          key={doctor.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12 * wxScale,
                            padding: 12 * wxScale,
                            borderRadius: 10 * wxScale,
                            backgroundColor: cardBg,
                            boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                          }}
                        >
                          <Box
                            style={{
                              width: 48 * wxScale,
                              height: 48 * wxScale,
                              borderRadius: 24 * wxScale,
                              backgroundColor: '#6366f115',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            {doctor.avatar ? (
                              <Image
                                src={getResourceUrl(doctor.avatar)}
                                mode="aspectFill"
                                style={{ width: 48 * wxScale, height: 48 * wxScale }}
                              />
                            ) : (
                              <Icon name="user" size={24 * wxScale} color="#6366f1" />
                            )}
                          </Box>
                          <Box style={{ flex: 1 }}>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 6 * wxScale }}>
                              <Text style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>
                                {doctor.name}
                              </Text>
                              <Text style={{
                                fontSize: 11 * wxScale,
                                color: '#6366f1',
                                backgroundColor: '#6366f115',
                                paddingLeft: 6 * wxScale,
                                paddingRight: 6 * wxScale,
                                paddingTop: 2 * wxScale,
                                paddingBottom: 2 * wxScale,
                                borderRadius: 4 * wxScale,
                              }}>
                                {doctor.title === 'chief' ? '主任医师' : doctor.title === 'deputy' ? '副主任医师' : '主治医师'}
                              </Text>
                            </Box>
                            <Text style={{ display: 'block', fontSize: 12 * wxScale, color: textSecondary, marginTop: 4 * wxScale }} numberOfLines={1}>
                              {doctor.hospital?.name} {doctor.department?.name && `· ${doctor.department.name}`}
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* 服务结果 */}
                  {searchResults.services.length > 0 && (
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 6 * wxScale }}>
                        <Icon name="medical-files" size={16 * wxScale} color={primaryColor} />
                        <Text style={{ fontSize: 14 * wxScale, fontWeight: 600, color: textPrimary }}>
                          服务 ({searchResults.services.length})
                        </Text>
                      </Box>
                      {searchResults.services.map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={service as unknown as ServiceListItem}
                          themeSettings={themeSettings}
                          isDarkMode={isDarkMode}
                          onClick={() => handleServiceClick(service.id)}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              ) : (
                /* 无结果 */
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: 80 * wxScale,
                    paddingBottom: 80 * wxScale,
                  }}
                >
                  <Box
                    style={{
                      width: 80 * wxScale,
                      height: 80 * wxScale,
                      borderRadius: 40 * wxScale,
                      backgroundColor: isDarkMode ? '#262626' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16 * wxScale,
                    }}
                  >
                    <Icon name="search" size={36 * wxScale} color={textMuted} />
                  </Box>
                  <Text
                    style={{
                      display: 'block',
                      fontSize: 16 * wxScale,
                      fontWeight: 500,
                      color: textPrimary,
                      marginBottom: 8 * wxScale,
                    }}
                  >
                    未找到相关内容
                  </Text>
                  <Text style={{ display: 'block', fontSize: 14 * wxScale, color: textSecondary }}>
                    换个关键词试试吧
                  </Text>
                </Box>
              )}
            </>
          )}

          {/* ========== 未搜索时显示历史和热门 ========== */}
          {!isSearching && !hasSearched && (
            <>
              {/* 搜索历史 */}
              {searchHistory.length > 0 && (
                <Box
                  style={{
                    marginBottom: 28 * wxScale,
                  }}
                >
                  {/* 标题行 */}
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12 * wxScale,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 6 * wxScale }}>
                      <Icon name="time" size={16 * wxScale} color={textPrimary} />
                      <Text style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>
                        搜索历史
                      </Text>
                    </Box>
                    <Box
                      onClick={clearHistory}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4 * wxScale,
                        paddingLeft: 8 * wxScale,
                        paddingRight: 8 * wxScale,
                        paddingTop: 4 * wxScale,
                        paddingBottom: 4 * wxScale,
                      }}
                    >
                      <Icon name="delete" size={14 * wxScale} color={textMuted} />
                      <Text style={{ fontSize: 13 * wxScale, color: textMuted }}>
                        清空
                      </Text>
                    </Box>
                  </Box>
                  {/* 历史标签 */}
                  <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 10 * wxScale }}>
                    {searchHistory.map((item, index) => (
                      <Box
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6 * wxScale,
                          paddingLeft: 14 * wxScale,
                          paddingRight: 10 * wxScale,
                          paddingTop: 8 * wxScale,
                          paddingBottom: 8 * wxScale,
                          borderRadius: 20 * wxScale,
                          backgroundColor: cardBg,
                          boxShadow: isDarkMode ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        <Box onClick={() => handleHistoryClick(item)} style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14 * wxScale, color: textSecondary }}>
                            {item}
                          </Text>
                        </Box>
                        <Box
                          onClick={() => deleteHistoryItem(item)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 16 * wxScale,
                            height: 16 * wxScale,
                          }}
                        >
                          <Icon name="close" size={12 * wxScale} color={textMuted} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* 热门搜索 */}
              <Box>
                {/* 标题行 */}
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6 * wxScale,
                    marginBottom: 12 * wxScale,
                  }}
                >
                  <Icon name="fire" size={16 * wxScale} color="#ef4444" />
                  <Text style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>
                    热门搜索
                  </Text>
                </Box>
                {/* 热门标签 - 带排名 */}
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                  }}
                >
                  {hotKeywords.map((item, index) => (
                    <Box
                      key={index}
                      onClick={() => handleHotKeywordClick(item.keyword)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12 * wxScale,
                        paddingTop: 14 * wxScale,
                        paddingBottom: 14 * wxScale,
                        borderBottom: index < hotKeywords.length - 1 ? `1px solid ${borderColor}` : 'none',
                      }}
                    >
                      {/* 排名数字 */}
                      <Box
                        style={{
                          width: 20 * wxScale,
                          height: 20 * wxScale,
                          borderRadius: 4 * wxScale,
                          backgroundColor: index < 3
                            ? (index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#eab308')
                            : (isDarkMode ? '#374151' : '#e5e7eb'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12 * wxScale,
                            fontWeight: 600,
                            color: index < 3 ? '#ffffff' : textMuted,
                          }}
                        >
                          {index + 1}
                        </Text>
                      </Box>
                      {/* 关键词 */}
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 15 * wxScale,
                          color: textPrimary,
                          fontWeight: index < 3 ? 500 : 400,
                        }}
                      >
                        {item.keyword}
                      </Text>
                      {/* 热门标签 */}
                      {item.hot && (
                        <Box
                          style={{
                            paddingLeft: 6 * wxScale,
                            paddingRight: 6 * wxScale,
                            paddingTop: 2 * wxScale,
                            paddingBottom: 2 * wxScale,
                            borderRadius: 4 * wxScale,
                            backgroundColor: '#fef2f2',
                          }}
                        >
                          <Text style={{ fontSize: 10 * wxScale, color: '#ef4444', fontWeight: 500 }}>
                            HOT
                          </Text>
                        </Box>
                      )}
                      {/* 箭头 */}
                      <Icon name="right" size={14 * wxScale} color={textMuted} />
                    </Box>
                  ))}
                </Box>

                {/* 推荐服务区域 */}
                <Box
                  style={{
                    marginTop: 28 * wxScale,
                    paddingTop: 20 * wxScale,
                    borderTop: `1px solid ${borderColor}`,
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6 * wxScale,
                      marginBottom: 16 * wxScale,
                    }}
                  >
                    <Icon name="like" size={16 * wxScale} color="#fbbf24" />
                    <Text style={{ fontSize: 15 * wxScale, fontWeight: 600, color: textPrimary }}>
                      猜你想找
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 10 * wxScale }}>
                    {guessKeywords.map((item, index) => (
                      <Box
                        key={index}
                        onClick={() => handleHotKeywordClick(item)}
                        style={{
                          paddingLeft: 14 * wxScale,
                          paddingRight: 14 * wxScale,
                          paddingTop: 10 * wxScale,
                          paddingBottom: 10 * wxScale,
                          borderRadius: 20 * wxScale,
                          backgroundColor: cardBg,
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <Text style={{ fontSize: 13 * wxScale, color: textSecondary }}>
                          {item}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </>
          )}

          {/* 底部留白 */}
          <Box style={{ height: 60 * wxScale }} />
        </Box>
      </ScrollView>
    </Box>
  )
}

export default SearchPage
