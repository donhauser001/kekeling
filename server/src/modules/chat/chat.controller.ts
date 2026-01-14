import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ApiResponse } from '../../common/response/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatSessionService } from './chat-session.service';
import { ChatMessageService } from './chat-message.service';
import {
    CreateSessionDto,
    SendMessageDto,
    CloseSessionDto,
    RateSessionDto,
    SenderType,
    ChatSessionStatus,
    MessageType,
} from './dto/chat.dto';

/**
 * 用户端客服聊天控制器
 *
 * 提供小程序/H5 端客服聊天功能：
 * - 创建/获取会话
 * - 发送消息
 * - 获取消息历史
 * - 标记已读
 * - 评价会话
 */
@ApiTags('用户端 - 在线客服')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(
        private readonly sessionService: ChatSessionService,
        private readonly messageService: ChatMessageService,
    ) { }

    // ========== 会话管理 ==========

    @Post('session')
    @ApiOperation({ summary: '获取或创建会话' })
    async getOrCreateSession(@Req() req: any, @Body() dto?: CreateSessionDto) {
        // JWT 策略返回的结构: { sub: userId, user: userObject, ... }
        const userId = req.user?.sub || req.user?.user?.id;
        if (!userId) {
            return ApiResponse.error('用户未登录');
        }

        // 先尝试获取当前会话
        const existingSession = await this.sessionService.getCurrentSession(userId);
        if (existingSession) {
            return ApiResponse.success(existingSession);
        }

        // 如果没有进行中的会话，创建新会话
        const session = await this.sessionService.createSession(userId, dto || { source: 'profile' as any });
        return ApiResponse.success(session);
    }

    @Get('session')
    @ApiOperation({ summary: '获取当前会话' })
    async getCurrentSession(@Req() req: any) {
        const userId = req.user?.sub || req.user?.user?.id;
        if (!userId) {
            return ApiResponse.error('用户未登录');
        }

        const session = await this.sessionService.getCurrentSession(userId);
        return ApiResponse.success(session);
    }

    // ========== 消息管理 ==========

    @Post('sessions/:sessionId/messages')
    @ApiOperation({ summary: '发送消息' })
    @ApiParam({ name: 'sessionId', description: '会话ID' })
    async sendMessage(
        @Req() req: any,
        @Param('sessionId') sessionId: string,
        @Body() dto: { type: MessageType; content: string },
    ) {
        const userId = req.user?.sub || req.user?.user?.id;
        if (!userId) {
            return ApiResponse.error('用户未登录');
        }

        const message = await this.messageService.sendMessage(
            {
                sessionId,
                type: dto.type,
                content: dto.content,
            },
            SenderType.USER,
            userId,
        );

        return ApiResponse.success(message);
    }

    @Get('sessions/:sessionId/messages')
    @ApiOperation({ summary: '获取消息历史' })
    @ApiParam({ name: 'sessionId', description: '会话ID' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    async getMessages(
        @Param('sessionId') sessionId: string,
        @Query('page') page = '1',
        @Query('pageSize') pageSize = '20',
    ) {
        const pageNum = parseInt(page as string, 10) || 1;
        const limit = parseInt(pageSize as string, 10) || 20;

        const messages = await this.messageService.getMessages(sessionId, {
            limit,
        });

        return ApiResponse.success({
            items: messages,
            total: messages.length,
            page: pageNum,
            pageSize: limit,
            hasMore: messages.length >= limit,
        });
    }

    @Post('sessions/:sessionId/read')
    @ApiOperation({ summary: '标记消息已读' })
    @ApiParam({ name: 'sessionId', description: '会话ID' })
    async markAsRead(
        @Req() req: any,
        @Param('sessionId') sessionId: string,
    ) {
        const userId = req.user?.sub || req.user?.user?.id;
        if (!userId) {
            return ApiResponse.error('用户未登录');
        }

        const result = await this.messageService.markAsRead(sessionId, undefined, SenderType.USER);
        return ApiResponse.success(result);
    }

    @Post('sessions/:sessionId/close')
    @ApiOperation({ summary: '用户关闭会话' })
    @ApiParam({ name: 'sessionId', description: '会话ID' })
    async closeSession(
        @Req() req: any,
        @Param('sessionId') sessionId: string,
    ) {
        const userId = req.user?.sub || req.user?.user?.id;
        if (!userId) {
            return ApiResponse.error('用户未登录');
        }

        // 用户关闭时不传 adminId
        const session = await this.sessionService.closeSession(sessionId, '', {
            reason: 'user_close',
        });
        return ApiResponse.success(session, '会话已关闭');
    }

    @Post('sessions/:sessionId/rate')
    @ApiOperation({ summary: '评价会话' })
    @ApiParam({ name: 'sessionId', description: '会话ID' })
    async rateSession(
        @Req() req: any,
        @Param('sessionId') sessionId: string,
        @Body() dto: RateSessionDto,
    ) {
        const userId = req.user?.sub || req.user?.user?.id;
        if (!userId) {
            return ApiResponse.error('用户未登录');
        }

        const session = await this.sessionService.rateSession(sessionId, userId, dto);
        return ApiResponse.success(session, '评价成功');
    }

    // ========== 其他 ==========

    @Get('unread-count')
    @ApiOperation({ summary: '获取未读消息数' })
    async getUnreadCount(@Req() req: any) {
        const userId = req.user?.sub || req.user?.user?.id;
        if (!userId) {
            return ApiResponse.success({ count: 0 });
        }

        // 获取用户当前会话
        const session = await this.sessionService.getCurrentSession(userId);
        if (!session) {
            return ApiResponse.success({ count: 0 });
        }

        const count = await this.messageService.getUnreadCount(session.id, SenderType.USER);
        return ApiResponse.success({ count });
    }
}
