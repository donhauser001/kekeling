/**
 * 就诊人编辑页面（预览器版本）- 重构版
 *
 * 添加或编辑就诊人信息
 * - page key: 'patient-edit'
 * - 新增时无 id，编辑时有 id
 *
 * 模块化拆分：
 * - types.ts - 类型定义
 * - constants.ts - 常量
 * - components/ - 子组件（FormRow、GenderButton、RelationPicker、PatientEditSkeleton）
 *
 * @see docs/小程序页面改造规范.md
 */

import { useState, useEffect, useCallback } from 'react'
import { Box, Text, ScrollView, Icon, Input } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import {
  FormRow,
  GenderButton,
  RelationPicker,
  PatientEditSkeleton,
} from './components'
import {
  wxScale,
  wxSafeAreaTop,
  defaultPatientForm,
} from './constants'
import { previewApi } from '../../../api'
import type { PatientEditPageProps, PatientForm, ThemeColors } from './types'

// ============================================================================
// 工具函数
// ============================================================================

/** 获取主题颜色 */
function getThemeColors(isDarkMode: boolean, primaryColor: string): ThemeColors {
  return {
    bgColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
    cardBg: isDarkMode ? '#2a2a2a' : '#ffffff',
    textPrimary: isDarkMode ? '#f3f4f6' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    textMuted: isDarkMode ? '#6b7280' : '#9ca3af',
    borderColor: isDarkMode ? '#3a3a3a' : '#e5e7eb',
    inputBg: isDarkMode ? '#1a1a1a' : '#f9fafb',
    primaryColor,
  }
}

/** 从生日计算年龄 */
function calculateAgeFromBirthday(birthday: string | null | undefined): string {
  if (!birthday) return ''
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age.toString()
}

/** 从年龄计算大概生日（用于提交，假设当年生日） */
function calculateBirthdayFromAge(age: string): string | undefined {
  const ageNum = parseInt(age, 10)
  if (isNaN(ageNum) || ageNum < 0) return undefined
  const today = new Date()
  const birthYear = today.getFullYear() - ageNum
  // 返回 YYYY-01-01 格式（假设1月1日）
  return `${birthYear}-01-01`
}

// ============================================================================
// 主组件
// ============================================================================

export function PatientEditPage({
  themeSettings,
  isDarkMode,
  patientId,
  onBack,
}: PatientEditPageProps) {
  // 是否为编辑模式
  const isEdit = !!patientId

  // 表单状态
  const [form, setForm] = useState<PatientForm>(defaultPatientForm)

  // 关系选择器状态
  const [showRelationPicker, setShowRelationPicker] = useState(false)

  // 加载状态（用于骨架屏）
  const [isLoading, setIsLoading] = useState(isEdit)

  // 提交加载状态
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 获取主题颜色
  const colors = getThemeColors(isDarkMode, themeSettings.primaryColor)
  const { bgColor, cardBg, textPrimary, textSecondary, textMuted, borderColor, inputBg, primaryColor } = colors

  // 加载就诊人数据
  const loadPatient = useCallback(async () => {
    if (!patientId) return
    setIsLoading(true)
    try {
      const patients = await previewApi.getPatients()
      const patient = patients.find((p) => p.id === patientId)
      if (patient) {
        setForm({
          name: patient.name,
          gender: (patient.gender === 'male' || patient.gender === 'female' ? patient.gender : 'male') as 'male' | 'female',
          age: calculateAgeFromBirthday((patient as { birthday?: string }).birthday),
          phone: patient.phone,
          idCard: patient.idCard || '',
          relation: patient.relation,
        })
      }
    } catch (error) {
      console.error('[PatientEditPage] 加载就诊人失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [patientId])

  // 编辑时加载数据
  useEffect(() => {
    if (isEdit && patientId) {
      loadPatient()
    }
  }, [isEdit, patientId, loadPatient])

  // 更新表单字段
  const updateField = <K extends keyof PatientForm>(key: K, value: PatientForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // 表单验证
  const validateForm = () => {
    if (!form.name.trim()) return false
    if (!form.phone.trim()) return false
    if (!form.age.trim()) return false
    return true
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // 构建提交数据
      const submitData = {
        name: form.name.trim(),
        gender: form.gender,
        birthday: calculateBirthdayFromAge(form.age),
        phone: form.phone.trim(),
        idCard: form.idCard.trim() || undefined,
        relation: form.relation,
      }

      if (isEdit && patientId) {
        // 更新就诊人
        await previewApi.updatePatient(patientId, submitData)
      } else {
        // 创建就诊人
        await previewApi.createPatient(submitData as Parameters<typeof previewApi.createPatient>[0])
      }
      // 返回列表页
      onBack?.()
    } catch (error) {
      console.error('[PatientEditPage] 保存就诊人失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 加载中显示骨架屏
  if (isLoading) {
    return <PatientEditSkeleton colors={colors} />
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
        paddingBottom: 16 * wxScale,
      }}
    >
      {/* 顶部导航栏 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          <Box
            onClick={onBack}
            style={{
              width: 32 * wxScale,
              height: 32 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="left" size={20 * wxScale} color="#fff" />
          </Box>
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 600, color: '#fff' }}>
            {isEdit ? '编辑就诊人' : '添加就诊人'}
          </Text>
          <Box style={{ width: 32 * wxScale }} />
        </Box>
      </Box>

      {/* 表单内容 */}
      <ScrollView
        style={{
          paddingLeft: 12 * wxScale,
          paddingRight: 12 * wxScale,
          paddingTop: 12 * wxScale,
        }}
      >
        {/* 基本信息卡片 */}
        <Box
          style={{
            borderRadius: 12 * wxScale,
            overflow: 'hidden',
            backgroundColor: cardBg,
          }}
        >
          {/* 姓名 */}
          <FormRow
            icon="user"
            label="姓名"
            required
            borderColor={borderColor}
            textMuted={textMuted}
            textSecondary={textSecondary}
          >
            <Input
              type="text"
              value={form.name}
              onChange={(value) => updateField('name', value)}
              placeholder="请输入真实姓名"
              style={{
                flex: 1,
                fontSize: 14 * wxScale,
                color: textPrimary,
                backgroundColor: 'transparent',
                textAlign: 'right',
                border: 'none',
                outline: 'none',
              }}
            />
          </FormRow>

          {/* 性别 */}
          <FormRow
            icon="peoples"
            label="性别"
            required
            borderColor={borderColor}
            textMuted={textMuted}
            textSecondary={textSecondary}
          >
            <Box
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 16 * wxScale,
              }}
            >
              <GenderButton
                selected={form.gender === 'male'}
                label="男"
                onClick={() => updateField('gender', 'male')}
                primaryColor={primaryColor}
                inputBg={inputBg}
                textSecondary={textSecondary}
                borderColor={borderColor}
              />
              <GenderButton
                selected={form.gender === 'female'}
                label="女"
                onClick={() => updateField('gender', 'female')}
                primaryColor={primaryColor}
                inputBg={inputBg}
                textSecondary={textSecondary}
                borderColor={borderColor}
              />
            </Box>
          </FormRow>

          {/* 年龄 */}
          <FormRow
            icon="calendar"
            label="年龄"
            required
            borderColor={borderColor}
            textMuted={textMuted}
            textSecondary={textSecondary}
          >
            <Input
              type="number"
              value={form.age}
              onChange={(value) => updateField('age', value)}
              placeholder="请输入年龄"
              style={{
                flex: 1,
                fontSize: 14 * wxScale,
                color: textPrimary,
                backgroundColor: 'transparent',
                textAlign: 'right',
                border: 'none',
                outline: 'none',
              }}
            />
            <Text style={{ marginLeft: 4 * wxScale, fontSize: 14 * wxScale, color: textMuted }}>
              岁
            </Text>
          </FormRow>

          {/* 手机号 */}
          <FormRow
            icon="phone"
            label="手机号"
            required
            borderColor={borderColor}
            textMuted={textMuted}
            textSecondary={textSecondary}
          >
            <Input
              type="tel"
              value={form.phone}
              onChange={(value) => updateField('phone', value)}
              placeholder="请输入手机号"
              maxLength={11}
              style={{
                flex: 1,
                fontSize: 14 * wxScale,
                color: textPrimary,
                backgroundColor: 'transparent',
                textAlign: 'right',
                border: 'none',
                outline: 'none',
              }}
            />
          </FormRow>

          {/* 身份证号 */}
          <FormRow
            icon="id-card-h"
            label="身份证号"
            borderColor={borderColor}
            textMuted={textMuted}
            textSecondary={textSecondary}
          >
            <Input
              type="text"
              value={form.idCard}
              onChange={(value) => updateField('idCard', value.toUpperCase())}
              placeholder="选填"
              maxLength={18}
              style={{
                flex: 1,
                fontSize: 14 * wxScale,
                color: textPrimary,
                backgroundColor: 'transparent',
                textAlign: 'right',
                border: 'none',
                outline: 'none',
              }}
            />
          </FormRow>

          {/* 与本人关系 */}
          <FormRow
            icon="peoples"
            label="关系"
            required
            borderColor={borderColor}
            textMuted={textMuted}
            textSecondary={textSecondary}
            showBorder={false}
            onClick={() => setShowRelationPicker(true)}
          >
            <Box
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14 * wxScale,
                  color: form.relation ? textPrimary : textMuted,
                }}
              >
                {form.relation || '请选择'}
              </Text>
              <Icon name="down" size={16 * wxScale} color={textMuted} />
            </Box>
          </FormRow>
        </Box>

        {/* 提示信息 */}
        <Box style={{ paddingLeft: 8 * wxScale, paddingRight: 8 * wxScale, marginTop: 12 * wxScale }}>
          <Text style={{ fontSize: 12 * wxScale, color: textMuted, lineHeight: 1.5 }}>
            <Text style={{ color: '#ef4444' }}>*</Text> 为必填项，请如实填写就诊人信息，以便医院核实身份。
          </Text>
        </Box>
      </ScrollView>

      {/* 底部保存按钮 */}
      <Box
        style={{
          position: 'fixed',
          bottom: isWxEnvironment() ? 80 * wxScale : 80,
          left: 0,
          right: 0,
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
        }}
      >
        <Box
          onClick={!validateForm() || isSubmitting ? undefined : handleSubmit}
          style={{
            width: '100%',
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
            borderRadius: 12 * wxScale,
            backgroundColor: primaryColor,
            opacity: !validateForm() || isSubmitting ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: '#fff' }}>
            {isSubmitting ? '保存中...' : '保存'}
          </Text>
        </Box>
      </Box>

      {/* 关系选择器 */}
      <RelationPicker
        visible={showRelationPicker}
        value={form.relation}
        onSelect={(value) => updateField('relation', value)}
        onClose={() => setShowRelationPicker(false)}
        colors={colors}
      />
    </Box>
  )
}
