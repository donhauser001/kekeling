/**
 * 表单区域组件
 */

import { Box, Text, Input, Icon } from '../../../../ui/primitives'
import { wxScale, genderOptions, formatDisplayDate } from '../constants'
import type { FormSectionProps } from '../types'

export function FormSection({
    colors,
    nickname,
    setNickname,
    phone,
    gender,
    birthday,
    onGenderClick,
    onBirthdayClick,
    renderBindPhoneButton,
    onPhoneBindSuccess,
}: FormSectionProps) {
    const { cardBg, borderColor, textPrimary, textSecondary, textMuted } = colors

    return (
        <Box
            style={{
                marginTop: 12 * wxScale,
                marginLeft: 12 * wxScale,
                marginRight: 12 * wxScale,
                borderRadius: 12 * wxScale,
                overflow: 'hidden',
                backgroundColor: cardBg,
            }}
        >
            {/* 昵称 */}
            <Box
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 14 * wxScale,
                    paddingBottom: 14 * wxScale,
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    borderBottom: `1px solid ${borderColor}`,
                }}
            >
                <Text
                    style={{
                        width: 70 * wxScale,
                        fontSize: 14 * wxScale,
                        color: textSecondary,
                    }}
                >
                    昵称
                </Text>
                <Input
                    value={nickname}
                    onChange={(val) => setNickname(val)}
                    placeholder="请输入昵称"
                    maxLength={20}
                    style={{
                        flex: 1,
                        textAlign: 'right',
                        fontSize: 14 * wxScale,
                        color: textPrimary,
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                    }}
                />
            </Box>

            {/* 手机号 */}
            <Box
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 14 * wxScale,
                    paddingBottom: 14 * wxScale,
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    borderBottom: `1px solid ${borderColor}`,
                }}
            >
                <Text
                    style={{
                        width: 70 * wxScale,
                        fontSize: 14 * wxScale,
                        color: textSecondary,
                    }}
                >
                    手机号
                </Text>
                {phone ? (
                    <Text
                        style={{
                            flex: 1,
                            textAlign: 'right',
                            fontSize: 14 * wxScale,
                            color: textPrimary,
                        }}
                    >
                        {phone}
                    </Text>
                ) : renderBindPhoneButton ? (
                    // 小程序：使用自定义绑定按钮
                    renderBindPhoneButton({ onSuccess: onPhoneBindSuccess })
                ) : (
                    // Web：显示未绑定
                    <Text
                        style={{
                            flex: 1,
                            textAlign: 'right',
                            fontSize: 14 * wxScale,
                            color: textMuted,
                        }}
                    >
                        未绑定
                    </Text>
                )}
            </Box>

            {/* 性别 */}
            <Box
                onClick={onGenderClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 14 * wxScale,
                    paddingBottom: 14 * wxScale,
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    borderBottom: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                }}
            >
                <Text
                    style={{
                        width: 70 * wxScale,
                        fontSize: 14 * wxScale,
                        color: textSecondary,
                    }}
                >
                    性别
                </Text>
                <Text
                    style={{
                        flex: 1,
                        textAlign: 'right',
                        fontSize: 14 * wxScale,
                        color: gender ? textPrimary : textMuted,
                    }}
                >
                    {gender ? genderOptions.find((g) => g.value === gender)?.label : '未设置'}
                </Text>
                <Icon name="right" size={16 * wxScale} color={textMuted} />
            </Box>

            {/* 生日 */}
            <Box
                onClick={onBirthdayClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 14 * wxScale,
                    paddingBottom: 14 * wxScale,
                    paddingLeft: 16 * wxScale,
                    paddingRight: 16 * wxScale,
                    cursor: 'pointer',
                }}
            >
                <Text
                    style={{
                        width: 70 * wxScale,
                        fontSize: 14 * wxScale,
                        color: textSecondary,
                    }}
                >
                    生日
                </Text>
                <Text
                    style={{
                        flex: 1,
                        textAlign: 'right',
                        fontSize: 14 * wxScale,
                        color: birthday ? textPrimary : textMuted,
                    }}
                >
                    {formatDisplayDate(birthday)}
                </Text>
                <Icon name="right" size={16 * wxScale} color={textMuted} />
            </Box>
        </Box>
    )
}

