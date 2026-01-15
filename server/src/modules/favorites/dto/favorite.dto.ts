import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FavoritesQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

export class FavoriteResponseDto {
  @ApiProperty({ description: '收藏ID' })
  id: string;

  @ApiProperty({ description: '服务ID' })
  serviceId: string;

  @ApiProperty({ description: '收藏时间' })
  createdAt: Date;

  @ApiProperty({ description: '服务信息' })
  service: {
    id: string;
    name: string;
    description: string;
    price: number;
    coverImage: string;
    rating: number;
    orderCount: number;
    categoryId: string;
    categoryName: string;
  };
}

export class CheckFavoriteResponseDto {
  @ApiProperty({ description: '是否已收藏' })
  isFavorite: boolean;
}
