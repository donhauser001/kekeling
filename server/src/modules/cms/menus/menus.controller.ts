import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto, QueryMenuDto } from './dto/menu.dto';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('CMS 菜单管理')
@Controller('cms/menus')
export class MenusController {
    constructor(private readonly service: MenusService) { }

    @Get('tree')
    @ApiOperation({ summary: '获取菜单树（公开）' })
    async getTree(
        @Query('position') position?: string,
        @Query('excludeHidden') excludeHidden?: string,
    ) {
        // 默认排除隐藏菜单
        const shouldExcludeHidden = excludeHidden !== 'false';
        const data = await this.service.getMenuTree(position, shouldExcludeHidden);
        return ApiResponse.success(data);
    }

    @Get()
    @ApiOperation({ summary: '获取菜单列表' })
    async findAll(@Query() query: QueryMenuDto) {
        const data = await this.service.findAll(query);
        return ApiResponse.success(data);
    }

    @Get(':id')
    @ApiOperation({ summary: '获取菜单详情' })
    async findById(@Param('id') id: string) {
        const data = await this.service.findById(id);
        return ApiResponse.success(data);
    }

    @Post()
    @ApiOperation({ summary: '创建菜单' })
    async create(@Body() dto: CreateMenuDto) {
        const data = await this.service.create(dto);
        return ApiResponse.success(data);
    }

    @Put('sort')
    @ApiOperation({ summary: '批量更新排序' })
    async updateSort(@Body() items: { id: string; sort: number }[]) {
        const data = await this.service.updateSort(items);
        return ApiResponse.success(data);
    }

    @Put(':id')
    @ApiOperation({ summary: '更新菜单' })
    async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
        const data = await this.service.update(id, dto);
        return ApiResponse.success(data);
    }

    @Delete(':id')
    @ApiOperation({ summary: '删除菜单' })
    async remove(@Param('id') id: string) {
        await this.service.remove(id);
        return ApiResponse.success(null, '删除成功');
    }
}

