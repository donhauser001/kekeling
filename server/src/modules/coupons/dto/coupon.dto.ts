import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ========== 用户端 DTO ==========

export class ClaimCouponDto {
  @ApiProperty({ description: '优惠券模板ID' })
  @IsString()
  templateId: string;
}

export class ExchangeCouponDto {
  @ApiProperty({ description: '兑换码' })
  @IsString()
  code: string;
}

// ========== 管理端 DTO ==========

export class CreateCouponTemplateDto {
  @ApiProperty({ description: '优惠券名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '兑换码（可选）' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: '优惠类型', enum: ['amount', 'percent', 'free'] })
  @IsEnum(['amount', 'percent', 'free'])
  type: string;

  @ApiProperty({ description: '面值或折扣' })
  @Type(() => Number)
  value: number;

  @ApiPropertyOptional({ description: '折扣券最大抵扣' })
  @Type(() => Number)
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: '最低消费金额', default: 0 })
  @Type(() => Number)
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({ description: '适用范围', enum: ['all', 'category', 'service'], default: 'all' })
  @IsEnum(['all', 'category', 'service'])
  @IsOptional()
  applicableScope?: string;

  @ApiPropertyOptional({ description: '适用ID列表' })
  @IsArray()
  @IsOptional()
  applicableIds?: string[];

  @ApiPropertyOptional({ description: '是否仅限会员', default: false })
  @IsBoolean()
  @IsOptional()
  memberOnly?: boolean;

  @ApiPropertyOptional({ description: '会员等级ID列表' })
  @IsArray()
  @IsOptional()
  memberLevelIds?: string[];

  @ApiPropertyOptional({ description: '总发放量（null表示不限）' })
  @IsNumber()
  @IsOptional()
  totalQuantity?: number;

  @ApiPropertyOptional({ description: '每人限领数量', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  perUserLimit?: number;

  @ApiPropertyOptional({ description: '有效期类型', enum: ['fixed', 'relative'], default: 'fixed' })
  @IsEnum(['fixed', 'relative'])
  @IsOptional()
  validityType?: string;

  @ApiPropertyOptional({ description: '开始时间（固定日期）' })
  @IsOptional()
  startAt?: Date;

  @ApiPropertyOptional({ description: '结束时间（固定日期）' })
  @IsOptional()
  endAt?: Date;

  @ApiPropertyOptional({ description: '有效天数（相对日期）' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  validDays?: number;

  @ApiPropertyOptional({ description: '是否可与会员折扣叠加', default: true })
  @IsBoolean()
  @IsOptional()
  stackWithMember?: boolean;

  @ApiPropertyOptional({ description: '是否可与活动叠加', default: true })
  @IsBoolean()
  @IsOptional()
  stackWithCampaign?: boolean;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '使用提示' })
  @IsString()
  @IsOptional()
  tips?: string;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'], default: 'active' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class UpdateCouponTemplateDto {
  @ApiPropertyOptional({ description: '优惠券名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '面值或折扣' })
  @Type(() => Number)
  @IsOptional()
  value?: number;

  @ApiPropertyOptional({ description: '折扣券最大抵扣' })
  @Type(() => Number)
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: '最低消费金额' })
  @Type(() => Number)
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({ description: '适用范围' })
  @IsEnum(['all', 'category', 'service'])
  @IsOptional()
  applicableScope?: string;

  @ApiPropertyOptional({ description: '适用ID列表' })
  @IsArray()
  @IsOptional()
  applicableIds?: string[];

  @ApiPropertyOptional({ description: '是否仅限会员' })
  @IsBoolean()
  @IsOptional()
  memberOnly?: boolean;

  @ApiPropertyOptional({ description: '会员等级ID列表' })
  @IsArray()
  @IsOptional()
  memberLevelIds?: string[];

  @ApiPropertyOptional({ description: '总发放量' })
  @IsNumber()
  @IsOptional()
  totalQuantity?: number;

  @ApiPropertyOptional({ description: '每人限领数量' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  perUserLimit?: number;

  @ApiPropertyOptional({ description: '有效期类型' })
  @IsEnum(['fixed', 'relative'])
  @IsOptional()
  validityType?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  startAt?: Date;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  endAt?: Date;

  @ApiPropertyOptional({ description: '有效天数' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  validDays?: number;

  @ApiPropertyOptional({ description: '是否可与会员折扣叠加' })
  @IsBoolean()
  @IsOptional()
  stackWithMember?: boolean;

  @ApiPropertyOptional({ description: '是否可与活动叠加' })
  @IsBoolean()
  @IsOptional()
  stackWithCampaign?: boolean;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '使用提示' })
  @IsString()
  @IsOptional()
  tips?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class CreateCouponGrantRuleDto {
  @ApiProperty({ description: '规则名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '优惠券模板ID' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: '触发条件', enum: ['register', 'member_monthly', 'birthday', 'order_complete', 'consume_milestone'] })
  @IsEnum(['register', 'member_monthly', 'birthday', 'order_complete', 'consume_milestone'])
  trigger: string;

  @ApiPropertyOptional({ description: '触发配置（JSON）' })
  @IsOptional()
  triggerConfig?: any;

  @ApiPropertyOptional({ description: '发放数量', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  grantQuantity?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'], default: 'active' })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}

export class BatchGrantCouponDto {
  @ApiProperty({ description: '优惠券模板ID' })
  @IsString()
  templateId: string;

  @ApiProperty({ description: '用户ID列表' })
  @IsArray()
  userIds: string[];

  @ApiPropertyOptional({ description: '来源', default: 'manual' })
  @IsString()
  @IsOptional()
  source?: string;
}

