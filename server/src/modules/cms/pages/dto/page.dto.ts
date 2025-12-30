import { IsString, IsOptional, IsNumber, IsIn, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建页面 DTO
 */
export class CreatePageDto {
  @ApiProperty({ description: '页面标题' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'URL 别名（如: about, privacy, terms）' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug 只能包含小写字母、数字和连字符' })
  slug: string;

  @ApiProperty({ description: '页面内容（富文本）' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '摘要/描述' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '布局模式', enum: ['boxed', 'fullwidth'], default: 'boxed' })
  @IsOptional()
  @IsIn(['boxed', 'fullwidth'])
  layout?: string;

  @ApiPropertyOptional({ description: '是否显示标题栏', default: true })
  @IsOptional()
  @IsBoolean()
  showTitle?: boolean;

  @ApiPropertyOptional({ description: 'SEO 标题' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO 描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoDesc?: string;

  @ApiPropertyOptional({ description: 'SEO 关键词' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoKeywords?: string;

  @ApiPropertyOptional({ description: '排序权重', default: 0 })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['draft', 'published'], default: 'draft' })
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;
}

/**
 * 更新页面 DTO
 */
export class UpdatePageDto {
  @ApiPropertyOptional({ description: '页面标题' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: 'URL 别名' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug 只能包含小写字母、数字和连字符' })
  slug?: string;

  @ApiPropertyOptional({ description: '页面内容（富文本）' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '摘要/描述' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '布局模式', enum: ['boxed', 'fullwidth'] })
  @IsOptional()
  @IsIn(['boxed', 'fullwidth'])
  layout?: string;

  @ApiPropertyOptional({ description: '是否显示标题栏' })
  @IsOptional()
  @IsBoolean()
  showTitle?: boolean;

  @ApiPropertyOptional({ description: 'SEO 标题' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO 描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoDesc?: string;

  @ApiPropertyOptional({ description: 'SEO 关键词' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoKeywords?: string;

  @ApiPropertyOptional({ description: '排序权重' })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['draft', 'published'] })
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;
}

/**
 * 查询页面 DTO
 */
export class QueryPageDto {
  @ApiPropertyOptional({ description: '状态筛选', enum: ['draft', 'published'] })
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
