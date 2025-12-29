import { IsString, IsOptional, IsInt, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 菜单类型枚举
const MENU_TYPES = ['link', 'category', 'page', 'user_login', 'escort_register', 'escort_login', 'escort_forgot_password', 'escort_profile'] as const;

export class CreateMenuDto {
    @ApiProperty({ description: '菜单名称' })
    @IsString()
    name: string;

    @ApiProperty({ description: '菜单代码（唯一）' })
    @IsString()
    code: string;

    @ApiPropertyOptional({
        description: '类型：link=自定义链接, category=文章分类, page=页面, user_login=用户登录, escort_register=陪诊员注册, escort_login=陪诊员登录, escort_forgot_password=陪诊员找回密码, escort_profile=陪诊员资料',
        enum: MENU_TYPES
    })
    @IsOptional()
    @IsEnum(MENU_TYPES)
    type?: string;

    @ApiPropertyOptional({ description: '链接地址（type=link时使用）' })
    @IsOptional()
    @IsString()
    url?: string;

    @ApiPropertyOptional({ description: '文章分类ID（type=category时使用）' })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({ description: '页面ID（type=page时使用）' })
    @IsOptional()
    @IsString()
    pageId?: string;

    @ApiPropertyOptional({ description: '打开方式', enum: ['_self', '_blank'] })
    @IsOptional()
    @IsEnum(['_self', '_blank'])
    target?: string;

    @ApiPropertyOptional({ description: '图标' })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiPropertyOptional({ description: '父级菜单ID' })
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiPropertyOptional({ description: '是否为首页' })
    @IsOptional()
    @IsBoolean()
    isHome?: boolean;

    @ApiPropertyOptional({ description: '在主菜单中隐藏' })
    @IsOptional()
    @IsBoolean()
    hideInMain?: boolean;

    @ApiPropertyOptional({ description: '排序' })
    @IsOptional()
    @IsInt()
    sort?: number;

    @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive'] })
    @IsOptional()
    @IsEnum(['active', 'inactive'])
    status?: string;
}

export class UpdateMenuDto {
    @ApiPropertyOptional({ description: '菜单名称' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: '菜单代码' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiPropertyOptional({
        description: '类型',
        enum: MENU_TYPES
    })
    @IsOptional()
    @IsEnum(MENU_TYPES)
    type?: string;

    @ApiPropertyOptional({ description: '链接地址' })
    @IsOptional()
    @IsString()
    url?: string;

    @ApiPropertyOptional({ description: '文章分类ID' })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({ description: '页面ID' })
    @IsOptional()
    @IsString()
    pageId?: string;

    @ApiPropertyOptional({ description: '打开方式' })
    @IsOptional()
    @IsEnum(['_self', '_blank'])
    target?: string;

    @ApiPropertyOptional({ description: '图标' })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiPropertyOptional({ description: '父级菜单ID' })
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiPropertyOptional({ description: '是否为首页' })
    @IsOptional()
    @IsBoolean()
    isHome?: boolean;

    @ApiPropertyOptional({ description: '在主菜单中隐藏' })
    @IsOptional()
    @IsBoolean()
    hideInMain?: boolean;

    @ApiPropertyOptional({ description: '排序' })
    @IsOptional()
    @IsInt()
    sort?: number;

    @ApiPropertyOptional({ description: '状态' })
    @IsOptional()
    @IsEnum(['active', 'inactive'])
    status?: string;
}

export class QueryMenuDto {
    @ApiPropertyOptional({ description: '状态筛选' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: '关键词搜索' })
    @IsOptional()
    @IsString()
    keyword?: string;

    @ApiPropertyOptional({ description: '父级ID（null表示获取顶级菜单）' })
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiPropertyOptional({ description: '是否在主菜单中隐藏' })
    @IsOptional()
    @IsBoolean()
    hideInMain?: boolean;

    @ApiPropertyOptional({ description: '是否排除隐藏的菜单（用于主菜单展示）' })
    @IsOptional()
    @IsBoolean()
    excludeHidden?: boolean;
}

