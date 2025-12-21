/**
 * 日期选择弹窗组件
 */

import { Box, Text, Input } from '../../../../ui/primitives'
import { wxScale, formatDate } from '../constants'
import type { DatePickerModalProps } from '../types'

export function DatePickerModal({
    visible,
    onClose,
    value,
    onChange,
    colors,
    renderDatePicker,
}: DatePickerModalProps) {
    if (!visible) return null

    const { cardBg, borderColor, textPrimary, textMuted, primaryColor, bgColor } = colors

    return (
        <Box
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 200,
                display: 'flex',
                alignItems: 'flex-end',
            }}
        >
            {/* 遮罩层 */}
            <Box
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                }}
            />

            {/* 弹窗内容 */}
            <Box
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    width: '100%',
                    borderTopLeftRadius: 16 * wxScale,
                    borderTopRightRadius: 16 * wxScale,
                    overflow: 'hidden',
                    backgroundColor: cardBg,
                }}
            >
                {/* 标题栏 */}
                <Box
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 12 * wxScale,
                        paddingBottom: 12 * wxScale,
                        paddingLeft: 16 * wxScale,
                        paddingRight: 16 * wxScale,
                        borderBottom: `1px solid ${borderColor}`,
                    }}
                >
                    <Box onClick={onClose}>
                        <Text
                            style={{
                                fontSize: 14 * wxScale,
                                color: textMuted,
                            }}
                        >
                            取消
                        </Text>
                    </Box>
                    <Text
                        style={{
                            fontSize: 16 * wxScale,
                            fontWeight: 500,
                            color: textPrimary,
                        }}
                    >
                        选择生日
                    </Text>
                    <Box onClick={onClose}>
                        <Text
                            style={{
                                fontSize: 14 * wxScale,
                                fontWeight: 500,
                                color: primaryColor,
                            }}
                        >
                            确定
                        </Text>
                    </Box>
                </Box>

                {/* 日期选择器 */}
                <Box style={{ padding: 16 * wxScale }}>
                    {renderDatePicker ? (
                        // 小程序：使用自定义日期选择器
                        renderDatePicker({
                            value,
                            onChange,
                        })
                    ) : (
                        // Web：使用 Input type="date"
                        <Input
                            type="date"
                            value={value}
                            onChange={(val) => onChange(val)}
                            style={{
                                width: '100%',
                                paddingTop: 12 * wxScale,
                                paddingBottom: 12 * wxScale,
                                paddingLeft: 12 * wxScale,
                                paddingRight: 12 * wxScale,
                                borderRadius: 8 * wxScale,
                                border: `1px solid ${borderColor}`,
                                textAlign: 'center',
                                fontSize: 16 * wxScale,
                                backgroundColor: bgColor,
                                color: textPrimary,
                            }}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    )
}

