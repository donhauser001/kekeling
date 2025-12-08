import { Module } from '@nestjs/common';
import { TestController } from './test.controller';

/**
 * 测试模块 (仅开发环境)
 * 
 * ⚠️ 生产环境应禁用此模块：
 * 在 app.module.ts 中注释掉 TestModule 的导入
 */
@Module({
  controllers: [TestController],
})
export class TestModule {}

