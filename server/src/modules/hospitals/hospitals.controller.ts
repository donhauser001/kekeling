import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HospitalsService } from './hospitals.service';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('医院')
@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Get()
  @ApiOperation({ summary: '获取医院列表' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('keyword') keyword?: string,
    @Query('level') level?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.hospitalsService.findAll({
      keyword,
      level,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取医院详情' })
  async findOne(@Param('id') id: string) {
    const data = await this.hospitalsService.findById(id);
    return ApiResponse.success(data);
  }
}

