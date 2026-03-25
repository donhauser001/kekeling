import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { useSite } from '@/context/SiteContext'

// 静态备用链接
const defaultFooterLinks = {
  services: [
    { label: '全程陪诊', href: '/services/full' },
    { label: '代办跑腿', href: '/services/errand' },
    { label: '住院陪护', href: '/services/hospital' },
    { label: '异地就医', href: '/services/remote' },
  ],
  about: [
    { label: '关于我们', href: '/about' },
    { label: '加入我们', href: '/join' },
    { label: '陪诊员入驻', href: '/escort/register' },
    { label: '新闻资讯', href: '/news' },
  ],
  support: [
    { label: '帮助中心', href: '/help' },
    { label: '常见问题', href: '/faq' },
    { label: '服务条款', href: '/terms' },
    { label: '隐私政策', href: '/privacy' },
  ],
}

export function Footer() {
  const { getSetting, categories } = useSite()

  // 从后台获取的设置
  const siteName = getSetting('site_name', '科科灵陪诊')
  const siteSlogan = getSetting('site_slogan', '专业医院陪诊服务')
  const siteDescription = getSetting('site_description', 
    '科科灵陪诊是专业的医院陪诊服务平台，提供全程陪诊、代办跑腿、住院陪护等服务，让您的就医之路不再孤单。')
  const contactPhone = getSetting('contact_phone', '400-123-4567')
  const contactEmail = getSetting('contact_email', 'service@kekeling.com')
  const contactAddress = getSetting('contact_address', '北京市朝阳区建国路XXX号')
  const serviceHours = getSetting('service_hours', '7:00 - 22:00')
  const siteLogo = getSetting('site_logo', '')
  const siteCopyright = getSetting('site_copyright', `© ${new Date().getFullYear()} 科科灵陪诊. All rights reserved.`)
  const siteIcp = getSetting('site_icp', '京ICP备2025149672号-2')

  // 使用文章分类或备用数据
  const categoryLinks = Array.isArray(categories) && categories.length > 0
    ? categories.slice(0, 4).map(cat => ({
        label: cat.name,
        href: `/category/${cat.slug}`,
      }))
    : defaultFooterLinks.services

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
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
                                flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{siteName.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-white">
                      {siteName}
                    </span>
                    <span className="text-xs text-gray-500">{siteSlogan}</span>
                  </div>
                </>
              )}
            </div>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              {siteDescription}
            </p>
            <div className="space-y-3">
              <a href={`tel:${contactPhone}`} className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors">
                <Phone className="w-5 h-5" />
                <span>{contactPhone}</span>
              </a>
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors">
                <Mail className="w-5 h-5" />
                <span>{contactEmail}</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-0.5" />
                <span>{contactAddress}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Clock className="w-5 h-5" />
                <span>服务时间: {serviceHours}</span>
              </div>
            </div>
          </div>

          {/* Services / Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">服务项目</h3>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">关于{siteName.slice(0, 3)}</h3>
            <ul className="space-y-3">
              {defaultFooterLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">帮助支持</h3>
            <ul className="space-y-3">
              {defaultFooterLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              {siteCopyright}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/terms" className="hover:text-gray-400 transition-colors">
                服务条款
              </Link>
              <Link to="/privacy" className="hover:text-gray-400 transition-colors">
                隐私政策
              </Link>
              {siteIcp && (
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition-colors"
                >
                  {siteIcp}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
