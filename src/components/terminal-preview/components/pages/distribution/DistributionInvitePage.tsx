/**
 * 邀请页面（预览器版本）
 *
 * Step 11.4: distribution-invite
 * - page key: 'distribution-invite'
 * - API: previewApi.getDistributionInviteCode()
 * - 数据通道: escortRequest（⚠️ 需要 escortToken）
 * - 展示字段：邀请码、链接、二维码、累计邀请数、每次奖励
 */

import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, RefreshCw, Copy, Share2, Gift, Users } from 'lucide-react'
import type { ThemeSettings, PreviewViewerRole } from '../../../types'
import { previewApi } from '../../../api'
import { PermissionPrompt } from '../../PermissionPrompt'
import { formatMoney } from '../../../utils'

// ============================================================================
// 类型定义
// ============================================================================

export interface DistributionInvitePageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  effectiveViewerRole: PreviewViewerRole
  onNavigate?: (page: string, params?: Record<string, string>) => void
  onLogin?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function DistributionInvitePage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLogin,
}: DistributionInvitePageProps) {
  const isEscort = effectiveViewerRole === 'escort'

  // ⚠️ 非 escort 视角时不发请求
  const {
    data: inviteData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['preview', 'distribution', 'invite'],
    queryFn: () => previewApi.getDistributionInviteCode(),
    staleTime: 60 * 1000,
    enabled: isEscort,
  })

  // 复制到剪贴板
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // 简单提示（实际项目可以用 toast）
      alert(`${label}已复制`)
    } catch {
      alert('复制失败，请手动复制')
    }
  }

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <div
        className="min-h-full flex flex-col"
        style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
      >
        {/* 标题栏 */}
        <div
          className="sticky top-0 z-10 px-4 py-3 flex items-center"
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          <button
            onClick={() => onNavigate?.('distribution')}
            className="w-8 h-8 flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-lg font-semibold text-white text-center pr-8">
            邀请好友
          </h1>
        </div>

        {/* 权限提示 */}
        <PermissionPrompt
          title="需要陪诊员身份"
          description="请先登录陪诊员账号获取邀请信息"
          onLogin={onLogin}
          showDebugInject={process.env.NODE_ENV === 'development'}
          primaryColor={themeSettings.primaryColor}
          isDarkMode={isDarkMode}
        />
      </div>
    )
  }

  return (
    <div
      className="min-h-full"
      style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa' }}
    >
      {/* 标题栏 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center"
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <button
          onClick={() => onNavigate?.('distribution')}
          className="w-8 h-8 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-white text-center pr-8">
          邀请好友
        </h1>
      </div>

      {/* 内容区 */}
      <div className="px-4 py-4">
        {/* 加载中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 text-sm">加载中...</div>
          </div>
        )}

        {/* 请求失败 */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-2">😔</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              加载失败
            </div>
            <button
              onClick={() => refetch()}
              className="mt-3 flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white"
              style={{ backgroundColor: themeSettings.primaryColor }}
            >
              <RefreshCw className="w-4 h-4" />
              重试
            </button>
          </div>
        )}

        {/* 邀请信息 */}
        {!isLoading && !isError && inviteData && (
          <>
            {/* 统计卡片 */}
            <div
              className="p-4 rounded-xl mb-4"
              style={{
                background: `linear-gradient(135deg, ${themeSettings.primaryColor} 0%, ${themeSettings.primaryColor}dd 100%)`,
              }}
            >
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-white/70 text-sm">
                    <Users className="w-4 h-4" />
                    <span>累计邀请</span>
                  </div>
                  <div className="text-white text-2xl font-bold mt-1">
                    {inviteData.totalInvited}
                  </div>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-white/70 text-sm">
                    <Gift className="w-4 h-4" />
                    <span>每次奖励</span>
                  </div>
                  <div className="text-white text-2xl font-bold mt-1">
                    ¥{formatMoney(inviteData.rewardPerInvite)}
                  </div>
                </div>
              </div>
            </div>

            {/* 邀请码 */}
            <div
              className="p-4 rounded-xl mb-4"
              style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
            >
              <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                我的邀请码
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 px-4 py-3 rounded-lg text-center font-mono text-xl tracking-widest"
                  style={{
                    backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                    color: themeSettings.primaryColor,
                    letterSpacing: '0.3em',
                  }}
                >
                  {inviteData.inviteCode}
                </div>
                <button
                  onClick={() => handleCopy(inviteData.inviteCode, '邀请码')}
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${themeSettings.primaryColor}15`,
                    color: themeSettings.primaryColor,
                  }}
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 邀请链接 */}
            <div
              className="p-4 rounded-xl mb-4"
              style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
            >
              <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                邀请链接
              </div>
              <div
                className="px-4 py-3 rounded-lg text-sm break-all"
                style={{
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                }}
              >
                {inviteData.inviteLink}
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleCopy(inviteData.inviteLink, '邀请链接')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: `${themeSettings.primaryColor}15`,
                    color: themeSettings.primaryColor,
                  }}
                >
                  <Copy className="w-4 h-4" />
                  复制链接
                </button>
                <button
                  onClick={() => {
                    // 模拟分享（实际需要调用小程序/App 分享 API）
                    alert('分享功能需要在终端环境中使用')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm text-white transition-colors"
                  style={{ backgroundColor: themeSettings.primaryColor }}
                >
                  <Share2 className="w-4 h-4" />
                  分享好友
                </button>
              </div>
            </div>

            {/* 二维码（如有） */}
            {inviteData.qrCodeUrl && (
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
              >
                <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  邀请二维码
                </div>
                <div className="flex justify-center">
                  <div
                    className="w-48 h-48 rounded-lg overflow-hidden"
                    style={{ backgroundColor: '#fff' }}
                  >
                    <img
                      src={inviteData.qrCodeUrl}
                      alt="邀请二维码"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className={`text-xs text-center mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  长按保存二维码分享给好友
                </div>
              </div>
            )}

            {/* 邀请规则说明 */}
            <div
              className="p-4 rounded-xl mt-4"
              style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }}
            >
              <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                邀请规则
              </div>
              <ul className={`text-xs space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <li>• 好友通过您的邀请码或链接注册成为陪诊员</li>
                <li>• 好友完成首单后，您将获得 ¥{formatMoney(inviteData.rewardPerInvite)} 奖励</li>
                <li>• 奖励将在好友首单完成后 7 个工作日内发放</li>
                <li>• 邀请无上限，多邀多得</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}
