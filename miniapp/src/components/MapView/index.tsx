/**
 * 跨端地图组件
 * 
 * H5 模式: 使用静态图片 (避免配置地图 SDK)
 * 小程序模式: 使用原生 Map 组件
 */
import { View, Map, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { isH5 } from '@/utils/env-adapter'
import './index.scss'

interface Marker {
  id: number
  latitude: number
  longitude: number
  title?: string
  iconPath?: string
  width?: number
  height?: number
}

interface MapViewProps {
  /** 纬度 */
  latitude: number
  /** 经度 */
  longitude: number
  /** 标记点 */
  markers?: Marker[]
  /** 地图高度 (rpx) */
  height?: number
  /** 缩放级别 */
  scale?: number
  /** 点击地图回调 */
  onTap?: () => void
  /** 是否显示导航按钮 */
  showNavButton?: boolean
  /** 目的地名称 (用于导航) */
  destinationName?: string
  /** 目的地地址 (用于导航) */
  destinationAddress?: string
  /** 样式类名 */
  className?: string
}

export const MapView = ({
  latitude,
  longitude,
  markers = [],
  height = 300,
  scale = 15,
  onTap,
  showNavButton = false,
  destinationName = '',
  destinationAddress = '',
  className = '',
}: MapViewProps) => {
  // 打开地图导航
  const handleNavigate = () => {
    if (isH5) {
      // H5: 打开高德地图网页版
      const url = `https://uri.amap.com/marker?position=${longitude},${latitude}&name=${encodeURIComponent(destinationName)}&address=${encodeURIComponent(destinationAddress)}&callnative=1`
      window.open(url, '_blank')
    } else {
      // 小程序: 打开微信内置地图
      Taro.openLocation({
        latitude,
        longitude,
        name: destinationName,
        address: destinationAddress,
        scale: 18,
      })
    }
  }

  // H5 模式: 使用静态地图图片
  if (isH5) {
    // 使用高德静态地图 API
    // 注意: 正式使用需要申请高德 Web 服务 Key
    // 开发阶段可以使用占位图
    const staticMapUrl = `https://restapi.amap.com/v3/staticmap?location=${longitude},${latitude}&zoom=${scale}&size=750*${height}&markers=mid,,A:${longitude},${latitude}&key=YOUR_AMAP_WEB_KEY`

    return (
      <View className={`map-view map-view--h5 ${className}`} onClick={onTap}>
        {/* 开发阶段使用渐变背景替代 */}
        <View 
          className="map-view__placeholder"
          style={{ height: `${height}rpx` }}
        >
          <View className="map-view__placeholder-icon">📍</View>
          <Text className="map-view__placeholder-text">
            {destinationName || '地图位置'}
          </Text>
          <Text className="map-view__placeholder-coords">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </Text>
        </View>

        {/* 正式环境可以换成静态地图 */}
        {/* <Image 
          className="map-view__static"
          src={staticMapUrl}
          mode="widthFix"
          style={{ height: `${height}rpx` }}
        /> */}

        {showNavButton && (
          <View className="map-view__nav-btn" onClick={handleNavigate}>
            <Text className="map-view__nav-icon">🧭</Text>
            <Text className="map-view__nav-text">导航</Text>
          </View>
        )}
      </View>
    )
  }

  // 小程序模式: 使用原生 Map 组件
  return (
    <View className={`map-view map-view--weapp ${className}`}>
      <Map
        className="map-view__native"
        latitude={latitude}
        longitude={longitude}
        markers={markers.length > 0 ? markers : [{
          id: 0,
          latitude,
          longitude,
          iconPath: '',
          width: 30,
          height: 30,
        }]}
        scale={scale}
        style={{ height: `${height}rpx` }}
        onTap={onTap}
      />

      {showNavButton && (
        <View className="map-view__nav-btn" onClick={handleNavigate}>
          <Text className="map-view__nav-icon">🧭</Text>
          <Text className="map-view__nav-text">导航</Text>
        </View>
      )}
    </View>
  )
}

export default MapView

