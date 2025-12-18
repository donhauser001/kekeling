/**
 * Runtime 模块入口
 *
 * 职责：
 * - 导出环境注入函数
 * - 导出 TerminalPreviewApp 运行时组件
 * - 导出 WxBridge 相关类型和错误码
 *
 * 说明：
 * - 这是宿主壳与终端预览器之间的唯一桥接点
 * - 所有对终端预览器的访问都必须通过此模块
 *
 * @see docs/终端预览器审计/全局终端预览器功能审计与迁移评估报告.md
 */

// 环境注入
export { injectWxBridgeRuntime, getInjectedBridge, isWxMiniProgramEnv } from './env-inject'

// TerminalPreviewApp 运行时组件
// TODO: 后续从终端预览器主仓导入
// 当前提供占位实现
export { TerminalPreviewApp } from './terminal-preview-app'

// WxBridge 实现
export { realWxBridge } from './bridge-impl'

// 错误码和错误类（供业务层判断错误类型）
export { BridgeErrorCode, BridgeError } from './bridge-impl'

// WxBridge 相关类型
export type {
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
    ToastParams,
    ModalParams,
    ModalResult,
} from './bridge-impl'
