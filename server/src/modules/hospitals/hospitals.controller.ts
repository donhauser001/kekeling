import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HospitalsService } from './hospitals.service';
import { ApiResponse } from '../../common/response/api-response';
import { DepartmentsService } from '../departments/departments.service';
import { DoctorsService } from '../doctors/doctors.service';

@ApiTags('医院')
@Controller('hospitals')
export class HospitalsController {
  constructor(
    private readonly hospitalsService: HospitalsService,
    private readonly departmentsService: DepartmentsService,
    private readonly doctorsService: DoctorsService,
  ) {}

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

  @Post()
  @ApiOperation({ summary: '创建医院' })
  async create(
    @Body()
    body: {
      name: string;
      level: string;
      type: string;
      address: string;
      phone?: string;
      introduction?: string;
      departmentTemplateIds?: string[];
    },
  ) {
    const data = await this.hospitalsService.create(body);
    return ApiResponse.success(data, '创建成功');
  }

  @Put(':id')
  @ApiOperation({ summary: '更新医院' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      level?: string;
      type?: string;
      address?: string;
      phone?: string;
      introduction?: string;
      status?: string;
      departmentTemplateIds?: string[];
    },
  ) {
    const data = await this.hospitalsService.update(id, body);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除医院' })
  async remove(@Param('id') id: string) {
    await this.hospitalsService.remove(id);
    return ApiResponse.success(null, '删除成功');
  }

  @Get(':id/departments')
  @ApiOperation({ summary: '获取医院科室树' })
  async getDepartments(@Param('id') id: string) {
    const data = await this.departmentsService.findTreeByHospital(id);
    return ApiResponse.success(data);
  }

  @Get(':id/doctors')
  @ApiOperation({ summary: '获取医院医生列表' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getDoctors(
    @Param('id') id: string,
    @Query('departmentId') departmentId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const data = await this.doctorsService.findAll({
      hospitalId: id,
      departmentId,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(data);
  }
}
