import { get } from './request'
import type {
  BannerAreaData,
  HomePageSettings,
  RecommendedServicesData,
  ServiceCategory,
  StatsData,
  ThemeSettings,
} from '../../../src/components/terminal-preview/types'

export function getThemeSettings() {
  return get<ThemeSettings>('/config/theme/settings')
}

export function getHomePageSettings() {
  return get<HomePageSettings>('/home/page-settings')
}

export function getBanners(area: string = 'home') {
  return get<BannerAreaData>(`/home/banners?position=${area}`)
}

export function getStats() {
  return get<StatsData>('/home/stats')
}

export function getCategories() {
  return get<ServiceCategory[]>('/services/categories')
}

export function getRecommendedServices() {
  return get<RecommendedServicesData>('/home/recommended-services')
}
