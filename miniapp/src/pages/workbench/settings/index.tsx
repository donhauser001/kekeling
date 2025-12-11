import { View, Text, Button, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useLoad } from '@tarojs/taro'
import Icon from '@/components/Icon'
import { get, post } from '@/services/request'
import './index.scss'

const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const weekdayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function ServiceSettings() {
  const [serviceHours, setServiceHours] = useState<Record<string, Array<{ start: string; end: string }>>>({})
  const [serviceRadius, setServiceRadius] = useState(20)
  const [maxDailyOrders, setMaxDailyOrders] = useState(5)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useLoad(() => {
    loadSettings()
  })

  const loadSettings = async () => {
    try {
      setLoading(true)
      const profile = await get('/escort/profile')
      if (profile) {
        setServiceRadius(profile.serviceRadius || 20)
        setMaxDailyOrders(profile.maxDailyOrders || 5)
        if (profile.serviceHours) {
          try {
            const hours = typeof profile.serviceHours === 'string'
              ? JSON.parse(profile.serviceHours)
              : profile.serviceHours
            setServiceHours(hours || {})
          } catch {
            setServiceHours({})
          }
        }
      }
    } catch (error: any) {
      Taro.showToast({ title: error.message || '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await post('/escort/settings/service', {
        serviceHours,
        serviceRadius,
        maxDailyOrders,
      })
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error: any) {
      Taro.showToast({ title: error.message || '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  const toggleWeekday = (key: string) => {
    const newHours = { ...serviceHours }
    if (newHours[key] && newHours[key].length > 0) {
      delete newHours[key]
    } else {
      newHours[key] = [{ start: '09:00', end: '18:00' }]
    }
    setServiceHours(newHours)
  }

  const updateTimeSlot = (key: string, index: number, field: 'start' | 'end', value: string) => {
    const newHours = { ...serviceHours }
    if (!newHours[key]) {
      newHours[key] = []
    }
    if (!newHours[key][index]) {
      newHours[key][index] = { start: '09:00', end: '18:00' }
    }
    newHours[key][index][field] = value
    setServiceHours({ ...newHours })
  }

  const addTimeSlot = (key: string) => {
    const newHours = { ...serviceHours }
    if (!newHours[key]) {
      newHours[key] = []
    }
    newHours[key].push({ start: '09:00', end: '18:00' })
    setServiceHours({ ...newHours })
  }

  const removeTimeSlot = (key: string, index: number) => {
    const newHours = { ...serviceHours }
    if (newHours[key]) {
      newHours[key].splice(index, 1)
      if (newHours[key].length === 0) {
        delete newHours[key]
      }
      setServiceHours({ ...newHours })
    }
  }

  if (loading) {
    return (
      <View className='settings-page'>
        <View className='loading'>加载中...</View>
      </View>
    )
  }

  return (
    <View className='settings-page'>
      <View className='header'>
        <Text className='title'>服务设置</Text>
      </View>

      {/* 服务时段配置 */}
      <View className='section card'>
        <Text className='section-title'>服务时段</Text>
        <Text className='section-desc'>设置每周可服务的时间段</Text>
        {weekdayKeys.map((key, index) => {
          const isEnabled = serviceHours[key] && serviceHours[key].length > 0
          return (
            <View key={key} className='weekday-item'>
              <View className='weekday-header' onClick={() => toggleWeekday(key)}>
                <View className='weekday-toggle'>
                  <View className={`toggle-switch ${isEnabled ? 'on' : ''}`}>
                    <View className='toggle-dot' />
                  </View>
                  <Text className='weekday-name'>{weekdays[index]}</Text>
                </View>
                <Icon name={isEnabled ? 'chevron-down' : 'chevron-right'} size={20} color='#999' />
              </View>
              {isEnabled && (
                <View className='time-slots'>
                  {serviceHours[key].map((slot, slotIndex) => (
                    <View key={slotIndex} className='time-slot'>
                      <Picker
                        mode='time'
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(key, slotIndex, 'start', e.detail.value)}
                      >
                        <View className='time-picker'>
                          <Text>{slot.start}</Text>
                          <Icon name='clock' size={16} color='#1890ff' />
                        </View>
                      </Picker>
                      <Text className='time-separator'>至</Text>
                      <Picker
                        mode='time'
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(key, slotIndex, 'end', e.detail.value)}
                      >
                        <View className='time-picker'>
                          <Text>{slot.end}</Text>
                          <Icon name='clock' size={16} color='#1890ff' />
                        </View>
                      </Picker>
                      {serviceHours[key].length > 1 && (
                        <View
                          className='remove-slot'
                          onClick={() => removeTimeSlot(key, slotIndex)}
                        >
                          <Icon name='x' size={18} color='#ff4d4f' />
                        </View>
                      )}
                    </View>
                  ))}
                  <Button
                    className='add-slot-btn'
                    size='mini'
                    onClick={() => addTimeSlot(key)}
                  >
                    + 添加时段
                  </Button>
                </View>
              )}
            </View>
          )
        })}
      </View>

      {/* 服务半径配置 */}
      <View className='section card'>
        <Text className='section-title'>服务半径</Text>
        <Text className='section-desc'>设置可接受订单的最大距离（公里）</Text>
        <View className='radius-input'>
          <Input
            type='number'
            value={String(serviceRadius)}
            onInput={(e) => setServiceRadius(Number(e.detail.value))}
            placeholder='请输入服务半径'
          />
          <Text className='unit'>公里</Text>
        </View>
        <Text className='hint'>范围：5-50公里</Text>
      </View>

      {/* 接单数量限制 */}
      <View className='section card'>
        <Text className='section-title'>每日最大接单数</Text>
        <Text className='section-desc'>设置每天最多可接的订单数量</Text>
        <View className='orders-input'>
          <Input
            type='number'
            value={String(maxDailyOrders)}
            onInput={(e) => setMaxDailyOrders(Number(e.detail.value))}
            placeholder='请输入最大接单数'
          />
          <Text className='unit'>单</Text>
        </View>
        <Text className='hint'>范围：1-20单</Text>
      </View>

      {/* 保存按钮 */}
      <View className='footer'>
        <Button className='save-btn' onClick={handleSave} loading={saving}>
          保存设置
        </Button>
      </View>
    </View>
  )
}
