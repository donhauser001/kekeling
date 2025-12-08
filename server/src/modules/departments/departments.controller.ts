import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { ApiResponse } from '../../common/response/api-response';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  /**
   * 获取科室列表 (管理端)
   */
  @Get()
  async findAll(
    @Query('hospitalId') hospitalId?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.departmentsService.findAll({
      hospitalId,
      status,
      keyword,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
    return ApiResponse.success(result);
  }

  /**
   * 获取单个科室
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.departmentsService.findById(id);
    return ApiResponse.success(result);
  }

  /**
   * 创建科室
   */
  @Post()
  async create(@Body() dto: CreateDepartmentDto) {
    const result = await this.departmentsService.create(dto);
    return ApiResponse.success(result);
  }

  /**
   * 更新科室
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    const result = await this.departmentsService.update(id, dto);
    return ApiResponse.success(result);
  }

  /**
   * 删除科室
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.departmentsService.delete(id);
    return ApiResponse.success(null, '删除成功');
  }
}

