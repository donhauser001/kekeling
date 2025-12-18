/**
 * 就诊人编辑页面（预览器版本）
 *
 * 添加或编辑就诊人信息
 * - page key: 'patient-edit'
 * - 新增时无 id，编辑时有 id
 */

import { useState, useEffect } from 'react'
import { ArrowLeft, User, Phone, CreditCard, Calendar, Users, ChevronDown, Check } from 'lucide-react'
import type { ThemeSettings } from '../../types'

// ============================================================================
// 类型定义
// ============================================================================

export interface PatientEditPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  patientId?: string
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

/** 就诊人表单数据 */
interface PatientForm {
  name: string
  gender: 'male' | 'female'
  age: string
  phone: string
  idCard: string
  relation: string
}

/** 关系选项 */
const relationOptions = [
  '本人',
  '配偶',
  '父母',
  '子女',
  '兄弟姐妹',
  '其他亲属',
  '朋友',
  '其他',
]

// Mock 就诊人数据（用于编辑回填）
const mockPatientData: Record<string, PatientForm> = {
  '1': {
    name: '张三',
    gender: 'male',
    age: '35',
    phone: '13888888888',
    idCard: '110101199001011234',
    relation: '本人',
  },
  '2': {
    name: '李小明',
    gender: 'male',
    age: '8',
    phone: '13888888888',
    idCard: '110101201601015678',
    relation: '子女',
  },
  '3': {
    name: '王阿姨',
    gender: 'female',
    age: '62',
    phone: '13999999999',
    idCard: '110101196301019012',
    relation: '父母',
  },
}

// ============================================================================
// 组件实现
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
  const [form, setForm] = useState<PatientForm>({
    name: '',
    gender: 'male',
    age: '',
    phone: '',
    idCard: '',
    relation: '本人',
  })

  // 关系选择器状态
  const [showRelationPicker, setShowRelationPicker] = useState(false)

  // 提交加载状态
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 编辑时加载数据
  useEffect(() => {
    if (isEdit && patientId && mockPatientData[patientId]) {
      setForm(mockPatientData[patientId])
    }
  }, [isEdit, patientId])

  // 颜色定义
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const inputBg = isDarkMode ? '#1a1a1a' : '#f9fafb'

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
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSubmitting(false)

    // 返回列表页
    onBack?.()
  }

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full pb-4'>
      {/* 顶部导航栏 */}
      <div
        className='sticky top-0 z-20 flex items-center justify-between px-3 py-3'
        style={{ backgroundColor: themeSettings.primaryColor }}
      >
        <button
          onClick={onBack}
          className='w-8 h-8 flex items-center justify-center text-white'
        >
          <ArrowLeft className='h-5 w-5' />
        </button>
        <h1 className='text-base font-semibold text-white'>
          {isEdit ? '编辑就诊人' : '添加就诊人'}
        </h1>
        <div className='w-8' />
      </div>

      {/* 表单内容 */}
      <div className='px-3 pt-3 space-y-3'>
        {/* 基本信息卡片 */}
        <div
          className='rounded-xl overflow-hidden'
          style={{ backgroundColor: cardBg }}
        >
          {/* 姓名 */}
          <div className='flex items-center px-4 py-3 border-b' style={{ borderColor }}>
            <div className='flex items-center gap-3 w-24'>
              <User className='h-4 w-4' style={{ color: textMuted }} />
              <span className='text-sm' style={{ color: textSecondary }}>姓名</span>
              <span className='text-red-500'>*</span>
            </div>
            <input
              type='text'
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder='请输入真实姓名'
              className='flex-1 text-sm bg-transparent outline-none text-right'
              style={{ color: textPrimary }}
            />
          </div>

          {/* 性别 */}
          <div className='flex items-center px-4 py-3 border-b' style={{ borderColor }}>
            <div className='flex items-center gap-3 w-24'>
              <Users className='h-4 w-4' style={{ color: textMuted }} />
              <span className='text-sm' style={{ color: textSecondary }}>性别</span>
              <span className='text-red-500'>*</span>
            </div>
            <div className='flex-1 flex justify-end gap-4'>
              <button
                onClick={() => updateField('gender', 'male')}
                className='flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors'
                style={{
                  backgroundColor: form.gender === 'male' ? `${themeSettings.primaryColor}20` : inputBg,
                  color: form.gender === 'male' ? themeSettings.primaryColor : textSecondary,
                  border: form.gender === 'male' ? `1px solid ${themeSettings.primaryColor}` : `1px solid ${borderColor}`,
                }}
              >
                {form.gender === 'male' && <Check className='h-3 w-3' />}
                男
              </button>
              <button
                onClick={() => updateField('gender', 'female')}
                className='flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors'
                style={{
                  backgroundColor: form.gender === 'female' ? `${themeSettings.primaryColor}20` : inputBg,
                  color: form.gender === 'female' ? themeSettings.primaryColor : textSecondary,
                  border: form.gender === 'female' ? `1px solid ${themeSettings.primaryColor}` : `1px solid ${borderColor}`,
                }}
              >
                {form.gender === 'female' && <Check className='h-3 w-3' />}
                女
              </button>
            </div>
          </div>

          {/* 年龄 */}
          <div className='flex items-center px-4 py-3 border-b' style={{ borderColor }}>
            <div className='flex items-center gap-3 w-24'>
              <Calendar className='h-4 w-4' style={{ color: textMuted }} />
              <span className='text-sm' style={{ color: textSecondary }}>年龄</span>
              <span className='text-red-500'>*</span>
            </div>
            <input
              type='number'
              value={form.age}
              onChange={(e) => updateField('age', e.target.value)}
              placeholder='请输入年龄'
              className='flex-1 text-sm bg-transparent outline-none text-right'
              style={{ color: textPrimary }}
              min='0'
              max='150'
            />
            <span className='ml-1 text-sm' style={{ color: textMuted }}>岁</span>
          </div>

          {/* 手机号 */}
          <div className='flex items-center px-4 py-3 border-b' style={{ borderColor }}>
            <div className='flex items-center gap-3 w-24'>
              <Phone className='h-4 w-4' style={{ color: textMuted }} />
              <span className='text-sm' style={{ color: textSecondary }}>手机号</span>
              <span className='text-red-500'>*</span>
            </div>
            <input
              type='tel'
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder='请输入手机号'
              className='flex-1 text-sm bg-transparent outline-none text-right'
              style={{ color: textPrimary }}
              maxLength={11}
            />
          </div>

          {/* 身份证号 */}
          <div className='flex items-center px-4 py-3 border-b' style={{ borderColor }}>
            <div className='flex items-center gap-3 w-24'>
              <CreditCard className='h-4 w-4' style={{ color: textMuted }} />
              <span className='text-sm' style={{ color: textSecondary }}>身份证号</span>
            </div>
            <input
              type='text'
              value={form.idCard}
              onChange={(e) => updateField('idCard', e.target.value.toUpperCase())}
              placeholder='选填'
              className='flex-1 text-sm bg-transparent outline-none text-right'
              style={{ color: textPrimary }}
              maxLength={18}
            />
          </div>

          {/* 与本人关系 */}
          <div
            className='flex items-center px-4 py-3 cursor-pointer'
            onClick={() => setShowRelationPicker(true)}
          >
            <div className='flex items-center gap-3 w-24'>
              <Users className='h-4 w-4' style={{ color: textMuted }} />
              <span className='text-sm' style={{ color: textSecondary }}>关系</span>
              <span className='text-red-500'>*</span>
            </div>
            <div className='flex-1 flex items-center justify-end gap-1'>
              <span className='text-sm' style={{ color: form.relation ? textPrimary : textMuted }}>
                {form.relation || '请选择'}
              </span>
              <ChevronDown className='h-4 w-4' style={{ color: textMuted }} />
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className='px-2'>
          <p className='text-xs' style={{ color: textMuted }}>
            <span className='text-red-500'>*</span> 为必填项，请如实填写就诊人信息，以便医院核实身份。
          </p>
        </div>
      </div>

      {/* 底部保存按钮 */}
      <div className='fixed bottom-20 left-0 right-0 px-4'>
        <button
          onClick={handleSubmit}
          disabled={!validateForm() || isSubmitting}
          className='w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50'
          style={{ backgroundColor: themeSettings.primaryColor }}
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>

      {/* 关系选择器 */}
      {showRelationPicker && (
        <>
          {/* 遮罩层 */}
          <div
            className='fixed inset-0 bg-black/50 z-40'
            onClick={() => setShowRelationPicker(false)}
          />
          {/* 选择器面板 */}
          <div
            className='fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl max-h-[60vh] overflow-hidden'
            style={{ backgroundColor: cardBg }}
          >
            <div className='flex items-center justify-between px-4 py-3 border-b' style={{ borderColor }}>
              <button
                onClick={() => setShowRelationPicker(false)}
                className='text-sm'
                style={{ color: textSecondary }}
              >
                取消
              </button>
              <span className='text-sm font-medium' style={{ color: textPrimary }}>
                选择关系
              </span>
              <button
                onClick={() => setShowRelationPicker(false)}
                className='text-sm'
                style={{ color: themeSettings.primaryColor }}
              >
                确定
              </button>
            </div>
            <div className='overflow-y-auto max-h-[50vh]'>
              {relationOptions.map(option => (
                <div
                  key={option}
                  className='flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors'
                  style={{ borderBottom: `1px solid ${borderColor}` }}
                  onClick={() => {
                    updateField('relation', option)
                    setShowRelationPicker(false)
                  }}
                >
                  <span className='text-sm' style={{ color: textPrimary }}>{option}</span>
                  {form.relation === option && (
                    <Check className='h-4 w-4' style={{ color: themeSettings.primaryColor }} />
                  )}
                </div>
              ))}
            </div>
            {/* 底部安全区 */}
            <div className='h-8' />
          </div>
        </>
      )}
    </div>
  )
}
