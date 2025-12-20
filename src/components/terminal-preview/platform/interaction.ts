/**
 * 小程序交互工具
 * 封装微信小程序的交互 API，提供跨平台兼容
 */

import { isWxEnvironment } from './env'

/**
 * 获取微信小程序 API
 */
const getWx = () => {
  if (typeof wx !== 'undefined') return wx
  if (typeof Taro !== 'undefined') return Taro
  return null
}

// ============================================================================
// 拨打电话
// ============================================================================

/**
 * 拨打电话
 * @param phoneNumber 电话号码
 */
export const makePhoneCall = async (phoneNumber: string): Promise<boolean> => {
  if (!phoneNumber) {
    console.warn('[makePhoneCall] 电话号码为空')
    return false
  }

  const wx = getWx()
  
  if (isWxEnvironment() && wx?.makePhoneCall) {
    try {
      await wx.makePhoneCall({ phoneNumber })
      return true
    } catch (err: any) {
      // 用户取消拨打不算失败
      if (err?.errMsg?.includes('cancel')) {
        return false
      }
      console.error('[makePhoneCall] 拨打失败:', err)
      return false
    }
  }
  
  // Web 环境降级处理
  window.location.href = `tel:${phoneNumber}`
  return true
}

// ============================================================================
// 打开地图导航
// ============================================================================

interface NavigateToLocationOptions {
  latitude: number
  longitude: number
  name?: string
  address?: string
}

/**
 * 打开地图导航
 * @param options 位置信息
 */
export const navigateToLocation = async (options: NavigateToLocationOptions): Promise<boolean> => {
  const { latitude, longitude, name, address } = options
  const wx = getWx()

  if (isWxEnvironment() && wx?.openLocation) {
    try {
      await wx.openLocation({
        latitude,
        longitude,
        name: name || '',
        address: address || '',
        scale: 18,
      })
      return true
    } catch (err) {
      console.error('[navigateToLocation] 打开地图失败:', err)
      return false
    }
  }

  // Web 环境：打开高德地图网页版
  const url = `https://uri.amap.com/marker?position=${longitude},${latitude}&name=${encodeURIComponent(name || '')}&coordinate=gaode&callnative=1`
  window.open(url, '_blank')
  return true
}

/**
 * 根据地址搜索并导航（无经纬度时使用）
 * @param address 地址字符串
 * @param name 地点名称
 */
export const navigateByAddress = async (address: string, name?: string): Promise<boolean> => {
  const wx = getWx()

  if (isWxEnvironment() && wx?.chooseLocation) {
    // 小程序中可以搜索地点
    try {
      // 使用地图搜索
      const searchUrl = `plugin://chooseLocation/index?key=YOUR_KEY&referer=kekeling&location=${encodeURIComponent(address)}`
      // 降级：打开地图搜索
      await showToast('请在地图中搜索：' + (name || address), 'none', 2000)
      return false
    } catch (err) {
      console.error('[navigateByAddress] 导航失败:', err)
      return false
    }
  }

  // Web 环境：打开高德地图搜索
  const searchName = name || address
  const url = `https://uri.amap.com/search?keyword=${encodeURIComponent(searchName)}&callnative=1`
  window.open(url, '_blank')
  return true
}

// ============================================================================
// 确认弹窗
// ============================================================================

interface ConfirmModalOptions {
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  showCancel?: boolean
}

/**
 * 显示确认弹窗
 * @param options 弹窗选项
 * @returns 用户是否点击确认
 */
export const showConfirmModal = async (options: ConfirmModalOptions): Promise<boolean> => {
  const {
    title = '提示',
    content,
    confirmText = '确定',
    cancelText = '取消',
    confirmColor = '#1890ff',
    showCancel = true,
  } = options

  const wx = getWx()

  if (isWxEnvironment() && wx?.showModal) {
    try {
      const res = await wx.showModal({
        title,
        content,
        confirmText,
        cancelText,
        confirmColor,
        showCancel,
      })
      return res.confirm
    } catch (err) {
      console.error('[showConfirmModal] 显示弹窗失败:', err)
      return false
    }
  }

  // Web 环境使用原生 confirm
  return window.confirm(content)
}

// ============================================================================
// Toast 提示
// ============================================================================

type ToastIcon = 'success' | 'error' | 'loading' | 'none'

/**
 * 显示 Toast 提示
 * @param title 提示文字
 * @param icon 图标类型
 * @param duration 持续时间(ms)
 */
export const showToast = async (
  title: string,
  icon: ToastIcon = 'none',
  duration: number = 2000
): Promise<void> => {
  const wx = getWx()

  if (isWxEnvironment() && wx?.showToast) {
    try {
      await wx.showToast({
        title,
        icon,
        duration,
      })
    } catch (err) {
      console.error('[showToast] 显示失败:', err)
    }
    return
  }

  // Web 环境降级：使用 alert 或自定义 toast
  // 这里简单使用 console + 可选的 DOM toast
  console.log(`[Toast] ${icon}: ${title}`)
  
  // 简单的 DOM toast 实现
  if (typeof document !== 'undefined') {
    const toast = document.createElement('div')
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 12px 24px;
      background: rgba(0,0,0,0.75);
      color: #fff;
      border-radius: 8px;
      font-size: 14px;
      z-index: 99999;
      pointer-events: none;
    `
    toast.textContent = title
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), duration)
  }
}

/**
 * 隐藏 Toast
 */
export const hideToast = async (): Promise<void> => {
  const wx = getWx()
  if (isWxEnvironment() && wx?.hideToast) {
    await wx.hideToast()
  }
}

/**
 * 显示加载中
 * @param title 提示文字
 */
export const showLoading = async (title: string = '加载中...'): Promise<void> => {
  const wx = getWx()
  if (isWxEnvironment() && wx?.showLoading) {
    await wx.showLoading({ title, mask: true })
  }
}

/**
 * 隐藏加载中
 */
export const hideLoading = async (): Promise<void> => {
  const wx = getWx()
  if (isWxEnvironment() && wx?.hideLoading) {
    await wx.hideLoading()
  }
}

