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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CampaignsService } from '../../campaigns/campaigns.service';
import { ApiResponse } from '../../../common/response/api-response';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  QueryCampaignDto,
  CreateSeckillItemDto,
  UpdateSeckillItemDto,
} from '../../campaigns/dto/campaign.dto';

@ApiTags('管理端-活动系统')
@ApiBearerAuth()
@Controller('admin/campaigns')
export class AdminCampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // --- 活动管理 ---
  @Post()
  @ApiOperation({ summary: '创建活动' })
  async createCampaign(@Body() dto: CreateCampaignDto) {
    const data = await this.campaignsService.createCampaign(dto);
    return ApiResponse.success(data, '创建成功');
  }

  @Get()
  @ApiOperation({ summary: '获取活动列表' })
  async getCampaigns(@Query() query: QueryCampaignDto) {
    const data = await this.campaignsService.getCampaigns(query);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取活动详情' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async getCampaignById(@Param('id') id: string) {
    const data = await this.campaignsService.getCampaignById(id);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新活动' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async updateCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    const data = await this.campaignsService.updateCampaign(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除活动' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async deleteCampaign(@Param('id') id: string) {
    await this.campaignsService.deleteCampaign(id);
    return ApiResponse.success(null, '删除成功');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消活动' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async cancelCampaign(@Param('id') id: string) {
    const data = await this.campaignsService.cancelCampaign(id);
    return ApiResponse.success(data, '活动已取消');
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '获取活动统计数据' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async getCampaignStats(@Param('id') id: string) {
    const data = await this.campaignsService.getCampaignStats(id);
    return ApiResponse.success(data);
  }

  // --- 秒杀商品管理 ---
  @Get('seckill/:campaignId/items')
  @ApiOperation({ summary: '获取秒杀商品列表' })
  @ApiParam({ name: 'campaignId', description: '活动ID' })
  async getSeckillItems(@Param('campaignId') campaignId: string) {
    const data = await this.campaignsService.getSeckillItems(campaignId);
    return ApiResponse.success(data);
  }

  @Post('seckill/:campaignId/items')
  @ApiOperation({ summary: '添加秒杀商品' })
  @ApiParam({ name: 'campaignId', description: '活动ID' })
  async createSeckillItem(
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateSeckillItemDto,
  ) {
    const data = await this.campaignsService.createSeckillItem(campaignId, dto);
    return ApiResponse.success(data, '添加成功');
  }

  @Put('seckill/items/:id')
  @ApiOperation({ summary: '更新秒杀商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  async updateSeckillItem(
    @Param('id') id: string,
    @Body() dto: UpdateSeckillItemDto,
  ) {
    const data = await this.campaignsService.updateSeckillItem(id, dto);
    return ApiResponse.success(data, '更新成功');
  }

  @Delete('seckill/items/:id')
  @ApiOperation({ summary: '删除秒杀商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  async deleteSeckillItem(@Param('id') id: string) {
    await this.campaignsService.deleteSeckillItem(id);
    return ApiResponse.success(null, '删除成功');
  }
}

