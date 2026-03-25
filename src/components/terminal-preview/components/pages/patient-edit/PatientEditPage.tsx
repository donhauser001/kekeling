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
import { Picker } from '@tarojs/components'
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
  relationLabelMap,
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

function normalizeBirthday(birthday: string | null | undefined): string {
  if (!birthday) return ''
  return birthday.slice(0, 10)
}

function extractBirthdayFromIdCard(idCard: string | null | undefined): string {
  if (!idCard) return ''
  const normalized = idCard.trim().toUpperCase()
  if (/^\d{17}[\dX]$/.test(normalized)) {
    return `${normalized.slice(6, 10)}-${normalized.slice(10, 12)}-${normalized.slice(12, 14)}`
  }
  if (/^\d{15}$/.test(normalized)) {
    return `19${normalized.slice(6, 8)}-${normalized.slice(8, 10)}-${normalized.slice(10, 12)}`
  }
  return ''
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

// ============================================================================
// 主组件
// ============================================================================

export function PatientEditPage({
  themeSettings,
  isDarkMode,
  patientId,
  onBack,
  onNavigate,
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
          birthday: normalizeBirthday(patient.birthday) || extractBirthdayFromIdCard(patient.idCard),
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
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'idCard' && typeof value === 'string') {
        const birthday = extractBirthdayFromIdCard(value)
        if (birthday) {
          next.birthday = birthday
        }
      }
      return next
    })
  }

  // 表单验证
  const validateForm = () => {
    if (!form.name.trim()) return false
    if (!form.phone.trim()) return false
    if (!form.birthday.trim()) return false
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
        birthday: form.birthday,
        phone: form.phone.trim(),
        idCard: form.idCard.trim() || undefined,
        relation: form.relation,
      }

      if (isEdit && patientId) {
        // 更新就诊人
        const updatedPatient = await previewApi.updatePatient(patientId, submitData)
        onNavigate?.('patients', {
          selectedPatientId: updatedPatient.id,
          action: 'updated',
        })
      } else {
        // 创建就诊人
        const createdPatient = await previewApi.createPatient(submitData as Parameters<typeof previewApi.createPatient>[0])
        onNavigate?.('patients', {
          selectedPatientId: createdPatient.id,
          action: 'created',
        })
      }
      if (!onNavigate) {
        onBack?.()
      }
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

  const ageDisplay = calculateAgeFromBirthday(form.birthday)
  const todayDate = getTodayDateString()

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
        paddingBottom: 16 * wxScale,
      }}
    >
      {/* 顶部导航栏 - 符合规范 3.3.2 */}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          {/* 返回按钮（绝对定位左侧） */}
          <Box
            onClick={onBack}
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
          {/* 标题（居中） */}
          <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
            {isEdit ? '编辑就诊人' : '添加就诊人'}
          </Text>
          {/* 右侧区域留空，不放操作按钮（避免胶囊遮挡） */}
        </Box>
      </Box>

      {/* 表单内容 */}
      <ScrollView style={{ flex: 1 }}>
        {/* 内容容器 - 小程序中 ScrollView 的 padding 可能不生效，用 Box 包裹 */}
        <Box
          style={{
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 100 * wxScale,
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

            {/* 出生日期 */}
            <FormRow
              icon="date-comes-back"
              label="出生日期"
              required
              borderColor={borderColor}
              textMuted={textMuted}
              textSecondary={textSecondary}
            >
              <Picker
                mode="date"
                value={form.birthday || todayDate}
                end={todayDate}
                onChange={(e) => updateField('birthday', e.detail.value)}
              >
                <Box
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 4 * wxScale,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14 * wxScale,
                      color: form.birthday ? textPrimary : textMuted,
                    }}
                  >
                    {form.birthday || '请选择出生日期'}
                  </Text>
                  <Icon name="down" size={16 * wxScale} color={textMuted} />
                </Box>
              </Picker>
            </FormRow>

            {/* 年龄（自动生成） */}
            <FormRow
              icon="time"
              label="年龄"
              required
              borderColor={borderColor}
              textMuted={textMuted}
              textSecondary={textSecondary}
            >
              <Box
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 4 * wxScale,
                }}
              >
                <Text
                  style={{
                    fontSize: 14 * wxScale,
                    color: ageDisplay ? textPrimary : textMuted,
                  }}
                >
                  {ageDisplay ? `${ageDisplay} 岁` : '选择出生日期后自动计算'}
                </Text>
              </Box>
            </FormRow>

            {/* 手机号 */}
            <FormRow
              icon="phone-telephone"
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
                  {form.relation ? relationLabelMap[form.relation] : '请选择'}
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
          onClick={handleSubmit}
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
