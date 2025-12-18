/**
 * 服务详情数据获取 Hook
 * 使用 useState + useEffect 替代 useQuery，确保小程序兼容
 */

import { useState, useEffect } from 'react'
import { previewApi } from '../../../../api'
import type { ServiceDetailType, BannerDataType, ServiceListItem } from '../types'

interface UseServiceDetailDataResult {
  service: ServiceDetailType | null
  isLoading: boolean
  bannerData: BannerDataType | null
  recommendedServices: ServiceListItem[]
}

export function useServiceDetailData(serviceId: string): UseServiceDetailDataResult {
  const [service, setService] = useState<ServiceDetailType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [bannerData, setBannerData] = useState<BannerDataType | null>(null)
  const [recommendedServices, setRecommendedServices] = useState<ServiceListItem[]>([])

  // 获取服务详情
  useEffect(() => {
    if (!serviceId) return
    setIsLoading(true)
    console.log('[ServiceDetailPage] 开始加载服务详情:', serviceId)
    previewApi.getServiceDetail(serviceId)
      .then(data => {
        console.log('[ServiceDetailPage] ✅ 服务详情加载成功:', data?.name)
        setService(data)
      })
      .catch(err => console.error('[ServiceDetailPage] ❌ 服务详情加载失败:', err))
      .finally(() => setIsLoading(false))
  }, [serviceId])

  // 获取轮播图
  useEffect(() => {
    previewApi.getBanners('service-detail')
      .then(data => setBannerData(data))
      .catch(err => console.error('[ServiceDetailPage] 轮播图加载失败:', err))
  }, [])

  // 获取推荐服务
  useEffect(() => {
    if (!serviceId) return
    previewApi.getServices({ pageSize: 6 })
      .then(result => {
        const filtered = (result?.data || []).filter(s => s.id !== serviceId).slice(0, 5)
        setRecommendedServices(filtered)
      })
      .catch(err => console.error('[ServiceDetailPage] 推荐服务加载失败:', err))
  }, [serviceId])

  return { service, isLoading, bannerData, recommendedServices }
}
