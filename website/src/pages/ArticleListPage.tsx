import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Eye, ArrowRight, Search, FileText } from 'lucide-react'
import { useArticles, useCategories } from '@/hooks/useApi'

export function ArticleListPage() {
  const [page, setPage] = useState(1)
  const [categoryId, setCategoryId] = useState<string>('')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  
  const { data: articlesData, loading, error } = useArticles({
    page,
    pageSize: 12,
    categoryId: categoryId || undefined,
    keyword: keyword || undefined,
  })
  
  const { data: categoriesData } = useCategories()

  // 提取分类数组（兼容不同响应格式）
  const categories = (() => {
    if (Array.isArray(categoriesData)) return categoriesData
    if (categoriesData && typeof categoriesData === 'object' && 'data' in categoriesData) {
      const inner = (categoriesData as { data: unknown }).data
      if (Array.isArray(inner)) return inner
    }
    return []
  })()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(1)
  }

  // 获取文章数组（兼容不同响应格式）
  const articles = (() => {
    if (Array.isArray(articlesData)) return articlesData
    if (articlesData?.data && Array.isArray(articlesData.data)) return articlesData.data
    return []
  })()
  
  const totalPages = (() => {
    if (articlesData?.totalPages) return articlesData.totalPages
    if (articlesData?.meta?.totalPages) return articlesData.meta.totalPages
    return 1
  })()

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-500">加载失败，请稍后重试</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">新闻资讯</h1>
          <p className="text-lg text-gray-600">了解最新的陪诊资讯和健康知识</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setPage(1)
            }}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white
                     focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="">全部分类</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无文章</p>
          </div>
        )}

        {/* Article Grid */}
        {!loading && articles.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
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
                        <FileText className="w-12 h-12 text-primary-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category */}
                    {article.category && (
                      <span className="inline-block px-3 py-1 text-xs font-medium text-primary-600 
                                     bg-primary-50 rounded-full mb-3">
                        {article.category.name}
                      </span>
                    )}

                    {/* Title */}
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 
                                 group-hover:text-primary-600 transition-colors">
                      {article.title}
                    </h2>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Meta */}
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
                          {article.viewCount || 0}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {[...Array(totalPages)].map((_, i) => (
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
      </div>
    </div>
  )
}
