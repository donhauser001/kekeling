import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 创建服务保障 DTO
export class CreateServiceGuaranteeDto {
  @ApiProperty({ description: '保障名称' })
  @IsString()
  @MinLength(2, { message: '名称至少2个字' })
  @MaxLength(20, { message: '名称最多20个字' })
  name: string;

  @ApiPropertyOptional({ description: '图标名称', default: 'shield' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '详细说明' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

// 更新服务保障 DTO
export class UpdateServiceGuaranteeDto {
  @ApiPropertyOptional({ description: '保障名称' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  name?: string;

  @ApiPropertyOptional({ description: '图标名称' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '详细说明' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

// 查询服务保障 DTO
export class QueryServiceGuaranteeDto {
  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
