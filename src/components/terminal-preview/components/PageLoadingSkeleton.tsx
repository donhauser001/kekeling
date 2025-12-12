/**
 * 页面加载骨架屏
 * 
 * Step 14.1-B.2: 用于 React.lazy 的 Suspense fallback
 * 保持与页面内容区高度一致，防止切页抖动
 */

import React from 'react'

interface PageLoadingSkeletonProps {
  /** 是否暗色模式 */
  isDarkMode?: boolean
}

export function PageLoadingSkeleton({ isDarkMode = false }: PageLoadingSkeletonProps) {
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardColor = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const shimmerColor = isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
  
  return (
    <div className={`flex flex-col h-full ${bgColor} animate-pulse`}>
      {/* 顶部导航区域骨架 */}
      <div className={`h-12 ${cardColor} flex items-center px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`w-6 h-6 rounded ${shimmerColor}`} />
        <div className={`ml-4 w-24 h-4 rounded ${shimmerColor}`} />
      </div>
      
      {/* 内容区域骨架 */}
      <div className="flex-1 p-4 space-y-4">
        {/* 统计卡片区域 */}
        <div className={`rounded-lg p-4 ${cardColor}`}>
          <div className={`w-20 h-3 rounded ${shimmerColor} mb-3`} />
          <div className={`w-32 h-6 rounded ${shimmerColor}`} />
        </div>
        
        {/* 列表区域 */}
        <div className={`rounded-lg ${cardColor}`}>
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`p-4 flex items-center space-x-3 ${i < 3 ? `border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}` : ''}`}
            >
              <div className={`w-10 h-10 rounded-full ${shimmerColor}`} />
              <div className="flex-1 space-y-2">
                <div className={`w-24 h-3 rounded ${shimmerColor}`} />
                <div className={`w-16 h-2 rounded ${shimmerColor}`} />
              </div>
              <div className={`w-12 h-4 rounded ${shimmerColor}`} />
            </div>
          ))}
        </div>
        
        {/* 底部留白 */}
        <div className={`rounded-lg p-4 ${cardColor}`}>
          <div className={`w-full h-8 rounded ${shimmerColor}`} />
        </div>
      </div>
    </div>
  )
}

