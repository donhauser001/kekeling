import { useQuery } from '@tanstack/react-query'
import {
  Crown,
  Award,
  Users,
  Star,
  Shield,
  Gem,
  Medal,
  Trophy,
  Sparkles,
} from 'lucide-react'
import { distributionApi, type DistributionLevel } from '@/lib/api'

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown,
  Award,
  Users,
  Star,
  Shield,
  Gem,
  Medal,
  Trophy,
  Sparkles,
}

// 默认等级配置（当 API 还没加载时使用）
const defaultLevels: Record<number, { label: string; color: string; bgColor: string; icon: string }> = {
  1: { label: '城市合伙人', color: '#f59e0b', bgColor: '#fef3c7', icon: 'Crown' },
  2: { label: '团队长', color: '#3b82f6', bgColor: '#dbeafe', icon: 'Award' },
  3: { label: '普通成员', color: '#6b7280', bgColor: '#f3f4f6', icon: 'Users' },
}

export interface LevelConfig {
  label: string
  color: string
  bgColor: string
  icon: string
  IconComponent: React.ComponentType<{ className?: string }>
  commissionRate: number
}

export function useDistributionLevels() {
  const { data: levels, isLoading, error } = useQuery({
    queryKey: ['distribution-levels'],
    queryFn: () => distributionApi.getLevels(),
    staleTime: 5 * 60 * 1000, // 5 分钟内不重新获取
  })

  // 将等级数组转换为以 level 为 key 的 Map
  const levelMap: Record<number, LevelConfig> = {}

  if (levels && levels.length > 0) {
    levels.forEach((level) => {
      const IconComponent = iconMap[level.icon || 'Users'] || Users
      levelMap[level.level] = {
        label: level.name,
        color: level.color,
        bgColor: level.bgColor || '#f3f4f6',
        icon: level.icon || 'Users',
        IconComponent,
        commissionRate: level.commissionRate,
      }
    })
  } else {
    // 使用默认配置
    Object.entries(defaultLevels).forEach(([key, value]) => {
      const IconComponent = iconMap[value.icon] || Users
      levelMap[Number(key)] = {
        ...value,
        IconComponent,
        commissionRate: 0,
      }
    })
  }

  // 获取指定等级的配置
  const getLevelConfig = (level: number): LevelConfig => {
    return levelMap[level] || levelMap[3] || {
      label: '未知等级',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      icon: 'Users',
      IconComponent: Users,
      commissionRate: 0,
    }
  }

  // 获取所有等级列表（用于下拉选择等）
  const levelOptions = levels?.map((level) => ({
    value: level.level,
    label: level.name,
    ...getLevelConfig(level.level),
  })) || Object.entries(defaultLevels).map(([key, value]) => ({
    value: Number(key),
    label: value.label,
    ...getLevelConfig(Number(key)),
  }))

  return {
    levels,
    levelMap,
    getLevelConfig,
    levelOptions,
    isLoading,
    error,
  }
}
