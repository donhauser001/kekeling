import { IsString, IsOptional, IsInt, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsString()
  @MinLength(2, { message: '名称至少2个字' })
  @MaxLength(20, { message: '名称最多20个字' })
  name: string;

  @ApiPropertyOptional({ description: '图标名称 (Lucide icon name)' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '主题颜色 (如: #667eea 或渐变色)' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: '分类描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ description: '是否置顶 (最多2个)', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPinned?: boolean;

  @ApiPropertyOptional({ description: '排序权重', default: 0 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort?: number;
}

export class UpdateServiceCategoryDto {
  @ApiPropertyOptional({ description: '分类名称' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  name?: string;

  @ApiPropertyOptional({ description: '图标名称 (Lucide icon name)' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '主题颜色 (如: #667eea 或渐变色)' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: '分类描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ description: '是否置顶 (最多2个)' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPinned?: boolean;

  @ApiPropertyOptional({ description: '排序权重' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

export class QueryServiceCategoryDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态过滤', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize?: number;
}

