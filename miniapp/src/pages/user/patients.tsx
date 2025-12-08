import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './patients.scss'

// Mock 数据
const mockPatients = [
  { id: '1', name: '张三', phone: '13812345678', idCard: '310***********1234', gender: 'male', relation: '本人', isDefault: true },
  { id: '2', name: '李四', phone: '13912345678', idCard: '310***********5678', gender: 'female', relation: '配偶', isDefault: false },
]

export default function Patients() {
  const [patients, setPatients] = useState(mockPatients)

  const handleAdd = () => {
    // TODO: 打开添加就诊人弹窗
    Taro.showToast({ title: '添加功能开发中', icon: 'none' })
  }

  const handleEdit = (id: string) => {
    // TODO: 打开编辑就诊人弹窗
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' })
  }

  const handleSetDefault = (id: string) => {
    setPatients(patients.map(p => ({
      ...p,
      isDefault: p.id === id
    })))
    Taro.showToast({ title: '设置成功', icon: 'success' })
  }

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '删除就诊人',
      content: '确定要删除该就诊人吗？',
      success: (res) => {
        if (res.confirm) {
          setPatients(patients.filter(p => p.id !== id))
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  return (
    <View className='patients-page'>
      {/* 就诊人列表 */}
      <View className='patient-list'>
        {patients.map(patient => (
          <View key={patient.id} className='patient-card card'>
            <View className='patient-header'>
              <View className='patient-info'>
                <Text className='patient-name'>{patient.name}</Text>
                <Text className='patient-relation tag tag-primary'>{patient.relation}</Text>
                {patient.isDefault && (
                  <Text className='default-tag tag tag-success'>默认</Text>
                )}
              </View>
              <View className='patient-actions'>
                <Text className='action-btn' onClick={() => handleEdit(patient.id)}>编辑</Text>
              </View>
            </View>
            <View className='patient-detail'>
              <View className='detail-item'>
                <Text className='label'>手机号</Text>
                <Text className='value'>{patient.phone}</Text>
              </View>
              <View className='detail-item'>
                <Text className='label'>身份证</Text>
                <Text className='value'>{patient.idCard}</Text>
              </View>
            </View>
            <View className='patient-footer'>
              {!patient.isDefault && (
                <Text className='footer-btn' onClick={() => handleSetDefault(patient.id)}>
                  设为默认
                </Text>
              )}
              <Text className='footer-btn delete' onClick={() => handleDelete(patient.id)}>
                删除
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* 添加按钮 */}
      <View className='add-btn-container safe-area-bottom'>
        <Button className='add-btn' onClick={handleAdd}>
          + 添加就诊人
        </Button>
      </View>
    </View>
  )
}

