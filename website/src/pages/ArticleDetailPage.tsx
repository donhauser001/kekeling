/**
 * 文章详情页
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articleApi, type Article } from '@/lib/api'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

// 骨架屏
function ArticleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="aspect-[21/9] bg-gray-200 animate-pulse" />
          <div className="p-8 space-y-6">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 相关文章卡片
function RelatedArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-all"
    >
      {article.coverImage ? (
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center flex-shrink-0">
          <Icon name="document" className="text-2xl text-primary-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {article.title}
        </h4>
        <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
          <Icon name="time" className="text-xs" />
          {article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString('zh-CN')
            : '-'}
        </p>
      </div>
    </Link>
  )
}

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载文章
  useEffect(() => {
    if (!slug) return

    setLoading(true)
    setError(null)

    articleApi
      .getBySlug(slug)
      .then(setArticle)
      .catch(() => {
        setError('文章不存在')
      })
      .finally(() => setLoading(false))
  }, [slug])

  // 加载相关文章
  useEffect(() => {
    if (!article?.categoryId) return

    articleApi
      .getList({
        page: 1,
        pageSize: 5,
        categoryId: article.categoryId,
      })
      .then((res) => {
        // 过滤掉当前文章
        setRelatedArticles(res.data.filter(a => a.id !== article.id).slice(0, 4))
      })
      .catch(console.error)
  }, [article?.categoryId, article?.id])

  // 分享功能
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt || '',
          url: window.location.href,
        })
      } catch {
        // 用户取消分享
      }
    } else {
      // 复制链接到剪贴板
      await navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  if (loading) {
    return <ArticleDetailSkeleton />
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Icon name="warning" className="text-6xl text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文章不存在</h1>
          <p className="text-gray-500 mb-8">{error || '找不到该文章'}</p>
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
      {/* 面包屑 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 py-4 text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary-600 transition-colors">
              首页
            </Link>
            <Icon name="right" className="text-xs text-gray-300" />
            <Link to="/news" className="text-gray-500 hover:text-primary-600 transition-colors">
              新闻资讯
            </Link>
            {article.category && (
              <>
                <Icon name="right" className="text-xs text-gray-300" />
                <Link
                  to={`/category/${article.category.slug}`}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {article.category.name}
                </Link>
              </>
            )}
            <Icon name="right" className="text-xs text-gray-300" />
            <span className="text-gray-900 truncate max-w-[200px]">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 文章主体 */}
          <main className="flex-1 min-w-0">
            <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* 封面图 */}
              {article.coverImage && (
                <div className="aspect-[21/9] overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 lg:p-10">
                {/* 头部信息 */}
                <header className="mb-8">
                  {/* 分类标签 */}
                  {article.category && (
                    <Link
                      to={`/category/${article.category.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded-full mb-4 hover:bg-primary-100 transition-colors"
                    >
                      <Icon name="folder" className="text-xs" />
                      {article.category.name}
                    </Link>
                  )}

                  {/* 标题 */}
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {article.title}
                  </h1>

                  {/* 元信息 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Icon name="time" className="text-sm" />
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                        : '-'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="browse" className="text-sm" />
                      {article.viewCount || 0} 阅读
                    </span>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1 hover:text-primary-600 transition-colors ml-auto"
                    >
                      <Icon name="share" className="text-sm" />
                      分享
                    </button>
                  </div>
                </header>

                {/* 摘要 */}
                {article.excerpt && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-xl border-l-4 border-primary-500">
                    <p className="text-gray-600 italic">{article.excerpt}</p>
                  </div>
                )}

                {/* 正文内容 */}
                <div
                  className="prose prose-lg max-w-none 
                    prose-headings:text-gray-900 prose-headings:font-bold
                    prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900
                    prose-ul:list-disc prose-ol:list-decimal
                    prose-li:text-gray-700
                    prose-img:rounded-xl prose-img:shadow-lg
                    prose-blockquote:border-l-primary-500 prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
                    prose-code:text-primary-600 prose-code:bg-primary-50 prose-code:px-1 prose-code:rounded
                    prose-pre:bg-gray-900 prose-pre:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* 标签 */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Icon name="tag" className="text-gray-400" />
                      {article.tags.map((tag, index) => {
                        const tagName = typeof tag === 'string' ? tag : tag.name
                        const tagKey = typeof tag === 'string' ? tag : tag.id || index
                        return (
                          <span
                            key={tagKey}
                            className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-default"
                          >
                            #{tagName}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </article>

            {/* 返回链接 */}
            <div className="mt-8 flex items-center justify-between">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Icon name="back" />
                返回文章列表
              </Link>
              {article.category && (
                <Link
                  to={`/category/${article.category.slug}`}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  更多{article.category.name}文章
                  <Icon name="right" />
                </Link>
              )}
            </div>
          </main>

          {/* 侧边栏 */}
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            {/* 作者/来源卡片 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Icon name="peoples" className="text-2xl text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">科科灵资讯</h4>
                  <p className="text-sm text-gray-500">官方发布</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                为您提供最新的陪诊资讯和健康知识，让就医更轻松
              </p>
              <Link
                to="/news"
                className="block w-full text-center py-2 border border-primary-600 text-primary-600 rounded-full text-sm font-medium hover:bg-primary-50 transition-colors"
              >
                查看更多文章
              </Link>
            </div>

            {/* 相关文章 */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="document" className="text-primary-600" />
                  相关文章
                </h3>
                <div className="space-y-4">
                  {relatedArticles.map((a) => (
                    <RelatedArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            )}

            {/* 快捷入口 */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-2">需要陪诊服务？</h3>
              <p className="text-white/80 text-sm mb-4">
                专业陪诊师全程陪同，让就医更安心
              </p>
              <Link
                to="/services"
                className="block w-full text-center py-2.5 bg-white text-primary-600 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                了解服务
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* 底部推荐 */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-100 lg:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icon name="document" className="text-primary-600" />
              相关文章
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedArticles.map((a) => (
                <RelatedArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
