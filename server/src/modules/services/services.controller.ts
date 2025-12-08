import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('服务')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('categories')
  @ApiOperation({ summary: '获取服务分类列表' })
  async getCategories() {
    const data = await this.servicesService.getCategories();
    return ApiResponse.success(data);
  }

  @Get()
  @ApiOperation({ summary: '获取服务列表' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.servicesService.findAll({
      categoryId,
      keyword,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Get('hot')
  @ApiOperation({ summary: '获取热门服务' })
  async getHotServices(@Query('limit') limit?: number) {
    const data = await this.servicesService.getHotServices(limit ? Number(limit) : 6);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取服务详情' })
  async findOne(@Param('id') id: string) {
    const data = await this.servicesService.findById(id);
    return ApiResponse.success(data);
  }
}

