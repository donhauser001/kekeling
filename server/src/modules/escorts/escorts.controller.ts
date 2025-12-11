import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { EscortsService } from './escorts.service';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('陪诊员')
@Controller('escorts')
export class EscortsController {
  constructor(private readonly escortsService: EscortsService) { }

  @Get()
  @ApiOperation({ summary: '获取陪诊员列表' })
  @ApiQuery({ name: 'hospitalId', required: false, description: '医院ID' })
  @ApiQuery({ name: 'levelCode', required: false, description: '等级代码' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序方式: rating/orderCount/experience' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('hospitalId') hospitalId?: string,
    @Query('levelCode') levelCode?: string,
    @Query('sortBy') sortBy?: 'rating' | 'orderCount' | 'experience',
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.escortsService.findAll({
      hospitalId,
      levelCode,
      sortBy,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('recommended')
  @ApiOperation({ summary: '获取推荐陪诊员' })
  @ApiQuery({ name: 'hospitalId', required: false, description: '医院ID' })
  @ApiQuery({ name: 'limit', required: false })
  async getRecommended(
    @Query('hospitalId') hospitalId?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.escortsService.getRecommended(hospitalId, limit ? Number(limit) : 4);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取陪诊员详情' })
  @ApiParam({ name: 'id', description: '陪诊员ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.escortsService.findById(id);
    return ApiResponse.success(data);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: '获取陪诊员评价列表' })
  @ApiParam({ name: 'id', description: '陪诊员ID' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getReviews(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const data = await this.escortsService.getReviews(id, {
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
    return ApiResponse.success(data);
  }
}

