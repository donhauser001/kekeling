import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { Request } from 'express'
import { ReviewsService } from './reviews.service'
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from './dto/review.dto'
import { ApiResponse } from '../../common/response/api-response'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('评价')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '提交评价' })
    async createReview(@Req() req: Request, @Body() dto: CreateReviewDto) {
        const userId = (req.user as any).id
        const data = await this.reviewsService.createReview(userId, dto)
        return ApiResponse.success(data, '评价成功')
    }

    @Get('order/:orderId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取订单评价状态' })
    @ApiParam({ name: 'orderId', description: '订单ID' })
    async getOrderReviewStatus(@Req() req: Request, @Param('orderId') orderId: string) {
        const userId = (req.user as any).id
        const data = await this.reviewsService.getOrderReviewStatus(userId, orderId)
        return ApiResponse.success(data)
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '修改评价（7天内）' })
    @ApiParam({ name: 'id', description: '评价ID' })
    async updateReview(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() dto: UpdateReviewDto
    ) {
        const userId = (req.user as any).id
        const data = await this.reviewsService.updateReview(userId, id, dto)
        return ApiResponse.success(data, '修改成功')
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '我的评价列表' })
    async getMyReviews(@Req() req: Request, @Query() query: ReviewQueryDto) {
        const userId = (req.user as any).id
        const data = await this.reviewsService.getMyReviews(userId, query)
        return ApiResponse.success(data)
    }
}
