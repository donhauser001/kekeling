/**
 * 我的收藏页面
 * 展示用户收藏的服务列表
 */

import { useState, useEffect, useCallback } from 'react'
import { Box, Text, Button, Image, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi, type FavoriteItem } from '../../../api'
import type { ThemeSettings } from '../../../types'
import { getResourceUrl } from '../../../utils'
import { getWxBridge } from '../../../bridge/wx-bridge'

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

interface FavoritesPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
  onServiceClick?: (serviceId: string) => void
}

export function FavoritesPage({
  themeSettings,
  isDarkMode = false,
  onBack,
  onServiceClick,
}: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const primaryColor = themeSettings.primaryColor

  // 主题颜色
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'

  // 加载收藏列表
  const loadFavorites = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setIsLoading(true)
      const result = await previewApi.getFavorites({ page: pageNum, pageSize: 20 })
      
      if (append) {
        setFavorites(prev => [...prev, ...result.data])
      } else {
        setFavorites(result.data)
      }
      
      setTotal(result.total)
      setHasMore(result.data.length === 20 && pageNum * 20 < result.total)
    } catch (err) {
      console.error('[FavoritesPage] 加载失败:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    loadFavorites(1)
  }, [loadFavorites])

  // 加载更多
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadFavorites(nextPage, true)
    }
  }

  // 取消收藏
  const handleRemoveFavorite = async (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const wxBridge = getWxBridge()

    try {
      const result = await previewApi.removeFavorite(serviceId)
      // 从列表中移除
      setFavorites(prev => prev.filter(item => item.serviceId !== serviceId))
      setTotal(prev => prev - 1)
      wxBridge.showToast({ title: result.message || '已取消收藏', icon: 'none' })
    } catch (err) {
      wxBridge.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  // 点击服务
  const handleServiceClick = (serviceId: string) => {
    onServiceClick?.(serviceId)
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      {/* 顶部导航栏 - 主色背景 + 安全区域 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: primaryColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          {/* 返回按钮（绝对定位左侧） */}
          {onBack && (
            <Box
              onClick={onBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36 * wxScale,
                height: 36 * wxScale,
              }}
            >
              <Icon name="left" size={22 * wxScale} color="#fff" />
            </Box>
          )}

          {/* 标题（居中） */}
          <Text
            style={{
              fontSize: 17 * wxScale,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            我的收藏
          </Text>

          {/* 收藏数量（右侧） */}
          <Text
            style={{
              position: 'absolute',
              right: 12 * wxScale,
              fontSize: 13 * wxScale,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            共 {total} 个
          </Text>
        </Box>
      </Box>

      {/* 收藏列表 */}
      <Box style={{ padding: 12 * wxScale }}>
        {/* 骨架屏加载状态 */}
        {isLoading && favorites.length === 0 ? (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 12 * wxScale,
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <Box
                  style={{
                    width: 100 * wxScale,
                    height: 100 * wxScale,
                    backgroundColor: '#e5e7eb',
                  }}
                />
                <Box
                  style={{
                    flex: 1,
                    padding: 12 * wxScale,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Box
                      style={{
                        width: '80%',
                        height: 16 * wxScale,
                        backgroundColor: '#e5e7eb',
                        borderRadius: 4 * wxScale,
                      }}
                    />
                    <Box
                      style={{
                        width: '40%',
                        height: 12 * wxScale,
                        backgroundColor: '#e5e7eb',
                        borderRadius: 4 * wxScale,
                        marginTop: 8 * wxScale,
                      }}
                    />
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box
                      style={{
                        width: 60 * wxScale,
                        height: 20 * wxScale,
                        backgroundColor: '#e5e7eb',
                        borderRadius: 4 * wxScale,
                      }}
                    />
                    <Box
                      style={{
                        width: 60 * wxScale,
                        height: 24 * wxScale,
                        backgroundColor: '#e5e7eb',
                        borderRadius: 12 * wxScale,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : favorites.length === 0 ? (
          // 空状态
          <Box
            style={{
              padding: 48 * wxScale,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Icon name="like" size={48 * wxScale} color={textSecondary} />
            <Text
              style={{
                display: 'block',
                fontSize: 14 * wxScale,
                color: textSecondary,
                marginTop: 16 * wxScale,
                textAlign: 'center',
              }}
            >
              暂无收藏
            </Text>
            <Text
              style={{
                display: 'block',
                fontSize: 12 * wxScale,
                color: textSecondary,
                marginTop: 8 * wxScale,
                textAlign: 'center',
              }}
            >
              快去浏览服务并收藏吧
            </Text>
          </Box>
        ) : (
          // 服务列表
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            {favorites.map((item) => (
              <Box
                key={item.id}
                onClick={() => handleServiceClick(item.serviceId)}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 12 * wxScale,
                  overflow: 'hidden',
                  display: 'flex',
                  cursor: 'pointer',
                }}
              >
                {/* 服务图片 */}
                <Image
                  src={getResourceUrl(item.service.coverImage)}
                  mode="aspectFill"
                  style={{
                    width: 100 * wxScale,
                    height: 100 * wxScale,
                  }}
                />

                {/* 服务信息 */}
                <Box
                  style={{
                    flex: 1,
                    padding: 12 * wxScale,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Text
                      style={{
                        fontSize: 15 * wxScale,
                        fontWeight: 500,
                        color: textPrimary,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.service.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12 * wxScale,
                        color: textSecondary,
                        marginTop: 4 * wxScale,
                      }}
                    >
                      {item.service.categoryName}
                    </Text>
                  </Box>

                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                      <Text style={{ fontSize: 12 * wxScale, color: primaryColor }}>¥</Text>
                      <Text
                        style={{
                          fontSize: 18 * wxScale,
                          fontWeight: 600,
                          color: primaryColor,
                        }}
                      >
                        {item.service.price}
                      </Text>
                    </Box>

                    {/* 取消收藏按钮 */}
                    <Button
                      onClick={(e) => handleRemoveFavorite(item.serviceId, e)}
                      style={{
                        padding: `${4 * wxScale}px ${12 * wxScale}px`,
                        borderRadius: 12 * wxScale,
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12 * wxScale,
                          color: textSecondary,
                        }}
                      >
                        取消收藏
                      </Text>
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}

            {/* 加载更多 */}
            {hasMore && (
              <Button
                onClick={handleLoadMore}
                style={{
                  padding: 12 * wxScale,
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Text
                  style={{
                    fontSize: 13 * wxScale,
                    color: primaryColor,
                  }}
                >
                  {isLoading ? '加载中...' : '加载更多'}
                </Text>
              </Button>
            )}

            {/* 已到底部 */}
            {!hasMore && favorites.length > 0 && (
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 12 * wxScale,
                  color: textSecondary,
                  padding: 12 * wxScale,
                }}
              >
                已全部加载
              </Text>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
