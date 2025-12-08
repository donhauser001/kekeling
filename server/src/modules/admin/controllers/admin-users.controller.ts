import { Controller, Get, Put, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminUsersService } from '../services/admin-users.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-用户')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'hasPhone', required: false, description: '是否绑定手机' })
  @ApiQuery({ name: 'startDate', required: false, description: '注册开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '注册结束日期' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('hasPhone') hasPhone?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.usersService.findAll({
      keyword,
      hasPhone: hasPhone === 'true' ? true : hasPhone === 'false' ? false : undefined,
      startDate,
      endDate,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取用户统计' })
  async getStats() {
    const data = await this.usersService.getStats();
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户ID' })
  async findById(@Param('id') id: string) {
    const data = await this.usersService.findById(id);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiBody({
    schema: {
      properties: {
        nickname: { type: 'string' },
        phone: { type: 'string' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() body: { nickname?: string; phone?: string },
  ) {
    const data = await this.usersService.update(id, body);
    return ApiResponse.success(data, '更新成功');
  }

  @Get(':id/patients')
  @ApiOperation({ summary: '获取用户的就诊人列表' })
  @ApiParam({ name: 'id', description: '用户ID' })
  async getPatients(@Param('id') id: string) {
    const data = await this.usersService.getPatients(id);
    return ApiResponse.success(data);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: '获取用户的订单历史' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getOrders(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const data = await this.usersService.getOrders(id, {
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(data);
  }
}

