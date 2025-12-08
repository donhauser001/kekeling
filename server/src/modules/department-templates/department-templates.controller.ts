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
import { DepartmentTemplatesService } from './department-templates.service';
import { ApiResponse } from '../../common/response/api-response';

@Controller('department-templates')
export class DepartmentTemplatesController {
  constructor(private readonly service: DepartmentTemplatesService) {}

  // 获取科室库 (树形结构)
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('keyword') keyword?: string,
  ) {
    const data = await this.service.findAll({ category, keyword });
    return ApiResponse.success(data);
  }

  // 获取科室库 (平铺列表，分页)
  @Get('flat')
  async findAllFlat(
    @Query('category') category?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const data = await this.service.findAllFlat({
      category,
      keyword,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 100,
    });
    return ApiResponse.success(data);
  }

  // 获取所有分类
  @Get('categories')
  async getCategories() {
    const data = await this.service.getCategories();
    return ApiResponse.success(data);
  }

  // 获取科室详情
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    if (!data) {
      return ApiResponse.error('科室不存在');
    }
    return ApiResponse.success(data);
  }

  // 创建科室模板
  @Post()
  async create(
    @Body()
    body: {
      name: string;
      category: string;
      parentId?: string;
      description?: string;
      diseases?: string[];
      color?: string;
      icon?: string;
    },
  ) {
    const data = await this.service.create(body);
    return ApiResponse.success(data, '创建成功');
  }

  // 更新科室模板
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      category?: string;
      parentId?: string;
      description?: string;
      diseases?: string[];
      color?: string;
      icon?: string;
      sort?: number;
      status?: string;
    },
  ) {
    const data = await this.service.update(id, body);
    return ApiResponse.success(data, '更新成功');
  }

  // 删除科室模板
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return ApiResponse.success(null, '删除成功');
  }
}

