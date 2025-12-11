import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class PricingPreviewDto {
  @ApiProperty({ description: '服务ID' })
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({ description: '数量', default: 1 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: '用户ID (可选，用于计算会员价、优惠券等)' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: '优惠券ID (可选)' })
  @IsUUID()
  @IsOptional()
  couponId?: string;

  @ApiPropertyOptional({ description: '活动ID (可选，通常自动匹配)' })
  @IsUUID()
  @IsOptional()
  campaignId?: string;

  @ApiPropertyOptional({ description: '使用积分数 (可选)' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  pointsToUse?: number;
}
