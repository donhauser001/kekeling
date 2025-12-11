import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PointsService } from '../../points/points.service';
import {
  CreatePointRuleDto,
  UpdatePointRuleDto,
  AdjustPointsDto,
} from '../../points/dto/points.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理端-积分管理')
@Controller('admin/points')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminPointsController {
  constructor(private readonly pointsService: PointsService) {}

  // ========== 规则管理 ==========

  @Get('rules')
  @ApiOperation({ summary: '获取积分规则列表' })
  @ApiQuery({ name: 'code', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getPointRules(
    @Query('code') code?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.pointsService.getPointRules({
      code,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Post('rules')
  @ApiOperation({ summary: '创建积分规则' })
  async createPointRule(@Body() dto: CreatePointRuleDto) {
    const data = await this.pointsService.createPointRule(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Put('rules/:id')
  @ApiOperation({ summary: '更新积分规则' })
  @ApiParam({ name: 'id', description: '规则ID' })
  async updatePointRule(
    @Param('id') id: string,
    @Body() dto: UpdatePointRuleDto,
  ) {
    const data = await this.pointsService.updatePointRule(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: '删除积分规则' })
  @ApiParam({ name: 'id', description: '规则ID' })
  async deletePointRule(@Param('id') id: string) {
    await this.pointsService.deletePointRule(id);
    return ApiResponse.success(null, '删除成功');
  }

  // ========== 用户积分管理 ==========

  @Get('users')
  @ApiOperation({ summary: '获取用户积分列表' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getUserPoints(
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.pointsService.getUserPoints({
      userId,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });
    return ApiResponse.success(result);
  }

  @Post('adjust')
  @ApiOperation({ summary: '手动调整积分' })
  async adjustPoints(@Body() dto: AdjustPointsDto) {
    const data = await this.pointsService.adjustPoints(dto);
    return ApiResponse.success(data, '调整成功');
  }

  // ========== 积分流水 ==========

  @Get('records')
  @ApiOperation({ summary: '获取积分流水' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getPointsRecords(
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.pointsService.getPointsRecordsForAdmin({
      userId,
      type,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
    return ApiResponse.success(result);
  }
}

