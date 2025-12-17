import { IsString, IsOptional, IsNumber, IsIn, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'URL 别名（如: help, news, guide）' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug 只能包含小写字母、数字和连字符' })
  slug: string;

  @ApiPropertyOptional({ description: '分类描述' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: '图标（Lucide 图标名）' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '排序权重', default: 0 })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}

export class UpdateArticleCategoryDto {
  @ApiPropertyOptional({ description: '分类名称' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'URL 别名' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug 只能包含小写字母、数字和连字符' })
  slug?: string;

  @ApiPropertyOptional({ description: '分类描述' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: '图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '排序权重' })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}

export class QueryArticleCategoryDto {
  @ApiPropertyOptional({ description: '状态筛选', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
