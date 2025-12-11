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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OperationGuideCategoriesService } from './operation-guide-categories.service';
import {
  CreateOperationGuideCategoryDto,
  UpdateOperationGuideCategoryDto,
  QueryOperationGuideCategoryDto,
} from './dto/operation-guide-category.dto';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('操作规范分类')
@Controller('operation-guide-categories')
export class OperationGuideCategoriesController {
  constructor(private readonly service: OperationGuideCategoriesService) { }

  @Get('active')
  @ApiOperation({ summary: '获取所有启用的分类（用于下拉选择）' })
  async findAllActive() {
    const data = await this.service.findAllActive();
    return ApiResponse.success(data);
  }

  @Get()
  @ApiOperation({ summary: '获取分类列表' })
  async findAll(@Query() query: QueryOperationGuideCategoryDto) {
    const data = await this.service.findAll(query);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建分类' })
  async create(@Body() dto: CreateOperationGuideCategoryDto) {
    const data = await this.service.create(dto);
    return ApiResponse.success(data);
  }

  @Put('sort')
  @ApiOperation({ summary: '批量更新排序' })
  async updateSort(@Body() items: { id: string; sort: number }[]) {
    const data = await this.service.updateSort(items);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新分类' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOperationGuideCategoryDto,
  ) {
    const data = await this.service.update(id, dto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return ApiResponse.success(null, '删除成功');
  }
}
