import { View, Text, Button, Input, Picker } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { getPrimaryColor } from '@/utils/theme'
import { patientsApi } from '@/services/api'
import { isLoggedIn } from '@/services/request'
import './patients.scss'

// 就诊人类型
interface Patient {
  id: string
  name: string
  gender: string
  phone: string
  idCard?: string
  relation: string
  birthday?: string
  isDefault?: boolean
}

// 关系选项
const relationOptions = ['本人', '父亲', '母亲', '配偶', '子女', '其他']
const genderOptions = ['male', 'female']
const genderLabels = ['男', '女']

export default function Patients() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  
  // 表单状态
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    phone: '',
    idCard: '',
    relation: '本人',
    birthday: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // 加载就诊人列表
  const loadPatients = async () => {
    if (!isLoggedIn()) {
      setPatients([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await patientsApi.getList()
      setPatients(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('加载就诊人失败:', err)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadPatients()
    
    // 检查是否需要直接打开添加表单
    if (router.params.action === 'add') {
      handleAddPatient()
    }
  }, [])

  // 页面显示时刷新
  useDidShow(() => {
    loadPatients()
  })

  // 打开添加表单
  const handleAddPatient = () => {
    if (!isLoggedIn()) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再添加就诊人',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/auth/login' })
          }
        }
      })
      return
    }
    
    setEditingPatient(null)
    setFormData({
      name: '',
      gender: 'male',
      phone: '',
      idCard: '',
      relation: '本人',
      birthday: '',
    })
    setShowForm(true)
  }

  // 打开编辑表单
  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name,
      gender: patient.gender || 'male',
      phone: patient.phone || '',
      idCard: patient.idCard || '',
      relation: patient.relation || '本人',
      birthday: patient.birthday ? patient.birthday.split('T')[0] : '',
    })
    setShowForm(true)
  }

  // 关闭表单
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingPatient(null)
  }

  // 提交表单
  const handleSubmit = async () => {
    // 验证
    if (!formData.name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    if (!formData.phone.trim()) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }
    if (!/^1\d{10}$/.test(formData.phone)) {
      Taro.showToast({ title: '手机号格式不正确', icon: 'none' })
      return
    }

    try {
      setSubmitting(true)
      
      const data: any = {
        name: formData.name.trim(),
        gender: formData.gender,
        phone: formData.phone.trim(),
        relation: formData.relation,
      }
      
      if (formData.idCard.trim()) {
        data.idCard = formData.idCard.trim()
      }
      if (formData.birthday) {
        data.birthday = new Date(formData.birthday).toISOString()
      }

      if (editingPatient) {
        // 编辑
        await patientsApi.update(editingPatient.id, data)
        Taro.showToast({ title: '修改成功', icon: 'success' })
      } else {
        // 新增
        await patientsApi.create(data as any)
        Taro.showToast({ title: '添加成功', icon: 'success' })
      }

      setShowForm(false)
      loadPatients()
    } catch (err: any) {
      Taro.showToast({ title: err.message || '操作失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  // 删除就诊人
  const handleDeletePatient = (patient: Patient) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除就诊人"${patient.name}"吗？`,
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await patientsApi.delete(patient.id)
            Taro.showToast({ title: '删除成功', icon: 'success' })
            loadPatients()
          } catch (err) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  // 设为默认
  const handleSetDefault = async (patient: Patient) => {
    try {
      await patientsApi.setDefault(patient.id)
      Taro.showToast({ title: '设置成功', icon: 'success' })
      loadPatients()
    } catch (err) {
      Taro.showToast({ title: '设置失败', icon: 'none' })
    }
  }

  // 计算年龄
  const calculateAge = (birthday?: string) => {
    if (!birthday) return null
    const birth = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // 未登录状态
  if (!isLoggedIn()) {
    return (
      <View className='patients-page'>
        <View className='empty-container'>
          <Icon name='user' size={64} color='#d9d9d9' />
          <Text className='empty-text'>请先登录</Text>
          <View 
            className='login-btn'
            onClick={() => Taro.navigateTo({ url: '/pages/auth/login' })}
          >
            去登录
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='patients-page'>
      {/* 就诊人列表 */}
      <View className='patient-list'>
        {loading ? (
          <View className='loading-container'>
            <View className='loading-spinner' />
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : patients.length === 0 ? (
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
                    color={patient.gender === 'male' ? getPrimaryColor() : '#eb2f96'} 
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
                    {patient.birthday && (
                      <>
                        <Text className='divider'>|</Text>
                        <Text className='detail-item'>{calculateAge(patient.birthday)}岁</Text>
                      </>
                    )}
                    <Text className='divider'>|</Text>
                    <Text className='detail-item'>{patient.phone}</Text>
                  </View>
                </View>
              </View>

              <View className='patient-actions'>
                {!patient.isDefault && (
                  <View 
                    className='action-btn'
                    onClick={() => handleSetDefault(patient)}
                  >
                    <Icon name='check-circle' size={16} color={getPrimaryColor()} />
                    <Text>设为默认</Text>
                  </View>
                )}
                <View 
                  className='action-btn'
                  onClick={() => handleEditPatient(patient)}
                >
                  <Icon name='edit' size={16} color='#666' />
                  <Text>编辑</Text>
                </View>
                <View 
                  className='action-btn delete'
                  onClick={() => handleDeletePatient(patient)}
                >
                  <Icon name='trash-2' size={16} color='#ff4d4f' />
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

      {/* 添加/编辑表单弹窗 */}
      {showForm && (
        <View className='form-modal'>
          <View className='form-backdrop' onClick={handleCloseForm} />
          <View className='form-container'>
            <View className='form-header'>
              <Text className='form-title'>
                {editingPatient ? '编辑就诊人' : '添加就诊人'}
              </Text>
              <View className='close-btn' onClick={handleCloseForm}>
                <Icon name='x' size={24} color='#999' />
              </View>
            </View>
            
            <View className='form-content'>
              <View className='form-item'>
                <Text className='form-label'>姓名 *</Text>
                <Input
                  className='form-input'
                  placeholder='请输入就诊人姓名'
                  value={formData.name}
                  onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
                />
              </View>

              <View className='form-item'>
                <Text className='form-label'>性别 *</Text>
                <Picker
                  mode='selector'
                  range={genderLabels}
                  value={genderOptions.indexOf(formData.gender)}
                  onChange={(e) => setFormData({ ...formData, gender: genderOptions[e.detail.value] })}
                >
                  <View className='form-picker'>
                    <Text>{formData.gender === 'male' ? '男' : '女'}</Text>
                    <Icon name='chevron-down' size={16} color='#999' />
                  </View>
                </Picker>
              </View>

              <View className='form-item'>
                <Text className='form-label'>手机号 *</Text>
                <Input
                  className='form-input'
                  type='number'
                  placeholder='请输入手机号'
                  maxlength={11}
                  value={formData.phone}
                  onInput={(e) => setFormData({ ...formData, phone: e.detail.value })}
                />
              </View>

              <View className='form-item'>
                <Text className='form-label'>与本人关系 *</Text>
                <Picker
                  mode='selector'
                  range={relationOptions}
                  value={relationOptions.indexOf(formData.relation)}
                  onChange={(e) => setFormData({ ...formData, relation: relationOptions[e.detail.value] })}
                >
                  <View className='form-picker'>
                    <Text>{formData.relation}</Text>
                    <Icon name='chevron-down' size={16} color='#999' />
                  </View>
                </Picker>
              </View>

              <View className='form-item'>
                <Text className='form-label'>出生日期</Text>
                <Picker
                  mode='date'
                  start='1920-01-01'
                  end={new Date().toISOString().split('T')[0]}
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.detail.value })}
                >
                  <View className='form-picker'>
                    <Text className={formData.birthday ? '' : 'placeholder'}>
                      {formData.birthday || '请选择出生日期（可选）'}
                    </Text>
                    <Icon name='chevron-down' size={16} color='#999' />
                  </View>
                </Picker>
              </View>

              <View className='form-item'>
                <Text className='form-label'>身份证号</Text>
                <Input
                  className='form-input'
                  placeholder='请输入身份证号（可选）'
                  maxlength={18}
                  value={formData.idCard}
                  onInput={(e) => setFormData({ ...formData, idCard: e.detail.value })}
                />
              </View>
            </View>

            <View className='form-footer'>
              <Button className='cancel-btn' onClick={handleCloseForm}>
                取消
              </Button>
              <Button 
                className='submit-btn' 
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '保存中...' : '保存'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
