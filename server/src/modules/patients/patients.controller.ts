import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('就诊人')
@Controller('patients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: '获取就诊人列表' })
  async findAll(@CurrentUser('sub') userId: string) {
    const data = await this.patientsService.findByUser(userId);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '添加就诊人' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePatientDto,
  ) {
    const data = await this.patientsService.create(userId, dto);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新就诊人' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    const data = await this.patientsService.update(id, userId, dto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除就诊人' })
  async delete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    await this.patientsService.delete(id, userId);
    return ApiResponse.success(null, '删除成功');
  }

  @Post(':id/default')
  @ApiOperation({ summary: '设为默认就诊人' })
  async setDefault(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    const data = await this.patientsService.setDefault(id, userId);
    return ApiResponse.success(data);
  }
}

