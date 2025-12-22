/**
 * 意见反馈页面 - 表单组件
 */

import { Box, Text, Icon, Textarea, Image, Input } from '../../../ui/primitives'
import { isWxEnvironment } from '../../../platform/env'
import { wxScale, FEEDBACK_TYPES } from './constants'

interface FeedbackFormProps {
    // 颜色
    primaryColor: string
    cardBg: string
    textPrimary: string
    textMuted: string
    borderColor: string
    inputBg: string
    // 表单数据
    selectedType: string
    content: string
    contact: string
    images: string[]
    isSubmitting: boolean
    // 回调
    onTypeChange: (type: string) => void
    onContentChange: (content: string) => void
    onContactChange: (contact: string) => void
    onChooseImage: () => void
    onDeleteImage: (index: number) => void
    onSubmit: () => void
}

export function FeedbackForm({
    primaryColor,
    cardBg,
    textPrimary,
    textMuted,
    borderColor,
    inputBg,
    selectedType,
    content,
    contact,
    images,
    isSubmitting,
    onTypeChange,
    onContentChange,
    onContactChange,
    onChooseImage,
    onDeleteImage,
    onSubmit,
}: FeedbackFormProps) {
    const isDisabled = !selectedType || !content.trim() || isSubmitting

    return (
        <>
            {/* 提示信息 */}
            <Box
                style={{
                    marginLeft: 12 * wxScale,
                    marginRight: 12 * wxScale,
                    marginTop: 12 * wxScale,
                    marginBottom: 12 * wxScale,
                    padding: 12 * wxScale,
                    backgroundColor: `${primaryColor}15`,
                    borderRadius: 8 * wxScale,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 8 * wxScale,
                }}
            >
                <Icon name="info" size={18 * wxScale} color={primaryColor} />
                <Text
                    style={{
                        flex: 1,
                        fontSize: 13 * wxScale,
                        color: primaryColor,
                        lineHeight: 1.5,
                    }}
                >
                    您的反馈对我们非常重要，我们会认真对待每一条建议。
                </Text>
            </Box>

            {/* 反馈类型选择 */}
            <Box
                style={{
                    marginLeft: 12 * wxScale,
                    marginRight: 12 * wxScale,
                    marginBottom: 12 * wxScale,
                    backgroundColor: cardBg,
                    borderRadius: 12 * wxScale,
                    overflow: 'hidden',
                }}
            >
                <Box
                    style={{
                        padding: 16 * wxScale,
                        paddingBottom: 8 * wxScale,
                    }}
                >
                    <Text
                        style={{
                            display: 'block',
                            fontSize: 15 * wxScale,
                            fontWeight: 600,
                            color: textPrimary,
                        }}
                    >
                        反馈类型
                    </Text>
                    <Text
                        style={{
                            display: 'block',
                            fontSize: 12 * wxScale,
                            color: textMuted,
                            marginTop: 4 * wxScale,
                        }}
                    >
                        请选择与您反馈最相关的类型
                    </Text>
                </Box>

                {FEEDBACK_TYPES.map((type, index) => (
                    <Box
                        key={type.value}
                        onClick={() => onTypeChange(type.value)}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 16 * wxScale,
                            paddingTop: 12 * wxScale,
                            paddingBottom: 12 * wxScale,
                            borderTop: index > 0 ? `1px solid ${borderColor}` : 'none',
                        }}
                    >
                        <Box
                            style={{
                                width: 22 * wxScale,
                                height: 22 * wxScale,
                                borderRadius: 11 * wxScale,
                                borderWidth: 2,
                                borderStyle: 'solid',
                                borderColor:
                                    selectedType === type.value ? primaryColor : borderColor,
                                backgroundColor:
                                    selectedType === type.value ? primaryColor : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12 * wxScale,
                            }}
                        >
                            {selectedType === type.value && (
                                <Icon name="check" size={14 * wxScale} color="#fff" />
                            )}
                        </Box>
                        <Box style={{ flex: 1 }}>
                            <Text
                                style={{
                                    display: 'block',
                                    fontSize: 14 * wxScale,
                                    fontWeight: 500,
                                    color: textPrimary,
                                }}
                            >
                                {type.label}
                            </Text>
                            <Text
                                style={{
                                    display: 'block',
                                    fontSize: 12 * wxScale,
                                    color: textMuted,
                                    marginTop: 2 * wxScale,
                                }}
                            >
                                {type.desc}
                            </Text>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* 反馈内容 */}
            <Box
                style={{
                    marginLeft: 12 * wxScale,
                    marginRight: 12 * wxScale,
                    marginBottom: 12 * wxScale,
                    backgroundColor: cardBg,
                    borderRadius: 12 * wxScale,
                    padding: 16 * wxScale,
                }}
            >
                <Text
                    style={{
                        display: 'block',
                        fontSize: 15 * wxScale,
                        fontWeight: 600,
                        color: textPrimary,
                        marginBottom: 12 * wxScale,
                    }}
                >
                    反馈内容
                </Text>

                <Textarea
                    value={content}
                    onChange={onContentChange}
                    placeholder="请详细描述您的问题或建议，至少10个字..."
                    style={{
                        width: '100%',
                        height: 120 * wxScale,
                        backgroundColor: inputBg,
                        borderRadius: 8 * wxScale,
                        padding: 12 * wxScale,
                        fontSize: 14 * wxScale,
                        color: textPrimary,
                        lineHeight: 1.5,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: borderColor,
                    }}
                />

                <Text
                    style={{
                        display: 'block',
                        fontSize: 12 * wxScale,
                        color: textMuted,
                        marginTop: 8 * wxScale,
                        textAlign: 'right',
                    }}
                >
                    {content.length}/500
                </Text>
            </Box>

            {/* 图片上传 */}
            <Box
                style={{
                    marginLeft: 12 * wxScale,
                    marginRight: 12 * wxScale,
                    marginBottom: 12 * wxScale,
                    backgroundColor: cardBg,
                    borderRadius: 12 * wxScale,
                    padding: 16 * wxScale,
                }}
            >
                <Text
                    style={{
                        display: 'block',
                        fontSize: 15 * wxScale,
                        fontWeight: 600,
                        color: textPrimary,
                        marginBottom: 4 * wxScale,
                    }}
                >
                    上传截图
                </Text>
                <Text
                    style={{
                        display: 'block',
                        fontSize: 12 * wxScale,
                        color: textMuted,
                        marginBottom: 12 * wxScale,
                    }}
                >
                    可选，上传相关截图帮助我们更好地理解问题
                </Text>

                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 8 * wxScale,
                    }}
                >
                    {/* 已上传的图片 */}
                    {images.map((img, index) => (
                        <Box
                            key={index}
                            style={{
                                position: 'relative',
                                width: 80 * wxScale,
                                height: 80 * wxScale,
                            }}
                        >
                            <Image
                                src={img}
                                mode="aspectFill"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 8 * wxScale,
                                }}
                            />
                            <Box
                                onClick={() => onDeleteImage(index)}
                                style={{
                                    position: 'absolute',
                                    top: -8 * wxScale,
                                    right: -8 * wxScale,
                                    width: 20 * wxScale,
                                    height: 20 * wxScale,
                                    borderRadius: 10 * wxScale,
                                    backgroundColor: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Icon name="close" size={12 * wxScale} color="#fff" />
                            </Box>
                        </Box>
                    ))}

                    {/* 添加图片按钮 */}
                    {images.length < 9 && (
                        <Box
                            onClick={onChooseImage}
                            style={{
                                width: 80 * wxScale,
                                height: 80 * wxScale,
                                borderRadius: 8 * wxScale,
                                borderWidth: 1,
                                borderStyle: 'dashed',
                                borderColor: borderColor,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: inputBg,
                            }}
                        >
                            <Icon name="add" size={24 * wxScale} color={textMuted} />
                            <Text
                                style={{
                                    fontSize: 10 * wxScale,
                                    color: textMuted,
                                    marginTop: 4 * wxScale,
                                }}
                            >
                                {images.length}/9
                            </Text>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* 联系方式 */}
            <Box
                style={{
                    marginLeft: 12 * wxScale,
                    marginRight: 12 * wxScale,
                    marginBottom: 12 * wxScale,
                    backgroundColor: cardBg,
                    borderRadius: 12 * wxScale,
                    padding: 16 * wxScale,
                }}
            >
                <Text
                    style={{
                        display: 'block',
                        fontSize: 15 * wxScale,
                        fontWeight: 600,
                        color: textPrimary,
                        marginBottom: 4 * wxScale,
                    }}
                >
                    联系方式
                </Text>
                <Text
                    style={{
                        display: 'block',
                        fontSize: 12 * wxScale,
                        color: textMuted,
                        marginBottom: 12 * wxScale,
                    }}
                >
                    可选，留下您的联系方式，方便我们回复您
                </Text>

                <Input
                    value={contact}
                    onChange={onContactChange}
                    placeholder="手机号或微信号"
                    style={{
                        width: '100%',
                        height: 44 * wxScale,
                        backgroundColor: inputBg,
                        borderRadius: 8 * wxScale,
                        paddingLeft: 12 * wxScale,
                        paddingRight: 12 * wxScale,
                        fontSize: 14 * wxScale,
                        color: textPrimary,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: borderColor,
                    }}
                />
            </Box>

            {/* 底部固定提交按钮 */}
            <Box
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 16 * wxScale,
                    paddingBottom: isWxEnvironment() ? 34 * wxScale : 16 * wxScale,
                    backgroundColor: cardBg,
                    borderTop: `1px solid ${borderColor}`,
                }}
            >
                <Box
                    onClick={onSubmit}
                    style={{
                        height: 48 * wxScale,
                        borderRadius: 24 * wxScale,
                        backgroundColor: isDisabled ? textMuted : primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isDisabled ? 0.6 : 1,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16 * wxScale,
                            fontWeight: 600,
                            color: '#fff',
                        }}
                    >
                        {isSubmitting ? '提交中...' : '提交反馈'}
                    </Text>
                </Box>
            </Box>
        </>
    )
}

