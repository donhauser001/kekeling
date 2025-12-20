/**
 * 微信小程序全局类型声明
 *
 * 此文件仅声明 terminal-preview 组件中使用的 wx.* API
 * 在 Web 环境中 wx 不存在，但代码中需要通过 typeof 检测
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const wx:
  | {
    getSystemInfoSync(): { platform?: string }
    request(options: {
      url: string
      method?: string
      data?: unknown
      header?: Record<string, string>
      timeout?: number
      success?: (res: { statusCode: number; data: unknown; header: Record<string, string> }) => void
      fail?: (err: { errMsg: string }) => void
    }): Promise<{ data: { data?: { phone?: string } }; statusCode: number }>
    login(options: {
      success?: (res: { code: string }) => void
      fail?: (err: any) => void
    }): void
    checkSession(options: {
      success?: () => void
      fail?: () => void
    }): void
    requestPayment(
      options: Record<string, any> & {
        success?: () => void
        fail?: (err: { errMsg: string }) => void
      }
    ): void
    chooseImage(options: {
      count?: number
      sourceType?: string[]
      sizeType?: string[]
      success?: (res: {
        tempFilePaths: string[]
        tempFiles: Array<{ path: string; size: number }>
      }) => void
      fail?: (err: any) => void
    }): void
    uploadFile(options: {
      url: string
      filePath: string
      name: string
      header?: Record<string, string>
      formData?: Record<string, string>
      success?: (res: { data: string; statusCode: number }) => void
      fail?: (err: any) => void
    }): void
    previewImage(options: { urls: string[]; current?: string }): void
    getLocation(options: {
      type?: string
      altitude?: boolean
      isHighAccuracy?: boolean
      success?: (res: {
        latitude: number
        longitude: number
        accuracy: number
        altitude?: number
        speed?: number
      }) => void
      fail?: (err: any) => void
    }): void
    scanCode(options: {
      onlyFromCamera?: boolean
      scanType?: string[]
      success?: (res: { result: string; scanType: string }) => void
      fail?: (err: any) => void
    }): void
    getStorageSync(key: string): any
    setStorageSync(key: string, data: any): void
    removeStorageSync(key: string): void
    clearStorageSync(): void
    navigateTo(options: { url: string }): void
    redirectTo(options: { url: string }): void
    navigateBack(options: { delta?: number }): void
    showToast(options: {
      title: string
      icon?: string
      duration?: number
    }): void
    showLoading(options: { title: string; mask?: boolean }): void
    hideLoading(): void
    showModal(options: {
      title: string
      content: string
      showCancel?: boolean
      cancelText?: string
      confirmText?: string
      success?: (res: { confirm: boolean; cancel: boolean }) => void
    }): void
  }
  | undefined
