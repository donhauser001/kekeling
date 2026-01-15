/**
 * 邀请记录页面
 */

import { useState, useEffect } from 'react'
import { Box, Text, Icon, Image } from '../../../../ui/primitives'
import { previewApi } from '../../../../api'
import type { ReferralRecord } from '../../../../api/types'
import type { ThemeSettings } from '../../../../types'
import { wxScale, wxSafeAreaTop } from './constants'

export interface ReferralRecordsPageProps {
  themeSettings: ThemeSettings
  isDarkMode: boolean
  onBack?: () => void
}

/**
 * 获取状态标签
 */
function getStatusLabel(status: ReferralRecord['status']): { text: string; color: string; bgColor: string } {
  switch (status) {
    case 'pending':
      return { text: '待注册', color: '#f59e0b', bgColor: '#fef3c7' }
    case 'registered':
      return { text: '已注册', color: '#3b82f6', bgColor: '#dbeafe' }
    case 'rewarded':
      return { text: '已发放', color: '#10b981', bgColor: '#d1fae5' }
    case 'invalid':
      return { text: '无效', color: '#6b7280', bgColor: '#f3f4f6' }
    default:
      return { text: '未知', color: '#6b7280', bgColor: '#f3f4f6' }
  }
}

/**
 * 格式化时间
 */
function formatTime(dateStr?: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

/**
 * 记录项组件
 */
function RecordItem({
  record,
  isDarkMode,
  primaryColor,
}: {
  record: ReferralRecord
  isDarkMode: boolean
  primaryColor: string
}) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
  const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'

  const statusInfo = getStatusLabel(record.status)
  const displayName = record.invitee?.nickname || record.patientPhone || '未知用户'
  const displayAvatar = record.invitee?.avatar

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 16 * wxScale,
        backgroundColor: cardBg,
        borderRadius: 12 * wxScale,
        marginBottom: 12 * wxScale,
      }}
    >
      {/* 头像 */}
      <Box
        style={{
          width: 48 * wxScale,
          height: 48 * wxScale,
          borderRadius: 24 * wxScale,
          backgroundColor: `${primaryColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {displayAvatar ? (
          <Image
            src={displayAvatar}
            style={{
              width: 48 * wxScale,
              height: 48 * wxScale,
            }}
          />
        ) : (
          <Icon name="user" size={24 * wxScale} color={primaryColor} />
        )}
      </Box>

      {/* 信息 */}
      <Box style={{ flex: 1, marginLeft: 12 * wxScale, minWidth: 0 }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 * wxScale }}>
          <Text
            style={{
              fontSize: 15 * wxScale,
              fontWeight: 500,
              color: textPrimary,
            }}
          >
            {displayName}
          </Text>
          <Box
            style={{
              paddingLeft: 8 * wxScale,
              paddingRight: 8 * wxScale,
              paddingTop: 2 * wxScale,
              paddingBottom: 2 * wxScale,
              borderRadius: 4 * wxScale,
              backgroundColor: statusInfo.bgColor,
            }}
          >
            <Text style={{ fontSize: 11 * wxScale, color: statusInfo.color }}>
              {statusInfo.text}
            </Text>
          </Box>
        </Box>
        <Text
          style={{
            fontSize: 12 * wxScale,
            color: textSecondary,
            marginTop: 4 * wxScale,
          }}
        >
          邀请时间：{formatTime(record.createdAt)}
        </Text>
        {record.status === 'rewarded' && record.inviterReward?.points && (
          <Text
            style={{
              fontSize: 12 * wxScale,
              color: primaryColor,
              marginTop: 2 * wxScale,
            }}
          >
            获得奖励：+{record.inviterReward.points} 积分
          </Text>
        )}
      </Box>

      {/* 类型标识 */}
      <Box
        style={{
          paddingLeft: 8 * wxScale,
          paddingRight: 8 * wxScale,
          paddingTop: 4 * wxScale,
          paddingBottom: 4 * wxScale,
          borderRadius: 4 * wxScale,
          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
        }}
      >
        <Text style={{ fontSize: 11 * wxScale, color: textSecondary }}>
          {record.type === 'patient' ? '就诊人' : '好友'}
        </Text>
      </Box>
    </Box>
  )
}

/**
 * 空状态组件
 */
function EmptyState({ isDarkMode }: { isDarkMode: boolean }) {
  const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80 * wxScale,
        paddingBottom: 80 * wxScale,
      }}
    >
      <Icon name="peoples" size={64 * wxScale} color={textMuted} />
      <Text
        style={{
          fontSize: 14 * wxScale,
          color: textMuted,
          marginTop: 16 * wxScale,
        }}
      >
        暂无邀请记录
      </Text>
      <Text
        style={{
          fontSize: 12 * wxScale,
          color: textMuted,
          marginTop: 8 * wxScale,
        }}
      >
        快去邀请好友一起享受优惠吧
      </Text>
    </Box>
  )
}

/**
 * 骨架屏
 */
function RecordsSkeleton({ isDarkMode }: { isDarkMode: boolean }) {
  const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
  const skeletonBg = isDarkMode ? '#374151' : '#e5e7eb'

  return (
    <Box>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: 16 * wxScale,
            backgroundColor: cardBg,
            borderRadius: 12 * wxScale,
            marginBottom: 12 * wxScale,
          }}
        >
          <Box
            style={{
              width: 48 * wxScale,
              height: 48 * wxScale,
              borderRadius: 24 * wxScale,
              backgroundColor: skeletonBg,
            }}
          />
          <Box style={{ flex: 1, marginLeft: 12 * wxScale }}>
            <Box
              style={{
                width: 120 * wxScale,
                height: 16 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: skeletonBg,
              }}
            />
            <Box
              style={{
                width: 180 * wxScale,
                height: 12 * wxScale,
                borderRadius: 4 * wxScale,
                backgroundColor: skeletonBg,
                marginTop: 8 * wxScale,
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export function ReferralRecordsPage({
  themeSettings,
  isDarkMode,
  onBack,
}: ReferralRecordsPageProps) {
  const [records, setRecords] = useState<ReferralRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
  const primaryColor = themeSettings.primaryColor

  // 加载数据
  useEffect(() => {
    setIsLoading(true)
    previewApi
      .getReferralRecords({ page: 1, pageSize: 20 })
      .then((res) => {
        setRecords(res.data)
        setTotal(res.total)
        setHasMore(res.data.length < res.total)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('[ReferralRecordsPage] 加载失败:', err)
        setIsLoading(false)
      })
  }, [])

  // 加载更多
  const loadMore = () => {
    if (!hasMore || isLoading) return

    const nextPage = page + 1
    previewApi
      .getReferralRecords({ page: nextPage, pageSize: 20 })
      .then((res) => {
        setRecords((prev) => [...prev, ...res.data])
        setPage(nextPage)
        setHasMore(records.length + res.data.length < res.total)
      })
      .catch((err) => {
        console.error('[ReferralRecordsPage] 加载更多失败:', err)
      })
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: bgColor,
      }}
    >
      {/* 页面标题 */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: wxSafeAreaTop,
          backgroundColor: primaryColor,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: 44 * wxScale,
            paddingLeft: 12 * wxScale,
            paddingRight: 12 * wxScale,
          }}
        >
          {/* 返回按钮 */}
          <Box
            onClick={onBack}
            style={{
              position: 'absolute',
              left: 12 * wxScale,
              width: 36 * wxScale,
              height: 36 * wxScale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="left" size={22 * wxScale} color="#fff" />
          </Box>

          {/* 标题 */}
          <Text
            style={{
              fontSize: 17 * wxScale,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            邀请记录
          </Text>
        </Box>
      </Box>

      {/* 统计信息 */}
      {!isLoading && records.length > 0 && (
        <Box
          style={{
            paddingLeft: 16 * wxScale,
            paddingRight: 16 * wxScale,
            paddingTop: 12 * wxScale,
            paddingBottom: 4 * wxScale,
          }}
        >
          <Text
            style={{
              fontSize: 13 * wxScale,
              color: isDarkMode ? '#9ca3af' : '#6b7280',
            }}
          >
            共 {total} 条邀请记录
          </Text>
        </Box>
      )}

      {/* 内容区 */}
      <Box
        style={{
          paddingLeft: 16 * wxScale,
          paddingRight: 16 * wxScale,
          paddingTop: 8 * wxScale,
        }}
      >
        {isLoading ? (
          <RecordsSkeleton isDarkMode={isDarkMode} />
        ) : records.length === 0 ? (
          <EmptyState isDarkMode={isDarkMode} />
        ) : (
          <>
            {records.map((record) => (
              <RecordItem
                key={record.id}
                record={record}
                isDarkMode={isDarkMode}
                primaryColor={primaryColor}
              />
            ))}

            {/* 加载更多 */}
            {hasMore && (
              <Box
                onClick={loadMore}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: 16 * wxScale,
                  paddingBottom: 16 * wxScale,
                }}
              >
                <Text
                  style={{
                    fontSize: 13 * wxScale,
                    color: primaryColor,
                  }}
                >
                  加载更多
                </Text>
              </Box>
            )}

            {!hasMore && records.length > 0 && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: 16 * wxScale,
                  paddingBottom: 16 * wxScale,
                }}
              >
                <Text
                  style={{
                    fontSize: 12 * wxScale,
                    color: isDarkMode ? '#6b7280' : '#9ca3af',
                  }}
                >
                  没有更多了
                </Text>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* 底部留白 */}
      <Box style={{ height: 64 * wxScale }} />
    </Box>
  )
}
