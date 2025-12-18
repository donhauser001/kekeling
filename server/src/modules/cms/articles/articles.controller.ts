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
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto, QueryArticleDto } from './dto/article.dto';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('CMS 文章管理')
@Controller('cms/articles')
export class ArticlesController {
  constructor(private readonly service: ArticlesService) { }

  /**
   * 公开接口：获取已发布文章列表
   */
  @Get('public')
  @ApiOperation({ summary: '获取已发布文章列表（公开）' })
  async findAllPublished(@Query() query: QueryArticleDto) {
    const data = await this.service.findAllPublished(query);
    return ApiResponse.success(data);
  }

  /**
   * 公开接口：根据 slug 获取文章详情
   */
  @Get('public/:slug')
  @ApiOperation({ summary: '根据 slug 获取文章详情（公开）' })
  async findBySlugPublic(@Param('slug') slug: string) {
    const data = await this.service.findBySlugPublic(slug);
    return ApiResponse.success(data);
  }

  /**
   * 公开接口：根据 ID 获取文章详情
   */
  @Get('public/detail/:id')
  @ApiOperation({ summary: '根据 ID 获取文章详情（公开）' })
  async findByIdPublic(@Param('id') id: string) {
    const data = await this.service.findByIdPublic(id);
    return ApiResponse.success(data);
  }

  /**
   * 管理接口：获取文章列表
   */
  @Get()
  @ApiOperation({ summary: '获取文章列表' })
  async findAll(@Query() query: QueryArticleDto) {
    const data = await this.service.findAll(query);
    return ApiResponse.success(data);
  }

  /**
   * 管理接口：获取文章详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取文章详情' })
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.success(data);
  }

  /**
   * 管理接口：创建文章
   */
  @Post()
  @ApiOperation({ summary: '创建文章' })
  async create(@Body() dto: CreateArticleDto) {
    const data = await this.service.create(dto);
    return ApiResponse.success(data);
  }

  /**
   * 管理接口：更新文章
   */
  @Put(':id')
  @ApiOperation({ summary: '更新文章' })
  async update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    const data = await this.service.update(id, dto);
    return ApiResponse.success(data);
  }

  /**
   * 管理接口：删除文章
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除文章' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return ApiResponse.success(null, '删除成功');
  }

  /**
   * 管理接口：发布文章
   */
  @Post(':id/publish')
  @ApiOperation({ summary: '发布文章' })
  async publish(@Param('id') id: string) {
    const data = await this.service.publish(id);
    return ApiResponse.success(data, '发布成功');
  }

  /**
   * 管理接口：取消发布
   */
  @Post(':id/unpublish')
  @ApiOperation({ summary: '取消发布文章' })
  async unpublish(@Param('id') id: string) {
    const data = await this.service.unpublish(id);
    return ApiResponse.success(data, '已取消发布');
  }

  /**
   * 管理接口：置顶/取消置顶
   */
  @Post(':id/toggle-top')
  @ApiOperation({ summary: '置顶/取消置顶文章' })
  async toggleTop(@Param('id') id: string) {
    const data = await this.service.toggleTop(id);
    return ApiResponse.success(data);
  }
}
