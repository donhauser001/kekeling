/**
 * 微信原生能力桥接层 - 实现
 *
 * 提供两套实现：
 * 1. mockWxBridge: 预览器环境使用的 Mock 实现
 * 2. realWxBridge: 小程序环境使用的真实实现（需在小程序项目中实现）
 *
 * 通过 getWxBridge() 自动获取当前环境对应的实现
 */

import type {
  WxBridge,
  WxLoginResult,
  WxPayParams,
  WxPayResult,
  WxShareParams,
  WxChooseImageParams,
  WxChooseImageResult,
  WxUploadFileParams,
  WxUploadFileResult,
  WxGetLocationParams,
  WxLocationResult,
  WxScanCodeParams,
  WxScanCodeResult,
  WxStorage,
} from './types'

// ============================================================================
// 环境检测
// ============================================================================

/**
 * 检测是否在微信小程序环境中
 */
export function isWxEnvironment(): boolean {
  // 检测 wx 全局对象
  if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
    try {
      const info = wx.getSystemInfoSync()
      return info.platform !== undefined
    } catch {
      return false
    }
  }
  return false
}

/**
 * 检测是否在预览器/浏览器环境中
 */
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && !isWxEnvironment()
}

// ============================================================================
// Mock 存储实现（使用 localStorage）
// ============================================================================

const mockStorage: WxStorage = {
  getSync(key: string): unknown {
    if (typeof localStorage === 'undefined') return null
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  },

  setSync(key: string, data: unknown): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.warn('[mockStorage] setSync failed:', e)
    }
  },

  removeSync(key: string): void {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(key)
  },

  clearSync(): void {
    if (typeof localStorage === 'undefined') return
    localStorage.clear()
  },
}

// ============================================================================
// Mock 实现（预览器环境）
// ============================================================================

let pendingShareParams: WxShareParams | null = null

/**
 * 预览器环境的 Mock 实现
 *
 * 用于在管理后台预览器中模拟微信原生能力
 */
export const mockWxBridge: WxBridge = {
  // ==================== 登录 ====================

  async login(): Promise<WxLoginResult> {
    console.log('[mockWxBridge] 模拟微信登录')
    // 返回 mock code，实际环境需要用户授权
    return {
      code: `mock_code_${Date.now()}`,
    }
  },

  async checkSession(): Promise<boolean> {
    console.log('[mockWxBridge] 模拟检查登录态')
    // Mock 环境始终返回 true
    return true
  },

  // ==================== 支付 ====================

  async requestPayment(params: WxPayParams): Promise<WxPayResult> {
    console.log('[mockWxBridge] 模拟微信支付', params)

    // 模拟支付确认弹窗
    const confirmed = window.confirm(
      '【模拟支付】\n\n' +
      '预览器环境无法发起真实支付。\n' +
      '点击"确定"模拟支付成功，点击"取消"模拟支付失败。'
    )

    if (confirmed) {
      return { success: true }
    } else {
      return { success: false, errMsg: '用户取消支付' }
    }
  },

  // ==================== 分享 ====================

  share(params: WxShareParams): void {
    console.log('[mockWxBridge] 模拟分享', params)
    pendingShareParams = params

    // 模拟分享提示
    alert(
      `【模拟分享】\n\n` +
      `标题: ${params.title}\n` +
      `描述: ${params.desc || '无'}\n` +
      `路径: ${params.path}\n\n` +
      `预览器环境无法触发真实分享，请在小程序中测试。`
    )
  },

  getShareParams(): WxShareParams | null {
    return pendingShareParams
  },

  // ==================== 图片 ====================

  async chooseImage(params?: WxChooseImageParams): Promise<WxChooseImageResult> {
    console.log('[mockWxBridge] 模拟选择图片', params)

    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = (params?.count || 1) > 1

      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files
        if (!files || files.length === 0) {
          reject(new Error('用户取消选择'))
          return
        }

        const tempFilePaths: string[] = []
        const tempFiles: Array<{ path: string; size: number }> = []

        Array.from(files).slice(0, params?.count || 9).forEach((file) => {
          const path = URL.createObjectURL(file)
          tempFilePaths.push(path)
          tempFiles.push({ path, size: file.size })
        })

        resolve({ tempFilePaths, tempFiles })
      }

      input.oncancel = () => {
        reject(new Error('用户取消选择'))
      }

      input.click()
    })
  },

  async uploadFile(params: WxUploadFileParams): Promise<WxUploadFileResult> {
    console.log('[mockWxBridge] 模拟上传文件', params)

    // 使用 fetch 上传（预览器环境）
    const formData = new FormData()

    // 如果是 blob URL，需要先获取 blob
    if (params.filePath.startsWith('blob:')) {
      const response = await fetch(params.filePath)
      const blob = await response.blob()
      formData.append(params.name, blob, 'image.jpg')
    } else {
      // 尝试作为 base64 处理
      const response = await fetch(params.filePath)
      const blob = await response.blob()
      formData.append(params.name, blob, 'image.jpg')
    }

    // 添加额外的 form data
    if (params.formData) {
      Object.entries(params.formData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const res = await fetch(params.url, {
      method: 'POST',
      headers: params.header,
      body: formData,
    })

    return {
      data: await res.text(),
      statusCode: res.status,
    }
  },

  previewImage(urls: string[], current?: string): void {
    console.log('[mockWxBridge] 模拟预览图片', { urls, current })

    // 简单实现：在新窗口打开图片
    const targetUrl = current || urls[0]
    if (targetUrl) {
      window.open(targetUrl, '_blank')
    }
  },

  // ==================== 定位 ====================

  async getLocation(params?: WxGetLocationParams): Promise<WxLocationResult> {
    console.log('[mockWxBridge] 模拟获取定位', params)

    // 使用浏览器 Geolocation API
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        // 返回默认位置（北京）
        resolve({
          latitude: 39.9042,
          longitude: 116.4074,
          accuracy: 100,
        })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            speed: position.coords.speed ?? undefined,
          })
        },
        (error) => {
          console.warn('[mockWxBridge] 定位失败:', error)
          // 返回默认位置
          resolve({
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: 100,
          })
        },
        {
          enableHighAccuracy: params?.isHighAccuracy || false,
          timeout: 10000,
        }
      )
    })
  },

  // ==================== 扫码 ====================

  async scanCode(params?: WxScanCodeParams): Promise<WxScanCodeResult> {
    console.log('[mockWxBridge] 模拟扫码', params)

    // 预览器环境无法调用摄像头扫码，使用输入框模拟
    const result = window.prompt(
      '【模拟扫码】\n\n' +
      '预览器环境无法调用摄像头。\n' +
      '请输入模拟的扫码结果：'
    )

    if (result) {
      return {
        result,
        scanType: 'qrCode',
      }
    } else {
      throw new Error('用户取消扫码')
    }
  },

  // ==================== 存储 ====================

  storage: mockStorage,

  // ==================== 导航 ====================

  navigateTo(url: string): void {
    console.log('[mockWxBridge] 模拟 navigateTo:', url)
    // 预览器内部导航由预览器组件处理，这里仅打印日志
  },

  redirectTo(url: string): void {
    console.log('[mockWxBridge] 模拟 redirectTo:', url)
  },

  navigateBack(delta?: number): void {
    console.log('[mockWxBridge] 模拟 navigateBack:', delta)
    // 预览器内部导航由预览器组件处理
  },

  // ==================== 提示 ====================

  showToast(params: {
    title: string
    icon?: 'success' | 'error' | 'loading' | 'none'
    duration?: number
  }): void {
    console.log('[mockWxBridge] showToast:', params)
    // 简单实现：使用 alert（实际项目建议使用 toast 组件）
    // 这里不使用 alert，避免阻塞
  },

  showLoading(title: string): void {
    console.log('[mockWxBridge] showLoading:', title)
  },

  hideLoading(): void {
    console.log('[mockWxBridge] hideLoading')
  },

  async showModal(params: {
    title: string
    content: string
    showCancel?: boolean
    cancelText?: string
    confirmText?: string
  }): Promise<{ confirm: boolean; cancel: boolean }> {
    console.log('[mockWxBridge] showModal:', params)

    if (params.showCancel === false) {
      // 只有确定按钮
      alert(`${params.title}\n\n${params.content}`)
      return { confirm: true, cancel: false }
    } else {
      // 有取消和确定按钮
      const confirmed = window.confirm(`${params.title}\n\n${params.content}`)
      return { confirm: confirmed, cancel: !confirmed }
    }
  },
}

// ============================================================================
// 真实实现占位（小程序环境）
// ============================================================================

/**
 * 小程序环境的真实实现
 *
 * 注意：此实现需要在小程序项目中完善
 * 当前仅作为接口占位，实际使用时需要替换为真实的 wx.* API 调用
 */
export const realWxBridge: WxBridge = {
  // 在小程序项目中，这些方法需要调用真实的 wx.* API
  // 以下是占位实现，实际使用时会被小程序项目中的实现覆盖

  async login(): Promise<WxLoginResult> {
    return new Promise((resolve, reject) => {
      wx!.login({
        success: (res: { code: string }) => resolve({ code: res.code }),
        fail: (err: Error) => reject(err),
      })
    })
  },

  async checkSession(): Promise<boolean> {
    return new Promise((resolve) => {
      wx!.checkSession({
        success: () => resolve(true),
        fail: () => resolve(false),
      })
    })
  },

  async requestPayment(params: WxPayParams): Promise<WxPayResult> {
    return new Promise((resolve) => {
      wx!.requestPayment({
        ...params,
        success: () => resolve({ success: true }),
        fail: (err: { errMsg: string }) =>
          resolve({ success: false, errMsg: err.errMsg }),
      })
    })
  },

  share(params: WxShareParams): void {
    pendingShareParams = params
  },

  getShareParams(): WxShareParams | null {
    return pendingShareParams
  },

  async chooseImage(params?: WxChooseImageParams): Promise<WxChooseImageResult> {
    return new Promise((resolve, reject) => {
      wx!.chooseImage({
        count: params?.count || 9,
        sourceType: params?.sourceType || ['album', 'camera'],
        sizeType: params?.sizeType || ['original', 'compressed'],
        success: (res: WxChooseImageResult) => resolve(res),
        fail: (err: Error) => reject(err),
      })
    })
  },

  async uploadFile(params: WxUploadFileParams): Promise<WxUploadFileResult> {
    return new Promise((resolve, reject) => {
      wx!.uploadFile({
        url: params.url,
        filePath: params.filePath,
        name: params.name,
        header: params.header,
        formData: params.formData,
        success: (res: WxUploadFileResult) => resolve(res),
        fail: (err: Error) => reject(err),
      })
    })
  },

  previewImage(urls: string[], current?: string): void {
    wx!.previewImage({
      urls,
      current: current || urls[0],
    })
  },

  async getLocation(params?: WxGetLocationParams): Promise<WxLocationResult> {
    return new Promise((resolve, reject) => {
      wx!.getLocation({
        type: params?.type || 'gcj02',
        altitude: params?.altitude,
        isHighAccuracy: params?.isHighAccuracy,
        success: (res: WxLocationResult) => resolve(res),
        fail: (err: Error) => reject(err),
      })
    })
  },

  async scanCode(params?: WxScanCodeParams): Promise<WxScanCodeResult> {
    return new Promise((resolve, reject) => {
      wx!.scanCode({
        onlyFromCamera: params?.onlyFromCamera,
        scanType: params?.scanType,
        success: (res: WxScanCodeResult) => resolve(res),
        fail: (err: Error) => reject(err),
      })
    })
  },

  storage: {
    getSync(key: string): unknown {
      return wx!.getStorageSync(key)
    },
    setSync(key: string, data: unknown): void {
      wx!.setStorageSync(key, data)
    },
    removeSync(key: string): void {
      wx!.removeStorageSync(key)
    },
    clearSync(): void {
      wx!.clearStorageSync()
    },
  },

  navigateTo(url: string): void {
    wx!.navigateTo({ url })
  },

  redirectTo(url: string): void {
    wx!.redirectTo({ url })
  },

  navigateBack(delta?: number): void {
    wx!.navigateBack({ delta: delta || 1 })
  },

  showToast(params: {
    title: string
    icon?: 'success' | 'error' | 'loading' | 'none'
    duration?: number
  }): void {
    wx!.showToast({
      title: params.title,
      icon: params.icon || 'none',
      duration: params.duration || 1500,
    })
  },

  showLoading(title: string): void {
    wx!.showLoading({ title, mask: true })
  },

  hideLoading(): void {
    wx!.hideLoading()
  },

  async showModal(params: {
    title: string
    content: string
    showCancel?: boolean
    cancelText?: string
    confirmText?: string
  }): Promise<{ confirm: boolean; cancel: boolean }> {
    return new Promise((resolve) => {
      wx!.showModal({
        title: params.title,
        content: params.content,
        showCancel: params.showCancel ?? true,
        cancelText: params.cancelText || '取消',
        confirmText: params.confirmText || '确定',
        success: (res: { confirm: boolean; cancel: boolean }) => resolve(res),
      })
    })
  },
}

// ============================================================================
// 获取当前环境的桥接实现
// ============================================================================

/**
 * 获取当前环境对应的微信能力桥接实现
 *
 * - 小程序环境：返回 realWxBridge（调用真实 wx.* API）
 * - 预览器/浏览器环境：返回 mockWxBridge（模拟实现）
 */
export function getWxBridge(): WxBridge {
  if (isWxEnvironment()) {
    return realWxBridge
  }
  return mockWxBridge
}

// 默认导出当前环境的桥接实现
export default getWxBridge()
