import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 检查响应是否已经是 ApiResponse 格式
 */
function isApiResponse(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    'code' in data &&
    'message' in data &&
    'data' in data &&
    typeof data.code === 'number'
  );
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果响应已经是 ApiResponse 格式，直接返回
        if (isApiResponse(data)) {
          return data;
        }
        // 否则包装为标准格式
        return {
          code: 0,
          message: 'success',
          data,
        };
      }),
    );
  }
}
