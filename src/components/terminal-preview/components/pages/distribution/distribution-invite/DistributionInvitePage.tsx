/**
 * 邀请页面（预览器版本）
 *
 * 改造状态: ✅ 已按小程序规范改造
 * @see docs/功能模块改造指南/小程序页面改造规范.md
 *
 * 改造内容：
 * - 规则 4: useQuery → useState + useEffect
 * - 规则 5: 使用跨平台原语 Box/Text/Icon/Image
 * - 规则 1/2: 布局属性在 style 中定义
 * - 规则 3: 添加 wxScale 缩放
 * - 规则 9: HTML 元素 → 跨平台原语
 * - 规则 4.1: 添加骨架屏
 * - 规则 11: 导航栏预留安全区域
 * - 规则 12: 已拆分为模块化结构
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon, Image } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { getWxBridge } from '../../../../bridge'
import { previewApi } from '../../../../api'
import { PermissionPrompt } from '../../../PermissionPrompt'
import { wxScale, wxSafeAreaTop } from './constants'
import type { DistributionInvitePageProps, InviteData } from './types'
import { InvitePageSkeleton } from './components'

// ============================================================================
// 组件实现
// ============================================================================

export function DistributionInvitePage({
  themeSettings,
  isDarkMode,
  effectiveViewerRole,
  onNavigate,
  onLogin,
  renderShareButton,
  onSaveQRCode,
}: DistributionInvitePageProps) {
  const isEscort = effectiveViewerRole === 'escort'
  const primaryColor = themeSettings.primaryColor

  // 颜色变量
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  // 数据状态
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // 获取邀请数据
  useEffect(() => {
    if (!isEscort) {
      setLoading(false)
      return
    }

    previewApi
      .getDistributionInviteCode()
      .then(setInviteData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [isEscort])

  const handleRetry = () => {
    setError(false)
    setLoading(true)
    previewApi
      .getDistributionInviteCode()
      .then(setInviteData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  // 复制到剪贴板
  const handleCopy = async (text: string, label: string) => {
    const wxBridge = getWxBridge()
    try {
      await wxBridge.setClipboardData({ data: text })
      wxBridge.showToast({ title: `${label}已复制`, icon: 'success' })
    } catch {
      wxBridge.showToast({ title: '复制失败，请手动复制', icon: 'none' })
    }
  }

  const handleBack = () => {
    onNavigate?.('distribution')
  }

  // 非 escort 视角：显示统一的 PermissionPrompt
  if (!isEscort) {
    return (
      <Box
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: bgColor,
        }}
      >
        {/* 导航栏 */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: primaryColor,
            paddingTop: wxSafeAreaTop,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: 44 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
            }}
          >
            <Box
              onClick={handleBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36 * wxScale,
                height: 36 * wxScale,
              }}
            >
              <Icon name="left" size={22 * wxScale} color="#fff" />
            </Box>
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
              邀请好友
            </Text>
          </Box>
        </Box>

        <Box style={{ flex: 1, padding: 16 * wxScale }}>
          <PermissionPrompt
            title="需要陪诊员身份"
            description="请先登录陪诊员账号获取邀请信息"
            onLogin={onLogin}
            showDebugInject={process.env.NODE_ENV === 'development'}
            primaryColor={primaryColor}
            isDarkMode={isDarkMode}
          />
        </Box>
      </Box>
    )
  }

  // 加载中
  if (loading) {
    return <InvitePageSkeleton primaryColor={primaryColor} isDarkMode={isDarkMode} />
  }

  // 错误状态
  if (error || !inviteData) {
    return (
      <Box style={{ minHeight: '100%', backgroundColor: bgColor }}>
        {/* 导航栏 */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: primaryColor,
            paddingTop: wxSafeAreaTop,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: 44 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
            }}
          >
            <Box
              onClick={handleBack}
              style={{
                position: 'absolute',
                left: 12 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36 * wxScale,
                height: 36 * wxScale,
              }}
            >
              <Icon name="left" size={22 * wxScale} color="#fff" />
            </Box>
            <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
              邀请好友
            </Text>
          </Box>
        </Box>

        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 48 * wxScale,
          }}
        >
          <Icon name="caution" size={48 * wxScale} color={textSecondary} />
          <Text
            style={{
              display: 'block',
              marginTop: 12 * wxScale,
              fontSize: 14 * wxScale,
              color: textSecondary,
            }}
          >
            加载失败
          </Text>
          <Box
            onClick={handleRetry}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4 * wxScale,
              marginTop: 12 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: 8 * wxScale,
              paddingBottom: 8 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: primaryColor,
            }}
          >
            <Icon name="refresh" size={16 * wxScale} color="#fff" />
            <Text style={{ fontSize: 14 * wxScale, color: '#fff' }}>重试</Text>
          </Box>
        </Box>
      </Box>
    )
  }

  // 主界面
  return (
    <Box style={{ minHeight: '100%', backgroundColor: bgColor }}>
      {/* 导航栏 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: primaryColor,
          paddingTop: wxSafeAreaTop,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          <Box
            onClick={handleBack}
            style={{
              position: 'absolute',
              left: 12 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36 * wxScale,
              height: 36 * wxScale,
            }}
          >
            <Icon name="left" size={22 * wxScale} color="#fff" />
          </Box>
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
            邀请好友
          </Text>
        </Box>
      </Box>

      {/* 内容区 */}
      <Box style={{ padding: 16 * wxScale }}>
        {/* 邀请码 */}
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            marginBottom: 16 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <Text
            style={{
              display: 'block',
              fontSize: 14 * wxScale,
              fontWeight: 500,
              marginBottom: 12 * wxScale,
              color: textPrimary,
            }}
          >
            我的邀请码
          </Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
            <Box
              style={{
                flex: 1,
                paddingLeft: 16 * wxScale,
                paddingRight: 16 * wxScale,
                paddingTop: 12 * wxScale,
                paddingBottom: 12 * wxScale,
                borderRadius: 8 * wxScale,
                textAlign: 'center',
                backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6',
              }}
            >
              <Text
                style={{
                  fontSize: 20 * wxScale,
                  fontWeight: 600,
                  letterSpacing: 4 * wxScale,
                  color: primaryColor,
                }}
              >
                {inviteData.inviteCode}
              </Text>
            </Box>
            <Box
              onClick={() => handleCopy(inviteData.inviteCode, '邀请码')}
              style={{
                width: 40 * wxScale,
                height: 40 * wxScale,
                borderRadius: 8 * wxScale,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${primaryColor}15`,
              }}
            >
              <Icon name="clipboard" size={20 * wxScale} color={primaryColor} />
            </Box>
          </Box>
        </Box>

        {/* 分享好友按钮 */}
        <Box
          style={{
            padding: 16 * wxScale,
            borderRadius: 12 * wxScale,
            marginBottom: 16 * wxScale,
            backgroundColor: cardBg,
          }}
        >
          <Text
            style={{
              display: 'block',
              fontSize: 14 * wxScale,
              fontWeight: 500,
              marginBottom: 12 * wxScale,
              color: textPrimary,
            }}
          >
            邀请好友
          </Text>
          <Text
            style={{
              display: 'block',
              fontSize: 12 * wxScale,
              color: textSecondary,
              marginBottom: 12 * wxScale,
            }}
          >
            点击下方按钮，将邀请分享给微信好友
          </Text>
          {/* 分享按钮：小程序需要使用原生 Button openType="share" */}
          {renderShareButton ? (
            renderShareButton({
              children: (
                <>
                  <Icon name="share-three" size={18 * wxScale} color="#fff" />
                  <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: '#fff' }}>分享给好友</Text>
                </>
              ),
              style: {
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8 * wxScale,
                paddingTop: 14 * wxScale,
                paddingBottom: 14 * wxScale,
                borderRadius: 12 * wxScale,
                backgroundColor: primaryColor,
              },
            })
          ) : (
            <Box
              onClick={() => {
                if (isWxEnvironment()) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const wx = (window as any).wx
                  wx?.showToast?.({ title: '请点击右上角分享', icon: 'none' })
                } else {
                  alert('分享功能需要在终端环境中使用')
                }
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8 * wxScale,
                paddingTop: 14 * wxScale,
                paddingBottom: 14 * wxScale,
                borderRadius: 12 * wxScale,
                backgroundColor: primaryColor,
              }}
            >
              <Icon name="share-three" size={18 * wxScale} color="#fff" />
              <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: '#fff' }}>分享给好友</Text>
            </Box>
          )}
        </Box>

        {/* 二维码（如有） */}
        {inviteData.qrCodeUrl && (
          <Box
            style={{
              padding: 16 * wxScale,
              borderRadius: 12 * wxScale,
              marginBottom: 16 * wxScale,
              backgroundColor: cardBg,
            }}
          >
            <Text
              style={{
                display: 'block',
                fontSize: 14 * wxScale,
                fontWeight: 500,
                marginBottom: 12 * wxScale,
                color: textPrimary,
              }}
            >
              邀请二维码
            </Text>
            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                style={{
                  width: 192 * wxScale,
                  height: 192 * wxScale,
                  borderRadius: 8 * wxScale,
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                }}
              >
                <Image
                  src={inviteData.qrCodeUrl}
                  mode="aspectFit"
                  style={{ width: 192 * wxScale, height: 192 * wxScale }}
                />
              </Box>
            </Box>
            {/* 保存到相册按钮 */}
            {onSaveQRCode ? (
              <Box
                onClick={() => onSaveQRCode(inviteData.qrCodeUrl!)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8 * wxScale,
                  marginTop: 12 * wxScale,
                  paddingTop: 10 * wxScale,
                  paddingBottom: 10 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: `${primaryColor}15`,
                }}
              >
                <Icon name="download" size={16 * wxScale} color={primaryColor} />
                <Text style={{ fontSize: 14 * wxScale, color: primaryColor }}>保存到相册</Text>
              </Box>
            ) : (
              <Text
                style={{
                  display: 'block',
                  fontSize: 12 * wxScale,
                  textAlign: 'center',
                  marginTop: 12 * wxScale,
                  color: textSecondary,
                }}
              >
                长按保存二维码分享给好友
              </Text>
            )}
          </Box>
        )}

        {/* 邀请规则说明 */}
        {inviteData.inviteRules && inviteData.inviteRules.length > 0 && (
          <Box
            style={{
              padding: 16 * wxScale,
              borderRadius: 12 * wxScale,
              backgroundColor: cardBg,
            }}
          >
            <Text
              style={{
                display: 'block',
                fontSize: 14 * wxScale,
                fontWeight: 500,
                marginBottom: 12 * wxScale,
                color: textPrimary,
              }}
            >
              邀请规则
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 * wxScale }}>
              {inviteData.inviteRules.map((rule, idx) => (
                <Text key={idx} style={{ fontSize: 12 * wxScale, color: textSecondary }}>
                  • {rule}
                </Text>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}
