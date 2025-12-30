/**
 * 首页组件
 * 根据后台设置动态显示首页内容：
 * - 如果有菜单设置为首页且类型为"页面"，则显示该页面内容
 * - 否则显示默认的静态首页
 */

import { useMemo } from 'react'
import { useSite } from '@/context/SiteContext'
import { usePageBySlug, useSidebarsForTarget, type MenuItem } from '@/hooks/useApi'
import { SidebarRenderer } from '@/components/SidebarRenderer'
import { Seo } from '@/components/Seo'
import { DefaultHomePage } from './DefaultHomePage'

/** 递归查找首页菜单 */
function findHomeMenu(menus: MenuItem[]): MenuItem | null {
  for (const menu of menus) {
    if (menu.isHome && menu.status === 'active') {
      return menu
    }
    if (menu.children?.length) {
      const found = findHomeMenu(menu.children)
      if (found) return found
    }
  }
  return null
}

/** 页面内容渲染组件 */
function PageContent({ slug }: { slug: string }) {
  const { data: page, loading, error } = usePageBySlug(slug)
  const { data: sidebars } = useSidebarsForTarget('page', page?.id)

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {/* 骨架屏 */}
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !page) {
    // 如果页面加载失败，回退到默认首页
    return <DefaultHomePage />
  }

  const isFullwidth = page.layout === 'fullwidth'
  const leftSidebar = sidebars?.find(s => s.position === 'left')
  const rightSidebar = sidebars?.find(s => s.position === 'right')
  const hasSidebar = !isFullwidth && (leftSidebar || rightSidebar)

  // 全宽布局
  if (isFullwidth) {
    return (
      <div className="min-h-screen pt-20">
        {/* 如果页面有封面图，全宽显示 */}
        {page.coverImage && (
          <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
            <img
              src={page.coverImage}
              alt={page.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {page.title}
                </h1>
                {page.excerpt && (
                  <p className="text-xl text-white/90 max-w-2xl">{page.excerpt}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 全宽内容区域 - 直接渲染HTML，无外层容器限制 */}
        <div 
          className="prose prose-lg max-w-none 
                   prose-headings:text-gray-900 prose-headings:font-bold
                   prose-p:text-gray-700 prose-p:leading-relaxed
                   prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                   prose-img:rounded-xl prose-img:shadow-lg
                   prose-ul:text-gray-700 prose-ol:text-gray-700
                   prose-blockquote:border-primary-500 prose-blockquote:text-gray-600
                   prose-code:text-primary-600 prose-code:bg-primary-50 prose-code:px-1 prose-code:rounded"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    )
  }

  // 盒式布局
  return (
    <div className="min-h-screen">
      {/* 如果页面有封面图，全宽显示 */}
      {page.coverImage && (
        <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img
            src={page.coverImage}
            alt={page.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {page.title}
              </h1>
              {page.excerpt && (
                <p className="text-xl text-white/90 max-w-2xl">{page.excerpt}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 主内容区域 */}
      <div className={`py-16 ${!page.coverImage ? 'pt-32' : ''} bg-gray-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 如果没有封面图且开启了显示标题，显示标题栏 */}
          {!page.coverImage && page.showTitle !== false && (
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {page.title}
              </h1>
              {page.excerpt && (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{page.excerpt}</p>
              )}
            </header>
          )}

          <div className={`flex gap-8`}>
            {/* 左侧边栏 */}
            {leftSidebar && (
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <SidebarRenderer sidebar={leftSidebar} />
              </aside>
            )}

            {/* 主内容 */}
            <main className="flex-1 min-w-0">
              <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-8 lg:p-12">
                  <div 
                    className="prose prose-lg max-w-none 
                             prose-headings:text-gray-900 prose-headings:font-bold
                             prose-p:text-gray-700 prose-p:leading-relaxed
                             prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                             prose-img:rounded-xl prose-img:shadow-lg
                             prose-ul:text-gray-700 prose-ol:text-gray-700
                             prose-blockquote:border-primary-500 prose-blockquote:text-gray-600
                             prose-code:text-primary-600 prose-code:bg-primary-50 prose-code:px-1 prose-code:rounded"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                </div>
              </article>
            </main>

            {/* 右侧边栏 */}
            {rightSidebar && (
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <SidebarRenderer sidebar={rightSidebar} />
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const { menus, loading } = useSite()

  // 查找首页菜单
  const homeMenu = useMemo(() => {
    if (!menus || !menus.length) return null
    return findHomeMenu(menus)
  }, [menus])

  // 判断首页是否为页面类型
  const isPageType = homeMenu?.type === 'page' && homeMenu.page?.slug

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <Seo isHome />
      {isPageType && homeMenu?.page?.slug ? (
        <PageContent slug={homeMenu.page.slug} />
      ) : (
        <DefaultHomePage />
      )}
    </>
  )
}
