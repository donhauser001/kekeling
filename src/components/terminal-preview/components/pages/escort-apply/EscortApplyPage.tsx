/**
 * 陪诊员申请页面
 * 按《小程序页面改造规范》改造
 */

import { useState, useEffect } from 'react'
import { Box, Text, Button, Icon, ScrollView } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { showToast } from '../../../platform/interaction'
import { previewApi } from '../../../api'
import type { EscortApplyPageProps, ApplicationStatus, ApplyFormData, InviterInfo } from './types'
import { getThemeColors } from './constants'
import { ApplyForm, ApplyStatusCard, EscortApplySkeleton } from './components'

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export function EscortApplyPage({
  themeSettings,
  isDarkMode = false,
  initialInviteCode,
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
  const [userAvatar, setUserAvatar] = useState<string>('')
  const [userGender, setUserGender] = useState<'male' | 'female' | 'unknown'>('male')

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

      // 获取用户资料（手机号、头像、性别）
      const profile = await previewApi.getUserProfile()
      if (profile) {
        if (profile.phone) {
          setUserPhone(profile.phone)
        }
        if (profile.avatar) {
          setUserAvatar(profile.avatar)
        }
        if (profile.gender) {
          // 将用户性别映射到表单性别选项
          const genderMap: Record<string, 'male' | 'female' | 'unknown'> = {
            'male': 'male',
            'female': 'female',
            '男': 'male',
            '女': 'female',
          }
          setUserGender(genderMap[profile.gender] || 'male')
        }
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
      const submitSource = {
        ...data,
        serviceAreas: data.productLine && data.productName
          ? `${data.productLine}：${data.productName}`
          : data.serviceAreas,
      }
      // 过滤掉空字符串字段，避免后端验证失败
      const submitData: Record<string, unknown> = {}
      Object.entries(submitSource).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          submitData[key] = value
        }
      })
      delete submitData.productLine
      delete submitData.productName
      // age 在表单中是字符串，提交前统一转换为数字
      if (typeof submitData.age === 'string') {
        const parsedAge = Number(submitData.age)
        if (!Number.isNaN(parsedAge)) {
          submitData.age = parsedAge
        }
      }
      await previewApi.submitEscortApplication(submitData as any)
      await showToast('申请提交成功', 'success')
      // 重新加载申请状态
      await loadApplication()
      setShowForm(false)
    } catch (error: any) {
      console.error('提交申请失败:', error)
      await showToast(error?.message || '提交失败，请重试', 'none')
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

  const handleViewAgreement = () => {
    onNavigate?.('cms-page', { slug: 'escort-terms' })
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
            userAvatar={userAvatar}
            userGender={userGender}
            initialInviteCode={initialInviteCode}
            onSubmit={handleSubmit}
            onValidateInviteCode={handleValidateInviteCode}
            onViewAgreement={handleViewAgreement}
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
            userAvatar={userAvatar}
            userGender={userGender}
            initialInviteCode={initialInviteCode}
            onSubmit={handleSubmit}
            onValidateInviteCode={handleValidateInviteCode}
            onViewAgreement={handleViewAgreement}
          />
        )}
      </ScrollView>
    </Box>
  )
}
