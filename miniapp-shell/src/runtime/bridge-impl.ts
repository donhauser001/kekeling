/**
 * WxBridge 真实实现（小程序环境）
 *
 * 职责：
 * - 封装所有微信小程序原生 API
 * - 提供统一的接口供终端预览器调用
 * - 统一错误处理，不暴露 wx 原始错误给业务层
 *
 * 说明：
 * - 这是唯一允许调用 wx.xxx 的文件
 * - 所有方法都返回 Promise，便于统一错误处理
 * - 所有错误都封装为 BridgeError，包含统一的错误码
 *
 * @see docs/终端预览器审计/全局终端预览器功能审计与迁移评估报告.md
 * @see src/components/terminal-preview/bridge/types.ts
 */

// ============================================================================
// 统一错误码和错误类
// ============================================================================

/**
 * 桥接层统一错误码
 *
 * 页面层根据 code 判断错误类型，无需解析 wx 原始错误信息
 */
export enum BridgeErrorCode {
  /** 成功 */
  SUCCESS = 0,
  /** 用户拒绝授权（如拒绝定位、相机权限） */
  PERMISSION_DENIED = 1001,
  /** 用户取消操作（如取消支付、取消选择图片） */
  CANCELLED = 1002,
  /** 能力不可用（如设备不支持某功能） */
  UNAVAILABLE = 1003,
  /** 网络错误 */
  NETWORK_ERROR = 1004,
  /** 操作超时 */
  TIMEOUT = 1005,
  /** 未知错误 */
  UNKNOWN = 9999,
}

/**
 * 桥接层统一错误类
 *
 * 所有 wx API 调用失败都会抛出此错误
 */
export class BridgeError extends Error {
  /** 错误码 */
  public readonly code: BridgeErrorCode
  /** 原始错误（仅用于调试，不要在业务层使用） */
  public readonly originalError?: unknown

  constructor(code: BridgeErrorCode, message: string, originalError?: unknown) {
    super(message)
    this.name = 'BridgeError'
    this.code = code
    this.originalError = originalError
  }

  /**
   * 判断是否为用户取消操作
   */
  get isCancelled(): boolean {
    return this.code === BridgeErrorCode.CANCELLED
  }

  /**
   * 判断是否为权限问题
   */
  get isPermissionDenied(): boolean {
    return this.code === BridgeErrorCode.PERMISSION_DENIED
  }
}

// ============================================================================
// 错误解析函数
// ============================================================================

/**
 * 微信错误对象类型
 */
interface WxError {
  errMsg?: string
  errno?: number
}

/**
 * 解析微信原始错误，转换为统一的 BridgeError
 *
 * 映射规则：
 * - cancel / user deny / user cancel -> CANCELLED
 * - auth deny / authorize / permission -> PERMISSION_DENIED
 * - timeout -> TIMEOUT
 * - network / request:fail / net:: -> NETWORK_ERROR
 * - not support / not available -> UNAVAILABLE
 * - 其他 -> UNKNOWN
 *
 * @param err 微信原始错误
 * @param defaultMessage 默认错误消息（当无法解析时使用）
 */
function parseWxError(err: WxError, defaultMessage = '操作失败'): BridgeError {
  const msg = (err.errMsg || '').toLowerCase()

  // 用户取消
  if (
    msg.includes('cancel') ||
    msg.includes('user deny') ||
    msg.includes('user cancel') ||
    msg.includes('取消')
  ) {
    return new BridgeError(BridgeErrorCode.CANCELLED, '用户取消操作', err)
  }

  // 权限拒绝
  if (
    msg.includes('auth deny') ||
    msg.includes('authorize') ||
    msg.includes('permission') ||
    msg.includes('scope') ||
    msg.includes('denied')
  ) {
    return new BridgeError(BridgeErrorCode.PERMISSION_DENIED, '用户拒绝授权', err)
  }

  // 超时
  if (msg.includes('timeout') || msg.includes('超时')) {
    return new BridgeError(BridgeErrorCode.TIMEOUT, '操作超时', err)
  }

  // 网络错误
  if (
    msg.includes('network') ||
    msg.includes('request:fail') ||
    msg.includes('net::') ||
    msg.includes('网络')
  ) {
    return new BridgeError(BridgeErrorCode.NETWORK_ERROR, '网络错误', err)
  }

  // 能力不可用
  if (
    msg.includes('not support') ||
    msg.includes('not available') ||
    msg.includes('不支持')
  ) {
    return new BridgeError(BridgeErrorCode.UNAVAILABLE, '当前设备不支持此功能', err)
  }

  // 未知错误
  return new BridgeError(
    BridgeErrorCode.UNKNOWN,
    err.errMsg || defaultMessage,
    err
  )
}

// ============================================================================
// 类型定义（与 terminal-preview/bridge/types.ts 保持一致）
// ============================================================================

/** 微信登录结果 */
export interface WxLoginResult {
  code: string
}

/** 支付参数 */
export interface WxPayParams {
  timeStamp: string
  nonceStr: string
  package: string
  signType: 'MD5' | 'HMAC-SHA256' | 'RSA'
  paySign: string
}

/** 支付结果 */
export interface WxPayResult {
  success: boolean
  errMsg?: string
  /** 错误码（仅失败时存在） */
  errorCode?: BridgeErrorCode
}

/** 分享参数 */
export interface WxShareParams {
  title: string
  desc?: string
  path: string
  imageUrl?: string
}

/** 选择图片参数 */
export interface WxChooseImageParams {
  count?: number
  sourceType?: Array<'album' | 'camera'>
  sizeType?: Array<'original' | 'compressed'>
}

/** 选择图片结果 */
export interface WxChooseImageResult {
  tempFilePaths: string[]
  tempFiles: Array<{ path: string; size: number }>
}

/** 上传文件参数 */
export interface WxUploadFileParams {
  url: string
  filePath: string
  name: string
  header?: Record<string, string>
  formData?: Record<string, string>
}

/** 上传文件结果 */
export interface WxUploadFileResult {
  data: string
  statusCode: number
}

/** 扫码参数 */
export interface WxScanCodeParams {
  onlyFromCamera?: boolean
  scanType?: Array<'barCode' | 'qrCode' | 'datamatrix' | 'pdf417'>
}

/** 扫码结果 */
export interface WxScanCodeResult {
  result: string
  scanType: string
  charSet?: string
  rawData?: string
}

/** 存储接口 */
export interface WxStorage {
  getSync(key: string): unknown
  setSync(key: string, data: unknown): void
  removeSync(key: string): void
  clearSync(): void
}

/** Toast 参数 */
export interface ToastParams {
  title: string
  icon?: 'success' | 'error' | 'loading' | 'none'
  duration?: number
}

/** Modal 参数 */
export interface ModalParams {
  title: string
  content: string
  showCancel?: boolean
  cancelText?: string
  confirmText?: string
}

/** Modal 结果 */
export interface ModalResult {
  confirm: boolean
  cancel: boolean
}

/** WxBridge 接口 */
export interface WxBridge {
  login(): Promise<WxLoginResult>
  checkSession(): Promise<boolean>
  requestPayment(params: WxPayParams): Promise<WxPayResult>
  share(params: WxShareParams): void
  getShareParams(): WxShareParams | null
  chooseImage(params?: WxChooseImageParams): Promise<WxChooseImageResult>
  uploadFile(params: WxUploadFileParams): Promise<WxUploadFileResult>
  previewImage(urls: string[], current?: string): void
  scanCode(params?: WxScanCodeParams): Promise<WxScanCodeResult>
  storage: WxStorage
  navigateTo(url: string): void
  redirectTo(url: string): void
  navigateBack(delta?: number): void
  showToast(params: ToastParams): void
  showLoading(title: string): void
  hideLoading(): void
  showModal(params: ModalParams): Promise<ModalResult>
}

// ============================================================================
// 分享状态
// ============================================================================

let pendingShareParams: WxShareParams | null = null

// ============================================================================
// 真实实现
// ============================================================================

/**
 * 小程序环境的 WxBridge 真实实现
 *
 * 说明：
 * - 所有方法直接调用 wx.* API
 * - 使用 @ts-expect-error 忽略 wx 类型检查（因为在小程序环境运行）
 * - 所有异步操作失败时抛出 BridgeError 而非原始错误
 */
export const realWxBridge: WxBridge = {
  // ==================== 登录 ====================

  /**
   * 微信登录，获取用户登录凭证 code
   *
   * @wx-api wx.login
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html
   *
   * @returns 登录凭证 code（有效期 5 分钟）
   * @throws BridgeError 登录失败时抛出
   */
  async login(): Promise<WxLoginResult> {
    return new Promise((resolve, reject) => {
      // @ts-expect-error wx 在小程序环境中存在
      wx.login({
        success: (res: { code: string }) => resolve({ code: res.code }),
        fail: (err: WxError) => reject(parseWxError(err, '微信登录失败')),
      })
    })
  },

  /**
   * 检查登录态是否过期
   *
   * @wx-api wx.checkSession
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.checkSession.html
   *
   * @returns true=未过期, false=已过期
   */
  async checkSession(): Promise<boolean> {
    return new Promise((resolve) => {
      // @ts-expect-error wx 在小程序环境中存在
      wx.checkSession({
        success: () => resolve(true),
        fail: () => resolve(false),
      })
    })
  },

  // ==================== 支付 ====================

  /**
   * 发起微信支付
   *
   * @wx-api wx.requestPayment
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestPayment.html
   *
   * @param params 支付参数（由后端下单接口返回）
   * @returns 支付结果（不抛异常，通过 success 字段判断）
   */
  async requestPayment(params: WxPayParams): Promise<WxPayResult> {
    return new Promise((resolve) => {
      // @ts-expect-error wx 在小程序环境中存在
      wx.requestPayment({
        ...params,
        success: () => resolve({ success: true }),
        fail: (err: WxError) => {
          const bridgeError = parseWxError(err, '支付失败')
          resolve({
            success: false,
            errMsg: bridgeError.message,
            errorCode: bridgeError.code,
          })
        },
      })
    })
  },

  // ==================== 分享 ====================

  /**
   * 设置分享参数
   *
   * 说明：
   * - 调用后参数会被缓存，供页面的 onShareAppMessage 使用
   * - 小程序分享只能由用户主动触发，无法通过 API 调用
   *
   * @param params 分享参数
   */
  share(params: WxShareParams): void {
    pendingShareParams = params
    console.log('[realWxBridge] 分享参数已设置:', params)
  },

  /**
   * 获取当前分享参数
   *
   * 用于 onShareAppMessage 回调中返回分享内容
   */
  getShareParams(): WxShareParams | null {
    return pendingShareParams
  },

  // ==================== 图片 ====================

  /**
   * 从相册选择图片或拍照
   *
   * @wx-api wx.chooseImage (基础库 < 2.21.0) / wx.chooseMedia (基础库 >= 2.21.0)
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.chooseImage.html
   *
   * @param params 选择参数
   * @returns 选择的图片临时文件路径列表
   * @throws BridgeError 选择失败或用户取消时抛出
   */
  async chooseImage(params?: WxChooseImageParams): Promise<WxChooseImageResult> {
    return new Promise((resolve, reject) => {
      // @ts-expect-error wx 在小程序环境中存在
      wx.chooseImage({
        count: params?.count || 9,
        sourceType: params?.sourceType || ['album', 'camera'],
        sizeType: params?.sizeType || ['original', 'compressed'],
        success: (res: WxChooseImageResult) => resolve(res),
        fail: (err: WxError) => reject(parseWxError(err, '选择图片失败')),
      })
    })
  },

  /**
   * 上传文件到服务器
   *
   * @wx-api wx.uploadFile
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/network/upload/wx.uploadFile.html
   *
   * @param params 上传参数
   * @returns 服务器返回的数据
   * @throws BridgeError 上传失败时抛出
   */
  async uploadFile(params: WxUploadFileParams): Promise<WxUploadFileResult> {
    return new Promise((resolve, reject) => {
      // @ts-expect-error wx 在小程序环境中存在
      wx.uploadFile({
        url: params.url,
        filePath: params.filePath,
        name: params.name,
        header: params.header,
        formData: params.formData,
        success: (res: WxUploadFileResult) => resolve(res),
        fail: (err: WxError) => reject(parseWxError(err, '上传文件失败')),
      })
    })
  },

  /**
   * 预览图片
   *
   * @wx-api wx.previewImage
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.previewImage.html
   *
   * @param urls 图片 URL 列表
   * @param current 当前显示的图片 URL
   */
  previewImage(urls: string[], current?: string): void {
    // @ts-expect-error wx 在小程序环境中存在
    wx.previewImage({
      urls,
      current: current || urls[0],
    })
  },

  // ==================== 扫码 ====================

  /**
   * 调起扫码界面
   *
   * @wx-api wx.scanCode
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/device/scan/wx.scanCode.html
   *
   * @param params 扫码参数
   * @returns 扫码结果
   * @throws BridgeError 扫码失败或用户取消时抛出
   */
  async scanCode(params?: WxScanCodeParams): Promise<WxScanCodeResult> {
    return new Promise((resolve, reject) => {
      // @ts-expect-error wx 在小程序环境中存在
      wx.scanCode({
        onlyFromCamera: params?.onlyFromCamera,
        scanType: params?.scanType,
        success: (res: WxScanCodeResult) => resolve(res),
        fail: (err: WxError) => reject(parseWxError(err, '扫码失败')),
      })
    })
  },

  // ==================== 存储 ====================

  /**
   * 本地存储接口
   *
   * @wx-api wx.getStorageSync / wx.setStorageSync / wx.removeStorageSync / wx.clearStorageSync
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.setStorageSync.html
   *
   * 注意：所有方法都带有 try-catch 保护，不会抛出异常
   */
  storage: {
    /**
     * 同步获取本地缓存
     * @returns 缓存数据，不存在或出错时返回 null
     */
    getSync(key: string): unknown {
      try {
        // @ts-expect-error wx 在小程序环境中存在
        return wx.getStorageSync(key)
      } catch (e) {
        console.warn('[realWxBridge.storage.getSync] 读取失败:', key, e)
        return null
      }
    },

    /**
     * 同步设置本地缓存
     */
    setSync(key: string, data: unknown): void {
      try {
        // @ts-expect-error wx 在小程序环境中存在
        wx.setStorageSync(key, data)
      } catch (e) {
        console.warn('[realWxBridge.storage.setSync] 写入失败:', key, e)
      }
    },

    /**
     * 同步移除本地缓存
     */
    removeSync(key: string): void {
      try {
        // @ts-expect-error wx 在小程序环境中存在
        wx.removeStorageSync(key)
      } catch (e) {
        console.warn('[realWxBridge.storage.removeSync] 删除失败:', key, e)
      }
    },

    /**
     * 同步清理本地缓存
     */
    clearSync(): void {
      try {
        // @ts-expect-error wx 在小程序环境中存在
        wx.clearStorageSync()
      } catch (e) {
        console.warn('[realWxBridge.storage.clearSync] 清理失败:', e)
      }
    },
  },

  // ==================== 导航 ====================

  /**
   * 保留当前页面，跳转到应用内的某个页面
   *
   * @wx-api wx.navigateTo
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.navigateTo.html
   *
   * @param url 页面路径
   */
  navigateTo(url: string): void {
    // @ts-expect-error wx 在小程序环境中存在
    wx.navigateTo({ url })
  },

  /**
   * 关闭当前页面，跳转到应用内的某个页面
   *
   * @wx-api wx.redirectTo
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.redirectTo.html
   *
   * @param url 页面路径
   */
  redirectTo(url: string): void {
    // @ts-expect-error wx 在小程序环境中存在
    wx.redirectTo({ url })
  },

  /**
   * 关闭当前页面，返回上一页面或多级页面
   *
   * @wx-api wx.navigateBack
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.navigateBack.html
   *
   * @param delta 返回的页面数，默认 1
   */
  navigateBack(delta?: number): void {
    // @ts-expect-error wx 在小程序环境中存在
    wx.navigateBack({ delta: delta || 1 })
  },

  // ==================== 提示 ====================

  /**
   * 显示消息提示框
   *
   * @wx-api wx.showToast
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showToast.html
   *
   * @param params Toast 参数
   */
  showToast(params: ToastParams): void {
    // @ts-expect-error wx 在小程序环境中存在
    wx.showToast({
      title: params.title,
      icon: params.icon || 'none',
      duration: params.duration || 1500,
    })
  },

  /**
   * 显示 loading 提示框
   *
   * @wx-api wx.showLoading
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showLoading.html
   *
   * @param title 提示内容
   */
  showLoading(title: string): void {
    // @ts-expect-error wx 在小程序环境中存在
    wx.showLoading({ title, mask: true })
  },

  /**
   * 隐藏 loading 提示框
   *
   * @wx-api wx.hideLoading
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.hideLoading.html
   */
  hideLoading(): void {
    // @ts-expect-error wx 在小程序环境中存在
    wx.hideLoading()
  },

  /**
   * 显示模态对话框
   *
   * @wx-api wx.showModal
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/ui/interaction/wx.showModal.html
   *
   * @param params Modal 参数
   * @returns 用户点击结果
   */
  async showModal(params: ModalParams): Promise<ModalResult> {
    return new Promise((resolve) => {
      // @ts-expect-error wx 在小程序环境中存在
      wx.showModal({
        title: params.title,
        content: params.content,
        showCancel: params.showCancel ?? true,
        cancelText: params.cancelText || '取消',
        confirmText: params.confirmText || '确定',
        success: (res: ModalResult) => resolve(res),
        // Modal 的 fail 回调很少触发，这里也返回一个默认值
        fail: () => resolve({ confirm: false, cancel: true }),
      })
    })
  },
}
