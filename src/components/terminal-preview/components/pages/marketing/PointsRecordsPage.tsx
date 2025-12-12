/**
 * 积分明细页面（预览器版本）
 *
 * Step 7 批次 B: points-records
 * - page key: 'points-records'
 * - API: previewApi.getPointsRecords()
 * - 数据通道: userRequest
 */

import { useQuery } from '@tanstack/react-query'
import type { ThemeSettings } from '../../../types'
import { previewApi, type PointsRecord } from '../../../api'

// ============================================================================
// 类型定义
// ============================================================================

export interface PointsRecordsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
}

// ============================================================================
// 组件实现
// ============================================================================

export function PointsRecordsPage({ themeSettings, isDarkMode, onBack }: PointsRecordsPageProps) {
  // 获取积分记录
  const {
    data: recordsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['preview', 'points', 'records'],
    queryFn: () => previewApi.getPointsRecords(),
    staleTime: 60 * 1000,
  })

  const records = recordsData?.items ?? []
  const isEmpty = !isLoading && records.length === 0

  return (
    <div
      className="min-h-full"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fa',
      }}
    >
      {/* 页面标题 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center"
        style={{
          backgroundColor: themeSettings.primaryColor,
        }}
      >
        {onBack && (
          <button onClick={onBack} className="text-white mr-3">
            ←
          </button>
        )}
        <h1 className="text-lg font-semibold text-white flex-1 text-center pr-6">
          积分明细
        </h1>
      </div>

      {/* 内容区 */}
      <div className="px-4 py-4">
        {/* 加载中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400 text-sm">加载中...</div>
          </div>
        )}

        {/* 请求失败 */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-2">😔</div>
            <div className="text-gray-400 text-sm">加载失败，请稍后重试</div>
          </div>
        )}

        {/* 空态 */}
        {isEmpty && !isError && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-5xl mb-3">📋</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无积分记录
            </div>
          </div>
        )}

        {/* 记录列表 */}
        {!isLoading && !isError && records.length > 0 && (
          <div className="space-y-2">
            {records.map((record) => (
              <RecordItem
                key={record.id}
                record={record}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部留白 */}
      <div className="h-16" />
    </div>
  )
}

// ============================================================================
// 记录项子组件
// ============================================================================

interface RecordItemProps {
  record: PointsRecord
  isDarkMode: boolean
}

function RecordItem({ record, isDarkMode }: RecordItemProps) {
  const isEarn = record.type === 'earn'

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg"
      style={{
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      }}
    >
      <div>
        <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {record.title}
        </div>
        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {record.createdAt}
        </div>
      </div>
      <div className={`font-medium ${isEarn ? 'text-green-500' : 'text-red-500'}`}>
        {isEarn ? '+' : '-'}{record.points}
      </div>
    </div>
  )
}

