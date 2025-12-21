/**
 * 地区数据解析
 * 
 * 使用 @vant/area-data 提供完整的中国省市区数据
 */

import { areaList } from '@vant/area-data'
import type { AreaItem } from './types'

interface AreaData {
  provinces: AreaItem[]
  cityMap: Record<string, AreaItem[]>
  districtMap: Record<string, AreaItem[]>
}

/**
 * 解析 @vant/area-data 数据结构
 * areaList = { province_list: { code: name }, city_list: { code: name }, county_list: { code: name } }
 */
function parseAreaData(): AreaData {
  const provinces: AreaItem[] = []
  const cityMap: Record<string, AreaItem[]> = {}
  const districtMap: Record<string, AreaItem[]> = {}

  // 解析省份
  Object.entries(areaList.province_list).forEach(([code, name]) => {
    provinces.push({ code, name })
  })

  // 解析城市（根据省份代码前2位匹配）
  Object.entries(areaList.city_list).forEach(([code, name]) => {
    const provinceCode = code.slice(0, 2) + '0000'
    if (!cityMap[provinceCode]) {
      cityMap[provinceCode] = []
    }
    cityMap[provinceCode].push({ code, name })
  })

  // 解析区县（根据城市代码前4位匹配）
  Object.entries(areaList.county_list).forEach(([code, name]) => {
    const cityCode = code.slice(0, 4) + '00'
    if (!districtMap[cityCode]) {
      districtMap[cityCode] = []
    }
    districtMap[cityCode].push({ code, name })
  })

  return { provinces, cityMap, districtMap }
}

// 解析后的地区数据（单例）
export const areaData = parseAreaData()

/**
 * 根据省份名称查找省份代码
 */
export function findProvinceCode(provinceName: string): string | undefined {
  const province = areaData.provinces.find((p) => p.name === provinceName)
  return province?.code
}

/**
 * 根据省份代码和城市名称查找城市代码
 */
export function findCityCode(provinceCode: string, cityName: string): string | undefined {
  const cities = areaData.cityMap[provinceCode] || []
  const city = cities.find((c) => c.name === cityName)
  return city?.code
}

