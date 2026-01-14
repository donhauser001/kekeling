import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { ChatGateway } from './chat.gateway';
import { ChatSessionService } from './chat-session.service';
import { ChatMessageService } from './chat-message.service';
import { QuickReplyService } from './quick-reply.service';
import { ChatController } from './chat.controller';

@Module({
    imports: [
        PrismaModule,
        RedisModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '7d' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [ChatController],
    providers: [
        ChatGateway,
        ChatSessionService,
        ChatMessageService,
        QuickReplyService,
    ],
    exports: [ChatSessionService, ChatMessageService, QuickReplyService, ChatGateway],
})
export class ChatModule { }
