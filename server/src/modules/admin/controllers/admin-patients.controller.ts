import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminPatientsService } from '../services/admin-patients.service';
import { CreatePatientDto, UpdatePatientDto } from '../../patients/dto/patient.dto';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-就诊人')
@Controller('admin/patients')
export class AdminPatientsController {
  constructor(private readonly patientsService: AdminPatientsService) { }

  @Get()
  @ApiOperation({ summary: '获取就诊人列表' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词（姓名/手机号/身份证）' })
  @ApiQuery({ name: 'userId', required: false, description: '按用户ID筛选' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.patientsService.findAll({
      keyword,
      userId,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取就诊人统计' })
  async getStats() {
    const data = await this.patientsService.getStats();
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取就诊人详情' })
  @ApiParam({ name: 'id', description: '就诊人ID' })
  async findById(@Param('id') id: string) {
    const data = await this.patientsService.findById(id);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新就诊人信息' })
  @ApiParam({ name: 'id', description: '就诊人ID' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    const data = await this.patientsService.update(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除就诊人' })
  @ApiParam({ name: 'id', description: '就诊人ID' })
  async delete(@Param('id') id: string) {
    await this.patientsService.delete(id);
    return ApiResponse.success(null, '删除成功');
  }

  @Post(':id/default')
  @ApiOperation({ summary: '设为默认就诊人' })
  @ApiParam({ name: 'id', description: '就诊人ID' })
  async setDefault(@Param('id') id: string) {
    const data = await this.patientsService.setDefault(id);
    return ApiResponse.success(data);
  }
}

@ApiTags('管理端-用户就诊人')
@Controller('admin/users/:userId/patients')
export class AdminUserPatientsController {
  constructor(private readonly patientsService: AdminPatientsService) { }

  @Get()
  @ApiOperation({ summary: '获取指定用户的就诊人列表' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  async findByUser(@Param('userId') userId: string) {
    const result = await this.patientsService.findAll({ userId, pageSize: 100 });
    return ApiResponse.success(result.data);
  }

  @Post()
  @ApiOperation({ summary: '为用户添加就诊人' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  async create(
    @Param('userId') userId: string,
    @Body() dto: CreatePatientDto,
  ) {
    const data = await this.patientsService.create(userId, dto);
    return ApiResponse.success(data, '添加成功');
  }
}
