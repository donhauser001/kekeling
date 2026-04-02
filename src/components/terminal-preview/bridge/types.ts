/**
 * 微信原生能力桥接层 - 类型定义
 */

// ============================================================================
// 登录相关
// ============================================================================

/** 微信登录结果 */
export interface WxLoginResult {
  /** 用户登录凭证（有效期5分钟） */
  code: string
}

/** 获取用户信息结果 */
export interface WxUserInfo {
  /** 用户昵称 */
  nickName: string
  /** 头像 URL */
  avatarUrl: string
  /** 性别 0-未知 1-男 2-女 */
  gender: 0 | 1 | 2
}

// ============================================================================
// 支付相关
// ============================================================================

/** 支付参数 */
export interface WxPayParams {
  /** 时间戳 */
  timeStamp: string
  /** 随机字符串 */
  nonceStr: string
  /** 统一下单接口返回的 prepay_id 参数值 */
  package: string
  /** 签名类型 */
  signType: 'MD5' | 'HMAC-SHA256' | 'RSA'
  /** 签名 */
  paySign: string
}

/** 支付结果 */
export interface WxPayResult {
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  errMsg?: string
}

// ============================================================================
// 分享相关
// ============================================================================

/** 分享参数 */
export interface WxShareParams {
  /** 分享标题 */
  title: string
  /** 分享描述 */
  desc?: string
  /** 分享路径 */
  path: string
  /** 分享图片 URL */
  imageUrl?: string
}

// ============================================================================
// 图片相关
// ============================================================================

/** 选择图片参数 */
export interface WxChooseImageParams {
  /** 最多可选图片数量 */
  count?: number
  /** 图片来源 */
  sourceType?: Array<'album' | 'camera'>
  /** 图片尺寸 */
  sizeType?: Array<'original' | 'compressed'>
}

/** 选择图片结果 */
export interface WxChooseImageResult {
  /** 本地临时文件路径列表 */
  tempFilePaths: string[]
  /** 本地临时文件列表 */
  tempFiles: Array<{
    path: string
    size: number
  }>
}

/** 上传文件参数 */
export interface WxUploadFileParams {
  /** 开发者服务器地址 */
  url: string
  /** 要上传文件资源的路径 */
  filePath: string
  /** 文件对应的 key */
  name: string
  /** HTTP 请求 Header */
  header?: Record<string, string>
  /** HTTP 请求中其他额外的 form data */
  formData?: Record<string, string>
}

/** 上传文件结果 */
export interface WxUploadFileResult {
  /** 开发者服务器返回的数据 */
  data: string
  /** HTTP 状态码 */
  statusCode: number
}

// ============================================================================
// 扫码相关
// ============================================================================

/** 扫码参数 */
export interface WxScanCodeParams {
  /** 是否只能从相机扫码 */
  onlyFromCamera?: boolean
  /** 扫码类型 */
  scanType?: Array<'barCode' | 'qrCode' | 'datamatrix' | 'pdf417'>
}

/** 扫码结果 */
export interface WxScanCodeResult {
  /** 扫码内容 */
  result: string
  /** 扫码类型 */
  scanType: string
  /** 字符集 */
  charSet?: string
  /** 原始数据 */
  rawData?: string
}

// ============================================================================
// 存储相关
// ============================================================================

/** 存储接口 */
export interface WxStorage {
  /** 同步获取本地缓存 */
  getSync(key: string): unknown
  /** 同步设置本地缓存 */
  setSync(key: string, data: unknown): void
  /** 同步移除本地缓存 */
  removeSync(key: string): void
  /** 同步清理本地缓存 */
  clearSync(): void
}

// ============================================================================
// 桥接层主接口
// ============================================================================

/**
 * 微信原生能力桥接层接口
 *
 * 包含所有需要原生实现的微信 API 抽象
 */
export interface WxBridge {
  // ==================== 登录 ====================

  /**
   * 微信登录
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html
   */
  login(): Promise<WxLoginResult>

  /**
   * 检查登录态是否过期
   */
  checkSession(): Promise<boolean>

  // ==================== 支付 ====================

  /**
   * 发起微信支付
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestPayment.html
   */
  requestPayment(params: WxPayParams): Promise<WxPayResult>

  // ==================== 分享 ====================

  /**
   * 触发分享（仅在小程序环境下生效）
   * 预览器环境下会模拟分享行为
   */
  share(params: WxShareParams): void

  /**
   * 获取分享参数（用于 onShareAppMessage）
   */
  getShareParams(): WxShareParams | null

  // ==================== 图片 ====================

  /**
   * 选择图片
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.chooseImage.html
   */
  chooseImage(params?: WxChooseImageParams): Promise<WxChooseImageResult>

  /**
   * 上传文件
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/network/upload/wx.uploadFile.html
   */
  uploadFile(params: WxUploadFileParams): Promise<WxUploadFileResult>

  /**
   * 预览图片
   */
  previewImage(urls: string[], current?: string): void

  // ==================== 扫码 ====================

  /**
   * 调起扫码
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/device/scan/wx.scanCode.html
   */
  scanCode(params?: WxScanCodeParams): Promise<WxScanCodeResult>

  // ==================== 存储 ====================

  /**
   * 本地存储接口
   */
  storage: WxStorage

  // ==================== 导航 ====================

  /**
   * 导航到页面
   */
  navigateTo(url: string): void

  /**
   * 重定向到页面
   */
  redirectTo(url: string): void

  /**
   * 返回上一页
   */
  navigateBack(delta?: number): void

  // ==================== 提示 ====================

  /**
   * 显示 Toast
   */
  showToast(params: {
    title: string
    icon?: 'success' | 'error' | 'loading' | 'none'
    duration?: number
  }): void

  /**
   * 显示 Loading
   */
  showLoading(title: string): void

  /**
   * 隐藏 Loading
   */
  hideLoading(): void

  /**
   * 显示模态对话框
   */
  showModal(params: {
    title: string
    content: string
    showCancel?: boolean
    cancelText?: string
    confirmText?: string
  }): Promise<{ confirm: boolean; cancel: boolean }>

  // ==================== 剪贴板 ====================

  /**
   * 设置剪贴板内容
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/device/clipboard/wx.setClipboardData.html
   */
  setClipboardData(params: { data: string }): Promise<void>
}
