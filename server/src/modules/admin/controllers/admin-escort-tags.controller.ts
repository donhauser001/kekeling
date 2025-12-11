import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import {
  AdminEscortTagsService,
  CreateEscortTagDto,
  UpdateEscortTagDto,
} from '../services/admin-escort-tags.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-陪诊员标签')
@Controller('admin/escort-tags')
export class AdminEscortTagsController {
  constructor(private readonly tagsService: AdminEscortTagsService) { }

  @Get()
  @ApiOperation({ summary: '获取所有标签' })
  @ApiQuery({ name: 'category', required: false, description: '标签分类' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  async findAll(
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.tagsService.findAll({ category, status });
    return ApiResponse.success(data);
  }

  @Get('grouped')
  @ApiOperation({ summary: '按分类分组获取标签' })
  async findAllGrouped() {
    const data = await this.tagsService.findAllGrouped();
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取标签详情' })
  @ApiParam({ name: 'id', description: '标签ID' })
  async findById(@Param('id') id: string) {
    const data = await this.tagsService.findById(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建标签' })
  @ApiBody({ description: '标签信息' })
  async create(@Body() dto: CreateEscortTagDto) {
    const data = await this.tagsService.create(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Put(':id')
  @ApiOperation({ summary: '更新标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateEscortTagDto) {
    const data = await this.tagsService.update(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  async delete(@Param('id') id: string) {
    await this.tagsService.delete(id);
    return ApiResponse.success(null, '删除成功');
  }

  @Put('batch/sort')
  @ApiOperation({ summary: '批量更新排序' })
  @ApiBody({
    schema: {
      properties: {
        items: {
          type: 'array',
          items: {
            properties: {
              id: { type: 'string' },
              sort: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async updateSort(@Body('items') items: Array<{ id: string; sort: number }>) {
    await this.tagsService.updateSort(items);
    return ApiResponse.success(null, '排序已更新');
  }
}
