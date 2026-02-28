/**
 * 用户资料编辑页面
 *
 * 功能：
 * - 头像上传
 * - 昵称编辑
 * - 手机号显示/绑定
 * - 性别选择
 * - 生日选择
 * - 退出登录
 *
 * 遵循《小程序页面改造规范》：
 * - 使用原语组件 Box, Text, Image, Icon
 * - 布局属性在 style 中定义
 * - 使用 wxScale 缩放视觉尺寸
 * - Image 显式指定 mode 属性
 */

import { useState, useEffect } from 'react'
import { Box, Text, Image, Icon } from '../../../ui/primitives'
import { isWxEnvironment, getFullImageUrl } from '../../../platform/env'
import { previewApi } from '../../../api'
import type { UserProfile } from '../../../api'

import { wxScale, wxSafeAreaTop, getThemeColors } from './constants'
import { GenderPicker, DatePickerModal, FormSection } from './components'
import type { UserProfileEditPageProps } from './types'

// ============================================================================
// 主组件
// ============================================================================

export function UserProfileEditPage({
    themeSettings,
    isDarkMode = false,
    onBack,
    onLogout,
    renderAvatarButton,
    renderBindPhoneButton,
    renderDatePicker,
}: UserProfileEditPageProps) {
    // 表单状态
    const [nickname, setNickname] = useState('')
    const [gender, setGender] = useState<string>('')
    const [birthday, setBirthday] = useState<string>('')
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)

    // UI 状态
    const [isLoading, setIsLoading] = useState(true)
    const [showGenderPicker, setShowGenderPicker] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // 主题颜色
    const colors = getThemeColors(themeSettings.primaryColor, isDarkMode)
    const { primaryColor, bgColor, cardBg, textPrimary, textSecondary, textMuted } = colors

    // ========== 数据获取 ==========
    useEffect(() => {
        setIsLoading(true)
        previewApi
            .getUserProfile()
            .then((data) => {
                if (!data) return
                setProfile(data)
                setNickname(data.nickname || '')
                setGender(data.gender || '')
                setBirthday(data.birthday || '')
                setAvatarPreview(getFullImageUrl(data.avatar) || null)
            })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    // ========== 保存资料 ==========
    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await previewApi.updateUserProfile({
                nickname: nickname || undefined,
                gender: gender || undefined,
                birthday: birthday || undefined,
                avatar: avatarPreview || undefined,
            })

            if (result) {
                if (isWxEnvironment() && typeof wx !== 'undefined') {
                    // @ts-ignore wx 在小程序环境中存在
                    wx.showToast?.({ title: '保存成功', icon: 'success' })
                }
                setTimeout(() => onBack?.(), 500)
            } else {
                if (isWxEnvironment() && typeof wx !== 'undefined') {
                    // @ts-ignore wx 在小程序环境中存在
                    wx.showToast?.({ title: '保存失败', icon: 'none' })
                }
            }
        } catch (error) {
            console.error('保存失败:', error)
            if (isWxEnvironment() && typeof wx !== 'undefined') {
                // @ts-ignore wx 在小程序环境中存在
                wx.showToast?.({ title: '保存失败', icon: 'none' })
            }
        } finally {
            setIsSaving(false)
        }
    }

    // ========== 头像上传 ==========
    const handleAvatarClick = () => {
        const wxApi = typeof wx !== 'undefined' ? (wx as unknown as { chooseMedia?: (...args: unknown[]) => void }) : undefined
        const isWx = typeof wxApi?.chooseMedia === 'function'

        if (isWx) {
            // @ts-ignore wx 在小程序环境中存在
            wx.chooseMedia({
                count: 1,
                mediaType: ['image'],
                sourceType: ['album', 'camera'],
                success: (res: { tempFiles: Array<{ tempFilePath: string }> }) => {
                    const tempFilePath = res.tempFiles[0]?.tempFilePath
                    if (!tempFilePath) return

                    // @ts-ignore wx 在小程序环境中存在
                    wx.showLoading?.({ title: '上传中...' })

                    const API_BASE_URL = 'https://kkl.top/api'
                    let token = ''
                    try {
                        // @ts-ignore wx 在小程序环境中存在
                        token = wx.getStorageSync('kekeling_user_token') || ''
                    } catch (e) {
                        console.warn('获取 token 失败:', e)
                    }

                    // @ts-ignore wx 在小程序环境中存在
                    wx.uploadFile({
                        url: `${API_BASE_URL}/upload`,
                        filePath: tempFilePath,
                        name: 'file',
                        formData: { folder: 'avatar' },
                        header: { Authorization: token ? `Bearer ${token}` : '' },
                        success: (uploadRes: { data: string }) => {
                            // @ts-ignore wx 在小程序环境中存在
                            wx.hideLoading?.()
                            try {
                                const data = JSON.parse(uploadRes.data)
                                if (data.code === 0 || data.code === 200) {
                                    const serverUrl = data.data?.url || data.data
                                    const fullUrl = serverUrl?.startsWith('http')
                                        ? serverUrl
                                        : `https://kkl.top${serverUrl}`
                                    setAvatarPreview(fullUrl)
                                    // @ts-ignore wx 在小程序环境中存在
                                    wx.showToast?.({ title: '头像已更新', icon: 'success' })
                                } else {
                                    // @ts-ignore wx 在小程序环境中存在
                                    wx.showToast?.({ title: data.message || '上传失败', icon: 'none' })
                                }
                            } catch {
                                // @ts-ignore wx 在小程序环境中存在
                                wx.showToast?.({ title: '上传失败', icon: 'none' })
                            }
                        },
                        fail: () => {
                            // @ts-ignore wx 在小程序环境中存在
                            wx.hideLoading?.()
                            // @ts-ignore wx 在小程序环境中存在
                            wx.showToast?.({ title: '上传失败', icon: 'none' })
                        },
                    })
                },
                fail: (err: { errMsg: string }) => {
                    if (!err.errMsg?.includes('cancel')) {
                        console.warn('选择图片失败:', err)
                    }
                },
            })
            return
        }

        // Web 环境：使用文件选择器
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (ev) => {
                    setAvatarPreview(ev.target?.result as string)
                }
                reader.readAsDataURL(file)
            }
        }
        input.click()
    }

    // 刷新用户资料（绑定手机号后调用）
    const handlePhoneBindSuccess = () => {
        previewApi.getUserProfile().then(setProfile).catch(console.error)
    }

    // ========== 加载状态 ==========
    if (isLoading) {
        return (
            <Box
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    backgroundColor: bgColor,
                }}
            >
                <Icon name="refresh" size={32 * wxScale} color={primaryColor} />
                <Text
                    style={{
                        marginTop: 8 * wxScale,
                        fontSize: 14 * wxScale,
                        color: textSecondary,
                    }}
                >
                    加载中...
                </Text>
            </Box>
        )
    }

    // ========== 主渲染 ==========
    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: bgColor,
            }}
        >
            {/* ========== 顶部导航栏 ========== */}
            <Box
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backgroundColor: primaryColor,
                    paddingTop: wxSafeAreaTop,
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 36 * wxScale,
                            height: 36 * wxScale,
                        }}
                    >
                        <Icon name="left" size={22 * wxScale} color="#fff" />
                    </Box>

                    {/* 标题 */}
                    <Text style={{ fontSize: 17 * wxScale, fontWeight: 600, color: '#fff' }}>
                        编辑资料
                    </Text>
                </Box>
            </Box>

            {/* ========== 内容区域 ========== */}
            <Box style={{ flex: 1, paddingBottom: 24 * wxScale }}>
                {/* 头像区域 */}
                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        paddingTop: 24 * wxScale,
                        paddingBottom: 24 * wxScale,
                        backgroundColor: cardBg,
                    }}
                >
                    {renderAvatarButton ? (
                        renderAvatarButton({
                            avatarUrl: avatarPreview,
                            onClick: handleAvatarClick,
                            onAvatarChange: (url: string) => setAvatarPreview(url),
                        })
                    ) : (
                        <Box
                            onClick={handleAvatarClick}
                            style={{
                                position: 'relative',
                                width: 80 * wxScale,
                                height: 80 * wxScale,
                                borderRadius: 40 * wxScale,
                                overflow: 'visible',
                                cursor: 'pointer',
                            }}
                        >
                            {avatarPreview ? (
                                <Image
                                    src={avatarPreview}
                                    mode="aspectFill"
                                    style={{
                                        width: 80 * wxScale,
                                        height: 80 * wxScale,
                                        borderRadius: 40 * wxScale,
                                    }}
                                />
                            ) : (
                                <Box
                                    style={{
                                        width: 80 * wxScale,
                                        height: 80 * wxScale,
                                        borderRadius: 40 * wxScale,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: `${primaryColor}20`,
                                    }}
                                >
                                    <Icon name="user" size={40 * wxScale} color={primaryColor} />
                                </Box>
                            )}
                            {/* 相机图标 */}
                            <Box
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: 24 * wxScale,
                                    height: 24 * wxScale,
                                    borderRadius: 12 * wxScale,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: primaryColor,
                                }}
                            >
                                <Icon name="camera" size={14 * wxScale} color="#fff" />
                            </Box>
                        </Box>
                    )}
                    <Text
                        style={{
                            marginTop: 8 * wxScale,
                            fontSize: 12 * wxScale,
                            color: textMuted,
                        }}
                    >
                        点击更换头像
                    </Text>
                </Box>

                {/* 表单区域 */}
                <FormSection
                    colors={colors}
                    nickname={nickname}
                    setNickname={setNickname}
                    phone={profile?.phone}
                    gender={gender}
                    birthday={birthday}
                    onGenderClick={() => setShowGenderPicker(true)}
                    onBirthdayClick={() => setShowDatePicker(true)}
                    renderBindPhoneButton={renderBindPhoneButton}
                    onPhoneBindSuccess={handlePhoneBindSuccess}
                />

                {/* 保存按钮 */}
                <Box
                    style={{
                        marginTop: 24 * wxScale,
                        marginLeft: 12 * wxScale,
                        marginRight: 12 * wxScale,
                    }}
                >
                    <Box
                        onClick={isSaving ? undefined : handleSave}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 48 * wxScale,
                            backgroundColor: primaryColor,
                            borderRadius: 12 * wxScale,
                            opacity: isSaving ? 0.7 : 1,
                        }}
                    >
                        <Text style={{ fontSize: 16 * wxScale, fontWeight: 500, color: '#ffffff' }}>
                            {isSaving ? '保存中...' : '保存修改'}
                        </Text>
                    </Box>
                </Box>

                {/* 退出登录按钮 */}
                {onLogout && (
                    <Box
                        style={{
                            marginTop: 16 * wxScale,
                            marginLeft: 12 * wxScale,
                            marginRight: 12 * wxScale,
                        }}
                    >
                        <Box
                            onClick={onLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8 * wxScale,
                                height: 48 * wxScale,
                                backgroundColor: cardBg,
                                borderRadius: 12 * wxScale,
                                border: '1px solid #ffccc7',
                            }}
                        >
                            <Icon name="power" size={18 * wxScale} color="#ff4d4f" />
                            <Text style={{ fontSize: 15 * wxScale, color: '#ff4d4f', fontWeight: 500 }}>
                                退出登录
                            </Text>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* ========== 弹窗 ========== */}
            <GenderPicker
                visible={showGenderPicker}
                onClose={() => setShowGenderPicker(false)}
                value={gender}
                onChange={setGender}
                colors={colors}
            />

            <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                value={birthday}
                onChange={setBirthday}
                colors={colors}
                renderDatePicker={renderDatePicker}
            />
        </Box>
    )
}
