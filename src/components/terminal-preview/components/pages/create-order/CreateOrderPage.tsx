/**
 * 确认订单页
 * 按《小程序页面改造规范》改造
 * 已拆分为模块化组件
 */

import { useState, useEffect } from 'react'
import { Box, Text, Button, Icon } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'
import { getWxBridge } from '../../../bridge'
import type { ThemeSettings } from '../../../types'

// 类型和常量
import type {
  CreateOrderPageProps,
  ThemeColors,
  Patient,
  Hospital,
  Department,
  Doctor,
  Coupon,
  MedicalRecord,
  EmergencyContact,
} from './types'
import {
  mockPatients,
  mockHospitals,
  mockDepartments,
  mockDoctors,
  mockCoupons,
  mockMedicalRecords,
  generateDateOptions,
  TIME_OPTIONS,
  getThemeColors,
} from './constants'

// 子组件
import {
  ServiceCard,
  FormSection,
  BottomBar,
  HeaderButton,
  RemarkSection,
  CouponSection,
  InputModal,
  PatientPicker,
  HospitalPicker,
  DepartmentPicker,
  DoctorPicker,
  DatePicker,
  TimePicker,
  GenderPicker,
  MedicalRecordPicker,
  CouponPicker,
  EmergencyContactModal,
} from './components'

const wxScale = isWxEnvironment() ? 1.1 : 1
const wxSafeAreaTop = isWxEnvironment() ? 44 : 0

export function CreateOrderPage({
  serviceId,
  themeSettings,
  isDarkMode = false,
  onBack,
  onNavigate,
}: CreateOrderPageProps) {
  // ============================================================================
  // 状态管理
  // ============================================================================

  // 服务数据
  const [service, setService] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

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
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({ name: '', phone: '' })
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

  // ============================================================================
  // 数据获取
  // ============================================================================

  useEffect(() => {
    if (!serviceId) return

    setIsLoading(true)
    previewApi
      .getServiceDetail(serviceId)
      .then((data) => {
        setService(data)
      })
      .catch((err) => {
        console.error('[CreateOrderPage] 获取服务详情失败', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [serviceId])

  // ============================================================================
  // 派生数据
  // ============================================================================

  const colors: ThemeColors = getThemeColors(isDarkMode)
  const primaryColor = themeSettings.primaryColor

  // 获取选中的数据
  const selectedPatient = mockPatients.find((p) => p.id === selectedPatientId)
  const selectedHospital = mockHospitals.find((h) => h.id === selectedHospitalId)
  const selectedDepartment = mockDepartments.find((d) => d.id === selectedDepartmentId)
  const selectedDoctor = mockDoctors.find((d) => d.id === selectedDoctorId)
  const selectedCoupon = mockCoupons.find((c) => c.id === selectedCouponId)
  const selectedMedicalRecord = mockMedicalRecords.find((r) => r.id === selectedMedicalRecordId)

  // 计算价格
  const servicePrice = service?.price || 0
  const totalPrice = servicePrice * quantity
  const couponDiscount =
    selectedCoupon && totalPrice >= selectedCoupon.minAmount ? selectedCoupon.amount : 0
  const finalPrice = Math.max(0, totalPrice - couponDiscount)

  // 日期和时间选项
  const dateOptions = generateDateOptions()
  const timeOptions = TIME_OPTIONS

  // ============================================================================
  // 事件处理
  // ============================================================================

  const handleSubmit = async () => {
    const wxBridge = getWxBridge()

    // 表单校验
    if (service?.needPatient !== false && !selectedPatientId) {
      wxBridge.showToast({ title: '请选择就诊人', icon: 'none' })
      return
    }
    if (service?.needHospital && !selectedHospitalId) {
      wxBridge.showToast({ title: '请选择医院', icon: 'none' })
      return
    }
    if (service?.needAppointment !== false && !selectedDate) {
      wxBridge.showToast({ title: '请选择日期', icon: 'none' })
      return
    }

    // TODO: 调用后端创建订单 API 获取支付参数
    wxBridge.showToast({ title: '订单创建中...', icon: 'loading' })
  }

  const handleCustomFieldChange = (fieldId: string, value: string | string[]) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  // ============================================================================
  // 渲染
  // ============================================================================

  // 加载状态
  if (isLoading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bgColor,
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            style={{
              width: 32 * wxScale,
              height: 32 * wxScale,
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: primaryColor,
              borderTopColor: 'transparent',
              borderRadius: 16 * wxScale,
              animation: 'spin 1s linear infinite',
            }}
          />
          <Text
            style={{
              marginTop: 12 * wxScale,
              fontSize: 14 * wxScale,
              color: colors.textMuted,
            }}
          >
            加载中...
          </Text>
        </Box>
      </Box>
    )
  }

  // 服务不存在
  if (!service) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bgColor,
        }}
      >
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Icon name="caution" size={48 * wxScale} color={colors.textMuted} />
          <Text
            style={{
              marginTop: 12 * wxScale,
              fontSize: 14 * wxScale,
              color: colors.textMuted,
            }}
          >
            服务不存在
          </Text>
          <Button
            onClick={onBack}
            style={{
              marginTop: 16 * wxScale,
              paddingLeft: 16 * wxScale,
              paddingRight: 16 * wxScale,
              paddingTop: isWxEnvironment() ? 14 * wxScale : 10,
              paddingBottom: isWxEnvironment() ? 14 * wxScale : 10,
              borderRadius: 9999,
              fontSize: 14 * wxScale,
              backgroundColor: primaryColor,
              color: '#fff',
            }}
          >
            返回
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box style={{ minHeight: '100vh', paddingBottom: 96 * wxScale, backgroundColor: colors.bgColor }}>
      {/* 悬浮返回按钮（规则 11） */}
      <HeaderButton isDarkMode={isDarkMode} onBack={onBack} />

      {/* 顶部导航栏（预留小程序安全区域） */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: wxSafeAreaTop + 12 * wxScale,
          paddingBottom: 12 * wxScale,
          backgroundColor: colors.headerBg,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: colors.borderColor,
        }}
      >
        <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: colors.textPrimary }}>
          确认订单
        </Text>
      </Box>

      {/* 服务信息卡片 */}
      <ServiceCard service={service} colors={colors} primaryColor={primaryColor} />

      {/* 就诊信息表单 */}
      <FormSection
        service={service}
        fillLater={fillLater}
        setFillLater={setFillLater}
        selectedPatient={selectedPatient}
        selectedHospital={selectedHospital}
        selectedDepartment={selectedDepartment}
        selectedDoctor={selectedDoctor}
        selectedDate={selectedDate || undefined}
        selectedTime={selectedTime || undefined}
        idCard={idCard}
        gender={gender}
        emergencyContact={emergencyContact}
        selectedMedicalRecord={selectedMedicalRecord}
        customFieldValues={customFieldValues}
        onOpenPatientPicker={() => setShowPatientPicker(true)}
        onOpenHospitalPicker={() => setShowHospitalPicker(true)}
        onOpenDepartmentPicker={() => setShowDepartmentPicker(true)}
        onOpenDoctorPicker={() => setShowDoctorPicker(true)}
        onOpenDatePicker={() => setShowDatePicker(true)}
        onOpenTimePicker={() => setShowTimePicker(true)}
        onOpenIdCardInput={() => setShowIdCardInput(true)}
        onOpenGenderPicker={() => setShowGenderPicker(true)}
        onOpenEmergencyContactInput={() => setShowEmergencyContactInput(true)}
        onOpenMedicalRecordPicker={() => setShowMedicalRecordPicker(true)}
        onCustomFieldChange={handleCustomFieldChange}
        colors={colors}
        primaryColor={primaryColor}
        dateOptions={dateOptions}
        timeOptions={timeOptions}
      />

      {/* 优惠券 */}
      <CouponSection
        selectedCoupon={selectedCoupon}
        availableCouponCount={mockCoupons.length}
        onOpenPicker={() => setShowCouponPicker(true)}
        colors={colors}
        primaryColor={primaryColor}
      />

      {/* 备注 */}
      <RemarkSection value={remark} onChange={setRemark} colors={colors} />

      {/* 底部操作栏 */}
      <BottomBar
        servicePrice={servicePrice}
        couponDiscount={couponDiscount}
        finalPrice={finalPrice}
        onSubmit={handleSubmit}
        colors={colors}
        primaryColor={primaryColor}
      />

      {/* ==================== 弹窗部分 ==================== */}

      {/* 就诊人选择弹窗 */}
      {showPatientPicker && (
        <PatientPicker
          patients={mockPatients}
          selectedPatient={selectedPatient}
          onSelect={(patient) => setSelectedPatientId(patient.id)}
          onClose={() => setShowPatientPicker(false)}
          colors={colors}
          primaryColor={primaryColor}
        />
      )}

      {/* 医院选择弹窗 */}
      {showHospitalPicker && (
        <HospitalPicker
          hospitals={mockHospitals}
          selectedHospital={selectedHospital}
          onSelect={(hospital) => setSelectedHospitalId(hospital.id)}
          onClose={() => setShowHospitalPicker(false)}
          colors={colors}
          primaryColor={primaryColor}
        />
      )}

      {/* 科室选择弹窗 */}
      {showDepartmentPicker && (
        <DepartmentPicker
          departments={mockDepartments}
          selectedDepartment={selectedDepartment}
          onSelect={(department) => setSelectedDepartmentId(department.id)}
          onClose={() => setShowDepartmentPicker(false)}
          colors={colors}
          primaryColor={primaryColor}
        />
      )}

      {/* 医生选择弹窗 */}
      {showDoctorPicker && (
        <DoctorPicker
          doctors={mockDoctors}
          selectedDoctor={selectedDoctor}
          onSelect={(doctor) => setSelectedDoctorId(doctor.id)}
          onClose={() => setShowDoctorPicker(false)}
          colors={colors}
          primaryColor={primaryColor}
        />
      )}

      {/* 日期选择弹窗 */}
      {showDatePicker && (
        <DatePicker
          dateOptions={dateOptions}
          selectedDate={selectedDate || undefined}
          onSelect={setSelectedDate}
          onClose={() => setShowDatePicker(false)}
          colors={colors}
          primaryColor={primaryColor}
        />
      )}

      {/* 时间选择弹窗 */}
      {showTimePicker && (
        <TimePicker
          timeOptions={timeOptions}
          selectedTime={selectedTime || undefined}
          onSelect={setSelectedTime}
          onClose={() => setShowTimePicker(false)}
          colors={colors}
          primaryColor={primaryColor}
        />
      )}

      {/* 性别选择弹窗 */}
      {showGenderPicker && (
        <GenderPicker
          selectedGender={gender}
          onSelect={setGender}
          onClose={() => setShowGenderPicker(false)}
          colors={colors}
          primaryColor={primaryColor}
        />
      )}

      {/* 身份证输入弹窗 */}
      {showIdCardInput && (
        <InputModal
          title="输入身份证号"
          colors={colors}
          primaryColor={primaryColor}
          value={idCard}
          placeholder="请输入18位身份证号码"
          onClose={() => setShowIdCardInput(false)}
          onConfirm={(value) => {
            setIdCard(value)
            setShowIdCardInput(false)
          }}
        />
      )}

      {/* 紧急联系人输入弹窗 */}
      {showEmergencyContactInput && (
        <EmergencyContactModal
          value={emergencyContact}
          onConfirm={setEmergencyContact}
          onClose={() => setShowEmergencyContactInput(false)}
          colors={colors}
          primaryColor={primaryColor}
        />
      )}

      {/* 病历选择弹窗 */}
      {showMedicalRecordPicker && (
        <MedicalRecordPicker
          medicalRecords={mockMedicalRecords}
          selectedMedicalRecord={selectedMedicalRecord}
          onSelect={(record) => setSelectedMedicalRecordId(record.id)}
          onClose={() => setShowMedicalRecordPicker(false)}
          colors={colors}
          primaryColor={primaryColor}
        />
      )}

      {/* 优惠券选择弹窗 */}
      {showCouponPicker && (
        <CouponPicker
          coupons={mockCoupons}
          selectedCoupon={selectedCoupon}
          servicePrice={totalPrice}
          onSelect={(coupon) => setSelectedCouponId(coupon?.id || null)}
          onClose={() => setShowCouponPicker(false)}
          colors={colors}
          primaryColor={primaryColor}
        />
      )}
    </Box>
  )
}
