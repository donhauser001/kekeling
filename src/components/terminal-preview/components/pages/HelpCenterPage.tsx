/**
 * 帮助中心页面
 *
 * 显示帮助中心分类下的文章列表
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState + useEffect 获取数据
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon } from '../../ui/primitives'
import { isWxEnvironment } from '../../platform/env'
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'

// ============================================================================
// 类型定义
// ============================================================================

interface HelpCenterPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

interface Article {
  id: string
  title: string
  excerpt?: string
}

// ============================================================================
// 常量
// ============================================================================

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

// ============================================================================
// 主组件
// ============================================================================

export function HelpCenterPage({
  themeSettings,
  isDarkMode = false,
  onBack,
  onNavigate,
}: HelpCenterPageProps) {
  // 数据状态
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 颜色配置
  const primaryColor = themeSettings.primaryColor
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  // 获取帮助中心文章列表
  useEffect(() => {
    setIsLoading(true)
    previewApi
      .getArticlesByCategory('help')
      .then((data) => {
        setArticles(data?.items || [])
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: bgColor,
      }}
    >
      {/* ========== 顶部导航栏 ========== */}
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
          {/* 返回按钮 */}
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

          {/* 标题 */}
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
            帮助中心
          </Text>
        </Box>
      </Box>

      {/* ========== 内容区域 ========== */}
      <Box style={{ flex: 1, padding: 12 * wxScale }}>
        {/* 加载状态 - 骨架屏 */}
        {isLoading && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                style={{
                  padding: 16 * wxScale,
                  borderRadius: 12 * wxScale,
                  backgroundColor: cardBg,
                }}
              >
                <Box
                  style={{
                    height: 20 * wxScale,
                    width: '75%',
                    borderRadius: 4 * wxScale,
                    backgroundColor: borderColor,
                    marginBottom: 8 * wxScale,
                  }}
                />
                <Box
                  style={{
                    height: 16 * wxScale,
                    width: '50%',
                    borderRadius: 4 * wxScale,
                    backgroundColor: borderColor,
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* 文章列表 */}
        {!isLoading && articles.length > 0 && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 * wxScale }}>
            {articles.map((article) => (
              <Box
                key={article.id}
                onClick={() => onNavigate?.('article-detail', { id: article.id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12 * wxScale,
                  padding: 16 * wxScale,
                  borderRadius: 12 * wxScale,
                  backgroundColor: cardBg,
                  cursor: 'pointer',
                }}
              >
                {/* 图标 */}
                <Box
                  style={{
                    width: 40 * wxScale,
                    height: 40 * wxScale,
                    borderRadius: 8 * wxScale,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: `${primaryColor}15`,
                  }}
                >
                  <Icon name="file-text" size={20 * wxScale} color={primaryColor} />
                </Box>

                {/* 内容 */}
                <Box style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <Text
                    style={{
                      display: 'block',
                      fontSize: 14 * wxScale,
                      fontWeight: 500,
                      color: textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {article.title}
                  </Text>
                  {article.excerpt && (
                    <Text
                      style={{
                        display: 'block',
                        marginTop: 4 * wxScale,
                        fontSize: 12 * wxScale,
                        color: textSecondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {article.excerpt}
                    </Text>
                  )}
                </Box>

                {/* 箭头 */}
                <Icon name="right" size={16 * wxScale} color={textSecondary} />
              </Box>
            ))}
          </Box>
        )}

        {/* 空状态 */}
        {!isLoading && articles.length === 0 && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 64 * wxScale,
              paddingBottom: 64 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
            }}
          >
            <Box
              style={{
                width: 64 * wxScale,
                height: 64 * wxScale,
                borderRadius: 32 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16 * wxScale,
                backgroundColor: `${primaryColor}15`,
              }}
            >
              <Icon name="help-circle" size={32 * wxScale} color={primaryColor} />
            </Box>
            <Text
              style={{
                fontSize: 16 * wxScale,
                fontWeight: 500,
                color: textPrimary,
                marginBottom: 8 * wxScale,
                textAlign: 'center',
              }}
            >
              暂无帮助文章
            </Text>
            <Text
              style={{
                fontSize: 14 * wxScale,
                color: textSecondary,
                textAlign: 'center',
              }}
            >
              请在后台文章管理中添加帮助中心分类的文章
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default HelpCenterPage
