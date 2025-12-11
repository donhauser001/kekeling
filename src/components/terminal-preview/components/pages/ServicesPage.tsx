/**
 * 服务页预览组件
 */

import { useState } from 'react'
import { Search, Clock, Star, Rocket, Hospital } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ThemeSettings } from '../../types'

interface ServicesPageProps {
  themeSettings: ThemeSettings
  isDarkMode?: boolean
}

// Mock 分类数据
const mockCategories = [
  { id: 'all', name: '全部' },
  { id: '1', name: '陪诊服务' },
  { id: '2', name: '代办服务' },
  { id: '3', name: '陪护服务' },
  { id: '4', name: '在线咨询' },
]

// Mock 服务列表
const mockServices = [
  {
    id: '1',
    name: '全程陪诊',
    category: '1',
    description: '专业陪诊员全程陪同就医，挂号、问诊、检查、取药一站式服务',
    price: 299,
    originalPrice: 399,
    duration: '4-6小时',
    orderCount: 12580,
    rating: 98,
    tags: ['热门', '专业'],
  },
  {
    id: '2',
    name: '代办挂号',
    category: '2',
    description: '专家号、普通号代挂服务，省去排队烦恼',
    price: 99,
    originalPrice: 0,
    duration: '当天',
    orderCount: 8920,
    rating: 99,
    tags: ['便捷'],
  },
  {
    id: '3',
    name: '检查陪同',
    category: '1',
    description: '陪同完成各项检查，协助排队、取报告',
    price: 199,
    originalPrice: 249,
    duration: '2-4小时',
    orderCount: 6580,
    rating: 97,
    tags: [],
  },
  {
    id: '4',
    name: '住院陪护',
    category: '3',
    description: '住院期间全程陪护，协助日常护理',
    price: 399,
    originalPrice: 499,
    duration: '24小时',
    orderCount: 3250,
    rating: 99,
    tags: ['专业', '24小时'],
  },
]

export function ServicesPage({ themeSettings, isDarkMode = false }: ServicesPageProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredServices = activeCategory === 'all'
    ? mockServices
    : mockServices.filter(s => s.category === activeCategory)

  // 深色模式颜色
  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const tabBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  return (
    <div style={{ backgroundColor: bgColor }} className='min-h-full pb-4'>
      {/* 搜索框 */}
      <div className='px-3 pt-3 pb-2'>
        <div
          className='flex items-center gap-2 rounded-full px-4 py-2.5 cursor-pointer transition-all hover:shadow-md'
          style={{ backgroundColor: cardBg }}
        >
          <Search className='h-4 w-4' style={{ color: textMuted }} />
          <span className='text-sm' style={{ color: textMuted }}>
            搜索服务
          </span>
        </div>
      </div>

      {/* 分类 Tab */}
      <div
        className='sticky top-0 z-10 overflow-x-auto px-3 py-2'
        style={{ backgroundColor: tabBg }}
      >
        <div className='flex gap-3'>
          {mockCategories.map(cat => (
            <div
              key={cat.id}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all',
                activeCategory === cat.id
                  ? 'font-medium'
                  : ''
              )}
              style={{
                backgroundColor: activeCategory === cat.id
                  ? `${themeSettings.primaryColor}15`
                  : 'transparent',
                color: activeCategory === cat.id
                  ? themeSettings.primaryColor
                  : textSecondary,
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </div>
          ))}
        </div>
      </div>

      {/* 服务列表 */}
      <div className='px-3 space-y-3'>
        {filteredServices.map(service => (
          <div
            key={service.id}
            className='rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md active:scale-[0.98]'
            style={{ backgroundColor: cardBg }}
          >
            {/* 封面占位 */}
            <div
              className='h-28 flex items-center justify-center relative'
              style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f3f4f6' }}
            >
              <Hospital className='h-10 w-10' style={{ color: themeSettings.primaryColor }} />
              {service.tags.includes('热门') && (
                <div
                  className='absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px]'
                  style={{ backgroundColor: '#ff4d4f' }}
                >
                  <Rocket className='h-3 w-3' />
                  <span>热门</span>
                </div>
              )}
            </div>
            {/* 信息 */}
            <div className='p-3'>
              <p className='text-sm font-semibold' style={{ color: textPrimary }}>
                {service.name}
              </p>
              <p className='mt-1 text-xs line-clamp-2' style={{ color: textSecondary }}>
                {service.description}
              </p>
              <div className='mt-2 flex items-center gap-3 text-xs' style={{ color: textMuted }}>
                <div className='flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  <span>{service.duration}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Star className='h-3 w-3 text-amber-400' />
                  <span>{service.rating}%</span>
                </div>
              </div>
              <div className='mt-2 flex items-center justify-between'>
                <div className='flex items-baseline gap-1'>
                  <span className='text-xs' style={{ color: themeSettings.primaryColor }}>¥</span>
                  <span className='text-base font-bold' style={{ color: themeSettings.primaryColor }}>
                    {service.price}
                  </span>
                  {service.originalPrice > 0 && (
                    <span className='text-xs line-through' style={{ color: textMuted }}>
                      ¥{service.originalPrice}
                    </span>
                  )}
                </div>
                <span className='text-xs' style={{ color: textMuted }}>
                  {service.orderCount.toLocaleString()}人已预约
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
