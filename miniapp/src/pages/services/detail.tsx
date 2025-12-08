import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { servicesApi } from '@/services/api'
import './detail.scss'

// 服务详情数据类型
interface ServiceDetail {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  duration?: string
  orderCount: number
  rating: number
  coverImage?: string
  detailImages?: string[]
  serviceIncludes?: Array<{ text: string; icon?: string }> | string[]
  serviceNotes?: Array<{ title: string; content: string }> | string[]
  unit?: string
  minQuantity?: number
  maxQuantity?: number
  needPatient?: boolean
  needHospital?: boolean
  needDepartment?: boolean
  needDoctor?: boolean
  needAppointment?: boolean
  category?: {
    id: string
    name: string
  }
}

// 默认服务流程
const defaultServiceProcess = [
  { step: 1, title: '在线预约', desc: '选择医院、时间、服务类型' },
  { step: 2, title: '确认订单', desc: '支付费用，等待陪诊员接单' },
  { step: 3, title: '陪诊服务', desc: '陪诊员准时到达，全程陪同' },
  { step: 4, title: '服务完成', desc: '服务结束，评价陪诊员' },
]

// 图标映射
const iconMap: Record<string, string> = {
  '陪诊服务': 'stethoscope',
  '代办服务': 'clipboard-list',
  '全程陪诊': 'stethoscope',
  '检查陪同': 'flask-conical',
  '住院陪护': 'bed',
  '代办挂号': 'clipboard-list',
  '代取报告': 'file-text',
  '代办病历': 'file-stack',
}

export default function ServiceDetail() {
  const router = useRouter()
  const [service, setService] = useState<ServiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 加载服务详情
  const loadServiceDetail = async (id: string) => {
    try {
      setLoading(true)
      setError('')
      const data = await servicesApi.getDetail(id)
      if (data) {
        setService(data as ServiceDetail)
      } else {
        setError('服务不存在')
      }
    } catch (err: any) {
      console.error('加载服务详情失败:', err)
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const { id } = router.params
    if (id) {
      loadServiceDetail(id)
    } else {
      setError('缺少服务ID')
      setLoading(false)
    }
  }, [router.params])

  // 解析 serviceIncludes
  const parseServiceIncludes = (): Array<{ text: string; icon?: string }> => {
    if (!service?.serviceIncludes) return []
    
    // 如果是字符串数组
    if (Array.isArray(service.serviceIncludes)) {
      return service.serviceIncludes.map(item => {
        if (typeof item === 'string') {
          return { text: item }
        }
        return item
      })
    }
    
    return []
  }

  // 解析 serviceNotes
  const parseServiceNotes = (): Array<{ title: string; content: string }> => {
    if (!service?.serviceNotes) return []
    
    // 如果是字符串数组
    if (Array.isArray(service.serviceNotes)) {
      return service.serviceNotes.map((item, index) => {
        if (typeof item === 'string') {
          return { title: `注意事项 ${index + 1}`, content: item }
        }
        return item
      })
    }
    
    return []
  }

  const handleBook = () => {
    if (!service) return
    
    Taro.navigateTo({ 
      url: `/pages/booking/index?serviceId=${service.id}&serviceName=${encodeURIComponent(service.name)}&price=${service.price}` 
    })
  }

  const handleShare = () => {
    // 小程序会自动处理分享
  }

  const handleContact = () => {
    Taro.makePhoneCall({
      phoneNumber: '400-123-4567',
      fail: () => {
        Taro.showToast({ title: '客服热线: 400-123-4567', icon: 'none', duration: 3000 })
      }
    })
  }

  // 获取服务图标
  const getServiceIcon = () => {
    if (!service) return 'stethoscope'
    return iconMap[service.name] || iconMap[service.category?.name || ''] || 'stethoscope'
  }

  if (loading) {
    return (
      <View className='loading-container'>
        <View className='loading-spinner' />
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  if (error || !service) {
    return (
      <View className='error-container'>
        <Icon name='alert-circle' size={48} color='#ff4d4f' />
        <Text className='error-text'>{error || '加载失败'}</Text>
        <Button className='retry-btn' onClick={() => router.params.id && loadServiceDetail(router.params.id)}>
          重新加载
        </Button>
      </View>
    )
  }

  const serviceIncludes = parseServiceIncludes()
  const serviceNotes = parseServiceNotes()

  return (
    <View className='detail-page'>
      {/* 顶部封面 */}
      <View className='cover-section'>
        {service.coverImage ? (
          <Image src={service.coverImage} mode='aspectFill' className='cover-image' />
        ) : (
          <View className='cover-placeholder'>
            <Icon name={getServiceIcon()} size={64} color='#1890ff' />
          </View>
        )}
        <View className='cover-overlay'>
          <View className='cover-tag'>{service.category?.name || '陪诊服务'}</View>
        </View>
      </View>

      {/* 基本信息 */}
      <View className='info-section card'>
        <Text className='service-name'>{service.name}</Text>
        <Text className='service-desc'>{service.description || '专业陪诊服务，让就医不再孤单'}</Text>
        <View className='price-row'>
          <View className='price-wrap'>
            <Text className='price-symbol'>¥</Text>
            <Text className='price'>{Number(service.price)}</Text>
            {service.originalPrice && Number(service.originalPrice) > Number(service.price) && (
              <Text className='original-price'>¥{Number(service.originalPrice)}</Text>
            )}
            {service.unit && <Text className='price-unit'>/{service.unit}</Text>}
          </View>
          <View className='stats'>
            <View className='stat-item'>
              <Icon name='star' size={16} color='#faad14' />
              <Text>{Number(service.rating) > 10 ? Number(service.rating) : Number(service.rating) * 20}%好评</Text>
            </View>
            <View className='stat-item'>
              <Icon name='file-text' size={16} color='#1890ff' />
              <Text>{service.orderCount || 0}单</Text>
            </View>
          </View>
        </View>
        {service.duration && (
          <View className='duration-row'>
            <Icon name='clock' size={16} color='#8c8c8c' />
            <Text className='duration-text'>预计服务时长：{service.duration}</Text>
          </View>
        )}
      </View>

      {/* 服务内容 */}
      {serviceIncludes.length > 0 && (
        <View className='content-section card'>
          <Text className='section-title'>服务内容</Text>
          <View className='content-list'>
            {serviceIncludes.map((item, index) => (
              <View key={index} className='content-item include'>
                <Icon name={item.icon || 'check-circle'} size={16} color='#52c41a' />
                <Text>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 服务流程 */}
      <View className='process-section card'>
        <Text className='section-title'>服务流程</Text>
        <View className='process-list'>
          {defaultServiceProcess.map((item, index) => (
            <View key={item.step} className='process-item'>
              <View className='process-step'>
                <Text className='step-num'>{item.step}</Text>
                {index < defaultServiceProcess.length - 1 && (
                  <View className='step-line' />
                )}
              </View>
              <View className='process-content'>
                <Text className='process-title'>{item.title}</Text>
                <Text className='process-desc'>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 注意事项 */}
      <View className='notes-section card'>
        <Text className='section-title'>注意事项</Text>
        <View className='notes-list'>
          {serviceNotes.length > 0 ? (
            serviceNotes.map((note, index) => (
              <View key={index} className='note-item'>
                <Text className='note-num'>{index + 1}.</Text>
                <Text className='note-text'>{note.content || note.title}</Text>
              </View>
            ))
          ) : (
            <>
              <View className='note-item'>
                <Text className='note-num'>1.</Text>
                <Text className='note-text'>请提前1天以上预约，以便安排陪诊员</Text>
              </View>
              <View className='note-item'>
                <Text className='note-num'>2.</Text>
                <Text className='note-text'>如需更改预约时间，请提前12小时联系客服</Text>
              </View>
              <View className='note-item'>
                <Text className='note-num'>3.</Text>
                <Text className='note-text'>陪诊服务不包含医疗诊断，仅提供陪同服务</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* 预约须知 */}
      {(service.needPatient || service.needHospital || service.needAppointment) && (
        <View className='requirements-section card'>
          <Text className='section-title'>预约须知</Text>
          <View className='requirements-list'>
            {service.needPatient && (
              <View className='requirement-item'>
                <Icon name='user' size={16} color='#1890ff' />
                <Text>需要填写就诊人信息</Text>
              </View>
            )}
            {service.needHospital && (
              <View className='requirement-item'>
                <Icon name='hospital' size={16} color='#1890ff' />
                <Text>需要选择就诊医院</Text>
              </View>
            )}
            {service.needDepartment && (
              <View className='requirement-item'>
                <Icon name='layers' size={16} color='#1890ff' />
                <Text>需要选择就诊科室</Text>
              </View>
            )}
            {service.needDoctor && (
              <View className='requirement-item'>
                <Icon name='stethoscope' size={16} color='#1890ff' />
                <Text>需要选择就诊医生</Text>
              </View>
            )}
            {service.needAppointment && (
              <View className='requirement-item'>
                <Icon name='calendar' size={16} color='#1890ff' />
                <Text>需要选择预约时间</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 底部按钮 */}
      <View className='bottom-bar safe-area-bottom'>
        <View className='action-btns'>
          <View className='action-btn' onClick={handleShare}>
            <Icon name='heart' size={24} color='#666' />
            <Text>收藏</Text>
          </View>
          <View className='action-btn' onClick={handleContact}>
            <Icon name='headphones' size={24} color='#666' />
            <Text>客服</Text>
          </View>
        </View>
        <Button className='book-btn' onClick={handleBook}>
          立即预约
        </Button>
      </View>
    </View>
  )
}

