/**
 * 营销功能配置 Hook
 * 用于获取营销功能开关配置，控制菜单项和功能的显示/隐藏
 */

import { useQuery } from '@tanstack/react-query'
import { marketingSettingsApi, type MarketingSettings } from '@/lib/api'

// 默认配置（在数据加载前使用）
const defaultSettings: MarketingSettings = {
  membershipEnabled: true,
  pointsEnabled: true,
  couponsEnabled: true,
  referralsEnabled: true,
  campaignsEnabled: true,
}

export function useMarketingSettings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['marketing-settings'],
    queryFn: () => marketingSettingsApi.get(),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
    gcTime: 30 * 60 * 1000, // 缓存30分钟（原 cacheTime）
  })

  return {
    settings: data ?? defaultSettings,
    isLoading,
    error,
    
    // 便捷方法：检查某个功能是否启用
    isFeatureEnabled: (key: keyof MarketingSettings) => {
      return data?.[key] ?? defaultSettings[key]
    },
  }
}
