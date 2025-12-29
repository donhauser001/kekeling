/**
 * 侧边栏渲染器
 * 根据后台配置的组件动态渲染侧边栏内容
 */

import { Link } from 'react-router-dom'
import { type Sidebar, type SidebarWidget, getMenuLink } from '@/lib/api'

interface SidebarRendererProps {
  sidebar: Sidebar
}

/** 获取侧边栏宽度 */
function getSidebarWidth(width: string, customWidth: number | null): string {
  switch (width) {
    case 'narrow':
      return 'w-56' // 224px
    case 'medium':
      return 'w-64' // 256px
    case 'wide':
      return 'w-80' // 320px
    case 'custom':
      return customWidth ? `w-[${customWidth}px]` : 'w-64'
    default:
      return 'w-64'
  }
}

/** 渲染单个组件 */
function WidgetRenderer({ widget }: { widget: SidebarWidget }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* 标题 */}
      {widget.showTitle && widget.title && (
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          {widget.titleIcon && (
            <span className="text-primary-500">{widget.titleIcon}</span>
          )}
          {widget.title}
        </h3>
      )}

      {/* 内容 */}
      {widget.type === 'menu' && widget.renderedMenu && (
        <nav className="space-y-2">
          {widget.renderedMenu.map((item) => (
            <Link
              key={item.id}
              to={getMenuLink(item)}
              target={item.target === '_blank' ? '_blank' : undefined}
              className="block px-3 py-2 text-sm text-gray-700 rounded-lg
                       hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.name}
            </Link>
          ))}
        </nav>
      )}

      {widget.type === 'category' && widget.renderedCategories && (
        <nav className="space-y-2">
          {widget.renderedCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 
                       rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <span>{cat.name}</span>
              {cat._count?.articles !== undefined && (
                <span className="text-xs text-gray-400">
                  {cat._count.articles}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}

      {widget.type === 'html' && widget.htmlContent && (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: widget.htmlContent }}
        />
      )}
    </div>
  )
}

export function SidebarRenderer({ sidebar }: SidebarRendererProps) {
  if (!sidebar.widgets || sidebar.widgets.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {sidebar.widgets
        .sort((a, b) => (a.sort || 0) - (b.sort || 0))
        .map((widget, index) => (
          <WidgetRenderer key={index} widget={widget} />
        ))}
    </div>
  )
}

