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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminHotKeywordsService } from '../services/admin-hot-keywords.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理后台 - 热门搜索')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/hot-keywords')
export class AdminHotKeywordsController {
  constructor(private readonly hotKeywordsService: AdminHotKeywordsService) {}

  @Get()
  @ApiOperation({ summary: '获取热门搜索列表' })
  @ApiQuery({ name: 'status', required: false, description: '状态筛选' })
  @ApiQuery({ name: 'type', required: false, description: '类型筛选: hot=热门搜索, guess=猜你想找' })
  async findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const data = await this.hotKeywordsService.findAll(status, type);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取热门搜索详情' })
  async findOne(@Param('id') id: string) {
    const data = await this.hotKeywordsService.findOne(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建热门搜索' })
  async create(
    @Body() dto: { keyword: string; type?: string; isHot?: boolean; sort?: number; status?: string },
  ) {
    const data = await this.hotKeywordsService.create(dto);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新热门搜索' })
  async update(
    @Param('id') id: string,
    @Body() dto: { keyword?: string; type?: string; isHot?: boolean; sort?: number; status?: string },
  ) {
    const data = await this.hotKeywordsService.update(id, dto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除热门搜索' })
  async remove(@Param('id') id: string) {
    await this.hotKeywordsService.remove(id);
    return ApiResponse.success(null, '删除成功');
  }

  @Put('batch/status')
  @ApiOperation({ summary: '批量更新状态' })
  async batchUpdateStatus(
    @Body() dto: { ids: string[]; status: string },
  ) {
    const result = await this.hotKeywordsService.batchUpdateStatus(dto.ids, dto.status);
    return ApiResponse.success(result);
  }

  @Put('batch/sort')
  @ApiOperation({ summary: '批量更新排序' })
  async batchUpdateSort(
    @Body() dto: { items: { id: string; sort: number }[] },
  ) {
    const result = await this.hotKeywordsService.batchUpdateSort(dto.items);
    return ApiResponse.success(result);
  }
}

