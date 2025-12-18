import { Module, OnModuleInit } from '@nestjs/common';
import { ArticleCategoriesController } from './article-categories.controller';
import { ArticleCategoriesService } from './article-categories.service';

@Module({
  controllers: [ArticleCategoriesController],
  providers: [ArticleCategoriesService],
  exports: [ArticleCategoriesService],
})
export class ArticleCategoriesModule implements OnModuleInit {
  constructor(private readonly categoriesService: ArticleCategoriesService) { }

  async onModuleInit() {
    // 确保系统分类存在
    await this.categoriesService.ensureSystemCategories();
  }
}
