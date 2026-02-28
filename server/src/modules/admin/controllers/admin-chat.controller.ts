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
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { ApiResponse } from '../../../common/response/api-response';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ChatSessionService } from '../../chat/chat-session.service';
import { ChatMessageService } from '../../chat/chat-message.service';
import { QuickReplyService } from '../../chat/quick-reply.service';
import { ChatGateway } from '../../chat/chat.gateway';
import {
    SessionQueryDto,
    CloseSessionDto,
    TransferSessionDto,
    CreateQuickReplyDto,
    UpdateQuickReplyDto,
    QuickReplyQueryDto,
    ChatSessionStatus,
} from '../../chat/dto/chat.dto';

@ApiTags('管理后台 - 在线客服')
@UseGuards(AdminGuard)
@Controller('admin/chat')
export class AdminChatController {
    constructor(
        private readonly sessionService: ChatSessionService,
        private readonly messageService: ChatMessageService,
        private readonly quickReplyService: QuickReplyService,
        private readonly chatGateway: ChatGateway,
    ) { }

    // ========== 会话管理 ==========

    @Get('sessions')
    @ApiOperation({ summary: '获取会话列表' })
    @ApiQuery({ name: 'status', required: false, enum: ChatSessionStatus })
    @ApiQuery({ name: 'adminId', required: false })
    @ApiQuery({ name: 'userId', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    async getSessions(@Query() query: SessionQueryDto) {
        const result = await this.sessionService.findAll(query);
        return ApiResponse.success(result);
    }

    @Get('sessions/stats')
    @ApiOperation({ summary: '获取会话统计' })
    async getStats() {
        const data = await this.sessionService.getStats();
        return ApiResponse.success(data);
    }

    @Get('sessions/:id')
    @ApiOperation({ summary: '获取会话详情（含消息）' })
    @ApiParam({ name: 'id', description: '会话ID' })
    @ApiQuery({ name: 'messageLimit', required: false, type: Number })
    async getSession(
        @Param('id') id: string,
        @Query('messageLimit') messageLimit?: number,
    ) {
        const data = await this.sessionService.findById(id, messageLimit || 50);
        return ApiResponse.success(data);
    }

    @Post('sessions/:id/accept')
    @ApiOperation({ summary: '接入会话' })
    @ApiParam({ name: 'id', description: '会话ID' })
    async acceptSession(
        @Param('id') id: string,
        @Body('adminId') adminId: string, // TODO: 从认证上下文获取
    ) {
        const data = await this.sessionService.acceptSession(id, adminId || 'admin');
        return ApiResponse.success(data, '接入成功');
    }

    @Post('sessions/:id/close')
    @ApiOperation({ summary: '关闭会话' })
    @ApiParam({ name: 'id', description: '会话ID' })
    async closeSession(
        @Param('id') id: string,
        @Body() dto: CloseSessionDto,
    ) {
        // TODO: 从认证上下文获取 adminId
        const adminId = 'admin';
        const data = await this.sessionService.closeSession(id, adminId, dto);
        return ApiResponse.success(data, '会话已关闭');
    }

    @Post('sessions/:id/transfer')
    @ApiOperation({ summary: '转接会话' })
    @ApiParam({ name: 'id', description: '会话ID' })
    async transferSession(
        @Param('id') id: string,
        @Body() dto: TransferSessionDto,
    ) {
        // TODO: 从认证上下文获取 currentAdminId
        const currentAdminId = 'admin';
        const data = await this.sessionService.transferSession(id, currentAdminId, dto.targetAdminId);
        return ApiResponse.success(data, '转接成功');
    }

    @Get('sessions/:id/messages')
    @ApiOperation({ summary: '获取会话消息' })
    @ApiParam({ name: 'id', description: '会话ID' })
    @ApiQuery({ name: 'before', required: false, description: '获取此消息ID之前的消息' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getMessages(
        @Param('id') sessionId: string,
        @Query('before') before?: string,
        @Query('limit') limit?: number,
    ) {
        const data = await this.messageService.getMessages(sessionId, {
            before,
            limit: limit || 20,
        });
        return ApiResponse.success(data);
    }

    // ========== 快捷回复管理 ==========

    @Get('quick-replies')
    @ApiOperation({ summary: '获取快捷回复列表' })
    async getQuickReplies(@Query() query: QuickReplyQueryDto) {
        const result = await this.quickReplyService.findAll(query);
        return ApiResponse.success(result);
    }

    @Get('quick-replies/active')
    @ApiOperation({ summary: '获取所有活跃的快捷回复（供客服使用）' })
    async getActiveQuickReplies() {
        const data = await this.quickReplyService.findAllActive();
        return ApiResponse.success(data);
    }

    @Get('quick-replies/popular')
    @ApiOperation({ summary: '获取热门快捷回复' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getPopularQuickReplies(@Query('limit') limit?: number) {
        const data = await this.quickReplyService.getPopular(limit || 10);
        return ApiResponse.success(data);
    }

    @Get('quick-replies/:id')
    @ApiOperation({ summary: '获取快捷回复详情' })
    @ApiParam({ name: 'id', description: '快捷回复ID' })
    async getQuickReply(@Param('id') id: string) {
        const data = await this.quickReplyService.findById(id);
        return ApiResponse.success(data);
    }

    @Post('quick-replies')
    @ApiOperation({ summary: '创建快捷回复' })
    async createQuickReply(@Body() dto: CreateQuickReplyDto) {
        const data = await this.quickReplyService.create(dto);
        return ApiResponse.success(data, '创建成功');
    }

    @Put('quick-replies/:id')
    @ApiOperation({ summary: '更新快捷回复' })
    @ApiParam({ name: 'id', description: '快捷回复ID' })
    async updateQuickReply(
        @Param('id') id: string,
        @Body() dto: UpdateQuickReplyDto,
    ) {
        const data = await this.quickReplyService.update(id, dto);
        return ApiResponse.success(data, '更新成功');
    }

    @Delete('quick-replies/:id')
    @ApiOperation({ summary: '删除快捷回复' })
    @ApiParam({ name: 'id', description: '快捷回复ID' })
    async deleteQuickReply(@Param('id') id: string) {
        await this.quickReplyService.remove(id);
        return ApiResponse.success(null, '删除成功');
    }

    @Post('quick-replies/:id/use')
    @ApiOperation({ summary: '记录快捷回复使用' })
    @ApiParam({ name: 'id', description: '快捷回复ID' })
    async useQuickReply(@Param('id') id: string) {
        await this.quickReplyService.incrementUseCount(id);
        return ApiResponse.success(null, '记录成功');
    }

    @Get('quick-replies/auto-greeting')
    @ApiOperation({ summary: '获取自动问候语' })
    async getAutoGreeting() {
        const data = await this.quickReplyService.getAutoGreeting();
        return ApiResponse.success(data);
    }

    @Post('quick-replies/:id/set-auto-greeting')
    @ApiOperation({ summary: '设置为自动问候语' })
    @ApiParam({ name: 'id', description: '快捷回复ID' })
    async setAutoGreeting(@Param('id') id: string) {
        const data = await this.quickReplyService.setAutoGreeting(id);
        return ApiResponse.success(data, '设置成功');
    }

    @Post('quick-replies/:id/cancel-auto-greeting')
    @ApiOperation({ summary: '取消自动问候语' })
    @ApiParam({ name: 'id', description: '快捷回复ID' })
    async cancelAutoGreeting(@Param('id') id: string) {
        const data = await this.quickReplyService.cancelAutoGreeting(id);
        return ApiResponse.success(data, '取消成功');
    }
}
