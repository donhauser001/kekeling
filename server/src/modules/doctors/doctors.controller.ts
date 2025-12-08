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
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';
import { ApiResponse } from '../../common/response/api-response';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  /**
   * 获取医生列表
   */
  @Get()
  async findAll(
    @Query('hospitalId') hospitalId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('keyword') keyword?: string,
    @Query('title') title?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: 'rating' | 'consultCount' | 'default',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.doctorsService.findAll({
      hospitalId,
      departmentId,
      keyword,
      title,
      status,
      sort,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
    return ApiResponse.success(result);
  }

  /**
   * 搜索医生 (快捷搜索)
   */
  @Get('search')
  async search(
    @Query('keyword') keyword: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.doctorsService.search(
      keyword,
      limit ? parseInt(limit, 10) : undefined,
    );
    return ApiResponse.success(result);
  }

  /**
   * 获取推荐医生
   */
  @Get('recommended')
  async findRecommended(@Query('limit') limit?: string) {
    const result = await this.doctorsService.findRecommended(
      limit ? parseInt(limit, 10) : undefined,
    );
    return ApiResponse.success(result);
  }

  /**
   * 获取单个医生
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.doctorsService.findById(id);
    return ApiResponse.success(result);
  }

  /**
   * 创建医生
   */
  @Post()
  async create(@Body() dto: CreateDoctorDto) {
    const result = await this.doctorsService.create(dto);
    return ApiResponse.success(result);
  }

  /**
   * 更新医生
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDoctorDto) {
    const result = await this.doctorsService.update(id, dto);
    return ApiResponse.success(result);
  }

  /**
   * 删除医生
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.doctorsService.delete(id);
    return ApiResponse.success(null, '删除成功');
  }
}

