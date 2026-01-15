import {
  Controller,
  Get,
  Post,
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
import { PointsService } from './points.service';
import { CheckInDto } from './dto/points.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('积分')
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取积分概览' })
  async getPointsOverview(@CurrentUser('sub') userId: string) {
    const data = await this.pointsService.getPointsOverview(userId);
    return ApiResponse.success(data);
  }

  @Get('records')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取积分明细' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getPointsRecords(
    @CurrentUser('sub') userId: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.pointsService.getPointsRecords(userId, {
      type,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
    return ApiResponse.success(result);
  }

  @Post('checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '每日签到' })
  async checkIn(
    @CurrentUser('sub') userId: string,
    @Body() dto: CheckInDto,
  ) {
    const data = await this.pointsService.checkIn(userId);
    return ApiResponse.success(data, '签到成功');
  }

  @Get('checkin/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取签到状态' })
  async getCheckInStatus(@CurrentUser('sub') userId: string) {
    const data = await this.pointsService.getCheckInStatus(userId);
    return ApiResponse.success(data);
  }

  @Get('tasks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取积分任务列表' })
  async getPointsTasks(@CurrentUser('sub') userId: string) {
    const data = await this.pointsService.getPointsTasks(userId);
    return ApiResponse.success(data);
  }

  @Post('tasks/:taskCode/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '领取任务奖励' })
  @ApiParam({ name: 'taskCode', description: '任务代码' })
  async claimTask(
    @CurrentUser('sub') userId: string,
    @Param('taskCode') taskCode: string,
  ) {
    const data = await this.pointsService.claimTask(userId, taskCode);
    return ApiResponse.success(data, '领取成功');
  }
}

