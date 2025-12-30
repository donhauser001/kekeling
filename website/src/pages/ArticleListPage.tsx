/**
 * 文章列表页（新闻资讯）
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { articleApi, categoryApi, type Article, type ArticleCategory } from '@/lib/api'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

// 文章卡片组件
function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  if (featured) {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 md:col-span-2 lg:col-span-2 flex flex-col md:flex-row"
      >
        {/* 封面图 */}
        <div className="md:w-1/2 aspect-[16/10] md:aspect-auto overflow-hidden bg-gray-100 relative">
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
              <Icon name="document" className="text-6xl text-primary-300" />
            </div>
          )}
          {/* 置顶/推荐标签 */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Icon name="fire" className="text-xs" />
            推荐
          </div>
        </div>

        {/* 内容 */}
        <div className="md:w-1/2 p-6 flex flex-col">
          {/* 分类标签 */}
          {article.category && (
            <span className="inline-flex items-center self-start px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-full mb-3">
              {article.category.name}
            </span>
          )}

          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          
          {article.excerpt && (
            <p className="text-gray-500 mb-4 line-clamp-3 flex-1">
              {article.excerpt}
            </p>
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
              阅读全文
              <Icon name="right" className="text-xs" />
            </span>
          </div>
        </div>
      </Link>
    )
  }

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

export function ArticleListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const currentCategory = searchParams.get('category') || ''
  const currentKeyword = searchParams.get('keyword') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = 12

  const [searchInput, setSearchInput] = useState(currentKeyword)

  // 加载分类
  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(console.error)
  }, [])

  // 加载文章列表
  useEffect(() => {
    setLoading(true)
    articleApi
      .getList({
        page: currentPage,
        pageSize,
        categoryId: currentCategory || undefined,
        keyword: currentKeyword || undefined,
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
      .catch((err) => {
        console.error('加载文章失败:', err)
        setArticles([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [currentCategory, currentKeyword, currentPage])

  // 搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchInput) {
      params.set('keyword', searchInput)
    } else {
      params.delete('keyword')
    }
    params.delete('page')
    setSearchParams(params)
  }

  // 切换分类
  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams)
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    params.delete('page')
    setSearchParams(params)
  }

  // 切换页码
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">新闻资讯</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            了解最新的陪诊资讯和健康知识
          </p>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-5 py-4 pl-12 rounded-full border border-gray-200 bg-white shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                搜索
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 分类筛选 */}
      <section className="bg-white border-b border-gray-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => handleCategoryChange('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !currentCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部文章
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentCategory === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
                {cat._count?.articles !== undefined && (
                  <span className="ml-1 opacity-70">({cat._count.articles})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 文章列表 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 搜索结果提示 */}
          {currentKeyword && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-500">
                搜索 "<span className="font-medium text-gray-900">{currentKeyword}</span>" 的结果，
                共 <span className="font-medium text-gray-900">{total}</span> 篇文章
              </p>
              <button
                onClick={() => {
                  setSearchInput('')
                  const params = new URLSearchParams(searchParams)
                  params.delete('keyword')
                  setSearchParams(params)
                }}
                className="text-sm text-primary-600 hover:underline"
              >
                清除搜索
              </button>
            </div>
          )}

          {/* 统计信息 */}
          {!currentKeyword && !loading && articles && articles.length > 0 && (
            <div className="mb-6 text-sm text-gray-500">
              共 <span className="font-medium text-gray-900">{total}</span> 篇文章
              {currentCategory && categories.find(c => c.id === currentCategory) && (
                <span>
                  ，当前分类：
                  <span className="font-medium text-primary-600">
                    {categories.find(c => c.id === currentCategory)?.name}
                  </span>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.map((article, index) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    featured={index === 0 && currentPage === 1 && !currentKeyword}
                  />
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
              <p className="text-gray-500 mb-4">
                {currentKeyword ? '没有找到相关文章' : '暂无文章'}
              </p>
              {(currentCategory || currentKeyword) && (
                <button
                  onClick={() => {
                    setSearchInput('')
                    setSearchParams(new URLSearchParams())
                  }}
                  className="text-primary-600 hover:underline"
                >
                  查看全部文章
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">需要陪诊服务？</h2>
          <p className="text-white/90 mb-8">专业陪诊师全程陪同，让就医更安心</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Icon name="stethoscope" />
              <span>了解服务</span>
            </Link>
            <a
              href="tel:400-123-4567"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/30 hover:bg-white/20 transition-all"
            >
              <Icon name="phone-telephone" />
              <span>400-123-4567</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
