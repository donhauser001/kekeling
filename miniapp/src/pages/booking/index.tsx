import { View, Text, Button, Picker, Textarea } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { servicesApi, hospitalsApi, patientsApi, ordersApi } from '@/services/api'
import { isLoggedIn } from '@/services/request'
import './index.scss'

// 数据类型定义
interface Service {
  id: string
  name: string
  price: number
  needHospital?: boolean
  needDepartment?: boolean
  needDoctor?: boolean
  needPatient?: boolean
  needAppointment?: boolean
}

interface Hospital {
  id: string
  name: string
  shortName?: string
}

interface Department {
  id: string
  name: string
  hospitalId?: string
}

interface Doctor {
  id: string
  name: string
  title?: string
  departmentId?: string
}

interface Patient {
  id: string
  name: string
  phone: string
  relation: string
  gender?: string
  birthday?: string
}

export default function Booking() {
  const router = useRouter()
  
  // 数据列表
  const [services, setServices] = useState<Service[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  
  // 选中状态
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [remark, setRemark] = useState('')
  
  // 加载状态
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 时间选项
  const timeOptions = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
  ]

  // 加载服务列表
  const loadServices = async () => {
    try {
      const result = await servicesApi.getList({ pageSize: 50 })
      const data = result?.data || result || []
      setServices(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('加载服务失败:', err)
    }
  }

  // 加载医院列表
  const loadHospitals = async () => {
    try {
      const result = await hospitalsApi.getList({ pageSize: 100 })
      const data = result?.data || result || []
      setHospitals(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('加载医院失败:', err)
    }
  }

  // 加载科室列表
  const loadDepartments = async (hospitalId: string) => {
    try {
      const data = await hospitalsApi.getDepartments(hospitalId)
      // 扁平化科室树
      const flatDepts: Department[] = []
      const flatten = (items: any[]) => {
        items.forEach(item => {
          flatDepts.push({ id: item.id, name: item.name, hospitalId })
          if (item.children?.length) {
            flatten(item.children)
          }
        })
      }
      if (Array.isArray(data)) {
        flatten(data)
      }
      setDepartments(flatDepts)
    } catch (err) {
      console.error('加载科室失败:', err)
      setDepartments([])
    }
  }

  // 加载医生列表
  const loadDoctors = async (hospitalId: string, departmentId?: string) => {
    try {
      const result = await hospitalsApi.getDoctors(hospitalId, { departmentId, pageSize: 100 })
      const data = result?.data || result || []
      setDoctors(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('加载医生失败:', err)
      setDoctors([])
    }
  }

  // 加载就诊人列表
  const loadPatients = async () => {
    try {
      const data = await patientsApi.getList()
      setPatients(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('加载就诊人失败:', err)
    }
  }

  // 初始化
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadServices(), loadHospitals()])
      
      // 处理路由参数
      const { serviceId, serviceName, price, hospitalId } = router.params
      
      if (serviceId) {
        // 从参数构建服务对象或从列表中查找
        const service = services.find(s => s.id === serviceId) || {
          id: serviceId,
          name: decodeURIComponent(serviceName || ''),
          price: Number(price) || 0,
        }
        setSelectedService(service as Service)
      }
      
      if (hospitalId) {
        const hospital = hospitals.find(h => h.id === hospitalId)
        if (hospital) {
          setSelectedHospital(hospital)
          await loadDepartments(hospitalId)
        }
      }
      
      // 登录后加载就诊人
      if (isLoggedIn()) {
        await loadPatients()
      }
      
      setLoading(false)
    }
    
    init()
  }, [])

  // 服务选择后更新
  useEffect(() => {
    if (services.length > 0 && router.params.serviceId) {
      const service = services.find(s => s.id === router.params.serviceId)
      if (service) {
        setSelectedService(service)
      }
    }
  }, [services])

  // 医院选择后更新
  useEffect(() => {
    if (hospitals.length > 0 && router.params.hospitalId) {
      const hospital = hospitals.find(h => h.id === router.params.hospitalId)
      if (hospital) {
        setSelectedHospital(hospital)
        loadDepartments(hospital.id)
      }
    }
  }, [hospitals])

  // 页面显示时刷新就诊人列表
  useDidShow(() => {
    if (isLoggedIn()) {
      loadPatients()
    }
  })

  // 服务选择
  const handleServiceSelect = (e: any) => {
    const index = e.detail.value
    setSelectedService(services[index])
  }

  // 医院选择
  const handleHospitalSelect = (e: any) => {
    const index = e.detail.value
    const hospital = hospitals[index]
    setSelectedHospital(hospital)
    setSelectedDepartment(null)
    setSelectedDoctor(null)
    setDepartments([])
    setDoctors([])
    
    if (hospital) {
      loadDepartments(hospital.id)
    }
  }

  // 科室选择
  const handleDepartmentSelect = (e: any) => {
    const index = e.detail.value
    const department = departments[index]
    setSelectedDepartment(department)
    setSelectedDoctor(null)
    setDoctors([])
    
    if (department && selectedHospital) {
      loadDoctors(selectedHospital.id, department.id)
    }
  }

  // 医生选择
  const handleDoctorSelect = (e: any) => {
    const index = e.detail.value
    setSelectedDoctor(doctors[index])
  }

  // 日期选择
  const handleDateSelect = (e: any) => {
    setSelectedDate(e.detail.value)
  }

  // 时间选择
  const handleTimeSelect = (e: any) => {
    const index = e.detail.value
    setSelectedTime(timeOptions[index])
  }

  // 就诊人选择
  const handlePatientSelect = () => {
    if (!isLoggedIn()) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再选择就诊人',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/auth/login' })
          }
        }
      })
      return
    }
    
    if (patients.length === 0) {
      Taro.showModal({
        title: '提示',
        content: '您还没有添加就诊人，是否立即添加？',
        confirmText: '立即添加',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/user/patients?action=add' })
          }
        }
      })
      return
    }
    
    Taro.showActionSheet({
      itemList: patients.map(p => `${p.name} (${p.relation})`),
      success: (res) => {
        setSelectedPatient(patients[res.tapIndex])
      }
    })
  }

  // 添加就诊人
  const handleAddPatient = () => {
    if (!isLoggedIn()) {
      Taro.navigateTo({ url: '/pages/auth/login' })
      return
    }
    Taro.navigateTo({ url: '/pages/user/patients?action=add' })
  }

  // 提交订单
  const handleSubmit = async () => {
    // 登录检查
    if (!isLoggedIn()) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再提交订单',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/auth/login' })
          }
        }
      })
      return
    }
    
    // 表单验证
    if (!selectedService) {
      Taro.showToast({ title: '请选择服务类型', icon: 'none' })
      return
    }
    if (!selectedHospital) {
      Taro.showToast({ title: '请选择医院', icon: 'none' })
      return
    }
    if (!selectedDate) {
      Taro.showToast({ title: '请选择日期', icon: 'none' })
      return
    }
    if (!selectedTime) {
      Taro.showToast({ title: '请选择时间', icon: 'none' })
      return
    }
    if (!selectedPatient) {
      Taro.showToast({ title: '请选择就诊人', icon: 'none' })
      return
    }

    try {
      setSubmitting(true)
      
      // 构建订单数据
      const orderData = {
        serviceId: selectedService.id,
        hospitalId: selectedHospital.id,
        patientId: selectedPatient.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        departmentName: selectedDepartment?.name,
        remark: remark.trim() || undefined,
      }
      
      // 调用 API 创建订单
      const result = await ordersApi.create(orderData)
      
      if (result?.id) {
        // 跳转到支付/结果页
        Taro.navigateTo({
          url: `/pages/booking/result?orderId=${result.id}&orderNo=${result.orderNo}&amount=${Number(selectedService.price)}`
        })
      } else {
        throw new Error('创建订单失败')
      }
    } catch (err: any) {
      console.error('提交订单失败:', err)
      Taro.showToast({ 
        title: err.message || '提交失败，请重试', 
        icon: 'none' 
      })
    } finally {
      setSubmitting(false)
    }
  }

  // 获取最小日期（明天）
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // 获取最大日期（30天后）
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <View className='loading-container'>
        <View className='loading-spinner' />
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='booking-page'>
      {/* 服务选择 */}
      <View className='section card'>
        <Text className='section-title'>服务信息</Text>
        
        <Picker
          mode='selector'
          range={services}
          rangeKey='name'
          onChange={handleServiceSelect}
        >
          <View className='form-item'>
            <Text className='form-label'>服务类型</Text>
            <View className='form-value'>
              <Text className={selectedService ? '' : 'placeholder'}>
                {selectedService ? selectedService.name : '请选择服务类型'}
              </Text>
              <Icon name='chevron-right' size={16} color='#d9d9d9' />
            </View>
          </View>
        </Picker>

        <Picker
          mode='selector'
          range={hospitals}
          rangeKey='name'
          onChange={handleHospitalSelect}
        >
          <View className='form-item'>
            <Text className='form-label'>就诊医院</Text>
            <View className='form-value'>
              <Text className={selectedHospital ? '' : 'placeholder'}>
                {selectedHospital ? (selectedHospital.shortName || selectedHospital.name) : '请选择医院'}
              </Text>
              <Icon name='chevron-right' size={16} color='#d9d9d9' />
            </View>
          </View>
        </Picker>

        {/* 科室选择 (仅当有科室数据时显示) */}
        {departments.length > 0 && (
          <Picker
            mode='selector'
            range={departments}
            rangeKey='name'
            onChange={handleDepartmentSelect}
          >
            <View className='form-item'>
              <Text className='form-label'>就诊科室</Text>
              <View className='form-value'>
                <Text className={selectedDepartment ? '' : 'placeholder'}>
                  {selectedDepartment ? selectedDepartment.name : '请选择科室（可选）'}
                </Text>
                <Icon name='chevron-right' size={16} color='#d9d9d9' />
              </View>
            </View>
          </Picker>
        )}

        {/* 医生选择 (仅当有医生数据时显示) */}
        {doctors.length > 0 && (
          <Picker
            mode='selector'
            range={doctors.map(d => `${d.name}${d.title ? ` (${d.title})` : ''}`)}
            onChange={handleDoctorSelect}
          >
            <View className='form-item'>
              <Text className='form-label'>就诊医生</Text>
              <View className='form-value'>
                <Text className={selectedDoctor ? '' : 'placeholder'}>
                  {selectedDoctor ? `${selectedDoctor.name}${selectedDoctor.title ? ` (${selectedDoctor.title})` : ''}` : '请选择医生（可选）'}
                </Text>
                <Icon name='chevron-right' size={16} color='#d9d9d9' />
              </View>
            </View>
          </Picker>
        )}
      </View>

      {/* 时间选择 */}
      <View className='section card'>
        <Text className='section-title'>预约时间</Text>
        
        <Picker
          mode='date'
          start={getMinDate()}
          end={getMaxDate()}
          onChange={handleDateSelect}
        >
          <View className='form-item'>
            <Text className='form-label'>预约日期</Text>
            <View className='form-value'>
              <Text className={selectedDate ? '' : 'placeholder'}>
                {selectedDate || '请选择日期'}
              </Text>
              <Icon name='chevron-right' size={16} color='#d9d9d9' />
            </View>
          </View>
        </Picker>

        <Picker
          mode='selector'
          range={timeOptions}
          onChange={handleTimeSelect}
        >
          <View className='form-item'>
            <Text className='form-label'>预约时间</Text>
            <View className='form-value'>
              <Text className={selectedTime ? '' : 'placeholder'}>
                {selectedTime || '请选择时间段'}
              </Text>
              <Icon name='chevron-right' size={16} color='#d9d9d9' />
            </View>
          </View>
        </Picker>
      </View>

      {/* 就诊人 */}
      <View className='section card'>
        <View className='section-header'>
          <Text className='section-title'>就诊人信息</Text>
          <View className='add-btn' onClick={handleAddPatient}>
            <Icon name='plus' size={14} color='#1890ff' />
            <Text>新增</Text>
          </View>
        </View>
        
        <View className='form-item' onClick={handlePatientSelect}>
          <Text className='form-label'>就诊人</Text>
          <View className='form-value'>
            {selectedPatient ? (
              <View className='patient-info'>
                <Text>{selectedPatient.name}</Text>
                <Text className='patient-relation'>({selectedPatient.relation})</Text>
              </View>
            ) : (
              <Text className='placeholder'>请选择就诊人</Text>
            )}
            <Icon name='chevron-right' size={16} color='#d9d9d9' />
          </View>
        </View>
      </View>

      {/* 备注 */}
      <View className='section card'>
        <Text className='section-title'>备注信息</Text>
        <View className='remark-input'>
          <Textarea
            className='textarea'
            placeholder='请输入特殊需求或备注（如需要轮椅、有忌口等）'
            value={remark}
            onInput={(e) => setRemark(e.detail.value)}
            maxlength={200}
          />
          <Text className='char-count'>{remark.length}/200</Text>
        </View>
      </View>

      {/* 价格汇总 */}
      <View className='price-summary card'>
        <View className='price-row'>
          <Text className='price-label'>服务费用</Text>
          <Text className='price-value'>¥{selectedService ? Number(selectedService.price) : 0}</Text>
        </View>
        <View className='price-row total'>
          <Text className='price-label'>应付金额</Text>
          <Text className='price-value price'>¥{selectedService ? Number(selectedService.price) : 0}</Text>
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='bottom-bar safe-area-bottom'>
        <View className='total-price'>
          <Text className='label'>合计:</Text>
          <Text className='price'>¥{selectedService ? Number(selectedService.price) : 0}</Text>
        </View>
        <Button 
          className='submit-btn' 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '提交中...' : '提交订单'}
        </Button>
      </View>
    </View>
  )
}
