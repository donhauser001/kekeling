import { Controller, Get, Post, Put, Delete, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import {
  AdminEscortsService,
  CreateEscortDto,
  UpdateEscortDto,
  AssociateHospitalDto,
} from '../services/admin-escorts.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-陪诊员')
@Controller('admin/escorts')
export class AdminEscortsController {
  constructor(private readonly escortsService: AdminEscortsService) {}

  // ============================================
  // 列表和详情
  // ============================================

  @Get()
  @ApiOperation({ summary: '获取陪诊员列表' })
  @ApiQuery({ name: 'status', required: false, description: '账号状态' })
  @ApiQuery({ name: 'workStatus', required: false, description: '接单状态' })
  @ApiQuery({ name: 'level', required: false, description: '等级' })
  @ApiQuery({ name: 'cityCode', required: false, description: '城市代码' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('workStatus') workStatus?: string,
    @Query('level') level?: string,
    @Query('cityCode') cityCode?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.escortsService.findAll({
      status,
      workStatus,
      level,
      cityCode,
      keyword,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取陪诊员统计数据' })
  async getStats() {
    const data = await this.escortsService.getStats();
    return ApiResponse.success(data);
  }

  @Get('available')
  @ApiOperation({ summary: '获取可派单的陪诊员' })
  @ApiQuery({ name: 'hospitalId', required: false })
  @ApiQuery({ name: 'cityCode', required: false })
  async getAvailable(
    @Query('hospitalId') hospitalId?: string,
    @Query('cityCode') cityCode?: string,
  ) {
    const data = await this.escortsService.getAvailable({ hospitalId, cityCode });
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取陪诊员详情' })
  @ApiParam({ name: 'id', description: '陪诊员ID' })
  async findById(@Param('id') id: string) {
    const data = await this.escortsService.findById(id);
    return ApiResponse.success(data);
  }

  // ============================================
  // 创建/更新/删除
  // ============================================

  @Post()
  @ApiOperation({ summary: '创建陪诊员' })
  @ApiBody({ description: '陪诊员信息' })
  async create(@Body() dto: CreateEscortDto) {
    const data = await this.escortsService.create(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Put(':id')
  @ApiOperation({ summary: '更新陪诊员信息' })
  @ApiParam({ name: 'id', description: '陪诊员ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateEscortDto) {
    const data = await this.escortsService.update(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除陪诊员' })
  @ApiParam({ name: 'id', description: '陪诊员ID' })
  async delete(@Param('id') id: string) {
    await this.escortsService.delete(id);
    return ApiResponse.success(null, '删除成功');
  }

  // ============================================
  // 状态管理
  // ============================================

  @Put(':id/status')
  @ApiOperation({ summary: '更新陪诊员状态' })
  @ApiParam({ name: 'id', description: '陪诊员ID' })
  @ApiBody({ schema: { properties: { status: { type: 'string' } } } })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const data = await this.escortsService.updateStatus(id, status);
    return ApiResponse.success(data, '状态已更新');
  }

  @Put(':id/work-status')
  @ApiOperation({ summary: '更新接单状态' })
  @ApiParam({ name: 'id', description: '陪诊员ID' })
  @ApiBody({ schema: { properties: { workStatus: { type: 'string' } } } })
  async updateWorkStatus(
    @Param('id') id: string,
    @Body('workStatus') workStatus: string,
  ) {
    const data = await this.escortsService.updateWorkStatus(id, workStatus);
    return ApiResponse.success(data, '接单状态已更新');
  }

  // ============================================
  // 医院关联
  // ============================================

  @Post(':id/hospitals')
  @ApiOperation({ summary: '关联医院' })
  @ApiParam({ name: 'id', description: '陪诊员ID' })
  async associateHospital(
    @Param('id') id: string,
    @Body() dto: AssociateHospitalDto,
  ) {
    await this.escortsService.associateHospital(id, dto);
    return ApiResponse.success(null, '关联成功');
  }

  @Delete(':id/hospitals/:hospitalId')
  @ApiOperation({ summary: '解除医院关联' })
  @ApiParam({ name: 'id', description: '陪诊员ID' })
  @ApiParam({ name: 'hospitalId', description: '医院ID' })
  async dissociateHospital(
    @Param('id') id: string,
    @Param('hospitalId') hospitalId: string,
  ) {
    await this.escortsService.dissociateHospital(id, hospitalId);
    return ApiResponse.success(null, '已解除关联');
  }

  @Put(':id/hospitals')
  @ApiOperation({ summary: '批量更新医院关联' })
  @ApiParam({ name: 'id', description: '陪诊员ID' })
  @ApiBody({
    schema: {
      properties: {
        hospitalIds: { type: 'array', items: { type: 'string' } },
        familiarDeptsMap: { type: 'object' },
      },
    },
  })
  async updateHospitals(
    @Param('id') id: string,
    @Body('hospitalIds') hospitalIds: string[],
    @Body('familiarDeptsMap') familiarDeptsMap?: Record<string, string[]>,
  ) {
    const data = await this.escortsService.updateHospitals(id, hospitalIds, familiarDeptsMap);
    return ApiResponse.success(data, '医院关联已更新');
  }
}
