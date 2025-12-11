import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import {
  AdminEscortLevelsService,
  CreateEscortLevelDto,
  UpdateEscortLevelDto,
} from '../services/admin-escort-levels.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-陪诊员等级')
@Controller('admin/escort-levels')
export class AdminEscortLevelsController {
  constructor(private readonly levelsService: AdminEscortLevelsService) { }

  @Get()
  @ApiOperation({ summary: '获取所有等级' })
  async findAll() {
    const data = await this.levelsService.findAll();
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取等级详情' })
  @ApiParam({ name: 'id', description: '等级ID' })
  async findById(@Param('id') id: string) {
    const data = await this.levelsService.findById(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建等级' })
  @ApiBody({ description: '等级信息' })
  async create(@Body() dto: CreateEscortLevelDto) {
    const data = await this.levelsService.create(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Put(':id')
  @ApiOperation({ summary: '更新等级' })
  @ApiParam({ name: 'id', description: '等级ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateEscortLevelDto) {
    const data = await this.levelsService.update(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除等级' })
  @ApiParam({ name: 'id', description: '等级ID' })
  async delete(@Param('id') id: string) {
    await this.levelsService.delete(id);
    return ApiResponse.success(null, '删除成功');
  }
}
