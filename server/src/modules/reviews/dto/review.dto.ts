import { IsString, IsOptional, IsInt, Min, Max, IsArray, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateReviewDto {
    @ApiProperty({ description: '订单ID' })
    @IsString()
    orderId: string

    @ApiProperty({ description: '评分 1-5' })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number

    @ApiPropertyOptional({ description: '评价内容' })
    @IsOptional()
    @IsString()
    content?: string

    @ApiPropertyOptional({ description: '评价标签' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[]

    @ApiPropertyOptional({ description: '评价图片' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[]

    @ApiPropertyOptional({ description: '是否匿名', default: false })
    @IsOptional()
    @IsBoolean()
    isAnonymous?: boolean
}

export class UpdateReviewDto {
    @ApiPropertyOptional({ description: '评分 1-5' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number

    @ApiPropertyOptional({ description: '评价内容' })
    @IsOptional()
    @IsString()
    content?: string

    @ApiPropertyOptional({ description: '评价标签' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[]

    @ApiPropertyOptional({ description: '评价图片' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[]
}

export class ReviewQueryDto {
    @ApiPropertyOptional({ description: '页码', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number

    @ApiPropertyOptional({ description: '每页数量', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    pageSize?: number
}
