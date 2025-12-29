import { useParams, Link } from 'react-router-dom'
import { usePageBySlug, useSidebarsForTarget } from '@/hooks/useApi'
import { SidebarRenderer } from '@/components/SidebarRenderer'

export function PageDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: page, loading, error } = usePageBySlug(slug || '')
  
  // 获取页面侧边栏
  const { data: sidebars } = useSidebarsForTarget('page', page?.id)

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
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

  if (error || !page) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">页面不存在</h1>
          <Link to="/" className="text-primary-600 hover:underline">
            返回首页
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
          <span className="text-gray-900">{page.title}</span>
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
              {page.coverImage && (
                <div className="aspect-[21/9] overflow-hidden">
                  <img
                    src={page.coverImage}
                    alt={page.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8 lg:p-12">
                {/* Header */}
                <header className="mb-8">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {page.title}
                  </h1>
                  {page.excerpt && (
                    <p className="text-lg text-gray-600">{page.excerpt}</p>
                  )}
                </header>

                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 
                           prose-p:text-gray-700 prose-a:text-primary-600 
                           prose-img:rounded-xl prose-img:shadow-lg"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </div>
            </article>
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

