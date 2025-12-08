import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EscortsService } from './escorts.service';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('陪诊员')
@Controller('escorts')
export class EscortsController {
  constructor(private readonly escortsService: EscortsService) {}

  @Get()
  @ApiOperation({ summary: '获取陪诊员列表' })
  @ApiQuery({ name: 'hospitalId', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('hospitalId') hospitalId?: string,
    @Query('level') level?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.escortsService.findAll({
      hospitalId,
      level,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('recommended')
  @ApiOperation({ summary: '获取推荐陪诊员' })
  async getRecommended(@Query('limit') limit?: number) {
    const data = await this.escortsService.getRecommended(limit ? Number(limit) : 4);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取陪诊员详情' })
  async findOne(@Param('id') id: string) {
    const data = await this.escortsService.findById(id);
    return ApiResponse.success(data);
  }
}

