import { useState, useEffect } from 'react'
import { View, Text, Textarea, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ordersApi } from '@/services/api'
import { getPrimaryColor } from '@/services/request'
import './complaint.scss'

// 投诉类型
const COMPLAINT_TYPES = [
  { value: 'service_quality', label: '服务质量', desc: '服务不专业、未按约定提供服务' },
  { value: 'attitude', label: '服务态度', desc: '态度恶劣、不耐烦、敷衍' },
  { value: 'late', label: '迟到', desc: '陪诊员未按时到达' },
  { value: 'no_show', label: '爽约', desc: '陪诊员未出现' },
  { value: 'other', label: '其他', desc: '其他问题' },
]

export default function ComplaintPage() {
  const router = useRouter()
  const orderId = router.params.id || ''

  const [selectedType, setSelectedType] = useState<string>('')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const primaryColor = getPrimaryColor()

  // 选择图片
  const handleChooseImage = async () => {
    if (evidence.length >= 9) {
      Taro.showToast({ title: '最多上传9张图片', icon: 'none' })
      return
    }

    try {
      const res = await Taro.chooseImage({
        count: 9 - evidence.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      // 上传图片
      const uploadPromises = res.tempFilePaths.map(async (filePath) => {
        const uploadRes = await Taro.uploadFile({
          url: `${process.env.TARO_APP_API_BASE_URL || ''}/upload`,
          filePath,
          name: 'file',
          header: {
            Authorization: `Bearer ${Taro.getStorageSync('token')}`,
          },
        })

        const data = JSON.parse(uploadRes.data)
        if (data.code === 0) {
          return data.data.url
        }
        throw new Error(data.message || '上传失败')
      })

      const urls = await Promise.all(uploadPromises)
      setEvidence([...evidence, ...urls])
    } catch (error: any) {
      console.error('上传图片失败:', error)
      Taro.showToast({ title: error.message || '上传失败', icon: 'none' })
    }
  }

  // 删除图片
  const handleRemoveImage = (index: number) => {
    const newEvidence = [...evidence]
    newEvidence.splice(index, 1)
    setEvidence(newEvidence)
  }

  // 预览图片
  const handlePreviewImage = (index: number) => {
    Taro.previewImage({
      current: evidence[index],
      urls: evidence,
    })
  }

  // 提交投诉
  const handleSubmit = async () => {
    if (!selectedType) {
      Taro.showToast({ title: '请选择投诉类型', icon: 'none' })
      return
    }

    if (!description.trim()) {
      Taro.showToast({ title: '请描述问题', icon: 'none' })
      return
    }

    if (description.trim().length < 10) {
      Taro.showToast({ title: '问题描述不少于10个字', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      await ordersApi.submitComplaint(orderId, {
        type: selectedType,
        description: description.trim(),
        evidence,
      })

      Taro.showToast({
        title: '投诉已提交',
        icon: 'success',
        duration: 2000,
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 2000)
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '提交失败',
        icon: 'none',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!orderId) {
    return (
      <View className="error-container">
        <Text>缺少订单信息</Text>
      </View>
    )
  }

  return (
    <View className="complaint-page">
      {/* 投诉类型 */}
      <View className="section">
        <View className="section-title">投诉类型</View>
        <View className="type-list">
          {COMPLAINT_TYPES.map((type) => (
            <View
              key={type.value}
              className={`type-item ${selectedType === type.value ? 'active' : ''}`}
              style={selectedType === type.value ? { borderColor: primaryColor } : {}}
              onClick={() => setSelectedType(type.value)}
            >
              <View className="type-label">{type.label}</View>
              <View className="type-desc">{type.desc}</View>
              {selectedType === type.value && (
                <View
                  className="type-check"
                  style={{ backgroundColor: primaryColor }}
                >
                  ✓
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 问题描述 */}
      <View className="section">
        <View className="section-title">
          问题描述
          <Text className="required">*</Text>
        </View>
        <Textarea
          className="description-input"
          placeholder="请详细描述您遇到的问题，不少于10个字"
          value={description}
          onInput={(e) => setDescription(e.detail.value)}
          maxlength={500}
        />
        <View className="char-count">{description.length}/500</View>
      </View>

      {/* 图片证据 */}
      <View className="section">
        <View className="section-title">
          上传凭证
          <Text className="optional">（选填，最多9张）</Text>
        </View>
        <View className="evidence-list">
          {evidence.map((url, index) => (
            <View key={url} className="evidence-item">
              <Image
                className="evidence-image"
                src={url}
                mode="aspectFill"
                onClick={() => handlePreviewImage(index)}
              />
              <View
                className="remove-btn"
                onClick={() => handleRemoveImage(index)}
              >
                ×
              </View>
            </View>
          ))}
          {evidence.length < 9 && (
            <View className="add-evidence" onClick={handleChooseImage}>
              <View className="add-icon">+</View>
              <View className="add-text">添加图片</View>
            </View>
          )}
        </View>
      </View>

      {/* 提示 */}
      <View className="tips">
        <View className="tip-title">温馨提示</View>
        <View className="tip-item">1. 请如实描述问题，提供真实有效的证据</View>
        <View className="tip-item">2. 我们会在1-3个工作日内处理您的投诉</View>
        <View className="tip-item">3. 处理结果将通过消息通知您</View>
      </View>

      {/* 提交按钮 */}
      <View className="submit-area">
        <View
          className={`submit-btn ${submitting ? 'disabled' : ''}`}
          style={{ backgroundColor: primaryColor }}
          onClick={submitting ? undefined : handleSubmit}
        >
          {submitting ? '提交中...' : '提交投诉'}
        </View>
      </View>
    </View>
  )
}
