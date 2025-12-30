/**
 * 陪诊员个人资料页面
 * 展示陪诊员的个人信息、统计数据和快捷操作
 */

import { Link, useNavigate } from 'react-router-dom'
import { useSite } from '@/context/SiteContext'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

// 模拟用户数据
const mockUserData = {
  name: '张陪诊',
  phone: '138****8888',
  avatar: '',
  status: 'active', // active | pending | suspended
  statusText: '已认证',
  level: '金牌陪诊员',
  joinDate: '2024-06-15',
  stats: {
    totalOrders: 156,
    monthOrders: 23,
    totalIncome: '12,580.00',
    monthIncome: '2,360.00',
    rating: '4.9',
    goodRate: '98.5%',
  },
}

// 快捷操作菜单
const quickMenus = [
  { icon: 'order', title: '我的订单', desc: '查看服务订单', link: '/escort/orders', color: 'emerald' },
  { icon: 'wallet', title: '我的收入', desc: '收入明细与提现', link: '/escort/income', color: 'amber' },
  { icon: 'calendar', title: '工作排班', desc: '设置接单时间', link: '/escort/schedule', color: 'blue' },
  { icon: 'comment', title: '服务评价', desc: '查看用户评价', link: '/escort/reviews', color: 'rose' },
]

// 设置菜单
const settingMenus = [
  { icon: 'edit', title: '编辑资料', link: '/escort/edit-profile' },
  { icon: 'hospital', title: '服务医院', link: '/escort/hospitals' },
  { icon: 'shield', title: '账号安全', link: '/escort/security' },
  { icon: 'bell', title: '消息通知', link: '/escort/notifications' },
  { icon: 'question', title: '帮助中心', link: '/help' },
  { icon: 'info', title: '关于我们', link: '/about' },
]

// 颜色映射
const colorMap = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-500' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-500' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', iconBg: 'bg-rose-500' },
}

export function EscortProfilePage() {
  const navigate = useNavigate()
  const { getSetting } = useSite()
  
  const siteName = getSetting('site_name', '科科灵陪诊')
  const siteLogo = getSetting('site_logo', '')
  const contactPhone = getSetting('contact_phone', '400-123-4567')

  const user = mockUserData

  // 退出登录
  const handleLogout = () => {
    // TODO: 调用退出登录 API
    navigate('/escort/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部背景 */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 pt-8 pb-28 px-4 relative overflow-hidden">
        {/* 装饰圆 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        
        {/* 标题栏 */}
        <div className="relative flex items-center justify-between max-w-lg mx-auto mb-8">
          <Link to="/" className="flex items-center gap-2">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-7 max-w-[120px] w-auto object-contain brightness-0 invert" />
            ) : (
              <span className="text-white font-bold text-lg">{siteName}</span>
            )}
          </Link>
          <button className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
            <Icon name="setting" className="text-xl text-white" />
          </button>
        </div>

        {/* 用户信息 */}
        <div className="relative max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            {/* 头像 */}
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-700/30 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <Icon name="user" className="text-4xl text-emerald-500" />
              )}
            </div>
            
            {/* 信息 */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">{user.name}</h1>
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur rounded-full text-xs">
                  {user.statusText}
                </span>
              </div>
              <p className="text-white/80 text-sm mb-2">{user.phone}</p>
              <div className="flex items-center gap-1">
                <Icon name="degree-hat" className="text-amber-300" />
                <span className="text-amber-200 text-sm font-medium">{user.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-20 relative z-10">
        {/* 数据统计卡片 */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 mb-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{user.stats.totalOrders}</p>
              <p className="text-sm text-gray-500">总订单</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-2xl font-bold text-emerald-600">¥{user.stats.totalIncome}</p>
              <p className="text-sm text-gray-500">总收入</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">
                <Icon name="like" className="text-lg mr-0.5" />
                {user.stats.rating}
              </p>
              <p className="text-sm text-gray-500">服务评分</p>
            </div>
          </div>

          {/* 本月数据 */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4">
            <p className="text-sm text-emerald-700 font-medium mb-3">本月数据</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-lg font-bold text-gray-900">{user.stats.monthOrders}</p>
                <p className="text-gray-500">本月订单</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">¥{user.stats.monthIncome}</p>
                <p className="text-gray-500">本月收入</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{user.stats.goodRate}</p>
                <p className="text-gray-500">好评率</p>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickMenus.map((menu) => {
              const colors = colorMap[menu.color as keyof typeof colorMap]
              return (
                <Link
                  key={menu.link}
                  to={menu.link}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon name={menu.icon} className={`text-2xl ${colors.text}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{menu.title}</p>
                    <p className="text-xs text-gray-500">{menu.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* 设置菜单 */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 overflow-hidden mb-4">
          {settingMenus.map((menu, index) => (
            <Link
              key={menu.link}
              to={menu.link}
              className={`flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors ${
                index < settingMenus.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Icon name={menu.icon} className="text-xl text-gray-600" />
              </div>
              <span className="flex-1 font-medium text-gray-800">{menu.title}</span>
              <Icon name="right" className="text-gray-300" />
            </Link>
          ))}
        </div>

        {/* 退出登录 */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 
                   text-red-500 font-medium hover:bg-red-50 transition-colors"
        >
          退出登录
        </button>

        {/* 联系客服 */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            遇到问题？
            <a href={`tel:${contactPhone}`} className="text-emerald-600 hover:text-emerald-700 font-medium ml-1">
              联系客服 {contactPhone}
            </a>
          </p>
        </div>

        {/* 版本信息 */}
        <p className="text-center text-gray-400 text-xs mt-4">
          {siteName} 陪诊员端 v1.0.0
        </p>
      </div>
    </div>
  )
}
