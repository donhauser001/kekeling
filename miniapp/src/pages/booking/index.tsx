import { View, Text, Button, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import './index.scss'

// Mock 数据
const mockServices = [
  { id: '1', name: '全程陪诊', price: 299 },
  { id: '2', name: '代办挂号', price: 99 },
  { id: '3', name: '检查陪同', price: 199 },
]

const mockHospitals = [
  { id: '1', name: '上海市第一人民医院' },
  { id: '2', name: '复旦大学附属华山医院' },
  { id: '3', name: '上海交通大学医学院附属瑞金医院' },
]

const mockPatients = [
  { id: '1', name: '张三', phone: '13888888888', relation: '本人' },
  { id: '2', name: '李四', phone: '13999999999', relation: '父亲' },
]

export default function Booking() {
  const router = useRouter()
  
  // 表单状态
  const [selectedService, setSelectedService] = useState<typeof mockServices[0] | null>(null)
  const [selectedHospital, setSelectedHospital] = useState<typeof mockHospitals[0] | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [remark, setRemark] = useState('')

  // 时间选项
  const timeOptions = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

  useEffect(() => {
    const { serviceId, hospitalId, serviceName, price } = router.params
    
    if (serviceId) {
      const service = mockServices.find(s => s.id === serviceId)
      if (service) setSelectedService(service)
    }
    
    if (hospitalId) {
      const hospital = mockHospitals.find(h => h.id === hospitalId)
      if (hospital) setSelectedHospital(hospital)
    }
  }, [router.params])

  const handleServiceSelect = (e: any) => {
    const index = e.detail.value
    setSelectedService(mockServices[index])
  }

  const handleHospitalSelect = (e: any) => {
    const index = e.detail.value
    setSelectedHospital(mockHospitals[index])
  }

  const handleDateSelect = (e: any) => {
    setSelectedDate(e.detail.value)
  }

  const handleTimeSelect = (e: any) => {
    const index = e.detail.value
    setSelectedTime(timeOptions[index])
  }

  const handlePatientSelect = () => {
    // 如果没有就诊人，先添加
    if (mockPatients.length === 0) {
      Taro.navigateTo({ url: '/pages/user/patients?action=add' })
      return
    }
    
    Taro.showActionSheet({
      itemList: mockPatients.map(p => `${p.name} (${p.relation})`),
      success: (res) => {
        setSelectedPatient(mockPatients[res.tapIndex])
      }
    })
  }

  const handleAddPatient = () => {
    Taro.navigateTo({ url: '/pages/user/patients?action=add' })
  }

  const handleSubmit = () => {
    // 验证表单
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

    // TODO: 提交订单
    Taro.showLoading({ title: '提交中...' })
    
    setTimeout(() => {
      Taro.hideLoading()
      Taro.navigateTo({
        url: `/pages/booking/result?orderId=KKL${Date.now()}&amount=${selectedService.price}`
      })
    }, 1000)
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

  return (
    <View className='booking-page'>
      {/* 服务选择 */}
      <View className='section card'>
        <Text className='section-title'>服务信息</Text>
        
        <Picker
          mode='selector'
          range={mockServices}
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
          range={mockHospitals}
          rangeKey='name'
          onChange={handleHospitalSelect}
        >
          <View className='form-item'>
            <Text className='form-label'>就诊医院</Text>
            <View className='form-value'>
              <Text className={selectedHospital ? '' : 'placeholder'}>
                {selectedHospital ? selectedHospital.name : '请选择医院'}
              </Text>
              <Icon name='chevron-right' size={16} color='#d9d9d9' />
            </View>
          </View>
        </Picker>
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
                {selectedTime || '请选择时间'}
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
          <textarea
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
          <Text className='price-value'>¥{selectedService?.price || 0}</Text>
        </View>
        <View className='price-row total'>
          <Text className='price-label'>应付金额</Text>
          <Text className='price-value price'>{selectedService?.price || 0}</Text>
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='bottom-bar safe-area-bottom'>
        <View className='total-price'>
          <Text className='label'>合计:</Text>
          <Text className='price'>{selectedService?.price || 0}</Text>
        </View>
        <Button className='submit-btn' onClick={handleSubmit}>
          提交订单
        </Button>
      </View>
    </View>
  )
}
