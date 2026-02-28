import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger'
import { AdminReviewsService, HideReviewDto } from '../services/admin-reviews.service'
import { ApiResponse } from '../../../common/response/api-response'
import { AdminGuard } from '../../auth/guards/admin.guard'

@ApiTags('管理后台 - 评价管理')
@UseGuards(AdminGuard)
@Controller('admin/reviews')
export class AdminReviewsController {
    constructor(private readonly reviewsService: AdminReviewsService) { }

    @Get()
    @ApiOperation({ summary: '获取评价列表' })
    @ApiQuery({ name: 'status', required: false, description: '状态: all, visible, hidden' })
    @ApiQuery({ name: 'escortId', required: false, description: '陪诊员ID' })
    @ApiQuery({ name: 'userId', required: false, description: '用户ID' })
    @ApiQuery({ name: 'rating', required: false, description: '指定评分 1-5' })
    @ApiQuery({ name: 'minRating', required: false, description: '最低评分' })
    @ApiQuery({ name: 'maxRating', required: false, description: '最高评分' })
    @ApiQuery({ name: 'hasContent', required: false, description: '是否有文字内容' })
    @ApiQuery({ name: 'hasReply', required: false, description: '是否有回复' })
    @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
    @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'pageSize', required: false })
    async findAll(
        @Query('status') status?: string,
        @Query('escortId') escortId?: string,
        @Query('userId') userId?: string,
        @Query('rating') rating?: number,
        @Query('minRating') minRating?: number,
        @Query('maxRating') maxRating?: number,
        @Query('hasContent') hasContent?: boolean,
        @Query('hasReply') hasReply?: boolean,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        const result = await this.reviewsService.findAll({
            status: status as any,
            escortId,
            userId,
            rating,
            minRating,
            maxRating,
            hasContent,
            hasReply,
            startDate,
            endDate,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
        })
        return ApiResponse.success(result)
    }

    @Get('stats')
    @ApiOperation({ summary: '获取评价统计' })
    @ApiQuery({ name: 'escortId', required: false, description: '陪诊员ID' })
    @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
    @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
    async getStats(
        @Query('escortId') escortId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const data = await this.reviewsService.getStats(escortId, startDate, endDate)
        return ApiResponse.success(data)
    }

    @Get('ranking')
    @ApiOperation({ summary: '获取陪诊员评分排行榜' })
    @ApiQuery({ name: 'period', required: false, description: '统计周期: week, month, quarter, year, all' })
    @ApiQuery({ name: 'minReviewCount', required: false, description: '最少评价数（过滤样本太少的）' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'pageSize', required: false })
    async getRanking(
        @Query('period') period?: string,
        @Query('minReviewCount') minReviewCount?: number,
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        const data = await this.reviewsService.getRanking({
            period: period as any,
            minReviewCount: minReviewCount ? Number(minReviewCount) : 5,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 20,
        })
        return ApiResponse.success(data)
    }

    @Get(':id')
    @ApiOperation({ summary: '获取评价详情' })
    @ApiParam({ name: 'id', description: '评价ID' })
    async findOne(@Param('id') id: string) {
        const data = await this.reviewsService.findById(id)
        return ApiResponse.success(data)
    }

    @Post(':id/hide')
    @ApiOperation({ summary: '隐藏评价' })
    @ApiParam({ name: 'id', description: '评价ID' })
    @ApiBody({
        schema: {
            properties: {
                reason: { type: 'string', description: '隐藏原因' },
            },
            required: ['reason'],
        },
    })
    async hideReview(@Param('id') id: string, @Body() dto: HideReviewDto) {
        // TODO: 从认证上下文获取 adminId
        const adminId = 'system'
        const data = await this.reviewsService.hideReview(id, dto, adminId)
        return ApiResponse.success(data, '评价已隐藏')
    }

    @Post(':id/show')
    @ApiOperation({ summary: '显示评价' })
    @ApiParam({ name: 'id', description: '评价ID' })
    async showReview(@Param('id') id: string) {
        const data = await this.reviewsService.showReview(id)
        return ApiResponse.success(data, '评价已恢复显示')
    }
}
