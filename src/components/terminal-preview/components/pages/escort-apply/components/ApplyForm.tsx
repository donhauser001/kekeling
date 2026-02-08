/**
 * 申请表单组件
 * 按《小程序页面改造规范》改造
 */

import { useState } from 'react'
import { Box, Text, Button, Input, Icon, Image } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { getFullResourceUrl } from '../../../../platform/config'
import type { ApplyFormData, InviterInfo, ThemeColors } from '../types'
import { GENDER_OPTIONS } from '../constants'

const wxScale = isWxEnvironment() ? 1.1 : 1

interface ApplyFormProps {
  colors: ThemeColors
  primaryColor: string
  userPhone?: string
  userAvatar?: string
  userGender?: 'male' | 'female' | 'unknown'
  /** 初始邀请码（从分享链接传入） */
  initialInviteCode?: string
  onSubmit: (data: ApplyFormData) => Promise<void>
  onValidateInviteCode: (code: string) => Promise<{ valid: boolean; inviter?: InviterInfo; message?: string }>
}

export function ApplyForm({
  colors,
  primaryColor,
  userPhone,
  userAvatar,
  userGender,
  initialInviteCode,
  onSubmit,
  onValidateInviteCode,
}: ApplyFormProps) {
  const [formData, setFormData] = useState<ApplyFormData>({
    name: '',
    phone: userPhone || '',
    idCard: '',
    avatar: userAvatar || '',
    gender: userGender || 'male',
    emergencyContact: '',
    emergencyPhone: '',
    inviteCode: initialInviteCode || '',
    // 新增字段
    age: '',
    hospitals: [],
    departments: [],
    specialties: '',
    serviceAreas: '',
  })
  const [inviter, setInviter] = useState<InviterInfo | null>(null)
  const [inviteCodeError, setInviteCodeError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: keyof ApplyFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // 从身份证自动计算年龄
    if (field === 'idCard' && typeof value === 'string' && value.length >= 14) {
      const birthYear = value.length === 18 ? value.substring(6, 10) : '19' + value.substring(6, 8)
      const currentYear = new Date().getFullYear()
      const calculatedAge = currentYear - parseInt(birthYear, 10)
      if (calculatedAge >= 18 && calculatedAge <= 70) {
        setFormData(prev => ({ ...prev, age: calculatedAge.toString() }))
      }
    }
  }

  const handleValidateInviteCode = async () => {
    if (!formData.inviteCode) {
      setInviter(null)
      setInviteCodeError('')
      return
    }

    const result = await onValidateInviteCode(formData.inviteCode)
    if (result.valid && result.inviter) {
      setInviter(result.inviter)
      setInviteCodeError('')
    } else {
      setInviter(null)
      setInviteCodeError(result.message || '邀请码无效')
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号'
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '手机号格式不正确'
    }
    if (!formData.idCard.trim()) {
      newErrors.idCard = '请输入身份证号'
    } else if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(formData.idCard)) {
      newErrors.idCard = '身份证号格式不正确'
    }
    if (formData.emergencyPhone && !/^1[3-9]\d{9}$/.test(formData.emergencyPhone)) {
      newErrors.emergencyPhone = '手机号格式不正确'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    if (inviteCodeError) return

    setSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box style={{ padding: 16 * wxScale }}>
      {/* 头像上传 */}
      <Box
        style={{
          padding: 20 * wxScale,
          borderRadius: 12 * wxScale,
          backgroundColor: colors.cardBg,
          marginBottom: 12 * wxScale,
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12 * wxScale,
          }}
        >
          <Box
            style={{
              width: 80 * wxScale,
              height: 80 * wxScale,
              borderRadius: 40 * wxScale,
              backgroundColor: colors.inputBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {formData.avatar ? (
              <Image
                src={getFullResourceUrl(formData.avatar)}
                mode="aspectFill"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <Icon name="camera" size={32 * wxScale} color={colors.textMuted} />
            )}
          </Box>
          <Text style={{ fontSize: 14 * wxScale, color: colors.textMuted }}>
            点击上传头像
          </Text>
        </Box>
      </Box>

      {/* 基本信息 */}
      <Box
        style={{
          padding: 16 * wxScale,
          borderRadius: 12 * wxScale,
          backgroundColor: colors.cardBg,
          marginBottom: 12 * wxScale,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 16 * wxScale,
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: 16 * wxScale,
          }}
        >
          基本信息
        </Text>

        {/* 姓名 */}
        <FormItem
          label="真实姓名"
          required
          error={errors.name}
          colors={colors}
        >
          <Input
            value={formData.name}
            onChange={(value) => updateField('name', value)}
            placeholder="请输入真实姓名"
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>

        {/* 手机号 */}
        <FormItem
          label="手机号"
          required
          error={errors.phone}
          colors={colors}
        >
          <Input
            value={formData.phone}
            onChange={(value) => updateField('phone', value)}
            placeholder="请输入手机号"
            type="tel"
            maxLength={11}
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>

        {/* 身份证号 */}
        <FormItem
          label="身份证号"
          required
          error={errors.idCard}
          colors={colors}
        >
          <Input
            value={formData.idCard}
            onChange={(value) => updateField('idCard', value)}
            placeholder="请输入身份证号"
            maxLength={18}
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>

        {/* 性别 */}
        <FormItem label="性别" required colors={colors}>
          <Box style={{ display: 'flex', gap: 12 * wxScale }}>
            {GENDER_OPTIONS.map(opt => (
              <Button
                key={opt.value}
                onClick={() => updateField('gender', opt.value)}
                style={{
                  paddingLeft: 20 * wxScale,
                  paddingRight: 20 * wxScale,
                  paddingTop: 8 * wxScale,
                  paddingBottom: 8 * wxScale,
                  borderRadius: 20 * wxScale,
                  backgroundColor: formData.gender === opt.value ? primaryColor : colors.inputBg,
                }}
              >
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    color: formData.gender === opt.value ? '#ffffff' : colors.textSecondary,
                  }}
                >
                  {opt.label}
                </Text>
              </Button>
            ))}
          </Box>
        </FormItem>
      </Box>

      {/* 紧急联系人 */}
      <Box
        style={{
          padding: 16 * wxScale,
          borderRadius: 12 * wxScale,
          backgroundColor: colors.cardBg,
          marginBottom: 12 * wxScale,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 16 * wxScale,
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: 16 * wxScale,
          }}
        >
          紧急联系人（选填）
        </Text>

        <FormItem label="联系人姓名" colors={colors}>
          <Input
            value={formData.emergencyContact}
            onChange={(value) => updateField('emergencyContact', value)}
            placeholder="请输入紧急联系人姓名"
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>

        <FormItem
          label="联系人电话"
          error={errors.emergencyPhone}
          colors={colors}
          noBorder
        >
          <Input
            value={formData.emergencyPhone}
            onChange={(value) => updateField('emergencyPhone', value)}
            placeholder="请输入紧急联系人电话"
            type="tel"
            maxLength={11}
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>
      </Box>

      {/* 专业信息（#27 陪诊员注册字段补齐） */}
      <Box
        style={{
          padding: 16 * wxScale,
          borderRadius: 12 * wxScale,
          backgroundColor: colors.cardBg,
          marginBottom: 12 * wxScale,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 16 * wxScale,
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: 16 * wxScale,
          }}
        >
          专业信息（选填）
        </Text>

        {/* 年龄（自动从身份证计算） */}
        <FormItem label="年龄" colors={colors}>
          <Input
            value={formData.age}
            onChange={(value) => updateField('age', value)}
            placeholder="输入身份证后自动计算"
            type="number"
            disabled={!!formData.idCard && formData.age !== ''}
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: formData.idCard && formData.age ? colors.textSecondary : colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>

        {/* 服务医院 */}
        <FormItem label="服务医院" colors={colors}>
          <Input
            value={formData.hospitals.join('、')}
            onChange={(value) => updateField('hospitals', value.split('、').filter(Boolean))}
            placeholder="请输入服务医院（多个用顿号分隔）"
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>

        {/* 擅长科室 */}
        <FormItem label="擅长科室" colors={colors}>
          <Input
            value={formData.departments.join('、')}
            onChange={(value) => updateField('departments', value.split('、').filter(Boolean))}
            placeholder="请输入擅长科室（多个用顿号分隔）"
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>

        {/* 擅长病种 */}
        <FormItem label="擅长病种" colors={colors}>
          <Input
            value={formData.specialties}
            onChange={(value) => updateField('specialties', value)}
            placeholder="请输入擅长病种"
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>

        {/* 服务领域 */}
        <FormItem label="服务领域" colors={colors} noBorder>
          <Input
            value={formData.serviceAreas}
            onChange={(value) => updateField('serviceAreas', value)}
            placeholder="请输入服务/产品领域"
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>
      </Box>

      {/* 邀请码 */}
      <Box
        style={{
          padding: 16 * wxScale,
          borderRadius: 12 * wxScale,
          backgroundColor: colors.cardBg,
          marginBottom: 24 * wxScale,
        }}
      >
        <Text
          style={{
            display: 'block',
            fontSize: 16 * wxScale,
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: 16 * wxScale,
          }}
        >
          邀请码（选填）
        </Text>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12 * wxScale,
          }}
        >
          <Input
            value={formData.inviteCode}
            onChange={(value) => {
              updateField('inviteCode', value)
              setInviteCodeError('')
              setInviter(null)
            }}
            onBlur={handleValidateInviteCode}
            placeholder="请输入邀请码"
            style={{
              flex: 1,
              height: 44 * wxScale,
              paddingLeft: 12 * wxScale,
              paddingRight: 12 * wxScale,
              borderRadius: 8 * wxScale,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: colors.inputBg,
            }}
          />
        </Box>

        {inviteCodeError && (
          <Text
            style={{
              display: 'block',
              marginTop: 8 * wxScale,
              fontSize: 12 * wxScale,
              color: '#ef4444',
            }}
          >
            {inviteCodeError}
          </Text>
        )}

        {inviter && (
          <Box
            style={{
              marginTop: 12 * wxScale,
              padding: 12 * wxScale,
              borderRadius: 8 * wxScale,
              backgroundColor: `${primaryColor}10`,
              display: 'flex',
              alignItems: 'center',
              gap: 12 * wxScale,
            }}
          >
            <Icon name="check-one" size={20 * wxScale} color={primaryColor} />
            <Text style={{ fontSize: 14 * wxScale, color: colors.textPrimary }}>
              邀请人：{inviter.name}
            </Text>
          </Box>
        )}
      </Box>

      {/* 提交按钮 */}
      <Button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          height: 48 * wxScale,
          borderRadius: 24 * wxScale,
          backgroundColor: submitting ? colors.textMuted : primaryColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 16 * wxScale, color: '#ffffff', fontWeight: 500 }}>
          {submitting ? '提交中...' : '提交申请'}
        </Text>
      </Button>

      {/* 协议提示 */}
      <Text
        style={{
          display: 'block',
          marginTop: 16 * wxScale,
          fontSize: 12 * wxScale,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        提交申请即表示您同意《陪诊员服务协议》
      </Text>
    </Box>
  )
}

// 表单项组件
interface FormItemProps {
  label: string
  required?: boolean
  error?: string
  noBorder?: boolean
  colors: ThemeColors
  children: React.ReactNode
}

function FormItem({ label, required, error, noBorder, colors, children }: FormItemProps) {
  return (
    <Box
      style={{
        paddingTop: 12 * wxScale,
        paddingBottom: 12 * wxScale,
        borderBottomWidth: noBorder ? 0 : 1,
        borderBottomStyle: 'solid',
        borderBottomColor: colors.border,
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: 4 * wxScale }}>
          <Text style={{ fontSize: 14 * wxScale, color: colors.textSecondary }}>
            {label}
          </Text>
          {required && (
            <Text style={{ fontSize: 14 * wxScale, color: '#ef4444' }}>*</Text>
          )}
        </Box>
        {children}
      </Box>
      {error && (
        <Text
          style={{
            display: 'block',
            marginTop: 4 * wxScale,
            fontSize: 12 * wxScale,
            color: '#ef4444',
          }}
        >
          {error}
        </Text>
      )}
    </Box>
  )
}
