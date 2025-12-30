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
import { ArticleCategoriesService } from './article-categories.service';
import { CreateArticleCategoryDto, UpdateArticleCategoryDto, QueryArticleCategoryDto } from './dto/article-category.dto';
import { ApiResponse } from '../../../common/response/api-response';

@ApiTags('CMS 文章分类')
@Controller('cms/article-categories')
export class ArticleCategoriesController {
  constructor(private readonly service: ArticleCategoriesService) { }

  @Get('active')
  @ApiOperation({ summary: '获取所有启用的分类（公开）' })
  async findAllActive() {
    const data = await this.service.findAllActive();
    return ApiResponse.success(data);
  }

  @Get()
  @ApiOperation({ summary: '获取分类列表' })
  async findAll(@Query() query: QueryArticleCategoryDto) {
    const data = await this.service.findAll(query);
    return ApiResponse.success(data);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: '根据 slug 获取分类详情（公开）' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.service.findBySlug(slug);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.success(data);
  }

  @Post()
  @ApiOperation({ summary: '创建分类' })
  async create(@Body() dto: CreateArticleCategoryDto) {
    const data = await this.service.create(dto);
    return ApiResponse.success(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新分类' })
  async update(@Param('id') id: string, @Body() dto: UpdateArticleCategoryDto) {
    const data = await this.service.update(id, dto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return ApiResponse.success(null, '删除成功');
  }
}
