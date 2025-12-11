import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 流程步骤 DTO
export class WorkflowStepDto {
  @ApiPropertyOptional({ description: '步骤ID（更新时使用）' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: '步骤名称' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: '步骤描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ description: '步骤类型', enum: ['start', 'action', 'end'] })
  @IsEnum(['start', 'action', 'end'])
  type: 'start' | 'action' | 'end';

  @ApiProperty({ description: '排序' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sort: number;
}

// 创建流程 DTO
export class CreateWorkflowDto {
  @ApiProperty({ description: '流程名称' })
  @IsString()
  @MinLength(2, { message: '名称至少2个字' })
  @MaxLength(50, { message: '名称最多50个字' })
  name: string;

  @ApiPropertyOptional({ description: '流程描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ description: '流程分类' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: '流程步骤' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps?: WorkflowStepDto[];

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive', 'draft'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: 'active' | 'inactive' | 'draft';

  // 时长配置
  @ApiPropertyOptional({ description: '基础服务时长（分钟）', default: 240 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  baseDuration?: number;

  // 超时策略
  @ApiPropertyOptional({ description: '是否允许超时加时', default: true })
  @IsOptional()
  @IsBoolean()
  overtimeEnabled?: boolean;

  @ApiPropertyOptional({ description: '超时单价' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  overtimePrice?: number;

  @ApiPropertyOptional({ description: '超时计价单位', default: '小时' })
  @IsOptional()
  @IsString()
  overtimeUnit?: string;

  @ApiPropertyOptional({ description: '最大加时时长（分钟）' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  overtimeMax?: number;

  @ApiPropertyOptional({ description: '宽限时间（分钟）', default: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  overtimeGrace?: number;
}

// 更新流程 DTO
export class UpdateWorkflowDto {
  @ApiPropertyOptional({ description: '流程名称' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '流程描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ description: '流程分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '流程步骤' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps?: WorkflowStepDto[];

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive', 'draft'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: 'active' | 'inactive' | 'draft';

  // 时长配置
  @ApiPropertyOptional({ description: '基础服务时长（分钟）' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  baseDuration?: number;

  // 超时策略
  @ApiPropertyOptional({ description: '是否允许超时加时' })
  @IsOptional()
  @IsBoolean()
  overtimeEnabled?: boolean;

  @ApiPropertyOptional({ description: '超时单价' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  overtimePrice?: number;

  @ApiPropertyOptional({ description: '超时计价单位' })
  @IsOptional()
  @IsString()
  overtimeUnit?: string;

  @ApiPropertyOptional({ description: '最大加时时长（分钟）' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  overtimeMax?: number;

  @ApiPropertyOptional({ description: '宽限时间（分钟）' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  overtimeGrace?: number;
}

// 更新状态 DTO
export class UpdateWorkflowStatusDto {
  @ApiProperty({ description: '状态', enum: ['active', 'inactive', 'draft'] })
  @IsEnum(['active', 'inactive', 'draft'])
  status: 'active' | 'inactive' | 'draft';
}

// 查询流程 DTO
export class QueryWorkflowDto {
  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive', 'draft'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize?: number;
}
