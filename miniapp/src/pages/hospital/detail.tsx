import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import './detail.scss'

export default function HospitalDetail() {
  const router = useRouter()

  const handleBook = () => {
    Taro.navigateTo({ url: `/pages/services/index?hospitalId=${router.params.id}` })
  }

  return (
    <View className='hospital-detail'>
      <View className='hospital-header card'>
        <Text className='hospital-name'>上海市第一人民医院</Text>
        <Text className='hospital-level tag tag-primary'>三级甲等</Text>
        <Text className='hospital-address'>📍 上海市虹口区武进路85号</Text>
        <Text className='hospital-phone'>📞 021-12345678</Text>
      </View>

      <View className='section card'>
        <Text className='section-title'>医院简介</Text>
        <Text className='section-content'>
          上海市第一人民医院是一所集医疗、教学、科研于一体的大型综合性三级甲等医院。
          医院拥有先进的医疗设备和优秀的医疗团队，为患者提供优质的医疗服务。
        </Text>
      </View>

      <View className='section card'>
        <Text className='section-title'>热门科室</Text>
        <View className='department-list'>
          <View className='department-item'>心内科</View>
          <View className='department-item'>骨科</View>
          <View className='department-item'>神经内科</View>
          <View className='department-item'>消化内科</View>
          <View className='department-item'>妇产科</View>
          <View className='department-item'>儿科</View>
        </View>
      </View>

      <View className='bottom-bar safe-area-bottom'>
        <Button className='book-btn' onClick={handleBook}>预约陪诊服务</Button>
      </View>
    </View>
  )
}

