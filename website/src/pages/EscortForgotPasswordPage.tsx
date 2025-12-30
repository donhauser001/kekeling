/**
 * 陪诊员找回密码页面
 * 引导用户联系客服找回密码
 */

import { Link } from 'react-router-dom'
import { useSite } from '@/context/SiteContext'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

export function EscortForgotPasswordPage() {
  const { getSetting } = useSite()
  
  const siteName = getSetting('site_name', '科科灵陪诊')
  const siteLogo = getSetting('site_logo', '')
  const contactPhone = getSetting('contact_phone', '400-123-4567')
  const serviceWechat = getSetting('service_wechat', 'kekeling_service')

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-50">
      {/* 顶部装饰 */}
      <div className="absolute inset-x-0 top-0 h-64 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-emerald-100/60 rounded-full blur-[100px]" />
        <div className="absolute -top-32 -left-32 w-[300px] h-[300px] bg-teal-100/40 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 pt-12 pb-20">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            {siteLogo ? (
              <>
                <img src={siteLogo} alt={siteName} className="h-12 max-w-[180px] w-auto object-contain" />
                <p className="text-sm text-gray-500">陪诊员工作台</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Icon name="peoples" className="text-3xl text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">{siteName}</span>
                  <p className="text-sm text-gray-500 mt-1">陪诊员工作台</p>
                </div>
              </>
            )}
          </Link>
        </div>

        {/* 找回密码卡片 */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="lock" className="text-3xl text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">找回密码</h1>
            <p className="text-gray-500">为保障账号安全，请联系客服重置密码</p>
          </div>

          {/* 提示信息 */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Icon name="tips" className="text-2xl text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 mb-2">温馨提示</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  陪诊员账号涉及接单和收入，为保障您的账号安全，密码重置需要人工审核。
                  请联系客服并提供您的注册手机号和身份证信息进行身份验证。
                </p>
              </div>
            </div>
          </div>

          {/* 联系方式 */}
          <div className="space-y-4">
            {/* 电话联系 */}
            <a 
              href={`tel:${contactPhone}`}
              className="flex items-center gap-4 p-5 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors group"
            >
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 
                            group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200">
                <Icon name="phone-telephone" className="text-2xl text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">客服电话</p>
                <p className="text-emerald-600 text-lg font-bold">{contactPhone}</p>
                <p className="text-sm text-gray-500">工作时间: 9:00-21:00</p>
              </div>
              <Icon name="right" className="text-2xl text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </a>

            {/* 微信联系 */}
            <div className="flex items-center gap-4 p-5 bg-[#07C160]/10 rounded-2xl">
              <div className="w-14 h-14 bg-[#07C160] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#07C160]/30">
                <Icon name="wechat" className="text-2xl text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">微信客服</p>
                <p className="text-[#07C160] text-lg font-bold">{serviceWechat}</p>
                <p className="text-sm text-gray-500">添加微信快速处理</p>
              </div>
            </div>
          </div>

          {/* 所需资料 */}
          <div className="mt-8 p-5 bg-gray-50 rounded-2xl">
            <p className="font-semibold text-gray-900 mb-3">
              <Icon name="file-text" className="mr-2 text-gray-500" />
              联系客服时请准备
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xs flex-shrink-0">1</span>
                <span>您的注册手机号码</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xs flex-shrink-0">2</span>
                <span>身份证号码后4位</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xs flex-shrink-0">3</span>
                <span>注册时使用的真实姓名</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 返回登录 */}
        <div className="mt-8 text-center">
          <Link 
            to="/escort/login" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Icon name="left" className="text-lg" />
            <span>返回登录</span>
          </Link>
        </div>

        {/* 还没有账号 */}
        <div className="mt-6 text-center">
          <p className="text-gray-500">
            还没有账号？
            <Link to="/escort/register" className="text-emerald-600 font-medium hover:text-emerald-700 ml-1">
              申请成为陪诊员
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
