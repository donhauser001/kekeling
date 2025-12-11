import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum CampaignType {
  FLASH_SALE = 'flash_sale',
  SECKILL = 'seckill',
  THRESHOLD = 'threshold',
  NEWCOMER = 'newcomer',
}

export enum DiscountType {
  AMOUNT = 'amount',
  PERCENT = 'percent',
}

export enum ApplicableScope {
  ALL = 'all',
  CATEGORY = 'category',
  SERVICE = 'service',
}

// ========== 用户端 DTO ==========

// ========== 管理端 DTO ==========

export class CreateCampaignDto {
  @ApiProperty({ description: '活动名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '活动代码（唯一）' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: '活动类型', enum: CampaignType })
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiProperty({ description: '开始时间', example: '2024-12-20T00:00:00Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ description: '结束时间', example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  endAt: string;

  @ApiProperty({ description: '优惠类型', enum: DiscountType })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: '优惠值（金额或折扣百分比）' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ description: '折扣上限（折扣类型时有效）' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: '最低消费金额', default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minAmount?: number = 0;

  @ApiProperty({ description: '适用范围', enum: ApplicableScope, default: ApplicableScope.ALL })
  @IsEnum(ApplicableScope)
  @IsOptional()
  applicableScope?: ApplicableScope = ApplicableScope.ALL;

  @ApiPropertyOptional({ description: '适用ID列表（分类ID或服务ID）' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableIds?: string[];

  @ApiPropertyOptional({ description: '总参与次数限制' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  totalQuantity?: number;

  @ApiPropertyOptional({ description: '每人限参与次数', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  perUserLimit?: number = 1;

  @ApiPropertyOptional({ description: '活动描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '活动横幅图URL' })
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: '活动详情页URL' })
  @IsString()
  @IsOptional()
  detailUrl?: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  sort?: number = 0;

  @ApiPropertyOptional({ description: '是否与会员折扣叠加', default: true })
  @IsBoolean()
  @IsOptional()
  stackWithMember?: boolean = true;

  @ApiPropertyOptional({ description: '状态', default: 'pending' })
  @IsString()
  @IsOptional()
  status?: string = 'pending';
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({ description: '活动名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsDateString()
  @IsOptional()
  startAt?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsDateString()
  @IsOptional()
  endAt?: string;

  @ApiPropertyOptional({ description: '优惠类型' })
  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @ApiPropertyOptional({ description: '优惠值' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  discountValue?: number;

  @ApiPropertyOptional({ description: '折扣上限' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: '最低消费金额' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({ description: '适用范围' })
  @IsEnum(ApplicableScope)
  @IsOptional()
  applicableScope?: ApplicableScope;

  @ApiPropertyOptional({ description: '适用ID列表' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableIds?: string[];

  @ApiPropertyOptional({ description: '总参与次数限制' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  totalQuantity?: number;

  @ApiPropertyOptional({ description: '每人限参与次数' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  perUserLimit?: number;

  @ApiPropertyOptional({ description: '活动描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '活动横幅图URL' })
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: '活动详情页URL' })
  @IsString()
  @IsOptional()
  detailUrl?: string;

  @ApiPropertyOptional({ description: '排序' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '是否与会员折扣叠加' })
  @IsBoolean()
  @IsOptional()
  stackWithMember?: boolean;

  @ApiPropertyOptional({ description: '状态' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class QueryCampaignDto {
  @ApiPropertyOptional({ description: '活动类型' })
  @IsEnum(CampaignType)
  @IsOptional()
  type?: CampaignType;

  @ApiPropertyOptional({ description: '状态' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageSize?: number = 10;
}

// ========== 秒杀商品 DTO ==========

export class CreateSeckillItemDto {
  @ApiProperty({ description: '服务ID' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: '秒杀价格' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  seckillPrice: number;

  @ApiProperty({ description: '库存总数' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  stockTotal: number;

  @ApiPropertyOptional({ description: '每人限购数量', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  perUserLimit?: number = 1;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  sort?: number = 0;
}

export class UpdateSeckillItemDto {
  @ApiPropertyOptional({ description: '秒杀价格' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  seckillPrice?: number;

  @ApiPropertyOptional({ description: '库存总数' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  stockTotal?: number;

  @ApiPropertyOptional({ description: '每人限购数量' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  perUserLimit?: number;

  @ApiPropertyOptional({ description: '排序' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  sort?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsString()
  @IsOptional()
  status?: string;
}

