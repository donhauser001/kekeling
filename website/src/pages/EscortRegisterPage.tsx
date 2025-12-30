/**
 * 陪诊员注册/申请页面
 * 多步骤表单：手机验证 -> 基本信息 -> 提交申请
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useSite } from '@/context/SiteContext'
import { escortApplyApi } from '@/lib/api'

// 图标组件
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <i className={`iconfont icon-${name} ${className}`} />
}

// 步骤定义
const steps = [
  { key: 'phone', title: '手机验证', icon: 'phone-telephone' },
  { key: 'info', title: '基本信息', icon: 'user' },
  { key: 'complete', title: '提交申请', icon: 'check-correct' },
]

export function EscortRegisterPage() {
  const navigate = useNavigate()
  const { getSetting } = useSite()
  
  const siteName = getSetting('site_name', '科科灵陪诊')
  const siteLogo = getSetting('site_logo', '')
  const contactPhone = getSetting('contact_phone', '400-123-4567')

  // 当前步骤
  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [, setPhoneVerified] = useState(false)
  const [phoneCheckStatus, setPhoneCheckStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const [phoneCheckMessage, setPhoneCheckMessage] = useState('')
  const [idCardCheckStatus, setIdCardCheckStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const [idCardCheckMessage, setIdCardCheckMessage] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<{ level: number; text: string; color: string }>({ level: 0, text: '', color: '' })

  // 表单数据
  const [formData, setFormData] = useState({
    phone: '',
    code: '',
    name: '',
    idCard: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    agree: false,
  })

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 检查手机号是否可用
  const checkPhoneAvailable = async (phone: string) => {
    if (!/^1\d{10}$/.test(phone)) {
      setPhoneCheckStatus('idle')
      setPhoneCheckMessage('')
      return
    }
    
    setPhoneCheckStatus('checking')
    setPhoneCheckMessage('')
    
    try {
      const result = await escortApplyApi.checkPhone(phone)
      if (result.available) {
        setPhoneCheckStatus('available')
        setPhoneCheckMessage('手机号可用')
      } else {
        setPhoneCheckStatus('unavailable')
        setPhoneCheckMessage(result.message)
      }
    } catch {
      setPhoneCheckStatus('idle')
      setPhoneCheckMessage('')
    }
  }

  // 检查身份证号是否可用
  const checkIdCardAvailable = async (idCard: string) => {
    if (!/^\d{17}[\dXx]$/.test(idCard)) {
      setIdCardCheckStatus('idle')
      setIdCardCheckMessage('')
      return
    }
    
    setIdCardCheckStatus('checking')
    setIdCardCheckMessage('')
    
    try {
      const result = await escortApplyApi.checkIdCard(idCard)
      if (result.available) {
        setIdCardCheckStatus('available')
        setIdCardCheckMessage('身份证号可用')
      } else {
        setIdCardCheckStatus('unavailable')
        setIdCardCheckMessage(result.message)
      }
    } catch {
      setIdCardCheckStatus('idle')
      setIdCardCheckMessage('')
    }
  }

  // 检测密码强度
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength({ level: 0, text: '', color: '' })
      return
    }

    let score = 0
    
    // 长度检查
    if (password.length >= 6) score += 1
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    
    // 包含数字
    if (/\d/.test(password)) score += 1
    
    // 包含小写字母
    if (/[a-z]/.test(password)) score += 1
    
    // 包含大写字母
    if (/[A-Z]/.test(password)) score += 1
    
    // 包含特殊字符
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

    // 映射为强度等级
    let level: number
    let text: string
    let color: string

    if (score <= 2) {
      level = 1
      text = '弱'
      color = 'bg-red-500'
    } else if (score <= 4) {
      level = 2
      text = '中'
      color = 'bg-yellow-500'
    } else {
      level = 3
      text = '强'
      color = 'bg-emerald-500'
    }

    setPasswordStrength({ level, text, color })
  }

  // 发送验证码
  const handleSendCode = async () => {
    if (!formData.phone || !/^1\d{10}$/.test(formData.phone)) {
      setError('请输入正确的手机号码')
      return
    }
    
    // 先检查手机号是否可用
    if (phoneCheckStatus !== 'available') {
      // 如果还没检查，先检查
      if (phoneCheckStatus === 'idle' || phoneCheckStatus === 'checking') {
        try {
          const result = await escortApplyApi.checkPhone(formData.phone)
          if (!result.available) {
            setPhoneCheckStatus('unavailable')
            setPhoneCheckMessage(result.message)
            setError(result.message)
            return
          }
          setPhoneCheckStatus('available')
        } catch {
          // 检查失败，继续发送
        }
      } else if (phoneCheckStatus === 'unavailable') {
        setError(phoneCheckMessage || '该手机号已被注册')
        return
      }
    }
    
    setSendingCode(true)
    setError('')
    
    try {
      const result = await escortApplyApi.sendSmsCode(formData.phone)
      // 开发模式下可能返回验证码
      if (result.code) {
        console.log('开发模式验证码:', result.code)
      }
      setCountdown(60)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送验证码失败'
      setError(errorMessage)
    } finally {
      setSendingCode(false)
    }
  }

  // 验证手机号
  const handleVerifyPhone = async () => {
    if (!formData.phone || !/^1\d{10}$/.test(formData.phone)) {
      setError('请输入正确的手机号码')
      return
    }
    if (!formData.code || !/^\d{6}$/.test(formData.code)) {
      setError('请输入6位验证码')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      await escortApplyApi.verifySmsCode(formData.phone, formData.code)
      setPhoneVerified(true)
      setCurrentStep(1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '验证码错误'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 提交申请
  const handleSubmit = async () => {
    // 表单验证
    if (!formData.name) {
      setError('请输入真实姓名')
      return
    }
    if (!formData.idCard || !/^\d{17}[\dXx]$/.test(formData.idCard)) {
      setError('请输入正确的身份证号码')
      return
    }
    // 身份证号验证
    if (idCardCheckStatus === 'unavailable') {
      setError(idCardCheckMessage || '该身份证号已被注册')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setError('密码长度不能少于6位')
      return
    }
    // 密码强度验证
    if (passwordStrength.level < 2) {
      setError('密码强度太弱，请使用包含数字和字母的组合')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (!formData.agree) {
      setError('请阅读并同意服务协议')
      return
    }

    // 如果身份证还没检查，先检查
    if (idCardCheckStatus !== 'available') {
      try {
        const result = await escortApplyApi.checkIdCard(formData.idCard)
        if (!result.available) {
          setIdCardCheckStatus('unavailable')
          setIdCardCheckMessage(result.message)
          setError(result.message)
          return
        }
        setIdCardCheckStatus('available')
      } catch {
        // 检查失败，继续提交
      }
    }
    
    setLoading(true)
    setError('')
    
    try {
      // 调用申请 API
      await escortApplyApi.submitApplication({
        name: formData.name,
        phone: formData.phone,
        idCard: formData.idCard,
        gender: 'unknown', // 可以后续在表单中添加性别选择
        inviteCode: formData.inviteCode || undefined,
      })
      setCurrentStep(2)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '提交申请失败'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 渲染步骤指示器
  const renderSteps = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-lg
              transition-all duration-300
              ${index < currentStep 
                ? 'bg-emerald-500 text-white' 
                : index === currentStep 
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' 
                  : 'bg-gray-100 text-gray-400'
              }
            `}>
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <Icon name={step.icon} />
              )}
            </div>
            <span className={`mt-2 text-xs font-medium ${
              index <= currentStep ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${
              index < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  // 步骤1：手机验证
  const renderPhoneStep = () => (
    <div className="space-y-5">
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
            placeholder="请输入手机号码"
            value={formData.phone}
            onChange={(e) => {
              const newPhone = e.target.value.replace(/\D/g, '').slice(0, 11)
              setFormData({ ...formData, phone: newPhone })
              setError('')
              // 当输入完整手机号时自动检查
              if (newPhone.length === 11) {
                checkPhoneAvailable(newPhone)
              } else {
                setPhoneCheckStatus('idle')
                setPhoneCheckMessage('')
              }
            }}
            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl
                     focus:bg-white focus:ring-2 transition-all outline-none text-base
                     ${phoneCheckStatus === 'unavailable' 
                       ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                       : phoneCheckStatus === 'available'
                         ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                         : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                     }`}
            maxLength={11}
          />
          {/* 检查状态图标 */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {phoneCheckStatus === 'checking' && (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin block" />
            )}
            {phoneCheckStatus === 'available' && (
              <Check className="w-5 h-5 text-emerald-500" />
            )}
            {phoneCheckStatus === 'unavailable' && (
              <Icon name="close" className="text-xl text-red-500" />
            )}
          </div>
        </div>
        {/* 检查结果提示 */}
        {phoneCheckMessage && (
          <p className={`mt-2 text-sm ${phoneCheckStatus === 'available' ? 'text-emerald-600' : 'text-red-600'}`}>
            {phoneCheckMessage}
          </p>
        )}
      </div>

      {/* 验证码输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          短信验证码
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Icon name="shield" className="text-xl text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="请输入验证码"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value.replace(/\D/g, '').slice(0, 6) })
                setError('')
              }}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl
                       focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                       transition-all outline-none text-base"
              maxLength={6}
            />
          </div>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sendingCode || countdown > 0}
            className={`px-6 py-4 rounded-2xl font-medium transition-all whitespace-nowrap ${
              countdown > 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
          </button>
        </div>
      </div>

      {/* 下一步按钮 */}
      <button
        type="button"
        onClick={handleVerifyPhone}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white 
                 font-semibold rounded-2xl shadow-lg shadow-emerald-200
                 hover:shadow-xl hover:shadow-emerald-300 hover:from-emerald-600 hover:to-teal-700
                 disabled:opacity-70 disabled:cursor-not-allowed
                 transition-all duration-300 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            验证中...
          </>
        ) : (
          <>
            <span>验证并继续</span>
            <Icon name="right" className="text-lg" />
          </>
        )}
      </button>
    </div>
  )

  // 步骤2：基本信息
  const renderInfoStep = () => (
    <div className="space-y-5">
      {/* 已验证手机号显示 */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm text-emerald-700 font-medium">手机号已验证</p>
          <p className="text-emerald-600">{formData.phone}</p>
        </div>
      </div>

      {/* 真实姓名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          真实姓名
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Icon name="user" className="text-xl text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="请输入您的真实姓名"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              setError('')
            }}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl
                     focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                     transition-all outline-none text-base"
          />
        </div>
      </div>

      {/* 身份证号 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          身份证号码
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Icon name="card" className="text-xl text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="请输入18位身份证号码"
            value={formData.idCard}
            onChange={(e) => {
              const newIdCard = e.target.value.toUpperCase().slice(0, 18)
              setFormData({ ...formData, idCard: newIdCard })
              setError('')
              // 当输入完整身份证号时自动检查
              if (newIdCard.length === 18 && /^\d{17}[\dXx]$/.test(newIdCard)) {
                checkIdCardAvailable(newIdCard)
              } else {
                setIdCardCheckStatus('idle')
                setIdCardCheckMessage('')
              }
            }}
            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl
                     focus:bg-white focus:ring-2 transition-all outline-none text-base
                     ${idCardCheckStatus === 'unavailable' 
                       ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                       : idCardCheckStatus === 'available'
                         ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                         : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                     }`}
            maxLength={18}
          />
          {/* 检查状态图标 */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {idCardCheckStatus === 'checking' && (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin block" />
            )}
            {idCardCheckStatus === 'available' && (
              <Check className="w-5 h-5 text-emerald-500" />
            )}
            {idCardCheckStatus === 'unavailable' && (
              <Icon name="close" className="text-xl text-red-500" />
            )}
          </div>
        </div>
        {/* 检查结果提示 */}
        {idCardCheckMessage && (
          <p className={`mt-2 text-sm ${idCardCheckStatus === 'available' ? 'text-emerald-600' : 'text-red-600'}`}>
            {idCardCheckMessage}
          </p>
        )}
      </div>

      {/* 设置密码 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          设置密码
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Icon name="lock" className="text-xl text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="请设置6-20位登录密码"
            value={formData.password}
            onChange={(e) => {
              const newPassword = e.target.value
              setFormData({ ...formData, password: newPassword })
              setError('')
              checkPasswordStrength(newPassword)
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
        {/* 密码强度指示器 */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full transition-all duration-300 rounded-full ${passwordStrength.level >= 1 ? passwordStrength.color : 'bg-gray-200'}`} style={{ width: '33.33%' }} />
                <div className={`h-full transition-all duration-300 rounded-full ${passwordStrength.level >= 2 ? passwordStrength.color : 'bg-gray-200'}`} style={{ width: '33.33%' }} />
                <div className={`h-full transition-all duration-300 rounded-full ${passwordStrength.level >= 3 ? passwordStrength.color : 'bg-gray-200'}`} style={{ width: '33.33%' }} />
              </div>
              <span className={`text-xs font-medium ${
                passwordStrength.level === 1 ? 'text-red-600' : 
                passwordStrength.level === 2 ? 'text-yellow-600' : 
                passwordStrength.level === 3 ? 'text-emerald-600' : 'text-gray-400'
              }`}>
                {passwordStrength.text}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              建议使用8位以上，包含数字、字母和特殊字符的组合
            </p>
          </div>
        )}
      </div>

      {/* 确认密码 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          确认密码
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Icon name="lock" className="text-xl text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="请再次输入密码"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value })
              setError('')
            }}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl
                     focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                     transition-all outline-none text-base"
          />
        </div>
      </div>

      {/* 邀请码（选填） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          邀请码 <span className="text-gray-400 font-normal">(选填)</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Icon name="gift" className="text-xl text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="如有邀请码请输入"
            value={formData.inviteCode}
            onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl
                     focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                     transition-all outline-none text-base"
          />
        </div>
      </div>

      {/* 服务协议 */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="mt-1">
          <input
            type="checkbox"
            checked={formData.agree}
            onChange={(e) => {
              setFormData({ ...formData, agree: e.target.checked })
              setError('')
            }}
            className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <span className="text-sm text-gray-600">
          我已阅读并同意
          <Link to="/terms" className="text-emerald-600 hover:underline mx-0.5">《陪诊员服务协议》</Link>
          和
          <Link to="/privacy" className="text-emerald-600 hover:underline mx-0.5">《隐私政策》</Link>
        </span>
      </label>

      {/* 按钮组 */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            setCurrentStep(0)
            setError('')
          }}
          className="flex-1 py-4 bg-gray-100 text-gray-700 font-medium rounded-2xl
                   hover:bg-gray-200 transition-colors"
        >
          上一步
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-[2] py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white 
                   font-semibold rounded-2xl shadow-lg shadow-emerald-200
                   hover:shadow-xl hover:shadow-emerald-300 hover:from-emerald-600 hover:to-teal-700
                   disabled:opacity-70 disabled:cursor-not-allowed
                   transition-all duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <span>提交申请</span>
              <Icon name="check-correct" className="text-lg" />
            </>
          )}
        </button>
      </div>
    </div>
  )

  // 步骤3：申请成功
  const renderCompleteStep = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full 
                    flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
        <Check className="w-10 h-10 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">申请已提交</h3>
      <p className="text-gray-500 mb-8">
        我们会在 1-3 个工作日内审核您的申请，<br />
        审核结果将通过短信通知您。
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <Icon name="tips" className="text-2xl text-amber-600 flex-shrink-0" />
          <div className="text-left">
            <p className="font-semibold text-amber-800 mb-1">温馨提示</p>
            <p className="text-sm text-amber-700">
              审核通过后，您可以使用手机号和设置的密码登录陪诊员工作台，开始接单赚钱。
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => navigate('/escort/login')}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white 
                   font-semibold rounded-2xl shadow-lg shadow-emerald-200
                   hover:shadow-xl hover:shadow-emerald-300 transition-all"
        >
          前往登录
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-gray-100 text-gray-700 font-medium rounded-2xl
                   hover:bg-gray-200 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-50">
      {/* 顶部装饰 */}
      <div className="absolute inset-x-0 top-0 h-64 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-emerald-100/60 rounded-full blur-[100px]" />
        <div className="absolute -top-32 -left-32 w-[300px] h-[300px] bg-teal-100/40 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 pt-8 pb-20">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-10 max-w-[160px] w-auto object-contain" />
            ) : (
              <>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Icon name="peoples" className="text-2xl text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">{siteName}</span>
              </>
            )}
          </Link>
        </div>

        {/* 申请卡片 */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">申请成为陪诊员</h1>
            <p className="text-gray-500">加入科科灵，开启健康服务事业</p>
          </div>

          {/* 步骤指示器 */}
          {renderSteps()}

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 flex items-center gap-2">
              <Icon name="tips" className="text-lg flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 步骤内容 */}
          {currentStep === 0 && renderPhoneStep()}
          {currentStep === 1 && renderInfoStep()}
          {currentStep === 2 && renderCompleteStep()}
        </div>

        {/* 已有账号 */}
        {currentStep < 2 && (
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              已有陪诊员账号？
              <Link to="/escort/login" className="text-emerald-600 font-medium hover:text-emerald-700 ml-1">
                立即登录
              </Link>
            </p>
          </div>
        )}

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
