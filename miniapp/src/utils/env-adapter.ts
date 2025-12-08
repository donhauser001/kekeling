/**
 * 环境适配层 (Mock Adapter)
 * 
 * H5 开发的灵魂：欺骗前端代码，让它以为自己在使用微信能力
 * 
 * 使用方式：
 * import { mockLogin, mockRequestPayment, mockGetLocation } from '@/utils/env-adapter'
 */
import Taro from '@tarojs/taro'

// 当前环境
export const isH5 = process.env.TARO_ENV === 'h5'
export const isWeapp = process.env.TARO_ENV === 'weapp'

// 开发模式标识
export const isDev = process.env.NODE_ENV === 'development'

/**
 * 🔐 模拟微信登录
 * H5: 返回模拟 code
 * 小程序: 调用真实 wx.login
 */
export const mockLogin = async (): Promise<{ code: string }> => {
  if (!isH5) {
    const res = await Taro.login()
    return { code: res.code }
  }

  console.log('🚧 [H5 Dev] 模拟微信登录...')
  
  // 模拟一个 code，后端可以识别这个特殊 code 返回测试用户
  return { code: 'h5_dev_code_' + Date.now() }
}

/**
 * 📱 模拟获取手机号
 * H5: 返回模拟手机号
 * 小程序: 需要用户点击按钮授权
 */
export const mockGetPhoneNumber = async (): Promise<{ phoneNumber: string }> => {
  if (!isH5) {
    // 小程序需要通过 button 组件获取，这里只是占位
    throw new Error('请使用 button 组件的 open-type="getPhoneNumber"')
  }

  console.log('📱 [H5 Dev] 模拟获取手机号...')
  
  // 弹窗让开发者输入测试手机号
  const phoneNumber = window.prompt('输入测试手机号:', '13800138000') || '13800138000'
  return { phoneNumber }
}

/**
 * 💰 模拟微信支付
 * H5: 弹出确认框模拟支付
 * 小程序: 调用真实 wx.requestPayment
 */
export const mockRequestPayment = async (params: {
  orderId: string
  totalAmount: number
  orderNo?: string
}): Promise<{ errMsg: string }> => {
  if (!isH5) {
    // 小程序需要先调用后端获取支付参数
    throw new Error('小程序支付请先调用后端获取预支付参数')
  }

  console.log('💰 [H5 Dev] 模拟支付...', params)

  return new Promise((resolve, reject) => {
    // 使用更友好的 UI
    Taro.showModal({
      title: '模拟支付',
      content: `订单号: ${params.orderNo || params.orderId}\n金额: ¥${params.totalAmount}\n\n点击【确定】模拟支付成功`,
      confirmText: '支付成功',
      cancelText: '支付失败',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '支付成功', icon: 'success' })
          resolve({ errMsg: 'requestPayment:ok' })
        } else {
          Taro.showToast({ title: '支付取消', icon: 'none' })
          reject({ errMsg: 'requestPayment:fail cancel' })
        }
      },
    })
  })
}

/**
 * 📍 模拟获取定位
 * H5: 返回模拟坐标 (北京协和医院)
 * 小程序: 调用真实 wx.getLocation
 */
export const mockGetLocation = async (): Promise<{
  latitude: number
  longitude: number
  errMsg: string
}> => {
  if (!isH5) {
    try {
      const res = await Taro.getLocation({ type: 'gcj02' })
      return {
        latitude: res.latitude,
        longitude: res.longitude,
        errMsg: 'getLocation:ok',
      }
    } catch (error: any) {
      // 用户拒绝授权时返回默认坐标
      console.warn('获取定位失败，使用默认坐标:', error)
      return {
        latitude: 39.91107,
        longitude: 116.41753,
        errMsg: 'getLocation:ok',
      }
    }
  }

  console.log('📍 [H5 Dev] 使用模拟坐标 (北京协和医院)')
  
  return {
    latitude: 39.91107,
    longitude: 116.41753,
    errMsg: 'getLocation:ok',
  }
}

/**
 * 🖼️ 模拟选择图片
 * H5: 使用 input[type=file]
 * 小程序: 调用 wx.chooseImage
 */
export const mockChooseImage = async (count = 1): Promise<{ tempFilePaths: string[] }> => {
  if (!isH5) {
    const res = await Taro.chooseImage({ count })
    return { tempFilePaths: res.tempFilePaths }
  }

  console.log('🖼️ [H5 Dev] 模拟选择图片...')
  
  // H5 使用 Taro 的兼容实现
  const res = await Taro.chooseImage({ count })
  return { tempFilePaths: res.tempFilePaths }
}

/**
 * 📋 模拟复制到剪贴板
 */
export const mockSetClipboardData = async (data: string): Promise<void> => {
  if (!isH5) {
    await Taro.setClipboardData({ data })
    return
  }

  try {
    await navigator.clipboard.writeText(data)
    Taro.showToast({ title: '复制成功', icon: 'success' })
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = data
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    Taro.showToast({ title: '复制成功', icon: 'success' })
  }
}

/**
 * 📞 模拟拨打电话
 */
export const mockMakePhoneCall = async (phoneNumber: string): Promise<void> => {
  if (!isH5) {
    await Taro.makePhoneCall({ phoneNumber })
    return
  }

  console.log('📞 [H5 Dev] 模拟拨打电话:', phoneNumber)
  
  // H5 使用 tel: 协议
  window.location.href = `tel:${phoneNumber}`
}

/**
 * 🗺️ 模拟打开地图导航
 */
export const mockOpenLocation = async (params: {
  latitude: number
  longitude: number
  name?: string
  address?: string
}): Promise<void> => {
  if (!isH5) {
    await Taro.openLocation(params)
    return
  }

  console.log('🗺️ [H5 Dev] 模拟打开地图:', params)
  
  // H5 使用高德地图 Web 端
  const { latitude, longitude, name = '', address = '' } = params
  const url = `https://uri.amap.com/marker?position=${longitude},${latitude}&name=${encodeURIComponent(name)}&address=${encodeURIComponent(address)}`
  window.open(url, '_blank')
}

/**
 * 🎯 调试工具：进入陪诊员工作台
 * 在搜索框输入 *#06# 触发
 */
export const checkDebugCommand = (input: string): boolean => {
  if (input === '*#06#') {
    console.log('🔧 [Debug] 进入陪诊员工作台')
    Taro.navigateTo({ url: '/pages/workbench/index' })
    return true
  }
  return false
}

/**
 * 🧪 H5 开发时的 Console 增强
 */
export const devLog = (tag: string, ...args: any[]) => {
  if (isDev) {
    console.log(`%c[${tag}]`, 'color: #1890ff; font-weight: bold;', ...args)
  }
}

export default {
  isH5,
  isWeapp,
  isDev,
  mockLogin,
  mockGetPhoneNumber,
  mockRequestPayment,
  mockGetLocation,
  mockChooseImage,
  mockSetClipboardData,
  mockMakePhoneCall,
  mockOpenLocation,
  checkDebugCommand,
  devLog,
}

