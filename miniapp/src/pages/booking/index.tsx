import { View, Text, Picker, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

// Mock 数据
const mockService = { id: '1', name: '门诊陪诊', price: 299, unit: '次' }
const mockHospitals = [
  { id: '1', name: '上海市第一人民医院' },
  { id: '2', name: '复旦大学附属华山医院' },
  { id: '3', name: '上海交通大学医学院附属瑞金医院' },
]
const mockEscorts = [
  { id: '1', name: '张护士', level: '高级', rating: 98.5 },
  { id: '2', name: '李护士', level: '中级', rating: 97.2 },
]
const mockPatients = [
  { id: '1', name: '张三', phone: '138****8888', relation: '本人' },
  { id: '2', name: '李四', phone: '139****9999', relation: '配偶' },
]

export default function Booking() {
  const router = useRouter()
  const [service, setService] = useState(mockService)
  const [selectedHospital, setSelectedHospital] = useState<string>('')
  const [selectedEscort, setSelectedEscort] = useState<string>('')
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [remark, setRemark] = useState('')

  useEffect(() => {
    const { serviceId } = router.params
    // TODO: 根据 serviceId 获取服务详情
    console.log('Service ID:', serviceId)
  }, [router.params])

  const handleHospitalChange = (e: any) => {
    setSelectedHospital(mockHospitals[e.detail.value].id)
  }

  const handleEscortChange = (e: any) => {
    setSelectedEscort(mockEscorts[e.detail.value].id)
  }

  const handlePatientChange = (e: any) => {
    setSelectedPatient(mockPatients[e.detail.value].id)
  }

  const handleDateChange = (e: any) => {
    setAppointmentDate(e.detail.value)
  }

  const handleTimeChange = (e: any) => {
    setAppointmentTime(e.detail.value)
  }

  const validateForm = () => {
    if (!selectedHospital) {
      Taro.showToast({ title: '请选择医院', icon: 'none' })
      return false
    }
    if (!selectedPatient) {
      Taro.showToast({ title: '请选择就诊人', icon: 'none' })
      return false
    }
    if (!appointmentDate) {
      Taro.showToast({ title: '请选择就诊日期', icon: 'none' })
      return false
    }
    if (!appointmentTime) {
      Taro.showToast({ title: '请选择就诊时间', icon: 'none' })
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    // TODO: 调用创建订单 API
    Taro.showModal({
      title: '确认预约',
      content: `服务费用 ¥${service.price}，确认提交订单？`,
      success: (res) => {
        if (res.confirm) {
          // 模拟创建订单成功
          Taro.redirectTo({
            url: `/pages/booking/result?orderId=mock_order_001&status=success`
          })
        }
      }
    })
  }

  const selectedHospitalObj = mockHospitals.find(h => h.id === selectedHospital)
  const selectedEscortObj = mockEscorts.find(e => e.id === selectedEscort)
  const selectedPatientObj = mockPatients.find(p => p.id === selectedPatient)

  return (
    <View className='booking-page'>
      {/* 服务信息 */}
      <View className='section card'>
        <Text className='section-title'>服务信息</Text>
        <View className='service-info'>
          <Text className='service-name'>{service.name}</Text>
          <Text className='service-price price'>{service.price}</Text>
          <Text className='service-unit'>/{service.unit}</Text>
        </View>
      </View>

      {/* 选择医院 */}
      <View className='section card'>
        <Text className='section-title'>选择医院</Text>
        <Picker
          mode='selector'
          range={mockHospitals}
          rangeKey='name'
          onChange={handleHospitalChange}
        >
          <View className='picker-item'>
            <Text className={selectedHospitalObj ? 'value' : 'placeholder'}>
              {selectedHospitalObj?.name || '请选择医院'}
            </Text>
            <Text className='arrow'>→</Text>
          </View>
        </Picker>
      </View>

      {/* 选择陪诊员（可选） */}
      <View className='section card'>
        <Text className='section-title'>选择陪诊员 <Text className='optional'>（可选）</Text></Text>
        <Picker
          mode='selector'
          range={mockEscorts}
          rangeKey='name'
          onChange={handleEscortChange}
        >
          <View className='picker-item'>
            {selectedEscortObj ? (
              <View className='escort-selected'>
                <Text className='escort-name'>{selectedEscortObj.name}</Text>
                <Text className='escort-level tag tag-primary'>{selectedEscortObj.level}</Text>
                <Text className='escort-rating'>⭐ {selectedEscortObj.rating}%</Text>
              </View>
            ) : (
              <Text className='placeholder'>系统自动分配</Text>
            )}
            <Text className='arrow'>→</Text>
          </View>
        </Picker>
      </View>

      {/* 选择就诊人 */}
      <View className='section card'>
        <Text className='section-title'>就诊人信息</Text>
        <Picker
          mode='selector'
          range={mockPatients}
          rangeKey='name'
          onChange={handlePatientChange}
        >
          <View className='picker-item'>
            {selectedPatientObj ? (
              <View className='patient-selected'>
                <Text className='patient-name'>{selectedPatientObj.name}</Text>
                <Text className='patient-relation tag tag-primary'>{selectedPatientObj.relation}</Text>
                <Text className='patient-phone'>{selectedPatientObj.phone}</Text>
              </View>
            ) : (
              <Text className='placeholder'>请选择就诊人</Text>
            )}
            <Text className='arrow'>→</Text>
          </View>
        </Picker>
        <View className='add-patient' onClick={() => Taro.navigateTo({ url: '/pages/user/patients' })}>
          + 添加就诊人
        </View>
      </View>

      {/* 选择时间 */}
      <View className='section card'>
        <Text className='section-title'>预约时间</Text>
        <View className='time-pickers'>
          <Picker mode='date' onChange={handleDateChange} start={new Date().toISOString().split('T')[0]}>
            <View className='picker-item half'>
              <Text className={appointmentDate ? 'value' : 'placeholder'}>
                {appointmentDate || '选择日期'}
              </Text>
            </View>
          </Picker>
          <Picker mode='time' onChange={handleTimeChange}>
            <View className='picker-item half'>
              <Text className={appointmentTime ? 'value' : 'placeholder'}>
                {appointmentTime || '选择时间'}
              </Text>
            </View>
          </Picker>
        </View>
      </View>

      {/* 备注 */}
      <View className='section card'>
        <Text className='section-title'>备注说明 <Text className='optional'>（可选）</Text></Text>
        <textarea
          className='remark-input'
          placeholder='请输入特殊需求或备注信息'
          value={remark}
          onInput={(e: any) => setRemark(e.detail.value)}
          maxlength={200}
        />
      </View>

      {/* 底部 */}
      <View className='bottom-bar safe-area-bottom'>
        <View className='price-info'>
          <Text className='label'>合计</Text>
          <Text className='price'>{service.price}</Text>
        </View>
        <Button className='submit-btn' onClick={handleSubmit}>
          提交订单
        </Button>
      </View>
    </View>
  )
}

