/**
 * 用户登录页面
 * 目前用户端主要使用微信登录，手机号登录功能即将上线
 */

import { Link } from 'react-router-dom'
import { useSite } from '@/context/SiteContext'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

export function LoginPage() {
  const { getSetting } = useSite()
  
  const siteName = getSetting('site_name', '科科灵陪诊')
  const siteLogo = getSetting('site_logo', '')
  const contactPhone = getSetting('contact_phone', '400-123-4567')

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gray-50">
      {/* 顶部装饰 */}
      <div className="absolute inset-x-0 top-0 h-64 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-primary-100/60 rounded-full blur-[100px]" />
        <div className="absolute -top-32 -left-32 w-[300px] h-[300px] bg-primary-100/40 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 pt-12 pb-20">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-12 max-w-[180px] w-auto object-contain" />
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
                  <Icon name="stethoscope" className="text-3xl text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{siteName}</span>
              </>
            )}
          </Link>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">用户登录</h1>
            <p className="text-gray-500">登录后即可预约陪诊服务</p>
          </div>

          {/* 微信登录 - 主要方式 */}
          <div className="space-y-4">
            <button 
              className="w-full py-4 bg-[#07C160] text-white font-semibold rounded-2xl 
                       shadow-lg shadow-[#07C160]/30 hover:shadow-xl hover:shadow-[#07C160]/40
                       hover:bg-[#06AD56] transition-all duration-300 
                       flex items-center justify-center gap-3"
            >
              <Icon name="wechat" className="text-2xl" />
              <span>微信一键登录</span>
            </button>
            
            <p className="text-center text-sm text-gray-400">
              推荐使用微信登录，安全快捷
            </p>
          </div>

          {/* 分隔线 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-400">其他登录方式</span>
            </div>
          </div>

          {/* 手机号登录 - 即将上线 */}
          <div className="space-y-4">
            <button 
              disabled
              className="w-full py-4 bg-gray-100 text-gray-400 font-medium rounded-2xl 
                       flex items-center justify-center gap-3 cursor-not-allowed"
            >
              <Icon name="phone-telephone" className="text-xl" />
              <span>手机号登录</span>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">即将上线</span>
            </button>
            
            <div className="flex items-start gap-2 p-4 bg-primary-50 rounded-2xl text-sm text-primary-700">
              <Icon name="tips" className="text-lg flex-shrink-0 mt-0.5" />
              <p>手机号登录功能正在开发中，敬请期待。目前请使用微信登录。</p>
            </div>
          </div>

          {/* 协议 */}
          <p className="text-center mt-8 text-xs text-gray-400">
            登录即表示您同意
            <Link to="/terms" className="text-primary-600 hover:underline mx-1">《服务协议》</Link>
            和
            <Link to="/privacy" className="text-primary-600 hover:underline mx-1">《隐私政策》</Link>
          </p>
        </div>

        {/* 陪诊员入口 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="peoples" className="text-2xl text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">陪诊员入口</p>
              <p className="text-sm text-gray-500">成为陪诊员，开启副业之旅</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Link
              to="/escort/login"
              className="flex-1 py-3 text-center text-sm font-medium text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              陪诊员登录
            </Link>
            <Link
              to="/escort/register"
              className="flex-1 py-3 text-center text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              申请成为陪诊员
            </Link>
          </div>
        </div>

        {/* 联系客服 */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            遇到问题？
            <a href={`tel:${contactPhone}`} className="text-primary-600 hover:text-primary-700 font-medium ml-1">
              联系客服 {contactPhone}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
