import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * 分页查询 DTO
 *
 * 用于分润记录、团队成员等列表查询
 * 通过 ValidationPipe 自动完成类型转换和校验
 */
export class QueryRecordsDto {
  @ApiPropertyOptional({
    description: '页码，从 1 开始',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page 必须是整数' })
  @Min(1, { message: 'page 最小值为 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量，最大 100',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pageSize 必须是整数' })
  @Min(1, { message: 'pageSize 最小值为 1' })
  @Max(100, { message: 'pageSize 最大值为 100' })
  pageSize?: number = 20;
}
