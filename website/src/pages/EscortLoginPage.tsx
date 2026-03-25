/**
 * 陪诊员登录页面
 * 支持密码登录
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useSite } from '@/context/SiteContext'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

export function EscortLoginPage() {
  const navigate = useNavigate()
  const { getSetting } = useSite()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  const siteName = getSetting('site_name', '科科灵陪诊')
  const siteLogo = getSetting('site_logo', '')
  const contactPhone = getSetting('contact_phone', '400-123-4567')
  
  // 表单数据
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  })

  // 提交登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.phone || !/^1\d{10}$/.test(formData.phone)) {
      setError('请输入正确的手机号码')
      return
    }
    if (!formData.password) {
      setError('请输入登录密码')
      return
    }
    if (!agreedToTerms) {
      setError('请先勾选并同意陪诊员服务协议')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // TODO: 调用登录 API
      await new Promise(resolve => setTimeout(resolve, 1500))
      navigate('/escort/profile')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败，请检查手机号和密码'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

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

        {/* 登录卡片 */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">陪诊员登录</h1>
            <p className="text-gray-500">登录后即可接单、管理订单</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 flex items-center gap-2">
              <Icon name="tips" className="text-lg flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 手机号输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号码
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Icon name="phone-telephone" className="text-xl text-gray-400" />
                </div>
                <input
                  type="tel"
                  placeholder="请输入注册手机号"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })
                    setError('')
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl
                           focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           transition-all outline-none text-base"
                  maxLength={11}
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                登录密码
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Icon name="lock" className="text-xl text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入登录密码"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setError('')
                  }}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl
                           focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                           transition-all outline-none text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 忘记密码 */}
            <div className="flex justify-end">
              <Link to="/escort/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">
                忘记密码？
              </Link>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white 
                       font-semibold rounded-2xl shadow-lg shadow-emerald-200
                       hover:shadow-xl hover:shadow-emerald-300 hover:from-emerald-600 hover:to-teal-700
                       disabled:opacity-70 disabled:cursor-not-allowed
                       transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </>
              ) : (
                <>
                  <span>立即登录</span>
                  <Icon name="right" className="text-lg" />
                </>
              )}
            </button>
          </form>

          <label className="mt-4 flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked)
                setError('')
              }}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-500">
              勾选即表示同意
              <Link to="/escort-terms" className="text-emerald-600 hover:underline mx-1">
                《陪诊员服务协议》
              </Link>
            </span>
          </label>

          {/* 分隔线 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-400">其他登录方式</span>
            </div>
          </div>

          {/* 微信登录 */}
          <button className="w-full py-4 bg-[#07C160]/10 text-[#07C160] font-medium rounded-2xl
                           hover:bg-[#07C160]/20 transition-colors flex items-center justify-center gap-2">
            <Icon name="wechat" className="text-2xl" />
            <span>微信登录</span>
          </button>

          {/* 注册入口 */}
          <p className="text-center mt-6 text-gray-600">
            还没有陪诊员账号？
            <Link to="/escort/register" className="text-emerald-600 font-medium hover:text-emerald-700 ml-1">
              立即申请
            </Link>
          </p>

        </div>

        {/* 用户入口 */}
        <div className="mt-6 text-center">
          <p className="text-gray-500">
            需要陪诊服务？
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium ml-1">
              用户登录
            </Link>
          </p>
        </div>

        {/* 联系客服 */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            遇到问题？
            <a href={`tel:${contactPhone}`} className="text-emerald-600 hover:text-emerald-700 font-medium ml-1">
              联系客服 {contactPhone}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
