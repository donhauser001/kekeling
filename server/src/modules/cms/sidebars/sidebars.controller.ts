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
import { SidebarsService } from './sidebars.service';
import { CreateSidebarDto, UpdateSidebarDto, QuerySidebarDto } from './dto/sidebar.dto';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('CMS 侧边栏管理')
@Controller('cms/sidebars')
export class SidebarsController {
  constructor(private readonly service: SidebarsService) {}

  @Get('widget-types')
  @ApiOperation({ summary: '获取组件类型列表' })
  getWidgetTypes() {
    const data = this.service.getWidgetTypes();
    return ApiResponse.success(data);
  }

  @Get('render/:code')
  @ApiOperation({ summary: '通过code获取渲染后的侧边栏（公开）' })
  async renderByCode(@Param('code') code: string) {
    const data = await this.service.findByCode(code);
    return ApiResponse.success(data);
  }

  @Get()
  @ApiOperation({ summary: '获取侧边栏列表' })
  async findAll(@Query() query: QuerySidebarDto) {
    const data = await this.service.findAll(query);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取侧边栏详情' })
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建侧边栏' })
  async create(@Body() dto: CreateSidebarDto) {
    const data = await this.service.create(dto);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新侧边栏' })
  async update(@Param('id') id: string, @Body() dto: UpdateSidebarDto) {
    const data = await this.service.update(id, dto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除侧边栏' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return ApiResponse.success(null, '删除成功');
  }
}

