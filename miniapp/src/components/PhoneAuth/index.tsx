/**
 * 跨端手机号授权组件
 * 
 * H5 模式: 显示输入框 + 验证码
 * 小程序模式: 显示微信授权按钮
 */
import { useState } from 'react'
import { View, Button, Input, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { isH5, isDev } from '@/utils/env-adapter'
import './index.scss'

interface PhoneAuthProps {
  /** 获取到手机号后的回调 */
  onGetPhone: (phone: string, code?: string) => void
  /** 按钮文案 */
  buttonText?: string
  /** 样式类名 */
  className?: string
}

export const PhoneAuth = ({ 
  onGetPhone, 
  buttonText = '授权手机号',
  className = ''
}: PhoneAuthProps) => {
  const [inputPhone, setInputPhone] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  // H5 模式: 模拟发送验证码
  const handleSendCode = async () => {
    if (!inputPhone || inputPhone.length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    // 模拟发送验证码
    if (isDev) {
      console.log('📱 [H5 Dev] 发送验证码到:', inputPhone)
      Taro.showToast({ title: '验证码已发送 (模拟)', icon: 'success' })
    }

    // 倒计时
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // H5 模式: 确认手机号
  const handleConfirmH5 = () => {
    if (!inputPhone || inputPhone.length !== 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    // 开发模式下，验证码默认 123456
    if (isDev && (!verifyCode || verifyCode === '123456')) {
      console.log('📱 [H5 Dev] 手机号授权成功:', inputPhone)
      onGetPhone(inputPhone)
      return
    }

    if (!verifyCode || verifyCode.length !== 6) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }

    // 正式环境需要调用后端验证
    onGetPhone(inputPhone, verifyCode)
  }

  // 小程序模式: 微信授权回调
  const handleWechatAuth = (e: any) => {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 有 code，调用后端解密
      if (e.detail.code) {
        onGetPhone('', e.detail.code)
      }
    } else {
      Taro.showToast({ title: '授权已取消', icon: 'none' })
    }
  }

  // H5 模式
  if (isH5) {
    return (
      <View className={`phone-auth phone-auth--h5 ${className}`}>
        <View className="phone-auth__input-group">
          <Input 
            className="phone-auth__input"
            type="number"
            maxlength={11}
            placeholder="请输入手机号" 
            value={inputPhone}
            onInput={(e) => setInputPhone(e.detail.value)}
          />
        </View>
        
        <View className="phone-auth__input-group phone-auth__input-group--code">
          <Input 
            className="phone-auth__input phone-auth__input--code"
            type="number"
            maxlength={6}
            placeholder="验证码 (开发模式输入123456)" 
            value={verifyCode}
            onInput={(e) => setVerifyCode(e.detail.value)}
          />
          <Button 
            className="phone-auth__send-btn"
            disabled={countdown > 0}
            onClick={handleSendCode}
          >
            {countdown > 0 ? `${countdown}s` : '发送验证码'}
          </Button>
        </View>

        <Button 
          className="phone-auth__confirm-btn"
          onClick={handleConfirmH5}
        >
          {buttonText}
        </Button>

        {isDev && (
          <Text className="phone-auth__tip">
            💡 开发模式：验证码输入 123456 即可
          </Text>
        )}
      </View>
    )
  }

  // 小程序模式
  return (
    <View className={`phone-auth phone-auth--weapp ${className}`}>
      <Button 
        className="phone-auth__wechat-btn"
        openType="getPhoneNumber"
        onGetPhoneNumber={handleWechatAuth}
      >
        <Text className="phone-auth__wechat-icon">📱</Text>
        <Text>{buttonText}</Text>
      </Button>
    </View>
  )
}

export default PhoneAuth

