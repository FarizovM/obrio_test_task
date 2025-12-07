// apps/notification-service/src/notification.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Додай імпорти
import { NotificationController } from './controllers/notification.controller';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        // Використовуємо Async конфігурацію для Redis
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get<string>('REDIS_HOST'),
                    port: configService.get<number>('REDIS_PORT'),
                },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: 'push-queue',
        }),
        HttpModule,
    ],
    controllers: [NotificationController],
    providers: [NotificationProcessor],
})
export class NotificationModule { }