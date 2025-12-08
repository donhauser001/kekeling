import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './login.scss'

export default function Login() {
  const handleWechatLogin = () => {
    Taro.login({
      success: (res) => {
        if (res.code) {
          console.log('微信登录 code:', res.code)
          // TODO: 发送 code 到后端换取 token
          Taro.showToast({ title: '登录成功', icon: 'success' })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
        }
      },
      fail: () => {
        Taro.showToast({ title: '登录失败', icon: 'none' })
      }
    })
  }

  const handleGetPhoneNumber = (e: any) => {
    if (e.detail.code) {
      console.log('手机号 code:', e.detail.code)
      // TODO: 发送 code 到后端获取手机号
      Taro.showToast({ title: '绑定成功', icon: 'success' })
    } else {
      console.log('用户拒绝授权')
    }
  }

  return (
    <View className='login-page'>
      <View className='login-header'>
        <View className='logo'>🏥</View>
        <Text className='app-name'>可客灵陪诊</Text>
        <Text className='app-desc'>专业陪诊服务平台</Text>
      </View>

      <View className='login-content'>
        <Button 
          className='login-btn wechat-btn' 
          openType='getPhoneNumber'
          onGetPhoneNumber={handleGetPhoneNumber}
        >
          微信一键登录
        </Button>
        
        <View className='agreement'>
          <Text className='agreement-text'>
            登录即表示同意 
            <Text className='link'>《用户协议》</Text>
            和
            <Text className='link'>《隐私政策》</Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

