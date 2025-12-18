/**
 * 下单页预览组件
 * 用户选择服务后进入的订单创建页面
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  User,
  Plus,
  Building2,
  Stethoscope,
  UserRound,
  Calendar,
  Clock,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Ticket,
  Shield,
  CreditCard,
  Phone,
  Users,
  Type,
  FileText,
  FileImage,
  Camera,
  X,
  ImageIcon,
} from '../../ui/lucide-compat'
import { cn } from '@/lib/utils'
import type { ThemeSettings } from '../../types'
import { previewApi } from '../../api'
import type { CustomField } from '../../api'
import { getResourceUrl } from '../../utils'
import { getWxBridge } from '../../bridge'

interface CreateOrderPageProps {
  serviceId: string
  themeSettings: ThemeSettings
  isDarkMode?: boolean
  onBack?: () => void
  onNavigate?: (page: string, params?: Record<string, string>) => void
}

// 模拟就诊人数据
const mockPatients = [
  { id: '1', name: '张三', relation: 'self', phone: '138****8888', idCard: '110***********1234', gender: '男' },
  { id: '2', name: '李四', relation: 'parent', phone: '139****9999', idCard: '110***********5678', gender: '女' },
]

// 模拟医院数据
const mockHospitals = [
  { id: '1', name: '北京协和医院', address: '北京市东城区帅府园一号' },
  { id: '2', name: '北京大学第一医院', address: '北京市西城区西什库大街8号' },
  { id: '3', name: '中日友好医院', address: '北京市朝阳区樱花园东街' },
]

// 模拟科室数据
const mockDepartments = [
  { id: '1', name: '内科' },
  { id: '2', name: '外科' },
  { id: '3', name: '妇产科' },
  { id: '4', name: '儿科' },
  { id: '5', name: '骨科' },
]

// 模拟医生数据
const mockDoctors = [
  { id: '1', name: '王医生', title: '主任医师', department: '内科' },
  { id: '2', name: '李医生', title: '副主任医师', department: '外科' },
  { id: '3', name: '张医生', title: '主治医师', department: '妇产科' },
]

// 模拟优惠券数据
const mockCoupons = [
  { id: '1', name: '新人专享券', amount: 20, minAmount: 100 },
  { id: '2', name: '满减优惠券', amount: 10, minAmount: 50 },
]

// 模拟病历本数据
const mockMedicalRecords = [
  {
    id: '1',
    title: '高血压复诊',
    hospital: '北京协和医院',
    department: '心内科',
    date: '2024-12-01',
    diagnosis: '原发性高血压',
    patientName: '张三',
  },
  {
    id: '2',
    title: '胃镜检查',
    hospital: '北京大学第一医院',
    department: '消化内科',
    date: '2024-11-15',
    diagnosis: '慢性浅表性胃炎',
    patientName: '张三',
  },
  {
    id: '3',
    title: '骨科复查',
    hospital: '中日友好医院',
    department: '骨科',
    date: '2024-10-20',
    diagnosis: '腰椎间盘突出',
    patientName: '李四',
  },
]

// 内置字段配置
const BUILTIN_FIELD_CONFIG: Record<string, { icon: React.ElementType; label: string }> = {
  needPatient: { icon: User, label: '就诊人' },
  needHospital: { icon: Building2, label: '就诊医院' },
  needDepartment: { icon: Stethoscope, label: '就诊科室' },
  needDoctor: { icon: UserRound, label: '选择医生' },
  needAppointment: { icon: Calendar, label: '预约时间' },
  needIdCard: { icon: CreditCard, label: '身份证号' },
  needGender: { icon: Users, label: '性别' },
  needEmergencyContact: { icon: Phone, label: '紧急联系人' },
  needMedicalRecord: { icon: FileImage, label: '病历本' },
}

// 默认字段排序
const DEFAULT_FIELD_ORDER = [
  'needPatient',
  'needHospital',
  'needDepartment',
  'needDoctor',
  'needAppointment',
  'needIdCard',
  'needGender',
  'needEmergencyContact',
  'needMedicalRecord',
]

export function CreateOrderPage({
  serviceId,
  themeSettings,
  isDarkMode = false,
  onBack,
  onNavigate,
}: CreateOrderPageProps) {
  // "下单后填写"开关状态
  const [fillLater, setFillLater] = useState(false)

  // 表单状态
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null)
  const [idCard, setIdCard] = useState('')
  const [gender, setGender] = useState<string | null>(null)
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '' })
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | string[]>>({})
  const [selectedMedicalRecordId, setSelectedMedicalRecordId] = useState<string | null>(null)
  const [remark, setRemark] = useState('')
  const [quantity, setQuantity] = useState(1)

  // 选择器弹窗状态
  const [showPatientPicker, setShowPatientPicker] = useState(false)
  const [showHospitalPicker, setShowHospitalPicker] = useState(false)
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false)
  const [showDoctorPicker, setShowDoctorPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showCouponPicker, setShowCouponPicker] = useState(false)
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [showEmergencyContactInput, setShowEmergencyContactInput] = useState(false)
  const [showIdCardInput, setShowIdCardInput] = useState(false)
  const [showMedicalRecordPicker, setShowMedicalRecordPicker] = useState(false)

  // 获取服务详情
  const { data: service, isLoading } = useQuery({
    queryKey: ['preview', 'serviceDetail', serviceId],
    queryFn: () => previewApi.getServiceDetail(serviceId),
    enabled: !!serviceId,
  })

  // 深色模式颜色
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const headerBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
  const inputBg = isDarkMode ? '#3a3a3a' : '#f9fafb'

  // 获取选中的数据
  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId)
  const selectedHospital = mockHospitals.find(h => h.id === selectedHospitalId)
  const selectedDepartment = mockDepartments.find(d => d.id === selectedDepartmentId)
  const selectedDoctor = mockDoctors.find(d => d.id === selectedDoctorId)
  const selectedCoupon = mockCoupons.find(c => c.id === selectedCouponId)
  const selectedMedicalRecord = mockMedicalRecords.find(r => r.id === selectedMedicalRecordId)

  // 计算价格
  const servicePrice = service?.price || 0
  const totalPrice = servicePrice * quantity
  const couponDiscount = selectedCoupon && totalPrice >= selectedCoupon.minAmount ? selectedCoupon.amount : 0
  const finalPrice = Math.max(0, totalPrice - couponDiscount)

  // 生成日期选项（未来7天）
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return {
      value: date.toISOString().split('T')[0],
      label: i === 0 ? '今天' : i === 1 ? '明天' : weekDays[date.getDay()],
      date: `${date.getMonth() + 1}月${date.getDate()}日`,
    }
  })

  // 生成时间选项
  const timeOptions = [
    { value: '08:00', label: '08:00-09:00' },
    { value: '09:00', label: '09:00-10:00' },
    { value: '10:00', label: '10:00-11:00' },
    { value: '11:00', label: '11:00-12:00' },
    { value: '14:00', label: '14:00-15:00' },
    { value: '15:00', label: '15:00-16:00' },
    { value: '16:00', label: '16:00-17:00' },
  ]

  // 检查是否有需要填写的字段
  const hasRequiredFields = service && (
    service.needPatient !== false ||
    service.needHospital ||
    service.needDepartment ||
    service.needDoctor ||
    service.needAppointment !== false ||
    service.needIdCard ||
    service.needGender ||
    service.needEmergencyContact ||
    service.needMedicalRecord ||
    (service.customFields && service.customFields.length > 0)
  )

  // 获取字段排序（确保新增字段也能显示）
  const savedFieldOrder = service?.fieldOrder || []
  // 合并：保存的顺序 + 默认顺序中未保存的字段
  const fieldOrder = [
    ...savedFieldOrder,
    ...DEFAULT_FIELD_ORDER.filter(key => !savedFieldOrder.includes(key))
  ]

  if (isLoading) {
    return (
      <div style={{ backgroundColor: bgColor }} className='min-h-full flex items-center justify-center'>
        <div className='flex flex-col items-center'>
          <div
            className='h-8 w-8 animate-spin rounded-full border-2 border-t-transparent'
            style={{ borderColor: `${themeSettings.primaryColor} transparent` }}
          />
          <p className='mt-3 text-sm' style={{ color: textMuted }}>加载中...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div style={{ backgroundColor: bgColor }} className='min-h-full flex items-center justify-center'>
        <div className='flex flex-col items-center'>
          <AlertCircle className='h-12 w-12' style={{ color: textMuted }} />
          <p className='mt-3 text-sm' style={{ color: textMuted }}>服务不存在</p>
          <button
            className='mt-4 px-4 py-2 rounded-full text-sm'
            style={{ backgroundColor: themeSettings.primaryColor, color: '#fff' }}
            onClick={onBack}
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  // 选择项组件
  const SelectItem = ({
    icon: Icon,
    label,
    value,
    placeholder,
    required,
    onClick,
    isLast,
  }: {
    icon: React.ElementType
    label: string
    value?: string | null
    placeholder: string
    required?: boolean
    onClick: () => void
    isLast?: boolean
  }) => (
    <div
      className='flex items-center justify-between py-3 cursor-pointer active:opacity-60'
      style={{ borderBottom: isLast ? 'none' : `1px solid ${borderColor}` }}
      onClick={onClick}
    >
      <div className='flex items-center gap-3'>
        <Icon className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
        <span className='text-sm' style={{ color: textPrimary }}>
          {label}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
        </span>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm' style={{ color: value ? textPrimary : textMuted }}>
          {value || placeholder}
        </span>
        <ChevronRight className='h-4 w-4' style={{ color: textMuted }} />
      </div>
    </div>
  )

  // 判断字段是否必填
  const isFieldRequired = (fieldKey: string): boolean => {
    return service.builtinFieldsRequired?.[fieldKey] ?? true
  }

  // 渲染内置字段
  const renderBuiltinField = (fieldKey: string, isLast: boolean) => {
    const config = BUILTIN_FIELD_CONFIG[fieldKey]
    if (!config) return null

    switch (fieldKey) {
      case 'needPatient':
        if (service.needPatient === false) return null
        return (
          <SelectItem
            key={fieldKey}
            icon={config.icon}
            label={config.label}
            value={selectedPatient?.name}
            placeholder='请选择就诊人'
            required={isFieldRequired('needPatient')}
            onClick={() => setShowPatientPicker(true)}
            isLast={isLast}
          />
        )
      case 'needHospital':
        if (!service.needHospital) return null
        return (
          <SelectItem
            key={fieldKey}
            icon={config.icon}
            label={config.label}
            value={selectedHospital?.name}
            placeholder='请选择医院'
            required={isFieldRequired('needHospital')}
            onClick={() => setShowHospitalPicker(true)}
            isLast={isLast}
          />
        )
      case 'needDepartment':
        if (!service.needDepartment) return null
        return (
          <SelectItem
            key={fieldKey}
            icon={config.icon}
            label={config.label}
            value={selectedDepartment?.name}
            placeholder='请选择科室'
            required={isFieldRequired('needDepartment')}
            onClick={() => setShowDepartmentPicker(true)}
            isLast={isLast}
          />
        )
      case 'needDoctor':
        if (!service.needDoctor) return null
        return (
          <SelectItem
            key={fieldKey}
            icon={config.icon}
            label={config.label}
            value={selectedDoctor?.name}
            placeholder='请选择医生'
            required={isFieldRequired('needDoctor')}
            onClick={() => setShowDoctorPicker(true)}
            isLast={isLast}
          />
        )
      case 'needAppointment':
        if (service.needAppointment === false) return null
        return (
          <div key={fieldKey}>
            <SelectItem
              icon={Calendar}
              label='预约日期'
              value={selectedDate ? dateOptions.find(d => d.value === selectedDate)?.date : null}
              placeholder='请选择日期'
              required={isFieldRequired('needAppointment')}
              onClick={() => setShowDatePicker(true)}
            />
            <SelectItem
              icon={Clock}
              label='预约时间'
              value={selectedTime ? timeOptions.find(t => t.value === selectedTime)?.label : null}
              placeholder='请选择时间'
              required={isFieldRequired('needAppointment')}
              onClick={() => setShowTimePicker(true)}
              isLast={isLast}
            />
          </div>
        )
      case 'needIdCard':
        if (!service.needIdCard) return null
        return (
          <SelectItem
            key={fieldKey}
            icon={config.icon}
            label={config.label}
            value={idCard || null}
            placeholder='请输入身份证号'
            required={isFieldRequired('needIdCard')}
            onClick={() => setShowIdCardInput(true)}
            isLast={isLast}
          />
        )
      case 'needGender':
        if (!service.needGender) return null
        return (
          <SelectItem
            key={fieldKey}
            icon={config.icon}
            label={config.label}
            value={gender}
            placeholder='请选择性别'
            required={isFieldRequired('needGender')}
            onClick={() => setShowGenderPicker(true)}
            isLast={isLast}
          />
        )
      case 'needEmergencyContact':
        if (!service.needEmergencyContact) return null
        return (
          <SelectItem
            key={fieldKey}
            icon={config.icon}
            label={config.label}
            value={emergencyContact.name ? `${emergencyContact.name} ${emergencyContact.phone}` : null}
            placeholder='请填写紧急联系人'
            required={isFieldRequired('needEmergencyContact')}
            onClick={() => setShowEmergencyContactInput(true)}
            isLast={isLast}
          />
        )
      case 'needMedicalRecord':
        if (!service.needMedicalRecord) return null
        return (
          <SelectItem
            key={fieldKey}
            icon={config.icon}
            label={config.label}
            value={selectedMedicalRecord?.title}
            placeholder='请选择病历'
            required={isFieldRequired('needMedicalRecord')}
            onClick={() => setShowMedicalRecordPicker(true)}
            isLast={isLast}
          />
        )
      default:
        return null
    }
  }

  // 获取启用的内置字段
  const enabledBuiltinFields = fieldOrder.filter(key => {
    switch (key) {
      case 'needPatient': return service.needPatient !== false
      case 'needHospital': return service.needHospital
      case 'needDepartment': return service.needDepartment
      case 'needDoctor': return service.needDoctor
      case 'needAppointment': return service.needAppointment !== false
      case 'needIdCard': return service.needIdCard
      case 'needGender': return service.needGender
      case 'needEmergencyContact': return service.needEmergencyContact
      case 'needMedicalRecord': return service.needMedicalRecord
      default: return false
    }
  })

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full pb-24'>
      {/* 顶部导航栏 */}
      <div
        className='sticky top-0 z-20 flex items-center justify-between px-4 py-3'
        style={{ backgroundColor: headerBg, borderBottom: `1px solid ${borderColor}` }}
      >
        <button
          onClick={onBack}
          className='flex items-center gap-1 text-sm'
          style={{ color: textPrimary }}
        >
          <ArrowLeft className='h-5 w-5' />
        </button>
        <span className='text-base font-medium' style={{ color: textPrimary }}>确认订单</span>
        <div className='w-6' />
      </div>

      {/* 服务信息卡片 */}
      <div className='mx-3 mt-3 rounded-xl p-3' style={{ backgroundColor: cardBg }}>
        <div className='flex gap-3'>
          {/* 服务图片 */}
          <div
            className='w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center'
            style={{ backgroundColor: inputBg }}
          >
            {service.coverImage ? (
              <img
                src={getResourceUrl(service.coverImage)}
                alt={service.name}
                className='w-full h-full object-cover'
              />
            ) : (
              <Stethoscope className='h-8 w-8' style={{ color: textMuted }} />
            )}
          </div>
          {/* 服务信息 */}
          <div className='flex-1 min-w-0'>
            <h3 className='text-sm font-medium truncate' style={{ color: textPrimary }}>
              {service.name}
            </h3>
            {service.description && (
              <p className='text-xs mt-1 line-clamp-2' style={{ color: textSecondary }}>
                {service.description}
              </p>
            )}
            <div className='flex items-baseline gap-1 mt-2'>
              <span className='text-xs' style={{ color: themeSettings.primaryColor }}>¥</span>
              <span className='text-lg font-bold' style={{ color: themeSettings.primaryColor }}>
                {service.price}
              </span>
              {service.unit && (
                <span className='text-xs' style={{ color: textMuted }}>/{service.unit}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 就诊信息 */}
      {hasRequiredFields && (
        <div className='mx-3 mt-3 rounded-xl' style={{ backgroundColor: cardBg }}>
          {/* 卡片头部 */}
          <div
            className='flex items-center justify-between px-4 py-3'
            style={{ borderBottom: fillLater ? 'none' : `1px solid ${borderColor}` }}
          >
            <span className='text-sm font-medium' style={{ color: textPrimary }}>就诊信息</span>
            {/* 下单后填写开关 - 仅当 allowPostOrder 为 true 时显示 */}
            {service.allowPostOrder && (
              <div
                className='flex items-center gap-2 cursor-pointer'
                onClick={() => setFillLater(!fillLater)}
              >
                <span className='text-xs' style={{ color: textSecondary }}>下单后填写</span>
                <div
                  className='relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0'
                  style={{ backgroundColor: fillLater ? themeSettings.primaryColor : '#e5e7eb' }}
                >
                  <span
                    className='absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200'
                    style={{ transform: fillLater ? 'translateX(18px)' : 'translateX(0)' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 折叠提示 */}
          {fillLater && (
            <div
              className='px-4 py-3 flex items-center gap-2 cursor-pointer'
              onClick={() => setFillLater(false)}
            >
              <ChevronDown className='h-4 w-4' style={{ color: textMuted }} />
              <span className='text-xs' style={{ color: textSecondary }}>
                下单后可在订单详情补充就诊信息
              </span>
            </div>
          )}

          {/* 表单字段 - 未折叠时显示 */}
          {!fillLater && (
            <div className='px-4'>
              {/* 根据 fieldOrder 渲染内置字段 */}
              {enabledBuiltinFields.map((fieldKey, index) =>
                renderBuiltinField(fieldKey, index === enabledBuiltinFields.length - 1 && (!service.customFields || service.customFields.length === 0))
              )}

              {/* 自定义字段 */}
              {service.customFields && service.customFields.map((field, index) => {
                const isLast = index === service.customFields!.length - 1
                // 图片类型字段
                if (field.type === 'image') {
                  const images = (customFieldValues[field.id] as string[]) || []
                  const maxImages = field.maxImages || 9
                  return (
                    <div key={field.id} style={{ borderBottom: isLast ? 'none' : `1px solid ${borderColor}` }}>
                      <div className='flex items-center justify-between py-3'>
                        <div className='flex items-center gap-3'>
                          <ImageIcon className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
                          <span className='text-sm' style={{ color: textPrimary }}>
                            {field.label}
                            {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                          </span>
                        </div>
                        <button
                          className='flex items-center gap-1 px-3 py-1.5 rounded-full text-xs'
                          style={{ backgroundColor: `${themeSettings.primaryColor}10`, color: themeSettings.primaryColor }}
                          onClick={async () => {
                            if (images.length >= maxImages) {
                              const wxBridge = getWxBridge()
                              wxBridge.showToast({ title: `最多上传${maxImages}张图片`, icon: 'none' })
                              return
                            }

                            try {
                              // 宿主能力对接：通过 WxBridge 选择图片
                              const wxBridge = getWxBridge()
                              const result = await wxBridge.chooseImage({
                                count: maxImages - images.length,
                                sourceType: ['album', 'camera'],
                                sizeType: ['compressed'],
                              })

                              // 将选择的图片添加到表单
                              if (result.tempFilePaths.length > 0) {
                                setCustomFieldValues(prev => ({
                                  ...prev,
                                  [field.id]: [...images, ...result.tempFilePaths]
                                }))
                              }
                            } catch (err) {
                              // 用户取消选择，不做处理
                              console.log('[CreateOrderPage] 用户取消选择图片', err)
                            }
                          }}
                        >
                          <Camera className='h-3.5 w-3.5' />
                          上传图片
                        </button>
                      </div>
                      {/* 已上传的图片预览 */}
                      {images.length > 0 && (
                        <div className='flex gap-2 pb-3 overflow-x-auto'>
                          {images.map((img, idx) => (
                            <div key={idx} className='relative flex-shrink-0'>
                              <div className='w-16 h-16 rounded-lg overflow-hidden' style={{ backgroundColor: inputBg }}>
                                <img src={img} alt='' className='w-full h-full object-cover' />
                              </div>
                              <button
                                className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center'
                                onClick={() => {
                                  setCustomFieldValues(prev => ({
                                    ...prev,
                                    [field.id]: images.filter((_, i) => i !== idx)
                                  }))
                                }}
                              >
                                <X className='h-3 w-3 text-white' />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                // 其他类型字段
                return (
                  <SelectItem
                    key={field.id}
                    icon={field.type === 'textarea' ? FileText : Type}
                    label={field.label}
                    value={customFieldValues[field.id] as string || null}
                    placeholder={field.placeholder || `请输入${field.label}`}
                    required={field.required}
                    onClick={() => {
                      // TODO: 打开自定义字段输入弹窗
                    }}
                    isLast={isLast}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 优惠券 */}
      <div className='mx-3 mt-3 rounded-xl px-4' style={{ backgroundColor: cardBg }}>
        <SelectItem
          icon={Ticket}
          label='优惠券'
          value={selectedCoupon ? `-¥${selectedCoupon.amount}` : null}
          placeholder={`${mockCoupons.length}张可用`}
          onClick={() => setShowCouponPicker(true)}
          isLast
        />
      </div>

      {/* 备注 */}
      <div className='mx-3 mt-3 rounded-xl p-4' style={{ backgroundColor: cardBg }}>
        <div className='text-sm font-medium mb-2' style={{ color: textPrimary }}>备注</div>
        <textarea
          className='w-full h-20 p-3 rounded-lg text-sm resize-none outline-none'
          style={{
            backgroundColor: inputBg,
            color: textPrimary,
            border: `1px solid ${borderColor}`,
          }}
          placeholder='请输入备注信息（选填）'
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
      </div>

      {/* 服务保障 */}
      <div className='mx-3 mt-3 rounded-xl p-4' style={{ backgroundColor: cardBg }}>
        <div className='flex items-center gap-2 text-xs' style={{ color: textSecondary }}>
          <Shield className='h-4 w-4' style={{ color: '#10b981' }} />
          <span>平台担保 · 先服务后付款 · 不满意可退款</span>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div
        className='fixed bottom-0 left-0 right-0 z-30 px-4 py-3'
        style={{ backgroundColor: cardBg, borderTop: `1px solid ${borderColor}` }}
      >
        {/* 价格明细 */}
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-4 text-xs' style={{ color: textSecondary }}>
            <span>服务费 ¥{servicePrice}</span>
            {couponDiscount > 0 && (
              <span style={{ color: '#10b981' }}>优惠 -¥{couponDiscount}</span>
            )}
          </div>
          <div className='flex items-baseline gap-1'>
            <span className='text-xs' style={{ color: textSecondary }}>合计</span>
            <span className='text-sm' style={{ color: themeSettings.primaryColor }}>¥</span>
            <span className='text-xl font-bold' style={{ color: themeSettings.primaryColor }}>
              {finalPrice}
            </span>
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          className='w-full py-3 rounded-full text-base font-medium text-white transition-all active:scale-[0.98]'
          style={{ backgroundColor: themeSettings.primaryColor }}
          onClick={async () => {
            const wxBridge = getWxBridge()
            // 表单校验
            if (!selectedPatientId) {
              wxBridge.showToast({ title: '请选择就诊人', icon: 'none' })
              return
            }
            if (!selectedHospitalId) {
              wxBridge.showToast({ title: '请选择医院', icon: 'none' })
              return
            }
            if (!selectedDate) {
              wxBridge.showToast({ title: '请选择日期', icon: 'none' })
              return
            }

            // TODO: 调用后端创建订单 API 获取支付参数
            // const orderResult = await userRequest<CreateOrderResponse>('/orders', { method: 'POST', body: {...} })
            // const payParams = orderResult.data.payParams

            // 宿主能力对接：调用微信支付
            // 注：实际支付参数需从后端获取，以下为占位演示
            wxBridge.showToast({ title: '订单创建中...', icon: 'loading' })

            // 当后端 API 就绪后，取消注释以下代码：
            // const result = await wxBridge.requestPayment({
            //   timeStamp: payParams.timeStamp,
            //   nonceStr: payParams.nonceStr,
            //   package: payParams.package,
            //   signType: payParams.signType,
            //   paySign: payParams.paySign,
            // })
            // if (result.success) {
            //   wxBridge.showToast({ title: '支付成功', icon: 'success' })
            //   onNavigate?.('user-order-detail', { id: orderResult.data.orderId })
            // } else {
            //   wxBridge.showToast({ title: result.errMsg || '支付失败', icon: 'error' })
            // }
          }}
        >
          提交订单
        </button>
      </div>

      {/* ==================== 弹窗部分 ==================== */}

      {/* 就诊人选择弹窗 */}
      {showPatientPicker && (
        <PickerModal
          title='选择就诊人'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          borderColor={borderColor}
          primaryColor={themeSettings.primaryColor}
          onClose={() => setShowPatientPicker(false)}
        >
          {mockPatients.map((patient) => (
            <div
              key={patient.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                selectedPatientId === patient.id ? 'ring-2' : ''
              )}
              style={{
                backgroundColor: selectedPatientId === patient.id ? `${themeSettings.primaryColor}10` : 'transparent',
                ringColor: themeSettings.primaryColor,
              }}
              onClick={() => {
                setSelectedPatientId(patient.id)
                setShowPatientPicker(false)
              }}
            >
              <div className='flex items-center gap-3'>
                <div
                  className='w-10 h-10 rounded-full flex items-center justify-center'
                  style={{ backgroundColor: `${themeSettings.primaryColor}20` }}
                >
                  <UserRound className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
                </div>
                <div>
                  <div className='text-sm font-medium' style={{ color: textPrimary }}>
                    {patient.name}
                    <span className='ml-2 text-xs px-1.5 py-0.5 rounded' style={{ backgroundColor: `${themeSettings.primaryColor}15`, color: themeSettings.primaryColor }}>
                      {patient.relation === 'self' ? '本人' : '家属'}
                    </span>
                  </div>
                  <div className='text-xs mt-0.5' style={{ color: textMuted }}>{patient.phone}</div>
                </div>
              </div>
              {selectedPatientId === patient.id && (
                <CheckCircle className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
              )}
            </div>
          ))}
          {/* 添加就诊人 */}
          <div
            className='flex items-center justify-center gap-2 p-3 mt-2 rounded-lg border-2 border-dashed cursor-pointer'
            style={{ borderColor: themeSettings.primaryColor, color: themeSettings.primaryColor }}
            onClick={() => {
              setShowPatientPicker(false)
              onNavigate?.('patient-edit')
            }}
          >
            <Plus className='h-4 w-4' />
            <span className='text-sm'>添加就诊人</span>
          </div>
        </PickerModal>
      )}

      {/* 医院选择弹窗 */}
      {showHospitalPicker && (
        <PickerModal
          title='选择医院'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          borderColor={borderColor}
          primaryColor={themeSettings.primaryColor}
          onClose={() => setShowHospitalPicker(false)}
        >
          {mockHospitals.map((hospital) => (
            <div
              key={hospital.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors'
              )}
              style={{
                backgroundColor: selectedHospitalId === hospital.id ? `${themeSettings.primaryColor}10` : 'transparent',
              }}
              onClick={() => {
                setSelectedHospitalId(hospital.id)
                setShowHospitalPicker(false)
              }}
            >
              <div className='flex items-center gap-3'>
                <Building2 className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
                <div>
                  <div className='text-sm font-medium' style={{ color: textPrimary }}>{hospital.name}</div>
                  <div className='text-xs mt-0.5' style={{ color: textMuted }}>{hospital.address}</div>
                </div>
              </div>
              {selectedHospitalId === hospital.id && (
                <CheckCircle className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
              )}
            </div>
          ))}
        </PickerModal>
      )}

      {/* 科室选择弹窗 */}
      {showDepartmentPicker && (
        <PickerModal
          title='选择科室'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          borderColor={borderColor}
          primaryColor={themeSettings.primaryColor}
          onClose={() => setShowDepartmentPicker(false)}
        >
          <div className='grid grid-cols-3 gap-2'>
            {mockDepartments.map((dept) => (
              <div
                key={dept.id}
                className={cn(
                  'flex items-center justify-center py-3 rounded-lg cursor-pointer transition-colors text-sm'
                )}
                style={{
                  backgroundColor: selectedDepartmentId === dept.id ? themeSettings.primaryColor : `${themeSettings.primaryColor}10`,
                  color: selectedDepartmentId === dept.id ? '#fff' : themeSettings.primaryColor,
                }}
                onClick={() => {
                  setSelectedDepartmentId(dept.id)
                  setShowDepartmentPicker(false)
                }}
              >
                {dept.name}
              </div>
            ))}
          </div>
        </PickerModal>
      )}

      {/* 医生选择弹窗 */}
      {showDoctorPicker && (
        <PickerModal
          title='选择医生'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          borderColor={borderColor}
          primaryColor={themeSettings.primaryColor}
          onClose={() => setShowDoctorPicker(false)}
        >
          {mockDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors'
              )}
              style={{
                backgroundColor: selectedDoctorId === doctor.id ? `${themeSettings.primaryColor}10` : 'transparent',
              }}
              onClick={() => {
                setSelectedDoctorId(doctor.id)
                setShowDoctorPicker(false)
              }}
            >
              <div className='flex items-center gap-3'>
                <div
                  className='w-10 h-10 rounded-full flex items-center justify-center'
                  style={{ backgroundColor: `${themeSettings.primaryColor}20` }}
                >
                  <UserRound className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
                </div>
                <div>
                  <div className='text-sm font-medium' style={{ color: textPrimary }}>{doctor.name}</div>
                  <div className='text-xs mt-0.5' style={{ color: textMuted }}>{doctor.title} · {doctor.department}</div>
                </div>
              </div>
              {selectedDoctorId === doctor.id && (
                <CheckCircle className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
              )}
            </div>
          ))}
        </PickerModal>
      )}

      {/* 日期选择弹窗 */}
      {showDatePicker && (
        <PickerModal
          title='选择日期'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          borderColor={borderColor}
          primaryColor={themeSettings.primaryColor}
          onClose={() => setShowDatePicker(false)}
        >
          <div className='grid grid-cols-4 gap-2'>
            {dateOptions.map((date) => (
              <div
                key={date.value}
                className={cn(
                  'flex flex-col items-center py-3 rounded-lg cursor-pointer transition-colors'
                )}
                style={{
                  backgroundColor: selectedDate === date.value ? themeSettings.primaryColor : `${themeSettings.primaryColor}10`,
                  color: selectedDate === date.value ? '#fff' : themeSettings.primaryColor,
                }}
                onClick={() => {
                  setSelectedDate(date.value)
                  setShowDatePicker(false)
                }}
              >
                <span className='text-sm font-medium'>{date.label}</span>
                <span className='text-xs mt-0.5 opacity-80'>{date.date}</span>
              </div>
            ))}
          </div>
        </PickerModal>
      )}

      {/* 时间选择弹窗 */}
      {showTimePicker && (
        <PickerModal
          title='选择时间'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          borderColor={borderColor}
          primaryColor={themeSettings.primaryColor}
          onClose={() => setShowTimePicker(false)}
        >
          <div className='grid grid-cols-2 gap-2'>
            {timeOptions.map((time) => (
              <div
                key={time.value}
                className={cn(
                  'flex items-center justify-center py-3 rounded-lg cursor-pointer transition-colors text-sm'
                )}
                style={{
                  backgroundColor: selectedTime === time.value ? themeSettings.primaryColor : `${themeSettings.primaryColor}10`,
                  color: selectedTime === time.value ? '#fff' : themeSettings.primaryColor,
                }}
                onClick={() => {
                  setSelectedTime(time.value)
                  setShowTimePicker(false)
                }}
              >
                {time.label}
              </div>
            ))}
          </div>
        </PickerModal>
      )}

      {/* 性别选择弹窗 */}
      {showGenderPicker && (
        <PickerModal
          title='选择性别'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          borderColor={borderColor}
          primaryColor={themeSettings.primaryColor}
          onClose={() => setShowGenderPicker(false)}
        >
          <div className='grid grid-cols-2 gap-3'>
            {['男', '女'].map((g) => (
              <div
                key={g}
                className='flex items-center justify-center py-4 rounded-lg cursor-pointer transition-colors text-sm font-medium'
                style={{
                  backgroundColor: gender === g ? themeSettings.primaryColor : `${themeSettings.primaryColor}10`,
                  color: gender === g ? '#fff' : themeSettings.primaryColor,
                }}
                onClick={() => {
                  setGender(g)
                  setShowGenderPicker(false)
                }}
              >
                {g}
              </div>
            ))}
          </div>
        </PickerModal>
      )}

      {/* 身份证输入弹窗 */}
      {showIdCardInput && (
        <InputModal
          title='输入身份证号'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textMuted={textMuted}
          borderColor={borderColor}
          inputBg={inputBg}
          primaryColor={themeSettings.primaryColor}
          value={idCard}
          placeholder='请输入18位身份证号码'
          onClose={() => setShowIdCardInput(false)}
          onConfirm={(value) => {
            setIdCard(value)
            setShowIdCardInput(false)
          }}
        />
      )}

      {/* 紧急联系人输入弹窗 */}
      {showEmergencyContactInput && (
        <PickerModal
          title='紧急联系人'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          borderColor={borderColor}
          primaryColor={themeSettings.primaryColor}
          onClose={() => setShowEmergencyContactInput(false)}
        >
          <div className='space-y-3'>
            <div>
              <label className='text-xs mb-1 block' style={{ color: textSecondary }}>姓名</label>
              <input
                type='text'
                className='w-full px-3 py-2.5 rounded-lg text-sm outline-none'
                style={{ backgroundColor: inputBg, color: textPrimary, border: `1px solid ${borderColor}` }}
                placeholder='请输入联系人姓名'
                value={emergencyContact.name}
                onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className='text-xs mb-1 block' style={{ color: textSecondary }}>电话</label>
              <input
                type='tel'
                className='w-full px-3 py-2.5 rounded-lg text-sm outline-none'
                style={{ backgroundColor: inputBg, color: textPrimary, border: `1px solid ${borderColor}` }}
                placeholder='请输入联系人电话'
                value={emergencyContact.phone}
                onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <button
              className='w-full py-2.5 rounded-lg text-sm font-medium text-white mt-2'
              style={{ backgroundColor: themeSettings.primaryColor }}
              onClick={() => setShowEmergencyContactInput(false)}
            >
              确定
            </button>
          </div>
        </PickerModal>
      )}

      {/* 病历选择弹窗 */}
      {showMedicalRecordPicker && (
        <PickerModal
          title='选择病历'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          borderColor={borderColor}
          primaryColor={themeSettings.primaryColor}
          onClose={() => setShowMedicalRecordPicker(false)}
        >
          {mockMedicalRecords.length === 0 ? (
            <div className='py-8 text-center'>
              <FileImage className='h-12 w-12 mx-auto mb-3' style={{ color: textMuted }} />
              <p className='text-sm' style={{ color: textMuted }}>暂无病历记录</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {mockMedicalRecords.map((record) => (
                <div
                  key={record.id}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-colors',
                    selectedMedicalRecordId === record.id ? 'ring-2' : ''
                  )}
                  style={{
                    backgroundColor: selectedMedicalRecordId === record.id ? `${themeSettings.primaryColor}10` : inputBg,
                    ringColor: themeSettings.primaryColor,
                  }}
                  onClick={() => {
                    setSelectedMedicalRecordId(record.id)
                    setShowMedicalRecordPicker(false)
                  }}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium truncate' style={{ color: textPrimary }}>
                          {record.title}
                        </span>
                        <span
                          className='text-xs px-1.5 py-0.5 rounded flex-shrink-0'
                          style={{ backgroundColor: `${themeSettings.primaryColor}15`, color: themeSettings.primaryColor }}
                        >
                          {record.patientName}
                        </span>
                      </div>
                      <div className='text-xs mt-1' style={{ color: textSecondary }}>
                        {record.hospital} · {record.department}
                      </div>
                      <div className='flex items-center gap-3 mt-1.5'>
                        <span className='text-xs' style={{ color: textMuted }}>{record.date}</span>
                        <span className='text-xs' style={{ color: textMuted }}>诊断：{record.diagnosis}</span>
                      </div>
                    </div>
                    {selectedMedicalRecordId === record.id && (
                      <CheckCircle className='h-5 w-5 flex-shrink-0 ml-2' style={{ color: themeSettings.primaryColor }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* 添加病历 */}
          <div
            className='flex items-center justify-center gap-2 p-3 mt-3 rounded-lg border-2 border-dashed cursor-pointer'
            style={{ borderColor: themeSettings.primaryColor, color: themeSettings.primaryColor }}
            onClick={() => {
              setShowMedicalRecordPicker(false)
              onNavigate?.('medical-record-edit')  // 跳转到病历编辑页（功能待开发）
            }}
          >
            <Plus className='h-4 w-4' />
            <span className='text-sm'>添加新病历</span>
          </div>
        </PickerModal>
      )}

      {/* 优惠券选择弹窗 */}
      {showCouponPicker && (
        <PickerModal
          title='选择优惠券'
          cardBg={cardBg}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          borderColor={borderColor}
          primaryColor={themeSettings.primaryColor}
          onClose={() => setShowCouponPicker(false)}
        >
          {/* 不使用优惠券 */}
          <div
            className={cn(
              'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors mb-2'
            )}
            style={{
              backgroundColor: selectedCouponId === null ? `${themeSettings.primaryColor}10` : 'transparent',
            }}
            onClick={() => {
              setSelectedCouponId(null)
              setShowCouponPicker(false)
            }}
          >
            <span className='text-sm' style={{ color: textPrimary }}>不使用优惠券</span>
            {selectedCouponId === null && (
              <CheckCircle className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
            )}
          </div>
          {mockCoupons.map((coupon) => {
            const canUse = totalPrice >= coupon.minAmount
            return (
              <div
                key={coupon.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                  !canUse && 'opacity-50 cursor-not-allowed'
                )}
                style={{
                  backgroundColor: selectedCouponId === coupon.id ? `${themeSettings.primaryColor}10` : 'transparent',
                }}
                onClick={() => {
                  if (canUse) {
                    setSelectedCouponId(coupon.id)
                    setShowCouponPicker(false)
                  }
                }}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className='px-3 py-2 rounded-lg text-center'
                    style={{ backgroundColor: `${themeSettings.primaryColor}15` }}
                  >
                    <div className='text-lg font-bold' style={{ color: themeSettings.primaryColor }}>
                      ¥{coupon.amount}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm font-medium' style={{ color: textPrimary }}>{coupon.name}</div>
                    <div className='text-xs mt-0.5' style={{ color: textMuted }}>满{coupon.minAmount}元可用</div>
                  </div>
                </div>
                {selectedCouponId === coupon.id && (
                  <CheckCircle className='h-5 w-5' style={{ color: themeSettings.primaryColor }} />
                )}
              </div>
            )
          })}
        </PickerModal>
      )}
    </div>
  )
}

// 选择器弹窗组件
function PickerModal({
  title,
  cardBg,
  textPrimary,
  textMuted,
  borderColor,
  primaryColor,
  onClose,
  children,
}: {
  title: string
  cardBg: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  borderColor: string
  primaryColor: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center'
      onClick={onClose}
    >
      {/* 遮罩 */}
      <div className='absolute inset-0 bg-black/50' />
      {/* 弹窗内容 */}
      <div
        className='relative w-full max-w-md max-h-[70vh] rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-300'
        style={{ backgroundColor: cardBg }}
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部 */}
        <div
          className='sticky top-0 z-10 flex items-center justify-between px-4 py-3'
          style={{ backgroundColor: cardBg, borderBottom: `1px solid ${borderColor}` }}
        >
          <div className='w-10' />
          <span className='text-base font-medium' style={{ color: textPrimary }}>{title}</span>
          <button
            className='text-sm'
            style={{ color: primaryColor }}
            onClick={onClose}
          >
            取消
          </button>
        </div>
        {/* 内容 */}
        <div className='p-4 overflow-y-auto max-h-[60vh]'>
          {children}
        </div>
      </div>
    </div>
  )
}

// 输入弹窗组件
function InputModal({
  title,
  cardBg,
  textPrimary,
  textMuted,
  borderColor,
  inputBg,
  primaryColor,
  value,
  placeholder,
  onClose,
  onConfirm,
}: {
  title: string
  cardBg: string
  textPrimary: string
  textMuted: string
  borderColor: string
  inputBg: string
  primaryColor: string
  value: string
  placeholder: string
  onClose: () => void
  onConfirm: (value: string) => void
}) {
  const [inputValue, setInputValue] = useState(value)

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center'
      onClick={onClose}
    >
      {/* 遮罩 */}
      <div className='absolute inset-0 bg-black/50' />
      {/* 弹窗内容 */}
      <div
        className='relative w-full max-w-md rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-300'
        style={{ backgroundColor: cardBg }}
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部 */}
        <div
          className='flex items-center justify-between px-4 py-3'
          style={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <button className='text-sm' style={{ color: textMuted }} onClick={onClose}>取消</button>
          <span className='text-base font-medium' style={{ color: textPrimary }}>{title}</span>
          <button className='text-sm' style={{ color: primaryColor }} onClick={() => onConfirm(inputValue)}>确定</button>
        </div>
        {/* 输入框 */}
        <div className='p-4'>
          <input
            type='text'
            className='w-full px-3 py-3 rounded-lg text-sm outline-none'
            style={{ backgroundColor: inputBg, color: textPrimary, border: `1px solid ${borderColor}` }}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
        </div>
      </div>
    </div>
  )
}
