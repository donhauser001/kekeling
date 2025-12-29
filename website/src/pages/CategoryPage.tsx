import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Eye, ArrowRight } from 'lucide-react'
import { useCategoryBySlug, useArticles, useSidebarsForTarget } from '@/hooks/useApi'
import { SidebarRenderer } from '@/components/SidebarRenderer'

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState(1)
  
  const { data: category, loading: categoryLoading, error: categoryError } = useCategoryBySlug(slug || '')
  const { data: articlesData, loading: articlesLoading } = useArticles({
    page,
    pageSize: 12,
    categoryId: category?.id,
  })
  
  // 获取分类页侧边栏
  const { data: sidebars } = useSidebarsForTarget('category', category?.id)

  const loading = categoryLoading || articlesLoading

  if (categoryError || (!categoryLoading && !category)) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">分类不存在</h1>
          <Link to="/news" className="text-primary-600 hover:underline">
            返回文章列表
          </Link>
        </div>
      </div>
    )
  }

  const leftSidebar = sidebars?.find(s => s.position === 'left')
  const rightSidebar = sidebars?.find(s => s.position === 'right')

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary-600">首页</Link>
          <span>/</span>
          <Link to="/news" className="hover:text-primary-600">新闻资讯</Link>
          <span>/</span>
          <span className="text-gray-900">{category?.name || '加载中...'}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {category?.name || '加载中...'}
          </h1>
          {category?.description && (
            <p className="text-lg text-gray-600">{category.description}</p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar */}
          {leftSidebar && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <SidebarRenderer sidebar={leftSidebar} />
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articlesData?.data.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">该分类下暂无文章</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {articlesData?.data.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm 
                               hover:shadow-xl transition-all duration-300"
                    >
                      {/* Cover Image */}
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50">
                            <span className="text-4xl text-primary-300">📰</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 
                                     group-hover:text-primary-600 transition-colors">
                          {article.title}
                        </h2>

                        {article.excerpt && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {article.publishedAt 
                                ? new Date(article.publishedAt).toLocaleDateString('zh-CN')
                                : '-'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {article.viewCount}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {articlesData && articlesData.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {[...Array(articlesData.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === i + 1
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>

          {/* Right Sidebar */}
          {rightSidebar && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <SidebarRenderer sidebar={rightSidebar} />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

