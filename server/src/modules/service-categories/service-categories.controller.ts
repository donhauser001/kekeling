import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ServiceCategoriesService } from './service-categories.service';
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  QueryServiceCategoryDto,
} from './dto/service-category.dto';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('服务分类')
@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly service: ServiceCategoriesService) {}

  @Get()
  @ApiOperation({ summary: '获取分类列表' })
  async findAll(@Query() query: QueryServiceCategoryDto) {
    const result = await this.service.findAll(query);
    return ApiResponse.success(result);
  }

  @Get('active')
  @ApiOperation({ summary: '获取所有启用的分类（下拉选择用）' })
  async findAllActive() {
    const data = await this.service.findAllActive();
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  @ApiParam({ name: 'id', description: '分类ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建分类' })
  async create(@Body() dto: CreateServiceCategoryDto) {
    const data = await this.service.create(dto);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceCategoryDto,
  ) {
    const data = await this.service.update(id, dto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return ApiResponse.success(null, '删除成功');
  }

  @Put('batch/sort')
  @ApiOperation({ summary: '批量更新排序' })
  async updateSort(@Body() items: { id: string; sort: number }[]) {
    const result = await this.service.updateSort(items);
    return ApiResponse.success(result);
  }
}

