import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import './detail.scss'

export default function EscortDetail() {
  const router = useRouter()

  const handleBook = () => {
    Taro.navigateTo({ url: `/pages/booking/index?escortId=${router.params.id}` })
  }

  return (
    <View className='escort-detail'>
      <View className='escort-header'>
        <View className='escort-avatar'>
          <View className='avatar-placeholder'>👩‍⚕️</View>
        </View>
        <View className='escort-info'>
          <View className='info-row'>
            <Text className='escort-name'>张护士</Text>
            <Text className='escort-level tag tag-primary'>高级</Text>
          </View>
          <View className='stats-row'>
            <Text className='stat-item'>⭐ 98.5%</Text>
            <Text className='stat-item'>接单 568</Text>
          </View>
        </View>
      </View>

      <View className='section card'>
        <Text className='section-title'>个人简介</Text>
        <Text className='section-content'>
          从事护理工作10年，熟悉上海各大三甲医院就诊流程，擅长老年人和儿童陪诊服务。
          持有护士执业资格证书，服务态度亲切，深受患者好评。
        </Text>
      </View>

      <View className='section card'>
        <Text className='section-title'>擅长领域</Text>
        <View className='tag-list'>
          <Text className='specialty-tag'>门诊陪诊</Text>
          <Text className='specialty-tag'>老年陪护</Text>
          <Text className='specialty-tag'>检查陪同</Text>
          <Text className='specialty-tag'>住院陪护</Text>
        </View>
      </View>

      <View className='section card'>
        <Text className='section-title'>服务医院</Text>
        <View className='hospital-list'>
          <Text className='hospital-item'>上海市第一人民医院</Text>
          <Text className='hospital-item'>复旦大学附属华山医院</Text>
          <Text className='hospital-item'>上海交通大学医学院附属瑞金医院</Text>
        </View>
      </View>

      <View className='bottom-bar safe-area-bottom'>
        <Button className='book-btn' onClick={handleBook}>预约 Ta</Button>
      </View>
    </View>
  )
}

