import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
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
   * 公开接口：渲染 HTML 页面（供小程序 WebView 使用）
   */
  @Get('view/:slug')
  @ApiOperation({ summary: '渲染 HTML 页面（供小程序 WebView）' })
  async renderPage(@Param('slug') slug: string, @Res() res: Response) {
    try {
      const page = await this.service.findBySlugPublic(slug);
      
      // 直接返回完整的 HTML 内容
      // 如果内容已经是完整 HTML 文档，直接返回
      // 否则包装成完整文档
      let html = page.content;
      
      if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
        // 不是完整 HTML，包装一下
        html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${page.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      padding: 16px;
      background: #fff;
    }
    h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em; font-weight: 600; }
    p { margin-bottom: 1em; }
    img { max-width: 100%; height: auto; }
    ul, ol { margin: 1em 0; padding-left: 1.5em; }
    a { color: #f97316; text-decoration: none; }
  </style>
</head>
<body>
${page.coverImage ? `<img src="${page.coverImage}" style="width:100%;margin-bottom:16px;border-radius:8px;">` : ''}
${html}
</body>
</html>`;
      }
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(404).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面不存在</title>
  <style>
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; color: #666; }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <h2>页面不存在</h2>
    <p>请在后台配置此页面</p>
  </div>
</body>
</html>`);
    }
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
