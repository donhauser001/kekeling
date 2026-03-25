/**
 * 申请表单组件
 * 按《小程序页面改造规范》改造
 */

import { useEffect, useMemo, useState } from 'react'
import { Box, Text, Button, Input, Icon, Image } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { getFullResourceUrl } from '../../../../platform/config'
import { previewApi } from '../../../../api'
import type { ApplyFormData, InviterInfo, ThemeColors } from '../types'
import { GENDER_OPTIONS, PRODUCT_LINE_OPTIONS } from '../constants'

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
  onViewAgreement?: () => void
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
  onViewAgreement,
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
    productLine: '',
    productName: '',
    foreignLanguage: '',
    education: '',
  })
  const [inviter, setInviter] = useState<InviterInfo | null>(null)
  const [inviteCodeError, setInviteCodeError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hospitalOptions, setHospitalOptions] = useState<Array<{ id: string; name: string }>>([])
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([])
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [showHospitalPicker, setShowHospitalPicker] = useState(false)
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false)
  const [showProductLinePicker, setShowProductLinePicker] = useState(false)
  const [useCustomHospitals, setUseCustomHospitals] = useState(false)
  const [useCustomDepartments, setUseCustomDepartments] = useState(false)
  const [customHospitalInput, setCustomHospitalInput] = useState('')
  const [customDepartmentInput, setCustomDepartmentInput] = useState('')

  const parseCustomValues = (value: string) =>
    value
      .split(/[、,，\n]/)
      .map((item) => item.trim())
      .filter(Boolean)

  const selectedHospitalNames = useMemo(
    () => hospitalOptions
      .filter((option) => selectedHospitalIds.includes(option.id))
      .map((option) => option.name),
    [hospitalOptions, selectedHospitalIds]
  )

  const customHospitalValues = useMemo(
    () => (useCustomHospitals ? parseCustomValues(customHospitalInput) : []),
    [useCustomHospitals, customHospitalInput]
  )

  const customDepartmentValues = useMemo(
    () => (useCustomDepartments ? parseCustomValues(customDepartmentInput) : []),
    [useCustomDepartments, customDepartmentInput]
  )

  useEffect(() => {
    previewApi.getHospitals({ pageSize: 200 })
      .then((result) => {
        setHospitalOptions(result?.data || [])
      })
      .catch((error) => {
        console.warn('[ApplyForm] 获取医院列表失败:', error)
      })
  }, [])

  useEffect(() => {
    if (selectedHospitalIds.length === 0) {
      setDepartmentOptions([])
      setSelectedDepartments([])
      setFormData((prev) => ({ ...prev, departments: customDepartmentValues }))
      return
    }

    Promise.all(selectedHospitalIds.map((hospitalId) => previewApi.getHospitalDepartments(hospitalId)))
      .then((results) => {
        const names = Array.from(new Set(results.flatMap((departments) => flattenDepartmentNames(departments))))
        setDepartmentOptions(names)
        setSelectedDepartments((prev) => prev.filter((item) => names.includes(item)))
      })
      .catch((error) => {
        console.warn('[ApplyForm] 获取科室列表失败:', error)
      })
  }, [selectedHospitalIds])

  useEffect(() => {
    setFormData((prev) => ({ ...prev, hospitals: [...selectedHospitalNames, ...customHospitalValues] }))
    if (selectedHospitalNames.length > 0 || customHospitalValues.length > 0) {
      setErrors((prev) => ({ ...prev, hospitals: '' }))
    }
  }, [selectedHospitalNames, customHospitalValues])

  useEffect(() => {
    setFormData((prev) => ({ ...prev, departments: [...selectedDepartments, ...customDepartmentValues] }))
    if (selectedDepartments.length > 0 || customDepartmentValues.length > 0) {
      setErrors((prev) => ({ ...prev, departments: '' }))
    }
  }, [selectedDepartments, customDepartmentValues])

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.productLine && prev.productName ? `${prev.productLine}：${prev.productName}` : '',
    }))
  }, [formData.productLine, formData.productName])

  useEffect(() => {
    if (formData.productLine) {
      setErrors((prev) => ({ ...prev, productLine: '' }))
    }
  }, [formData.productLine])

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
    if (!formData.age.trim()) {
      newErrors.age = '请输入年龄'
    }
    if (formData.hospitals.length === 0) {
      newErrors.hospitals = '请选择服务医院'
    }
    if (formData.departments.length === 0) {
      newErrors.departments = '请选择擅长科室'
    }
    if (!formData.specialties.trim()) {
      newErrors.specialties = '请输入擅长病种'
    }
    if (!formData.productLine.trim()) {
      newErrors.productLine = '请选择既往产品线'
    }
    if (!formData.productName.trim()) {
      newErrors.productName = '请输入具体产品名称'
    }
    if (!formData.education.trim()) {
      newErrors.education = '请输入学历'
    }
    if (!formData.foreignLanguage.trim()) {
      newErrors.foreignLanguage = '请输入外语能力'
    }
    if (!agreedToTerms) {
      newErrors.agreement = '请先勾选并同意陪诊员服务协议'
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
          专业信息
        </Text>

        {/* 年龄（自动从身份证计算） */}
        <FormItem label="年龄" required error={errors.age} colors={colors}>
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
        <FormItem label="服务医院" required error={errors.hospitals} colors={colors}>
          <SelectorField
            value={formData.hospitals.join('、')}
            placeholder="请选择服务医院"
            colors={colors}
            onClick={() => setShowHospitalPicker(true)}
          />
        </FormItem>

        {/* 擅长科室 */}
        <FormItem label="擅长科室" required error={errors.departments} colors={colors}>
          <SelectorField
            value={formData.departments.join('、')}
            placeholder="请选择擅长科室"
            colors={colors}
            onClick={() => setShowDepartmentPicker(true)}
          />
        </FormItem>

        {/* 擅长病种 */}
        <FormItem label="擅长病种" required error={errors.specialties} colors={colors}>
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

        {/* 既往产品线 */}
        <FormItem label="既往产品线" required error={errors.productLine} colors={colors}>
          <SelectorField
            value={formData.productLine}
            placeholder="请选择既往产品线"
            colors={colors}
            onClick={() => setShowProductLinePicker(true)}
          />
        </FormItem>

        <FormItem label="产品名称" required error={errors.productName} colors={colors}>
          <Input
            value={formData.productName}
            onChange={(value) => updateField('productName', value)}
            placeholder="请输入具体产品名称"
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>

        {/* 学历 */}
        <FormItem label="学历" required error={errors.education} colors={colors}>
          <Input
            value={formData.education}
            onChange={(value) => updateField('education', value)}
            placeholder="如：本科、大专"
            style={{
              flex: 1,
              fontSize: 14 * wxScale,
              color: colors.textPrimary,
              backgroundColor: 'transparent',
            }}
          />
        </FormItem>

        {/* 外语能力 */}
        <FormItem label="外语能力" required error={errors.foreignLanguage} colors={colors} noBorder>
          <Input
            value={formData.foreignLanguage}
            onChange={(value) => updateField('foreignLanguage', value)}
            placeholder="如：英语六级、日语N1"
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
      <Box
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 8 * wxScale,
          marginTop: 16 * wxScale,
        }}
      >
        <Box
          onClick={() => {
            setAgreedToTerms((prev) => !prev)
            setErrors((prev) => ({ ...prev, agreement: '' }))
          }}
          style={{
            width: 16 * wxScale,
            height: 16 * wxScale,
            marginTop: 2 * wxScale,
            borderRadius: 4 * wxScale,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: agreedToTerms ? primaryColor : colors.borderColor,
            backgroundColor: agreedToTerms ? primaryColor : colors.cardBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {agreedToTerms ? <Icon name="check-one" size={12 * wxScale} color="#ffffff" /> : null}
        </Box>
        <Text
          style={{
            display: 'block',
            fontSize: 12 * wxScale,
            color: colors.textMuted,
            textAlign: 'left',
            lineHeight: 1.6,
          }}
        >
          勾选即表示同意
          <Text
            onClick={onViewAgreement}
            style={{
              color: primaryColor,
              textDecorationLine: 'underline',
            }}
          >
            《陪诊员服务协议》
          </Text>
        </Text>
      </Box>
      {errors.agreement ? (
        <Text
          style={{
            display: 'block',
            marginTop: 6 * wxScale,
            fontSize: 12 * wxScale,
            color: '#ef4444',
            textAlign: 'center',
          }}
        >
          {errors.agreement}
        </Text>
      ) : null}

      <MultiSelectModal
        open={showHospitalPicker}
        title="选择服务医院"
        options={hospitalOptions.map((item) => ({ value: item.id, label: item.name }))}
        selectedValues={selectedHospitalIds}
        useCustom={useCustomHospitals}
        customValue={customHospitalInput}
        customPlaceholder="请输入其他医院，多个用顿号分隔"
        onClose={() => setShowHospitalPicker(false)}
        onToggleValue={(value) => {
          setSelectedHospitalIds((prev) => (
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
          ))
        }}
        onToggleCustom={(checked) => {
          setUseCustomHospitals(checked)
          if (!checked) {
            setCustomHospitalInput('')
          }
        }}
        onCustomValueChange={setCustomHospitalInput}
      />

      <MultiSelectModal
        open={showDepartmentPicker}
        title="选择擅长科室"
        options={departmentOptions.map((item) => ({ value: item, label: item }))}
        selectedValues={selectedDepartments}
        useCustom={useCustomDepartments}
        customValue={customDepartmentInput}
        customPlaceholder="请输入其他科室，多个用顿号分隔"
        emptyText={selectedHospitalIds.length === 0 ? '请先选择服务医院' : '暂无可选科室'}
        onClose={() => setShowDepartmentPicker(false)}
        onToggleValue={(value) => {
          setSelectedDepartments((prev) => (
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
          ))
        }}
        onToggleCustom={(checked) => {
          setUseCustomDepartments(checked)
          if (!checked) {
            setCustomDepartmentInput('')
          }
        }}
        onCustomValueChange={setCustomDepartmentInput}
      />

      <SingleSelectModal
        open={showProductLinePicker}
        title="选择既往产品线"
        options={PRODUCT_LINE_OPTIONS}
        selectedValue={formData.productLine}
        onClose={() => setShowProductLinePicker(false)}
        onSelect={(value) => {
          updateField('productLine', value)
          setShowProductLinePicker(false)
        }}
      />
    </Box>
  )
}

function flattenDepartmentNames(
  departments: Array<{ name: string; children?: Array<{ name: string; children?: any[] }> }>
): string[] {
  return departments.flatMap((department) => [
    department.name,
    ...(department.children ? flattenDepartmentNames(department.children) : []),
  ]).filter(Boolean)
}

function SelectorField({
  value,
  placeholder,
  colors,
  onClick,
  children,
}: {
  value?: string
  placeholder: string
  colors: ThemeColors
  onClick?: () => void
  children?: React.ReactNode
}) {
  if (children) {
    return <Box style={{ flex: 1 }}>{children}</Box>
  }

  return (
    <Button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8 * wxScale,
      }}
    >
      <Text
        style={{
          flex: 1,
          fontSize: 14 * wxScale,
          color: value ? colors.textPrimary : colors.textMuted,
          textAlign: 'left',
        }}
      >
        {value || placeholder}
      </Text>
      <Icon name="down" size={16 * wxScale} color={colors.textMuted} />
    </Button>
  )
}

function MultiSelectModal({
  open,
  title,
  options,
  selectedValues,
  useCustom,
  customValue,
  customPlaceholder,
  emptyText = '暂无可选项',
  onClose,
  onToggleValue,
  onToggleCustom,
  onCustomValueChange,
}: {
  open: boolean
  title: string
  options: Array<{ value: string; label: string }>
  selectedValues: string[]
  useCustom: boolean
  customValue: string
  customPlaceholder: string
  emptyText?: string
  onClose: () => void
  onToggleValue: (value: string) => void
  onToggleCustom: (checked: boolean) => void
  onCustomValueChange: (value: string) => void
}) {
  if (!open) return null

  return (
    <Box
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <Box
        style={{
          width: '100%',
          maxHeight: '70vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 16 * wxScale,
          borderTopRightRadius: 16 * wxScale,
          padding: 16 * wxScale,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 * wxScale }}>
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 600, color: '#111827' }}>{title}</Text>
          <Button onClick={onClose} style={{ padding: 4 * wxScale }}>
            <Icon name="close" size={18 * wxScale} color="#6b7280" />
          </Button>
        </Box>

        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 * wxScale, maxHeight: '52vh', overflowY: 'auto' }}>
          {options.length > 0 ? options.map((option) => {
            const checked = selectedValues.includes(option.value)
            return (
              <Button
                key={option.value}
                onClick={() => onToggleValue(option.value)}
                style={{
                  width: '100%',
                  padding: 12 * wxScale,
                  borderRadius: 10 * wxScale,
                  backgroundColor: checked ? '#22c55e' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 14 * wxScale, color: checked ? '#ffffff' : '#111827' }}>{option.label}</Text>
                {checked && <Icon name="check-one" size={16 * wxScale} color="#ffffff" />}
              </Button>
            )
          }) : (
            <Text style={{ fontSize: 13 * wxScale, color: '#6b7280' }}>{emptyText}</Text>
          )}

          <Button
            onClick={() => onToggleCustom(!useCustom)}
            style={{
              width: '100%',
              padding: 12 * wxScale,
              borderRadius: 10 * wxScale,
              backgroundColor: useCustom ? '#22c55e' : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 14 * wxScale, color: useCustom ? '#ffffff' : '#111827' }}>其他</Text>
            {useCustom && <Icon name="check-one" size={16 * wxScale} color="#ffffff" />}
          </Button>

          {useCustom && (
            <Box
              style={{
                paddingLeft: 12 * wxScale,
                paddingRight: 12 * wxScale,
                borderRadius: 10 * wxScale,
                backgroundColor: '#f9fafb',
              }}
            >
              <Input
                value={customValue}
                onChange={onCustomValueChange}
                placeholder={customPlaceholder}
                style={{
                  width: '100%',
                  height: 44 * wxScale,
                  fontSize: 14 * wxScale,
                  color: '#111827',
                  backgroundColor: 'transparent',
                }}
              />
            </Box>
          )}
        </Box>

        <Button
          onClick={onClose}
          style={{
            width: '100%',
            height: 44 * wxScale,
            marginTop: 16 * wxScale,
            borderRadius: 22 * wxScale,
            backgroundColor: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 15 * wxScale, color: '#ffffff', fontWeight: 500 }}>完成</Text>
        </Button>
      </Box>
    </Box>
  )
}

function SingleSelectModal({
  open,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
}: {
  open: boolean
  title: string
  options: string[]
  selectedValue: string
  onClose: () => void
  onSelect: (value: string) => void
}) {
  if (!open) return null

  return (
    <Box
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <Box
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 16 * wxScale,
          borderTopRightRadius: 16 * wxScale,
          padding: 16 * wxScale,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 * wxScale }}>
          <Text style={{ fontSize: 16 * wxScale, fontWeight: 600, color: '#111827' }}>{title}</Text>
          <Button onClick={onClose} style={{ padding: 4 * wxScale }}>
            <Icon name="close" size={18 * wxScale} color="#6b7280" />
          </Button>
        </Box>

        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 * wxScale }}>
          {options.map((option) => {
            const checked = selectedValue === option
            return (
              <Button
                key={option}
                onClick={() => onSelect(option)}
                style={{
                  width: '100%',
                  padding: 12 * wxScale,
                  borderRadius: 10 * wxScale,
                  backgroundColor: checked ? '#22c55e' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 14 * wxScale, color: checked ? '#ffffff' : '#111827' }}>{option}</Text>
                {checked && <Icon name="check-one" size={16 * wxScale} color="#ffffff" />}
              </Button>
            )
          })}
        </Box>
      </Box>
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
        }}
      >
        <Box
          style={{
            width: 108 * wxScale,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 14 * wxScale,
              fontWeight: 500,
              color: colors.textPrimary,
            }}
          >
            {label}
          </Text>
          <Text style={{ fontSize: 14 * wxScale, color: colors.textMuted }}>：</Text>
          {required && (
            <Text style={{ fontSize: 14 * wxScale, color: '#ef4444' }}>*</Text>
          )}
        </Box>
        <Box
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minWidth: 0,
            marginLeft: 8 * wxScale,
          }}
        >
          {children}
        </Box>
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
