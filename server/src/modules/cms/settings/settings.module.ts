import { Module, OnModuleInit } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule implements OnModuleInit {
    constructor(private readonly settingsService: SettingsService) { }

    async onModuleInit() {
        // 初始化默认设置
        await this.settingsService.ensureDefaultSettings();
        console.log('[CMS] 网站设置模块已初始化');
    }
}

