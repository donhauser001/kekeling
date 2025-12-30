/**
 * 文章分类列表页
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { categoryApi, articleApi, type ArticleCategory, type Article } from '@/lib/api'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

// 文章卡片组件
function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
    >
      {/* 封面图 */}
      <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <Icon name="document" className="text-5xl text-primary-300" />
          </div>
        )}
        {/* 分类标签 */}
        {article.category && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
            {article.category.name}
          </div>
        )}
      </div>

      {/* 内容 */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
            {article.excerpt}
          </p>
        )}

        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={typeof tag === 'string' ? tag : tag.id || index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                #{typeof tag === 'string' ? tag : tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-sm text-gray-400 mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Icon name="time" className="text-xs" />
              {article.publishedAt 
                ? new Date(article.publishedAt).toLocaleDateString('zh-CN')
                : '-'}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="browse" className="text-xs" />
              {article.viewCount || 0}
            </span>
          </div>
          <span className="text-primary-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
            阅读
            <Icon name="right" className="text-xs" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// 骨架屏
function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
        </div>
      </div>
    </div>
  )
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [category, setCategory] = useState<ArticleCategory | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [allCategories, setAllCategories] = useState<ArticleCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = 12

  // 加载所有分类
  useEffect(() => {
    categoryApi.getAll().then(setAllCategories).catch(console.error)
  }, [])

  // 加载当前分类
  useEffect(() => {
    if (!slug) return
    
    setCategoryLoading(true)
    setError(null)
    
    categoryApi
      .getBySlug(slug)
      .then(setCategory)
      .catch(() => {
        setError('分类不存在')
      })
      .finally(() => setCategoryLoading(false))
  }, [slug])

  // 加载文章列表
  useEffect(() => {
    if (!category?.id) return
    
    setLoading(true)
    articleApi
      .getList({
        page: currentPage,
        pageSize,
        categoryId: category.id,
      })
      .then((res) => {
        // 兼容不同响应格式: { data, total } 或直接数组
        const data = Array.isArray(res) 
          ? res 
          : (res?.data || [])
        const totalCount = typeof res === 'object' && 'total' in res 
          ? res.total 
          : data.length
        setArticles(data)
        setTotal(totalCount)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category?.id, currentPage])

  // 切换页码
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(total / pageSize)

  // 错误状态
  if (error || (!categoryLoading && !category)) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Icon name="warning" className="text-6xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">分类不存在</h1>
          <p className="text-gray-500 mb-8">{error || '找不到该分类'}</p>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-700 transition-colors"
          >
            <Icon name="back" />
            <span>返回文章列表</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 面包屑 */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-primary-600 transition-colors">首页</Link>
            <Icon name="right" className="text-xs text-gray-300" />
            <Link to="/news" className="hover:text-primary-600 transition-colors">新闻资讯</Link>
            <Icon name="right" className="text-xs text-gray-300" />
            <span className="text-gray-900">{category?.name || '加载中...'}</span>
          </nav>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {category?.name || '加载中...'}
            </h1>
            {category?.description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 分类切换 */}
      <section className="bg-white border-b border-gray-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <Link
              to="/news"
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              全部文章
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  cat.slug === slug
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
                {cat._count?.articles !== undefined && (
                  <span className="ml-1 opacity-70">({cat._count.articles})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 文章列表 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 统计信息 */}
          {!loading && articles && articles.length > 0 && (
            <div className="mb-6 text-sm text-gray-500">
              共 <span className="font-medium text-gray-900">{total}</span> 篇文章
            </div>
          )}

          {loading || categoryLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Icon name="left" className="text-xs" />
                      上一页
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      if (
                        page <= 3 ||
                        page > totalPages - 3 ||
                        Math.abs(page - currentPage) <= 1
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-primary-600 text-white'
                                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (
                        (page === 4 && currentPage > 5) ||
                        (page === totalPages - 3 && currentPage < totalPages - 4)
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-400">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      下一页
                      <Icon name="right" className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Icon name="document" className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">该分类下暂无文章</p>
              <Link
                to="/news"
                className="text-primary-600 hover:underline"
              >
                查看全部文章
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">想了解更多？</h2>
          <p className="text-gray-400 mb-8">浏览我们的全部文章，获取更多健康资讯</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/news"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Icon name="document" />
              <span>全部文章</span>
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors"
            >
              <Icon name="stethoscope" />
              <span>了解服务</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
