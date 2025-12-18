import { IsString, IsOptional, IsNumber, IsIn, IsBoolean, IsArray, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateArticleDto {
  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: '文章标题' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'URL 别名' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug 只能包含小写字母、数字和连字符' })
  slug: string;

  @ApiPropertyOptional({ description: '摘要' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @ApiProperty({ description: '文章内容（富文本）' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '作者' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  author?: string;

  @ApiPropertyOptional({ description: '来源' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @ApiPropertyOptional({ description: '标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '置顶', default: false })
  @IsOptional()
  @IsBoolean()
  isTop?: boolean;

  @ApiPropertyOptional({ description: '热门', default: false })
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

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

  @ApiPropertyOptional({ description: '状态', enum: ['draft', 'published', 'archived'], default: 'draft' })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;
}

export class UpdateArticleDto {
  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '文章标题' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'URL 别名' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug 只能包含小写字母、数字和连字符' })
  slug?: string;

  @ApiPropertyOptional({ description: '摘要' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @ApiPropertyOptional({ description: '文章内容（富文本）' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '作者' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  author?: string;

  @ApiPropertyOptional({ description: '来源' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @ApiPropertyOptional({ description: '标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '置顶' })
  @IsOptional()
  @IsBoolean()
  isTop?: boolean;

  @ApiPropertyOptional({ description: '热门' })
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

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

  @ApiPropertyOptional({ description: '状态', enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;
}

export class QueryArticleDto {
  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '分类 slug' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ description: '状态筛选', enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @ApiPropertyOptional({ description: '置顶筛选' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isTop?: boolean;

  @ApiPropertyOptional({ description: '热门筛选' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isHot?: boolean;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;
}
