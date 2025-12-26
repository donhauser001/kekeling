/**
 * App 初始化模块（轻量版）
 *
 * 职责：
 * - 仅导出 App 启动所需的轻量函数
 * - 不导出 TerminalPreviewApp（避免拉入业务代码）
 *
 * 说明：
 * - 这是专门给 app.tsx 使用的轻量模块
 * - TerminalPreviewApp 应该在分包页面中直接导入
 */

// 环境注入（轻量）
export { injectWxBridgeRuntime, getInjectedBridge, isWxMiniProgramEnv } from './env-inject'




