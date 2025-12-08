import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import Icon from '@/components/Icon'
import './login.scss'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleWechatLogin = async () => {
    setLoading(true)
    try {
      // 获取微信 code
      const { code } = await Taro.login()
      console.log('Login code:', code)

      // TODO: 调用后端登录接口
      // const res = await callCloudFunction('login', { code })
      
      // 模拟登录成功
      setTimeout(() => {
        Taro.setStorageSync('token', 'mock_token_' + Date.now())
        Taro.showToast({ title: '登录成功', icon: 'success' })
        
        // 返回上一页或首页
        const pages = Taro.getCurrentPages()
        if (pages.length > 1) {
          Taro.navigateBack()
        } else {
          Taro.switchTab({ url: '/pages/index/index' })
        }
      }, 1000)
      
    } catch (error) {
      console.error('Login error:', error)
      Taro.showToast({ title: '登录失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleGetPhoneNumber = async (e: any) => {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      console.log('用户拒绝授权手机号')
      return
    }

    setLoading(true)
    try {
      const { code } = e.detail
      console.log('Phone code:', code)

      // TODO: 调用后端绑定手机号接口
      // await callCloudFunction('bindPhone', { code })

      Taro.showToast({ title: '绑定成功', icon: 'success' })
    } catch (error) {
      console.error('Bindphone error:', error)
      Taro.showToast({ title: '绑定失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='login-page'>
      <View className='login-header'>
        <View className='logo'>
          <Icon name='hospital' size={48} color='#1890ff' />
        </View>
        <Text className='app-name'>科科灵陪诊</Text>
        <Text className='app-slogan'>专业陪诊服务，让就医更轻松</Text>
      </View>

      <View className='login-content'>
        <View className='features'>
          <View className='feature-item'>
            <Icon name='check-circle' size={18} color='#52c41a' />
            <Text>专业陪诊员，全程贴心服务</Text>
          </View>
          <View className='feature-item'>
            <Icon name='check-circle' size={18} color='#52c41a' />
            <Text>覆盖上海各大医院</Text>
          </View>
          <View className='feature-item'>
            <Icon name='check-circle' size={18} color='#52c41a' />
            <Text>在线预约，便捷高效</Text>
          </View>
        </View>
      </View>

      <View className='login-actions'>
        <Button
          className='wechat-btn'
          loading={loading}
          onClick={handleWechatLogin}
        >
          <Icon name='log-in' size={20} color='#fff' />
          <Text>微信一键登录</Text>
        </Button>

        <Button
          className='phone-btn'
          openType='getPhoneNumber'
          onGetPhoneNumber={handleGetPhoneNumber}
          loading={loading}
        >
          <Icon name='phone' size={20} color='#1890ff' />
          <Text>手机号快捷登录</Text>
        </Button>

        <Text className='agreement'>
          登录即表示您同意
          <Text className='link'>《用户服务协议》</Text>
          和
          <Text className='link'>《隐私政策》</Text>
        </Text>
      </View>
    </View>
  )
}
