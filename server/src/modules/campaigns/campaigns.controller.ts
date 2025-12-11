import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { ApiResponse } from '../../common/response/api-response';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('活动系统')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) { }

  @Get('active')
  @ApiOperation({ summary: '获取进行中的活动列表' })
  @ApiQuery({ name: 'type', required: false, description: '活动类型' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getActiveCampaigns(
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const data = await this.campaignsService.getActiveCampaigns({
      type,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取活动详情' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async getCampaignById(
    @Param('id') id: string,
    @CurrentUser('sub') userId?: string,
  ) {
    const data = await this.campaignsService.getCampaignById(id, userId);
    return ApiResponse.success(data);
  }

  @Get('service/:serviceId')
  @ApiOperation({ summary: '获取服务适用的活动' })
  @ApiParam({ name: 'serviceId', description: '服务ID' })
  async getCampaignForService(
    @Param('serviceId') serviceId: string,
    @CurrentUser('sub') userId?: string,
  ) {
    const data = await this.campaignsService.getCampaignForService(serviceId, userId);
    return ApiResponse.success(data);
  }

  @Post('seckill/:campaignId/:serviceId/reserve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '秒杀预占库存' })
  @ApiParam({ name: 'campaignId', description: '活动ID' })
  @ApiParam({ name: 'serviceId', description: '服务ID' })
  async reserveSeckillStock(
    @Param('campaignId') campaignId: string,
    @Param('serviceId') serviceId: string,
    @CurrentUser('sub') userId: string,
    @Request() req: any,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const data = await this.campaignsService.reserveSeckillStock(
      campaignId,
      serviceId,
      userId,
      ip,
    );
    return ApiResponse.success(data, '库存预占成功');
  }
}

