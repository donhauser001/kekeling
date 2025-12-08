import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 服务包含项
export class ServiceIncludeItem {
  @ApiProperty({ description: '内容文本' })
  @IsString()
  @MinLength(1)
  text: string;

  @ApiPropertyOptional({ description: '图标名称' })
  @IsOptional()
  @IsString()
  icon?: string;
}

// 预订须知项
export class ServiceNoteItem {
  @ApiProperty({ description: '标题' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ description: '内容' })
  @IsString()
  @MinLength(1)
  content: string;
}

// 创建服务 DTO
export class CreateServiceDto {
  @ApiProperty({ description: '服务名称' })
  @IsString()
  @MinLength(2, { message: '名称至少2个字' })
  @MaxLength(50, { message: '名称最多50个字' })
  name: string;

  @ApiProperty({ description: '服务分类ID' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ description: '服务简介' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '销售价格' })
  @IsNumber({}, { message: '价格必须是数字' })
  @Min(0, { message: '价格不能为负' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ description: '原价（划线价）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  originalPrice?: number;

  @ApiPropertyOptional({ description: '单位', default: '次' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '服务时长描述' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: '封面图URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '详情图片URL数组' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  detailImages?: string[];

  @ApiPropertyOptional({ description: '服务包含项' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceIncludeItem)
  serviceIncludes?: ServiceIncludeItem[];

  @ApiPropertyOptional({ description: '预订须知' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceNoteItem)
  serviceNotes?: ServiceNoteItem[];

  @ApiPropertyOptional({ description: '最小购买数量', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  minQuantity?: number;

  @ApiPropertyOptional({ description: '最大购买数量', default: 99 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxQuantity?: number;

  @ApiPropertyOptional({ description: '是否需要填写就诊人', default: true })
  @IsOptional()
  @IsBoolean()
  needPatient?: boolean;

  @ApiPropertyOptional({ description: '是否需要选择医院', default: true })
  @IsOptional()
  @IsBoolean()
  needHospital?: boolean;

  @ApiPropertyOptional({ description: '是否需要选择科室', default: false })
  @IsOptional()
  @IsBoolean()
  needDepartment?: boolean;

  @ApiPropertyOptional({ description: '是否需要选择医生', default: false })
  @IsOptional()
  @IsBoolean()
  needDoctor?: boolean;

  @ApiPropertyOptional({ description: '是否需要预约时间', default: true })
  @IsOptional()
  @IsBoolean()
  needAppointment?: boolean;

  @ApiPropertyOptional({ description: '标签数组' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive', 'draft'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: 'active' | 'inactive' | 'draft';
}

// 更新服务 DTO
export class UpdateServiceDto {
  @ApiPropertyOptional({ description: '服务名称' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '服务分类ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '服务简介' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: '销售价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ description: '原价（划线价）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  originalPrice?: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '服务时长描述' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: '封面图URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '详情图片URL数组' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  detailImages?: string[];

  @ApiPropertyOptional({ description: '服务包含项' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceIncludeItem)
  serviceIncludes?: ServiceIncludeItem[];

  @ApiPropertyOptional({ description: '预订须知' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceNoteItem)
  serviceNotes?: ServiceNoteItem[];

  @ApiPropertyOptional({ description: '最小购买数量' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  minQuantity?: number;

  @ApiPropertyOptional({ description: '最大购买数量' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxQuantity?: number;

  @ApiPropertyOptional({ description: '是否需要填写就诊人' })
  @IsOptional()
  @IsBoolean()
  needPatient?: boolean;

  @ApiPropertyOptional({ description: '是否需要选择医院' })
  @IsOptional()
  @IsBoolean()
  needHospital?: boolean;

  @ApiPropertyOptional({ description: '是否需要选择科室' })
  @IsOptional()
  @IsBoolean()
  needDepartment?: boolean;

  @ApiPropertyOptional({ description: '是否需要选择医生' })
  @IsOptional()
  @IsBoolean()
  needDoctor?: boolean;

  @ApiPropertyOptional({ description: '是否需要预约时间' })
  @IsOptional()
  @IsBoolean()
  needAppointment?: boolean;

  @ApiPropertyOptional({ description: '标签数组' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive', 'draft'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'draft'])
  status?: 'active' | 'inactive' | 'draft';
}

// 查询服务 DTO
export class QueryServiceDto {
  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

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

