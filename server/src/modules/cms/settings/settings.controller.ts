import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto, QuerySettingDto, BatchUpdateSettingsDto } from './dto/setting.dto';
import { ApiResponse } from '../../../common/response/api-response';
import { AdminGuard } from '../../auth/guards/admin.guard';

@ApiTags('CMS 网站设置')
@Controller('cms/settings')
export class SettingsController {
    constructor(private readonly service: SettingsService) { }

    @Get('public')
    @ApiOperation({ summary: '获取所有设置（公开）' })
    async getPublicSettings() {
        const data = await this.service.getAllSettings();
        return ApiResponse.success(data);
    }

    @Get('groups')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: '获取分组列表' })
    async getGroups() {
        const data = this.service.getGroups();
        return ApiResponse.success(data);
    }

    @Get('group/:group')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: '按分组获取设置' })
    async findByGroup(@Param('group') group: string) {
        const data = await this.service.findByGroup(group);
        return ApiResponse.success(data);
    }

    @Get()
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: '获取设置列表' })
    async findAll(@Query() query: QuerySettingDto) {
        const data = await this.service.findAll(query);
        return ApiResponse.success(data);
    }

    @Get('key/:key')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: '按键名获取设置' })
    async findByKey(@Param('key') key: string) {
        const data = await this.service.findByKey(key);
        return ApiResponse.success(data);
    }

    @Post()
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: '创建设置' })
    async create(@Body() dto: CreateSettingDto) {
        const data = await this.service.create(dto);
        return ApiResponse.success(data);
    }

    @Put('batch')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: '批量更新设置' })
    async batchUpdate(@Body() dto: BatchUpdateSettingsDto) {
        const data = await this.service.batchUpdate(dto);
        return ApiResponse.success(data);
    }

    @Put('key/:key')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: '按键名更新设置' })
    async updateByKey(@Param('key') key: string, @Body('value') value: string) {
        const data = await this.service.updateByKey(key, value);
        return ApiResponse.success(data);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: '更新设置' })
    async update(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
        const data = await this.service.update(id, dto);
        return ApiResponse.success(data);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: '删除设置' })
    async remove(@Param('id') id: string) {
        await this.service.remove(id);
        return ApiResponse.success(null, '删除成功');
    }
}
