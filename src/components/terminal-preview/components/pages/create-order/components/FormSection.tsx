/**
 * 就诊信息表单区域组件
 * 按《小程序页面改造规范》改造
 */

import { Box, Text, Image, Icon, Button } from '../../../../ui/primitives'
import { isWxEnvironment } from '../../../../platform/env'
import { getWxBridge } from '../../../../bridge'
import { SelectItem } from './SelectItem'
import type {
  Patient,
  Hospital,
  Department,
  Doctor,
  MedicalRecord,
  DateOption,
  TimeOption,
  EmergencyContact,
  ThemeColors,
} from '../types'
import type { CustomField } from '../../../../api'

const wxScale = isWxEnvironment() ? 1.1 : 1

// 内置字段配置（图标名称需与 iconfont 一致）
const BUILTIN_FIELD_CONFIG: Record<string, { icon: string; label: string }> = {
  needPatient: { icon: 'user', label: '就诊人' },
  needHospital: { icon: 'hospital', label: '就诊医院' },
  needDepartment: { icon: 'stethoscope', label: '就诊科室' },
  needDoctor: { icon: 'peoples', label: '选择医生' },
  needAppointment: { icon: 'appointment', label: '预约时间' },
  needIdCard: { icon: 'clipboard', label: '身份证号' },
  needGender: { icon: 'people', label: '性别' },
  needEmergencyContact: { icon: 'phone-telephone', label: '紧急联系人' },
  needMedicalRecord: { icon: 'medical-files', label: '病历本' },
}

interface FormSectionProps {
  service: {
    needPatient?: boolean
    needHospital?: boolean
    needDepartment?: boolean
    needDoctor?: boolean
    needAppointment?: boolean
    needIdCard?: boolean
    needGender?: boolean
    needEmergencyContact?: boolean
    needMedicalRecord?: boolean
    allowPostOrder?: boolean
    fieldOrder?: string[]
    customFields?: CustomField[]
    builtinFieldsRequired?: Record<string, boolean>
  }
  fillLater: boolean
  setFillLater: (value: boolean) => void
  // 选中的数据
  selectedPatient?: Patient
  selectedHospital?: Hospital
  selectedDepartment?: Department
  selectedDoctor?: Doctor
  selectedDate?: string
  selectedTime?: string
  idCard: string
  gender: string | null
  emergencyContact: EmergencyContact
  selectedMedicalRecord?: MedicalRecord
  customFieldValues: Record<string, string | string[]>
  // 打开选择器
  onOpenPatientPicker: () => void
  onOpenHospitalPicker: () => void
  onOpenDepartmentPicker: () => void
  onOpenDoctorPicker: () => void
  onOpenDatePicker: () => void
  onOpenTimePicker: () => void
  onOpenIdCardInput: () => void
  onOpenGenderPicker: () => void
  onOpenEmergencyContactInput: () => void
  onOpenMedicalRecordPicker: () => void
  // 自定义字段
  onCustomFieldChange: (fieldId: string, value: string | string[]) => void
  // 样式
  colors: ThemeColors
  primaryColor: string
  dateOptions: DateOption[]
  timeOptions: TimeOption[]
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

export function FormSection({
  service,
  fillLater,
  setFillLater,
  selectedPatient,
  selectedHospital,
  selectedDepartment,
  selectedDoctor,
  selectedDate,
  selectedTime,
  idCard,
  gender,
  emergencyContact,
  selectedMedicalRecord,
  customFieldValues,
  onOpenPatientPicker,
  onOpenHospitalPicker,
  onOpenDepartmentPicker,
  onOpenDoctorPicker,
  onOpenDatePicker,
  onOpenTimePicker,
  onOpenIdCardInput,
  onOpenGenderPicker,
  onOpenEmergencyContactInput,
  onOpenMedicalRecordPicker,
  onCustomFieldChange,
  colors,
  primaryColor,
  dateOptions,
  timeOptions,
}: FormSectionProps) {
  const { cardBg, textPrimary, textSecondary, textMuted, borderColor, inputBg } = colors

  // 判断字段是否必填
  const isFieldRequired = (fieldKey: string): boolean => {
    return service.builtinFieldsRequired?.[fieldKey] ?? true
  }

  // 获取字段排序
  const savedFieldOrder = service.fieldOrder || []
  const fieldOrder = [
    ...savedFieldOrder,
    ...DEFAULT_FIELD_ORDER.filter((key) => !savedFieldOrder.includes(key)),
  ]

  // 获取启用的内置字段
  const enabledBuiltinFields = fieldOrder.filter((key) => {
    switch (key) {
      case 'needPatient':
        return service.needPatient !== false
      case 'needHospital':
        return service.needHospital
      case 'needDepartment':
        return service.needDepartment
      case 'needDoctor':
        return service.needDoctor
      case 'needAppointment':
        return service.needAppointment !== false
      case 'needIdCard':
        return service.needIdCard
      case 'needGender':
        return service.needGender
      case 'needEmergencyContact':
        return service.needEmergencyContact
      case 'needMedicalRecord':
        return service.needMedicalRecord
      default:
        return false
    }
  })

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
            placeholder="请选择就诊人"
            required={isFieldRequired('needPatient')}
            onClick={onOpenPatientPicker}
            isLast={isLast}
            colors={colors}
            primaryColor={primaryColor}
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
            placeholder="请选择医院"
            required={isFieldRequired('needHospital')}
            onClick={onOpenHospitalPicker}
            isLast={isLast}
            colors={colors}
            primaryColor={primaryColor}
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
            placeholder="请选择科室"
            required={isFieldRequired('needDepartment')}
            onClick={onOpenDepartmentPicker}
            isLast={isLast}
            colors={colors}
            primaryColor={primaryColor}
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
            placeholder="请选择医生"
            required={isFieldRequired('needDoctor')}
            onClick={onOpenDoctorPicker}
            isLast={isLast}
            colors={colors}
            primaryColor={primaryColor}
          />
        )
      case 'needAppointment':
        if (service.needAppointment === false) return null
        return (
          <Box key={fieldKey}>
            <SelectItem
              icon="appointment"
              label="预约日期"
              value={
                selectedDate
                  ? dateOptions.find((d) => d.value === selectedDate)?.date
                  : null
              }
              placeholder="请选择日期"
              required={isFieldRequired('needAppointment')}
              onClick={onOpenDatePicker}
              colors={colors}
              primaryColor={primaryColor}
            />
            <SelectItem
              icon="time"
              label="预约时间"
              value={
                selectedTime
                  ? timeOptions.find((t) => t.value === selectedTime)?.label
                  : null
              }
              placeholder="请选择时间"
              required={isFieldRequired('needAppointment')}
              onClick={onOpenTimePicker}
              isLast={isLast}
              colors={colors}
              primaryColor={primaryColor}
            />
          </Box>
        )
      case 'needIdCard':
        if (!service.needIdCard) return null
        return (
          <SelectItem
            key={fieldKey}
            icon={config.icon}
            label={config.label}
            value={idCard || null}
            placeholder="请输入身份证号"
            required={isFieldRequired('needIdCard')}
            onClick={onOpenIdCardInput}
            isLast={isLast}
            colors={colors}
            primaryColor={primaryColor}
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
            placeholder="请选择性别"
            required={isFieldRequired('needGender')}
            onClick={onOpenGenderPicker}
            isLast={isLast}
            colors={colors}
            primaryColor={primaryColor}
          />
        )
      case 'needEmergencyContact':
        if (!service.needEmergencyContact) return null
        return (
          <SelectItem
            key={fieldKey}
            icon={config.icon}
            label={config.label}
            value={
              emergencyContact.name
                ? `${emergencyContact.name} ${emergencyContact.phone}`
                : null
            }
            placeholder="请填写紧急联系人"
            required={isFieldRequired('needEmergencyContact')}
            onClick={onOpenEmergencyContactInput}
            isLast={isLast}
            colors={colors}
            primaryColor={primaryColor}
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
            placeholder="请选择病历"
            required={isFieldRequired('needMedicalRecord')}
            onClick={onOpenMedicalRecordPicker}
            isLast={isLast}
            colors={colors}
            primaryColor={primaryColor}
          />
        )
      default:
        return null
    }
  }

  // 渲染自定义字段
  const renderCustomField = (field: CustomField, isLast: boolean) => {
    // 图片类型字段
    if (field.type === 'image') {
      const images = (customFieldValues[field.id] as string[]) || []
      const maxImages = field.maxImages || 9

      return (
        <Box
          key={field.id}
          style={{
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomStyle: 'solid',
            borderBottomColor: borderColor,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 12 * wxScale,
              paddingBottom: 12 * wxScale,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: 12 * wxScale }}>
              <Icon name="pic" size={20 * wxScale} color={primaryColor} />
              <Text style={{ fontSize: 14 * wxScale, color: textPrimary }}>
                {field.label}
                {field.required && <Text style={{ color: '#ef4444' }}>*</Text>}
              </Text>
            </Box>
            <Button
              onClick={async () => {
                if (images.length >= maxImages) {
                  const wxBridge = getWxBridge()
                  wxBridge.showToast({
                    title: `最多上传${maxImages}张图片`,
                    icon: 'none',
                  })
                  return
                }

                try {
                  const wxBridge = getWxBridge()
                  const result = await wxBridge.chooseImage({
                    count: maxImages - images.length,
                    sourceType: ['album', 'camera'],
                    sizeType: ['compressed'],
                  })

                  if (result.tempFilePaths.length > 0) {
                    onCustomFieldChange(field.id, [
                      ...images,
                      ...result.tempFilePaths,
                    ])
                  }
                } catch (err) {
                  console.log('[FormSection] 用户取消选择图片', err)
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4 * wxScale,
                paddingLeft: 12 * wxScale,
                paddingRight: 12 * wxScale,
                paddingTop: 6 * wxScale,
                paddingBottom: 6 * wxScale,
                borderRadius: 9999,
                fontSize: 12 * wxScale,
                backgroundColor: `${primaryColor}10`,
                color: primaryColor,
              }}
            >
              <Icon name="camera" size={14 * wxScale} color={primaryColor} />
              上传图片
            </Button>
          </Box>
          {/* 已上传的图片预览 */}
          {images.length > 0 && (
            <Box
              style={{
                display: 'flex',
                gap: 8 * wxScale,
                paddingBottom: 12 * wxScale,
                overflowX: 'auto',
              }}
            >
              {images.map((img, idx) => (
                <Box key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                  <Box
                    style={{
                      width: 64 * wxScale,
                      height: 64 * wxScale,
                      borderRadius: 8 * wxScale,
                      overflow: 'hidden',
                      backgroundColor: inputBg,
                    }}
                  >
                    <Image
                      src={img}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                  <Box
                    onClick={() => {
                      onCustomFieldChange(
                        field.id,
                        images.filter((_, i) => i !== idx)
                      )
                    }}
                    style={{
                      position: 'absolute',
                      top: -6 * wxScale,
                      right: -6 * wxScale,
                      width: 20 * wxScale,
                      height: 20 * wxScale,
                      borderRadius: 10 * wxScale,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    <Icon name="close" size={12 * wxScale} color="#fff" />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )
    }

    // 其他类型字段
    return (
      <SelectItem
        key={field.id}
        icon={field.type === 'textarea' ? 'file-text' : 'edit'}
        label={field.label}
        value={(customFieldValues[field.id] as string) || null}
        placeholder={field.placeholder || `请输入${field.label}`}
        required={field.required}
        onClick={() => {
          // TODO: 打开自定义字段输入弹窗
        }}
        isLast={isLast}
        colors={colors}
        primaryColor={primaryColor}
      />
    )
  }

  // 检查是否有需要填写的字段
  const hasRequiredFields =
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

  if (!hasRequiredFields) {
    return null
  }

  return (
    <Box
      style={{
        marginLeft: 12 * wxScale,
        marginRight: 12 * wxScale,
        marginTop: 12 * wxScale,
        borderRadius: 12 * wxScale,
        backgroundColor: cardBg,
      }}
    >
      {/* 卡片头部 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 12 * wxScale,
          paddingBottom: 12 * wxScale,
          borderBottomWidth: fillLater ? 0 : 1,
          borderBottomStyle: 'solid',
          borderBottomColor: borderColor,
        }}
      >
        <Text style={{ fontSize: 14 * wxScale, fontWeight: 500, color: textPrimary }}>
          就诊信息
        </Text>
        {/* 下单后填写开关 */}
        {service.allowPostOrder && (
          <Box
            onClick={() => setFillLater(!fillLater)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}
          >
            <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
              下单后填写
            </Text>
            <Box
              style={{
                position: 'relative',
                width: 40 * wxScale,
                height: 22 * wxScale,
                borderRadius: 11 * wxScale,
                backgroundColor: fillLater ? primaryColor : '#e5e7eb',
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  top: 3 * wxScale,
                  left: fillLater ? 21 * wxScale : 3 * wxScale,
                  width: 16 * wxScale,
                  height: 16 * wxScale,
                  borderRadius: 8 * wxScale,
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* 折叠提示 */}
      {fillLater && (
        <Box
          onClick={() => setFillLater(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8 * wxScale,
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 12 * wxScale,
          }}
        >
          <Icon name="down" size={16 * wxScale} color={textMuted} />
          <Text style={{ fontSize: 12 * wxScale, color: textSecondary }}>
            下单后可在订单详情补充就诊信息
          </Text>
        </Box>
      )}

      {/* 表单字段 - 未折叠时显示 */}
      {!fillLater && (
        <Box
          style={{
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
          }}
        >
          {/* 根据 fieldOrder 渲染内置字段 */}
          {enabledBuiltinFields.map((fieldKey, index) =>
            renderBuiltinField(
              fieldKey,
              index === enabledBuiltinFields.length - 1 &&
              (!service.customFields || service.customFields.length === 0)
            )
          )}

          {/* 自定义字段 */}
          {service.customFields &&
            service.customFields.map((field, index) =>
              renderCustomField(field, index === service.customFields!.length - 1)
            )}
        </Box>
      )}
    </Box>
  )
}
