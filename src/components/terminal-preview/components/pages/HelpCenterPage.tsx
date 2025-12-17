/**
 * 帮助中心页面预览组件
 *
 * 显示帮助中心分类下的文章列表
 */

import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronRight, HelpCircle, FileText } from 'lucide-react'
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'

interface HelpCenterPageProps {
  /** 主题设置 */
  themeSettings: ThemeSettings
  /** 是否深色模式 */
  isDarkMode?: boolean
  /** 返回回调 */
  onBack?: () => void
  /** 导航回调 */
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

export function HelpCenterPage({
  themeSettings,
  isDarkMode = false,
  onBack,
  onNavigate,
}: HelpCenterPageProps) {
  // 获取帮助中心文章列表
  const { data, isLoading } = useQuery({
    queryKey: ['preview', 'help-articles'],
    queryFn: () => previewApi.getArticlesByCategory('help'),
  })

  // 颜色配置
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const borderColor = isDarkMode ? '#3a3a3a' : '#f3f4f6'

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full'>
      {/* 顶部导航 */}
      <div
        className='sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b'
        style={{
          backgroundColor: cardBg,
          borderColor,
        }}
      >
        <button
          onClick={onBack}
          className='p-1 -ml-1 rounded-full hover:bg-black/5 active:bg-black/10'
        >
          <ArrowLeft className='h-5 w-5' style={{ color: textPrimary }} />
        </button>
        <HelpCircle className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
        <span className='font-medium' style={{ color: textPrimary }}>
          帮助中心
        </span>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className='p-4 space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='p-4 rounded-lg animate-pulse'
              style={{ backgroundColor: cardBg }}
            >
              <div className='h-5 w-3/4 rounded mb-2' style={{ backgroundColor: borderColor }} />
              <div className='h-4 w-1/2 rounded' style={{ backgroundColor: borderColor }} />
            </div>
          ))}
        </div>
      )}

      {/* 文章列表 */}
      {!isLoading && data?.items && data.items.length > 0 && (
        <div className='p-4 space-y-3'>
          {data.items.map((article) => (
            <div
              key={article.id}
              className='flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all hover:shadow-sm active:opacity-80'
              style={{ backgroundColor: cardBg }}
              onClick={() => onNavigate?.('article-detail', { id: article.id })}
            >
              <div
                className='w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0'
                style={{ backgroundColor: `${themeSettings.primaryColor}15` }}
              >
                <FileText className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
              </div>
              <div className='flex-1 min-w-0'>
                <h3
                  className='font-medium text-sm truncate'
                  style={{ color: textPrimary }}
                >
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p
                    className='text-xs mt-1 line-clamp-1'
                    style={{ color: textSecondary }}
                  >
                    {article.excerpt}
                  </p>
                )}
              </div>
              <ChevronRight className='h-4 w-4 flex-shrink-0' style={{ color: textSecondary }} />
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && (!data?.items || data.items.length === 0) && (
        <div className='flex flex-col items-center justify-center py-16 px-4'>
          <div
            className='w-16 h-16 rounded-full flex items-center justify-center mb-4'
            style={{ backgroundColor: `${themeSettings.primaryColor}15` }}
          >
            <HelpCircle className='h-8 w-8' style={{ color: themeSettings.primaryColor }} />
          </div>
          <p className='text-center font-medium mb-2' style={{ color: textPrimary }}>
            暂无帮助文章
          </p>
          <p className='text-center text-sm' style={{ color: textSecondary }}>
            请在后台文章管理中添加帮助中心分类的文章
          </p>
        </div>
      )}
    </div>
  )
}

export default HelpCenterPage

