import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConfigDto {
  @ApiProperty({ description: '配置值 (JSON 格式)' })
  @IsObject()
  value: Record<string, any>;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class BatchUpdateConfigDto {
  @ApiProperty({ description: '配置项列表' })
  configs: { key: string; value: any; remark?: string }[];
}

// 订单设置配置键
export const ORDER_CONFIG_KEYS = {
  AUTO_CANCEL_MINUTES: 'order.auto_cancel_minutes',
  AUTO_COMPLETE_HOURS: 'order.auto_complete_hours',
  PLATFORM_FEE_RATE: 'order.platform_fee_rate',
  DISPATCH_MODE: 'order.dispatch_mode',
  GRAB_TIMEOUT_MINUTES: 'order.grab_timeout_minutes',
  ALLOW_REFUND_BEFORE_START: 'order.allow_refund_before_start',
  REFUND_FEE_RATE: 'order.refund_fee_rate',
} as const;

// 订单设置默认值
export const ORDER_CONFIG_DEFAULTS: Record<string, any> = {
  [ORDER_CONFIG_KEYS.AUTO_CANCEL_MINUTES]: 15,
  [ORDER_CONFIG_KEYS.AUTO_COMPLETE_HOURS]: 24,
  [ORDER_CONFIG_KEYS.PLATFORM_FEE_RATE]: 0.2,
  [ORDER_CONFIG_KEYS.DISPATCH_MODE]: 'assign', // grab, assign, mixed
  [ORDER_CONFIG_KEYS.GRAB_TIMEOUT_MINUTES]: 30,
  [ORDER_CONFIG_KEYS.ALLOW_REFUND_BEFORE_START]: true,
  [ORDER_CONFIG_KEYS.REFUND_FEE_RATE]: 0.5,
};

// 订单设置类型
export interface OrderSettings {
  autoCancelMinutes: number;
  autoCompleteHours: number;
  platformFeeRate: number;
  dispatchMode: 'grab' | 'assign' | 'mixed';
  grabTimeoutMinutes: number;
  allowRefundBeforeStart: boolean;
  refundFeeRate: number;
}

