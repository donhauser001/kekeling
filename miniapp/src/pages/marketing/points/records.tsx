import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import { pointApi, type PointRecord } from '@/services/api'
import './records.scss'

export default function PointRecords() {
  const [records, setRecords] = useState<PointRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useLoad(() => {
    loadRecords()
  })

  const loadRecords = async (reset = false) => {
    try {
      if (reset) {
        setPage(1)
        setRecords([])
      }
      setLoading(true)
      const result = await pointApi.getRecords({
        page: reset ? 1 : page,
        pageSize: 20,
      })
      if (reset) {
        setRecords(result.data)
      } else {
        setRecords([...records, ...result.data])
      }
      setHasMore(result.data.length === 20)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'earn':
        return '获得'
      case 'use':
        return '使用'
      case 'expire':
        return '过期'
      case 'refund':
        return '退回'
      default:
        return ''
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'earn':
      case 'refund':
        return '#52c41a'
      case 'use':
        return '#ff4d4f'
      case 'expire':
        return '#faad14'
      default:
        return '#666'
    }
  }

  return (
    <View className='point-records-page'>
      <View className='records-list'>
        {loading && records.length === 0 ? (
          <View className='empty'>加载中...</View>
        ) : records.length === 0 ? (
          <View className='empty'>暂无积分记录</View>
        ) : (
          records.map((record) => (
            <View key={record.id} className='record-item'>
              <View className='record-left'>
                <Text className='record-desc'>{record.description || getTypeText(record.type)}</Text>
                <Text className='record-time'>
                  {new Date(record.createdAt).toLocaleString()}
                </Text>
              </View>
              <View className='record-right'>
                <Text
                  className='record-points'
                  style={{ color: getTypeColor(record.type) }}
                >
                  {record.points > 0 ? '+' : ''}{record.points}
                </Text>
                <Text className='record-balance'>余额: {record.balance}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  )
}

