import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 创建操作规范 DTO
export class CreateOperationGuideDto {
  @ApiProperty({ description: '分类ID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: '标题' })
  @IsString()
  @MinLength(2, { message: '标题至少2个字' })
  @MaxLength(100, { message: '标题最多100个字' })
  title: string;

  @ApiPropertyOptional({ description: '摘要' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  summary?: string;

  @ApiProperty({ description: '内容（富文本）' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '封面图' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({
    description: '状态',
    enum: ['active', 'inactive', 'draft'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: 'active' | 'inactive' | 'draft';
}

// 更新操作规范 DTO
export class UpdateOperationGuideDto {
  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: '标题' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: '摘要' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  summary?: string;

  @ApiPropertyOptional({ description: '内容（富文本）' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '封面图' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({
    description: '状态',
    enum: ['active', 'inactive', 'draft'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: 'active' | 'inactive' | 'draft';
}

// 查询操作规范 DTO
export class QueryOperationGuideDto {
  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: '状态',
    enum: ['active', 'inactive', 'draft'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: string;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

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
