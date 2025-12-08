import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import './patients.scss'

// Mock 数据
const mockPatients = [
  { 
    id: '1', 
    name: '张三', 
    gender: 'male',
    age: 65,
    phone: '13888888888', 
    idCard: '310***********1234',
    relation: '本人',
    isDefault: true,
  },
  { 
    id: '2', 
    name: '李四', 
    gender: 'male',
    age: 68,
    phone: '13999999999', 
    idCard: '310***********5678',
    relation: '父亲',
    isDefault: false,
  },
]

export default function Patients() {
  const [patients, setPatients] = useState(mockPatients)

  useEffect(() => {
    // TODO: 从 API 获取就诊人列表
  }, [])

  const handleAddPatient = () => {
    // TODO: 跳转到添加就诊人页面
    Taro.showToast({ title: '功能开发中', icon: 'none' })
  }

  const handleEditPatient = (id: string) => {
    // TODO: 跳转到编辑就诊人页面
    Taro.showToast({ title: '功能开发中', icon: 'none' })
  }

  const handleDeletePatient = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该就诊人吗？',
      success: (res) => {
        if (res.confirm) {
          setPatients(patients.filter(p => p.id !== id))
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  const handleSetDefault = (id: string) => {
    setPatients(patients.map(p => ({
      ...p,
      isDefault: p.id === id
    })))
    Taro.showToast({ title: '设置成功', icon: 'success' })
  }

  return (
    <View className='patients-page'>
      {/* 就诊人列表 */}
      <View className='patient-list'>
        {patients.length === 0 ? (
          <View className='empty-container'>
            <Icon name='users' size={64} color='#d9d9d9' />
            <Text className='empty-text'>暂无就诊人</Text>
            <Text className='empty-desc'>添加就诊人，方便快速预约</Text>
          </View>
        ) : (
          patients.map(patient => (
            <View key={patient.id} className='patient-card card'>
              <View className='patient-header'>
                <View className='patient-avatar'>
                  <Icon 
                    name='user' 
                    size={24} 
                    color={patient.gender === 'male' ? '#1890ff' : '#eb2f96'} 
                  />
                </View>
                <View className='patient-info'>
                  <View className='name-row'>
                    <Text className='patient-name'>{patient.name}</Text>
                    <Text className='patient-relation tag tag-outline'>{patient.relation}</Text>
                    {patient.isDefault && (
                      <Text className='default-tag tag tag-primary'>默认</Text>
                    )}
                  </View>
                  <View className='detail-row'>
                    <Text className='detail-item'>
                      {patient.gender === 'male' ? '男' : '女'}
                    </Text>
                    <Text className='divider'>|</Text>
                    <Text className='detail-item'>{patient.age}岁</Text>
                    <Text className='divider'>|</Text>
                    <Text className='detail-item'>{patient.phone}</Text>
                  </View>
                </View>
              </View>

              <View className='patient-actions'>
                {!patient.isDefault && (
                  <View 
                    className='action-btn'
                    onClick={() => handleSetDefault(patient.id)}
                  >
                    <Icon name='check-circle' size={16} color='#1890ff' />
                    <Text>设为默认</Text>
                  </View>
                )}
                <View 
                  className='action-btn'
                  onClick={() => handleEditPatient(patient.id)}
                >
                  <Icon name='settings' size={16} color='#666' />
                  <Text>编辑</Text>
                </View>
                <View 
                  className='action-btn delete'
                  onClick={() => handleDeletePatient(patient.id)}
                >
                  <Icon name='x' size={16} color='#ff4d4f' />
                  <Text>删除</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 添加按钮 */}
      <View className='bottom-bar safe-area-bottom'>
        <Button className='add-btn' onClick={handleAddPatient}>
          <Icon name='plus' size={20} color='#fff' />
          <Text>添加就诊人</Text>
        </Button>
      </View>
    </View>
  )
}
