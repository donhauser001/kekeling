import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsInt, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class UpdatePricingConfigDto {
  @ApiPropertyOptional({ description: '折扣叠加模式', enum: ['multiply', 'min'] })
  @IsEnum(['multiply', 'min'])
  @IsOptional()
  discountStackMode?: string;

  @ApiPropertyOptional({ description: '优惠券可与会员折扣叠加' })
  @IsBoolean()
  @IsOptional()
  couponStackWithMember?: boolean;

  @ApiPropertyOptional({ description: '优惠券可与活动叠加' })
  @IsBoolean()
  @IsOptional()
  couponStackWithCampaign?: boolean;

  @ApiPropertyOptional({ description: '积分功能启用' })
  @IsBoolean()
  @IsOptional()
  pointsEnabled?: boolean;

  @ApiPropertyOptional({ description: '积分汇率（100积分=1元）' })
  @IsInt()
  @IsOptional()
  pointsRate?: number;

  @ApiPropertyOptional({ description: '积分最高抵扣比例（%）' })
  @IsInt()
  @IsOptional()
  pointsMaxRate?: number;

  @ApiPropertyOptional({ description: '最低支付金额' })
  @IsNumber()
  @IsOptional()
  minPayAmount?: number;

  @ApiPropertyOptional({ description: '显示原价' })
  @IsBoolean()
  @IsOptional()
  showOriginalPrice?: boolean;

  @ApiPropertyOptional({ description: '显示会员价' })
  @IsBoolean()
  @IsOptional()
  showMemberPrice?: boolean;

  @ApiPropertyOptional({ description: '显示节省金额' })
  @IsBoolean()
  @IsOptional()
  showSavings?: boolean;
}
