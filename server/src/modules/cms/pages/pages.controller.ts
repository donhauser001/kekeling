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
import { PagesService } from './pages.service';
import { CreatePageDto, UpdatePageDto, QueryPageDto } from './dto/page.dto';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('CMS 页面管理')
@Controller('cms/pages')
export class PagesController {
  constructor(private readonly service: PagesService) { }

  /**
   * 公开接口：获取已发布页面列表
   */
  @Get('public')
  @ApiOperation({ summary: '获取已发布页面列表（公开）' })
  async findAllPublished() {
    const data = await this.service.findAllPublished();
    return ApiResponse.success(data);
  }

  /**
   * 公开接口：根据 slug 获取页面详情
   */
  @Get('public/:slug')
  @ApiOperation({ summary: '根据 slug 获取页面详情（公开）' })
  async findBySlugPublic(@Param('slug') slug: string) {
    const data = await this.service.findBySlugPublic(slug);
    return ApiResponse.success(data);
  }

  /**
   * 管理接口：获取页面列表
   */
  @Get()
  @ApiOperation({ summary: '获取页面列表' })
  async findAll(@Query() query: QueryPageDto) {
    const data = await this.service.findAll(query);
    return ApiResponse.success(data);
  }

  /**
   * 管理接口：获取页面详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取页面详情' })
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.success(data);
  }

  /**
   * 管理接口：创建页面
   */
  @Post()
  @ApiOperation({ summary: '创建页面' })
  async create(@Body() dto: CreatePageDto) {
    const data = await this.service.create(dto);
    return ApiResponse.success(data);
  }

  /**
   * 管理接口：更新页面
   */
  @Put(':id')
  @ApiOperation({ summary: '更新页面' })
  async update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    const data = await this.service.update(id, dto);
    return ApiResponse.success(data);
  }

  /**
   * 管理接口：删除页面
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除页面' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return ApiResponse.success(null, '删除成功');
  }

  /**
   * 管理接口：发布页面
   */
  @Post(':id/publish')
  @ApiOperation({ summary: '发布页面' })
  async publish(@Param('id') id: string) {
    const data = await this.service.publish(id);
    return ApiResponse.success(data, '发布成功');
  }

  /**
   * 管理接口：取消发布
   */
  @Post(':id/unpublish')
  @ApiOperation({ summary: '取消发布页面' })
  async unpublish(@Param('id') id: string) {
    const data = await this.service.unpublish(id);
    return ApiResponse.success(data, '已取消发布');
  }
}
