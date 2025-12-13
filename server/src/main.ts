import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cookie 解析中间件（安全修复 P1-9：支持 httpOnly Cookie）
  // @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P1-9
  app.use(cookieParser());

  // 静态文件服务 - 上传的文件
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  // 启用 CORS（支持 Cookie）
  app.enableCors({
    origin: true,
    credentials: true, // 允许携带 Cookie
  });

  // 全局响应拦截器 - 统一包装响应格式为 { code: 0, message: 'success', data: ... }
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('科科灵陪诊 API')
    .setDescription('科科灵陪诊服务后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 科科灵 API 服务已启动: http://localhost:${port}`);
  console.log(`📚 API 文档: http://localhost:${port}/api/docs`);
}

bootstrap();

