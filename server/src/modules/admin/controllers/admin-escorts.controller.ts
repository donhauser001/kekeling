import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminEscortsService } from '../services/admin-escorts.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-陪诊员')
@Controller('admin/escorts')
export class AdminEscortsController {
  constructor(private readonly escortsService: AdminEscortsService) {}

  @Get()
  @ApiOperation({ summary: '获取陪诊员列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('status') status?: string,
    @Query('level') level?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.escortsService.findAll({
      status,
      level,
      keyword,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('available')
  @ApiOperation({ summary: '获取可派单的陪诊员' })
  @ApiQuery({ name: 'hospitalId', required: false })
  async getAvailable(@Query('hospitalId') hospitalId?: string) {
    const data = await this.escortsService.getAvailable(hospitalId);
    return ApiResponse.success(data);
  }
}

