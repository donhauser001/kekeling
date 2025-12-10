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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminBannersService } from '../services/admin-banners.service';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('管理后台-轮播图')
@Controller('admin/banners')
export class AdminBannersController {
  constructor(private readonly bannersService: AdminBannersService) { }

  @Get()
  @ApiOperation({ summary: '获取轮播图列表' })
  async findAll(
    @Query('position') position?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const data = await this.bannersService.findAll({
      position,
      status,
      keyword,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取轮播图详情' })
  async findOne(@Param('id') id: string) {
    const data = await this.bannersService.findOne(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建轮播图' })
  async create(
    @Body()
    body: {
      title?: string;
      image: string;
      link?: string;
      linkType?: string;
      position?: string;
      sort?: number;
      status?: string;
    },
  ) {
    const data = await this.bannersService.create(body);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新轮播图' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      image?: string;
      link?: string;
      linkType?: string;
      position?: string;
      sort?: number;
      status?: string;
    },
  ) {
    const data = await this.bannersService.update(id, body);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除轮播图' })
  async remove(@Param('id') id: string) {
    await this.bannersService.remove(id);
    return ApiResponse.success(null);
  }

  @Put('batch/sort')
  @ApiOperation({ summary: '批量更新排序' })
  async updateSort(@Body() items: { id: string; sort: number }[]) {
    const data = await this.bannersService.updateSort(items);
    return ApiResponse.success(data);
  }

  @Put('batch/status')
  @ApiOperation({ summary: '批量更新状态' })
  async batchUpdateStatus(@Body() body: { ids: string[]; status: string }) {
    const data = await this.bannersService.batchUpdateStatus(
      body.ids,
      body.status,
    );
    return ApiResponse.success(data);
  }
}
