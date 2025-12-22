/**
 * 意见反馈页面
 *
 * 用户提交意见反馈、建议、问题等
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Icon, TextArea, Image
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - 使用 useState 管理状态
 */

import { useState } from 'react'
import { Box } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { previewApi } from '../../../api'

import type { FeedbackPageProps } from './types'
import { wxScale, showToast } from './constants'
import { FeedbackHeader } from './FeedbackHeader'
import { FeedbackSuccess } from './FeedbackSuccess'
import { FeedbackForm } from './FeedbackForm'

export function FeedbackPage({
    themeSettings,
    isDarkMode,
    onBack,
}: FeedbackPageProps) {
    // 颜色变量
    const primaryColor = themeSettings.primaryColor
    const bgColor = isDarkMode ? '#1a1a1a' : '#f5f7fa'
    const cardBg = isDarkMode ? '#2a2a2a' : '#ffffff'
    const textPrimary = isDarkMode ? '#f3f4f6' : '#111827'
    const textSecondary = isDarkMode ? '#9ca3af' : '#6b7280'
    const textMuted = isDarkMode ? '#6b7280' : '#9ca3af'
    const borderColor = isDarkMode ? '#3a3a3a' : '#e5e7eb'
    const inputBg = isDarkMode ? '#1a1a1a' : '#f9fafb'

    // 表单状态
    const [selectedType, setSelectedType] = useState<string>('')
    const [content, setContent] = useState('')
    const [contact, setContact] = useState('')
    const [images, setImages] = useState<string[]>([])
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 选择图片
    const handleChooseImage = () => {
        if (isWxEnvironment() && typeof wx !== 'undefined') {
            // 小程序环境
            ; (wx as any).chooseMedia({
                count: 9 - images.length,
                mediaType: ['image'],
                sourceType: ['album', 'camera'],
                success: (res: any) => {
                    const newImages = res.tempFiles.map((file: any) => file.tempFilePath)
                    setImages([...images, ...newImages])
                },
            })
        } else {
            // Web 环境（模拟）
            const mockImages = [
                'https://picsum.photos/200/200?random=' + Math.random(),
            ]
            setImages([...images, ...mockImages])
        }
    }

    // 删除图片
    const handleDeleteImage = (index: number) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        setImages(newImages)
    }

    // 提交反馈
    const handleSubmit = async () => {
        if (!selectedType) {
            showToast('请选择反馈类型')
            return
        }

        if (!content.trim()) {
            showToast('请输入反馈内容')
            return
        }

        if (content.trim().length < 10) {
            showToast('反馈内容不能少于10个字')
            return
        }

        setIsSubmitting(true)

        try {
            // 调用 API 提交反馈
            await previewApi.submitFeedback({
                type: selectedType,
                content: content.trim(),
                contact: contact.trim(),
                images,
            })

            setIsSubmitted(true)
            if (isWxEnvironment() && typeof wx !== 'undefined') {
                wx.showToast({ title: '提交成功', icon: 'success' })
            }
        } catch (error: any) {
            showToast(error.message || '提交失败，请重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    // 提交成功后显示
    if (isSubmitted) {
        return (
            <FeedbackSuccess
                primaryColor={primaryColor}
                bgColor={bgColor}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                onBack={onBack}
            />
        )
    }

    // ========== 反馈表单 ==========
    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: bgColor,
                paddingBottom: 100 * wxScale,
            }}
        >
            {/* 导航栏 */}
            <FeedbackHeader primaryColor={primaryColor} onBack={onBack} />

            {/* 表单 */}
            <FeedbackForm
                primaryColor={primaryColor}
                cardBg={cardBg}
                textPrimary={textPrimary}
                textMuted={textMuted}
                borderColor={borderColor}
                inputBg={inputBg}
                selectedType={selectedType}
                content={content}
                contact={contact}
                images={images}
                isSubmitting={isSubmitting}
                onTypeChange={setSelectedType}
                onContentChange={setContent}
                onContactChange={setContact}
                onChooseImage={handleChooseImage}
                onDeleteImage={handleDeleteImage}
                onSubmit={handleSubmit}
            />
        </Box>
    )
}

