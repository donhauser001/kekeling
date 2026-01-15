import { Module, NestModule, MiddlewareConsumer, RequestMethod, Injectable, NestMiddleware } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { SystemConfigModule } from '../config/config.module';
import { Request, Response, NextFunction } from 'express';

/**
 * 自定义中间件：将请求体读取为原始字符串
 * 用于处理微信支付回调的 XML 数据
 */
@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let data = '';
    req.setEncoding('utf8');
    
    req.on('data', (chunk) => {
      data += chunk;
    });
    
    req.on('end', () => {
      (req as any).rawXmlBody = data;
      next();
    });
    
    req.on('error', (err) => {
      console.error('[RawBodyMiddleware] 读取请求体失败:', err);
      next(err);
    });
  }
}

@Module({
  imports: [PrismaModule, NotificationModule, SystemConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 为微信支付回调路由配置原始请求体读取
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'payment/notify', method: RequestMethod.POST });
  }
}

