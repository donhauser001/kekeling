import { IsString, IsOptional, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// 侧边栏组件类型
export type WidgetType = 'menu' | 'category' | 'html';

// 应用目标类型
export type ApplyTargetType = 'page' | 'category' | 'article' | 'all';

// 应用目标配置
export class ApplyTargetDto {
  @ApiProperty({ description: '目标类型', enum: ['page', 'category', 'article', 'all'] })
  @IsEnum(['page', 'category', 'article', 'all'])
  type: ApplyTargetType;

  @ApiPropertyOptional({ description: '目标ID（type=all时不需要）' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: '目标名称（仅展示用）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '分类ID（type=article时用于筛选分类下的文章）' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '分类名称（仅展示用）' })
  @IsOptional()
  @IsString()
  categoryName?: string;
}

// 组件配置基类
export class WidgetConfigDto {
  @ApiProperty({ description: '组件类型', enum: ['menu', 'category', 'html'] })
  @IsEnum(['menu', 'category', 'html'])
  type: WidgetType;

  @ApiPropertyOptional({ description: '组件标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '是否显示标题' })
  @IsOptional()
  showTitle?: boolean;

  @ApiPropertyOptional({ description: '标题图标' })
  @IsOptional()
  @IsString()
  titleIcon?: string;

  @ApiPropertyOptional({ description: '菜单ID（type=menu时使用）' })
  @IsOptional()
  @IsString()
  menuId?: string;

  @ApiPropertyOptional({ description: '分类ID（type=category时使用，空表示全部分类）' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '显示数量限制' })
  @IsOptional()
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ description: 'HTML内容（type=html时使用）' })
  @IsOptional()
  @IsString()
  htmlContent?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  sort?: number;
}

// 宽度预设类型
export type SidebarWidth = 'narrow' | 'medium' | 'wide' | 'custom';

export class CreateSidebarDto {
  @ApiProperty({ description: '侧边栏名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '唯一标识' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '位置', enum: ['left', 'right'] })
  @IsOptional()
  @IsEnum(['left', 'right'])
  position?: string;

  @ApiPropertyOptional({ description: '宽度预设', enum: ['narrow', 'medium', 'wide', 'custom'] })
  @IsOptional()
  @IsEnum(['narrow', 'medium', 'wide', 'custom'])
  width?: SidebarWidth;

  @ApiPropertyOptional({ description: '自定义宽度（像素）' })
  @IsOptional()
  @IsInt()
  customWidth?: number;

  @ApiPropertyOptional({ description: '应用目标', type: [ApplyTargetDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyTargetDto)
  applyTo?: ApplyTargetDto[];

  @ApiPropertyOptional({ description: '组件配置', type: [WidgetConfigDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetConfigDto)
  widgets?: WidgetConfigDto[];

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}

export class UpdateSidebarDto {
  @ApiPropertyOptional({ description: '侧边栏名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '唯一标识' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '位置', enum: ['left', 'right'] })
  @IsOptional()
  @IsEnum(['left', 'right'])
  position?: string;

  @ApiPropertyOptional({ description: '宽度预设', enum: ['narrow', 'medium', 'wide', 'custom'] })
  @IsOptional()
  @IsEnum(['narrow', 'medium', 'wide', 'custom'])
  width?: SidebarWidth;

  @ApiPropertyOptional({ description: '自定义宽度（像素）' })
  @IsOptional()
  @IsInt()
  customWidth?: number;

  @ApiPropertyOptional({ description: '应用目标', type: [ApplyTargetDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyTargetDto)
  applyTo?: ApplyTargetDto[];

  @ApiPropertyOptional({ description: '组件配置', type: [WidgetConfigDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetConfigDto)
  widgets?: WidgetConfigDto[];

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;
}

export class QuerySidebarDto {
  @ApiPropertyOptional({ description: '状态筛选' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

