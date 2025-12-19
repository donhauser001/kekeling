/**
 * 陪诊员申请页面
 * 按《小程序页面改造规范》改造
 */

import { useState, useEffect } from 'react'
import { Box, Text, Button, Icon, ScrollView } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'
import type { EscortApplyPageProps, ApplicationStatus, ApplyFormData, InviterInfo } from './types'
import { getThemeColors } from './constants'
import { ApplyForm, ApplyStatusCard, EscortApplySkeleton } from './components'

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export function EscortApplyPage({
  themeSettings,
  isDarkMode = false,
  onBack,
  onNavigate,
}: EscortApplyPageProps) {
  // ============================================================================
  // 状态管理
  // ============================================================================

  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<ApplicationStatus | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [userPhone, setUserPhone] = useState<string>('')

  // ============================================================================
  // 数据获取
  // ============================================================================

  useEffect(() => {
    loadApplication()
  }, [])

  const loadApplication = async () => {
    setLoading(true)
    try {
      // 获取申请状态
      const result = await previewApi.getMyEscortApplication()
      setApplication(result)

      // 如果没有申请或被驳回，显示表单
      if (!result || result.status === 'rejected') {
        setShowForm(true)
      }

      // 获取用户手机号
      const profile = await previewApi.getUserProfile()
      if (profile?.phone) {
        setUserPhone(profile.phone)
      }
    } catch (error) {
      console.error('获取申请状态失败:', error)
      setShowForm(true)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // 派生数据
  // ============================================================================

  const colors = getThemeColors(isDarkMode)
  const primaryColor = themeSettings.primaryColor

  // ============================================================================
  // 事件处理
  // ============================================================================

  const handleSubmit = async (data: ApplyFormData) => {
    try {
      await previewApi.submitEscortApplication(data)
      // 重新加载申请状态
      await loadApplication()
      setShowForm(false)
    } catch (error: any) {
      console.error('提交申请失败:', error)
      // 可以添加 toast 提示
    }
  }

  const handleValidateInviteCode = async (code: string): Promise<{ valid: boolean; inviter?: InviterInfo; message?: string }> => {
    try {
      const result = await previewApi.validateEscortInviteCode(code)
      return result
    } catch (error) {
      return { valid: false, message: '验证失败，请重试' }
    }
  }

  const handleReapply = () => {
    setShowForm(true)
  }

  const handleGoWorkbench = () => {
    onNavigate?.('workbench')
  }

  // ============================================================================
  // 渲染
  // ============================================================================

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: colors.pageBg,
      }}
    >
      {/* 自定义导航栏 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          style={{
            height: 44 * wxScale,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* 返回按钮 */}
          <Button
            onClick={onBack}
            style={{
              position: 'absolute',
              left: 12 * wxScale,
              width: 36 * wxScale,
              height: 36 * wxScale,
              borderRadius: 18 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Icon name="left" size={20 * wxScale} color="#ffffff" />
          </Button>

          {/* 标题 */}
          <Text
            style={{
              fontSize: 17 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            成为陪诊员
          </Text>
        </Box>
      </Box>

      {/* 内容区域 */}
      <ScrollView
        style={{
          flex: 1,
        }}
      >
        {loading ? (
          <EscortApplySkeleton colors={colors} />
        ) : showForm ? (
          <ApplyForm
            colors={colors}
            primaryColor={primaryColor}
            userPhone={userPhone}
            onSubmit={handleSubmit}
            onValidateInviteCode={handleValidateInviteCode}
          />
        ) : application ? (
          <ApplyStatusCard
            application={application}
            colors={colors}
            primaryColor={primaryColor}
            onReapply={handleReapply}
            onGoWorkbench={handleGoWorkbench}
          />
        ) : (
          <ApplyForm
            colors={colors}
            primaryColor={primaryColor}
            userPhone={userPhone}
            onSubmit={handleSubmit}
            onValidateInviteCode={handleValidateInviteCode}
          />
        )}
      </ScrollView>
    </Box>
  )
}
