import { useParams, Link } from 'react-router-dom'
import { Calendar, Eye, Tag, ArrowLeft, Share2 } from 'lucide-react'
import { useArticleBySlug, useLatestArticles } from '@/hooks/useApi'
import { useSidebarsForTarget } from '@/hooks/useApi'
import { SidebarRenderer } from '@/components/SidebarRenderer'

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: article, loading, error } = useArticleBySlug(slug || '')
  const { data: latestArticles } = useLatestArticles(5)
  
  // 获取文章页侧边栏
  const { data: sidebars } = useSidebarsForTarget('article', article?.categoryId || undefined)

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文章不存在</h1>
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
          {article.category && (
            <>
              <span>/</span>
              <Link to={`/category/${article.category.slug}`} className="hover:text-primary-600">
                {article.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[200px]">{article.title}</span>
        </nav>

        <div className="flex gap-8">
          {/* Left Sidebar */}
          {leftSidebar && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <SidebarRenderer sidebar={leftSidebar} />
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Cover Image */}
              {article.coverImage && (
                <div className="aspect-[21/9] overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8 lg:p-12">
                {/* Header */}
                <header className="mb-8">
                  {article.category && (
                    <Link
                      to={`/category/${article.category.slug}`}
                      className="inline-block px-3 py-1 text-sm font-medium text-primary-600 
                               bg-primary-50 rounded-full mb-4 hover:bg-primary-100 transition-colors"
                    >
                      {article.category.name}
                    </Link>
                  )}

                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {article.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '-'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.viewCount} 阅读
                    </span>
                    <button className="flex items-center gap-1 hover:text-primary-600 transition-colors ml-auto">
                      <Share2 className="w-4 h-4" />
                      分享
                    </button>
                  </div>
                </header>

                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 
                           prose-p:text-gray-700 prose-a:text-primary-600 
                           prose-img:rounded-xl prose-img:shadow-lg"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-4 h-4 text-gray-400" />
                      {article.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          to={`/tag/${tag.slug}`}
                          className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full
                                   hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>

            {/* Back Link */}
            <div className="mt-8">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回文章列表
              </Link>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
            {rightSidebar ? (
              <SidebarRenderer sidebar={rightSidebar} />
            ) : (
              /* Default sidebar content */
              <>
                {/* Latest Articles */}
                {latestArticles && latestArticles.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">最新文章</h3>
                    <div className="space-y-4">
                      {latestArticles.filter(a => a.id !== article.id).slice(0, 5).map((a) => (
                        <Link
                          key={a.id}
                          to={`/article/${a.slug}`}
                          className="block group"
                        >
                          <h4 className="text-sm text-gray-700 line-clamp-2 
                                       group-hover:text-primary-600 transition-colors">
                            {a.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {a.publishedAt 
                              ? new Date(a.publishedAt).toLocaleDateString('zh-CN')
                              : '-'}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

