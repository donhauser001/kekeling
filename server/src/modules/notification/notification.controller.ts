import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationService } from './notification.service';
import { ApiResponse } from '../../common/response/api-response';

@ApiTags('消息通知')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  @ApiOperation({ summary: '获取消息列表' })
  async getMessages(
    @CurrentUser('sub') userId: string,
    @Query('category') category?: string,
    @Query('isRead') isRead?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.notificationService.getUserMessages(userId, {
      category,
      isRead: isRead === undefined ? undefined : isRead === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return ApiResponse.success(data);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读消息数量' })
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    const data = await this.notificationService.getUnreadCount(userId);
    return ApiResponse.success(data);
  }

  @Post('read')
  @ApiOperation({ summary: '标记消息为已读' })
  async markAsRead(
    @CurrentUser('sub') userId: string,
    @Body() body: { messageIds: string[] },
  ) {
    const count = await this.notificationService.markAsRead(userId, body.messageIds);
    return ApiResponse.success({ count }, '标记成功');
  }

  @Post('read-all')
  @ApiOperation({ summary: '标记全部已读' })
  async markAllAsRead(
    @CurrentUser('sub') userId: string,
    @Body() body: { category?: string },
  ) {
    const count = await this.notificationService.markAllAsRead(userId, body.category);
    return ApiResponse.success({ count }, '已全部标记为已读');
  }

  @Post('delete')
  @ApiOperation({ summary: '删除消息' })
  async deleteMessages(
    @CurrentUser('sub') userId: string,
    @Body() body: { messageIds: string[] },
  ) {
    const count = await this.notificationService.deleteMessages(userId, body.messageIds);
    return ApiResponse.success({ count }, '删除成功');
  }
}
