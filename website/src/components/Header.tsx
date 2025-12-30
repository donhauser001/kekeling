import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { useSite } from '@/context/SiteContext'
import { getMenuLink, type MenuItem } from '@/lib/api'

// 导航项类型
interface NavItem {
  label: string
  href: string
  target?: string
  icon?: string | null
  children?: NavItem[]
}

// 静态备用菜单（后台未配置时使用）
const fallbackNavItems: NavItem[] = [
  { label: '首页', href: '/' },
  { 
    label: '服务项目', 
    href: '/services',
    children: [
      { label: '全程陪诊', href: '/services/full' },
      { label: '代办跑腿', href: '/services/errand' },
      { label: '住院陪护', href: '/services/hospital' },
      { label: '异地就医', href: '/services/remote' },
    ]
  },
  { label: '陪诊员', href: '/escorts' },
  { label: '关于我们', href: '/about' },
  { label: '新闻资讯', href: '/news' },
]

// 将 CMS 菜单转换为导航项
function menuToNavItem(menu: MenuItem): NavItem {
  return {
    label: menu.name,
    href: getMenuLink(menu),
    target: menu.target,
    icon: menu.icon,
    children: menu.children?.map(child => ({
      label: child.name,
      href: getMenuLink(child),
      icon: child.icon,
    })),
  }
}

// 菜单图标组件
function MenuIcon({ name, className }: { name: string; className?: string }) {
  return (
    <i 
      className={`iconfont icon-${name} ${className || ''}`}
      style={{ fontSize: 'inherit', lineHeight: 1 }}
    />
  )
}

export function Header() {
  const { menus, getSetting } = useSite()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 从后台获取的设置
  const siteName = getSetting('site_name', '科科灵陪诊')
  const siteSlogan = getSetting('site_slogan', '专业医院陪诊服务')
  const siteLogo = getSetting('site_logo', '')
  const contactPhone = getSetting('contact_phone', '400-123-4567')

  // 使用后台菜单或备用菜单
  const cmsNavItems = Array.isArray(menus) && menus.length > 0
    ? menus.map(menuToNavItem)
    : fallbackNavItems

  // 检查是否有首页菜单项（href 为 "/" 或标签包含"首页"）
  const hasHomeItem = cmsNavItems.some(
    item => item.href === '/' || item.label.includes('首页')
  )

  // 如果没有首页菜单项，则在最前面添加默认首页
  const navItems = hasHomeItem
    ? cmsNavItems
    : [{ label: '首页', href: '/' }, ...cmsNavItems]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {siteLogo ? (
              /* 有 Logo 时只显示图片 */
              <img 
                src={siteLogo} 
                alt={siteName} 
                className="h-10 w-auto object-contain"
              />
            ) : (
              /* 没有 Logo 时显示图标和文字 */
              <>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 
                              flex items-center justify-center shadow-lg shadow-primary-500/30
                              group-hover:shadow-xl group-hover:shadow-primary-500/40 transition-shadow">
                  <span className="text-white font-bold text-lg">{siteName.charAt(0)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900">
                    {siteName}
                  </span>
                  <span className="text-xs text-gray-500 -mt-0.5">{siteSlogan}</span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  to={item.href}
                  target={item.target === '_blank' ? '_blank' : undefined}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    'flex items-center gap-1.5',
                    'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  )}
                >
                  {item.icon && <MenuIcon name={item.icon} className="text-base" />}
                  {item.label}
                  {item.children && item.children.length > 0 && <ChevronDown className="w-4 h-4" />}
                </Link>
                
                {/* Dropdown */}
                {item.children && item.children.length > 0 && (
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible 
                                group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white rounded-xl shadow-xl shadow-black/10 border border-gray-100 
                                  py-2 min-w-[180px] overflow-hidden">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 
                                   hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          {child.icon && <MenuIcon name={child.icon} className="text-base" />}
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA & Phone */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">{contactPhone}</span>
            </a>
            <Link to="/booking" className="btn-primary text-sm">
              立即预约
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'lg:hidden transition-all duration-300 overflow-hidden',
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:text-primary-600 
                       hover:bg-primary-50 font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon && <MenuIcon name={item.icon} className="text-lg" />}
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100">
            <Link
              to="/booking"
              className="btn-primary w-full text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              立即预约
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
