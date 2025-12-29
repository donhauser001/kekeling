import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettingDto {
    @ApiProperty({ description: '设置键名' })
    @IsString()
    key: string;

    @ApiProperty({ description: '设置值' })
    @IsString()
    value: string;

    @ApiProperty({ description: '显示名称' })
    @IsString()
    label: string;

    @ApiPropertyOptional({ description: '类型', enum: ['text', 'textarea', 'image', 'switch', 'select', 'color'] })
    @IsOptional()
    @IsEnum(['text', 'textarea', 'image', 'switch', 'select', 'color'])
    type?: string;

    @ApiPropertyOptional({ description: '分组', enum: ['general', 'seo', 'social', 'contact', 'appearance'] })
    @IsOptional()
    @IsEnum(['general', 'seo', 'social', 'contact', 'appearance'])
    group?: string;

    @ApiPropertyOptional({ description: '选项（JSON格式，select类型时使用）' })
    @IsOptional()
    @IsString()
    options?: string;

    @ApiPropertyOptional({ description: '排序' })
    @IsOptional()
    @IsInt()
    sort?: number;
}

export class UpdateSettingDto {
    @ApiPropertyOptional({ description: '设置值' })
    @IsOptional()
    @IsString()
    value?: string;

    @ApiPropertyOptional({ description: '显示名称' })
    @IsOptional()
    @IsString()
    label?: string;

    @ApiPropertyOptional({ description: '类型' })
    @IsOptional()
    @IsEnum(['text', 'textarea', 'image', 'switch', 'select', 'color'])
    type?: string;

    @ApiPropertyOptional({ description: '分组' })
    @IsOptional()
    @IsEnum(['general', 'seo', 'social', 'contact', 'appearance'])
    group?: string;

    @ApiPropertyOptional({ description: '选项' })
    @IsOptional()
    @IsString()
    options?: string;

    @ApiPropertyOptional({ description: '排序' })
    @IsOptional()
    @IsInt()
    sort?: number;
}

export class QuerySettingDto {
    @ApiPropertyOptional({ description: '分组筛选' })
    @IsOptional()
    @IsString()
    group?: string;

    @ApiPropertyOptional({ description: '关键词搜索' })
    @IsOptional()
    @IsString()
    keyword?: string;
}

export class BatchUpdateSettingsDto {
    @ApiProperty({ description: '设置列表' })
    settings: { key: string; value: string }[];
}

