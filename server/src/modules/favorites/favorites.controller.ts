import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';
import { FavoritesQueryDto, FavoriteResponseDto, CheckFavoriteResponseDto } from './dto/favorite.dto';

@ApiTags('收藏')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':serviceId')
  @ApiOperation({ summary: '添加收藏' })
  @ApiParam({ name: 'serviceId', description: '服务ID' })
  @ApiResponse({ status: 201, description: '收藏成功' })
  @ApiResponse({ status: 404, description: '服务不存在' })
  @ApiResponse({ status: 409, description: '已收藏该服务' })
  async addFavorite(
    @CurrentUser('sub') userId: string,
    @Param('serviceId') serviceId: string,
  ) {
    await this.favoritesService.addFavorite(userId, serviceId);
    return { message: '收藏成功' };
  }

  @Delete(':serviceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '取消收藏' })
  @ApiParam({ name: 'serviceId', description: '服务ID' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 404, description: '未收藏该服务' })
  async removeFavorite(
    @CurrentUser('sub') userId: string,
    @Param('serviceId') serviceId: string,
  ) {
    await this.favoritesService.removeFavorite(userId, serviceId);
    return { message: '已取消收藏' };
  }

  @Get()
  @ApiOperation({ summary: '获取我的收藏列表' })
  @ApiResponse({ status: 200, description: '成功', type: [FavoriteResponseDto] })
  async getFavorites(
    @CurrentUser('sub') userId: string,
    @Query() query: FavoritesQueryDto,
  ) {
    return this.favoritesService.getFavorites(userId, query);
  }

  @Get('check/:serviceId')
  @ApiOperation({ summary: '检查是否已收藏' })
  @ApiParam({ name: 'serviceId', description: '服务ID' })
  @ApiResponse({ status: 200, description: '成功', type: CheckFavoriteResponseDto })
  async checkFavorite(
    @CurrentUser('sub') userId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<CheckFavoriteResponseDto> {
    const isFavorite = await this.favoritesService.checkFavorite(userId, serviceId);
    return { isFavorite };
  }

  @Get('ids')
  @ApiOperation({ summary: '获取已收藏的服务ID列表' })
  @ApiResponse({ status: 200, description: '成功' })
  async getFavoriteIds(
    @CurrentUser('sub') userId: string,
  ) {
    const ids = await this.favoritesService.getFavoriteServiceIds(userId);
    return { ids };
  }
}
