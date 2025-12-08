// apps/notification-service/src/notification.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { NotificationController } from './controllers/notification.controller';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            // === ВАЛІДАЦІЯ ===
            validationSchema: Joi.object({
                // RabbitMQ
                RABBITMQ_URL: Joi.string().uri().required(),
                // Redis
                REDIS_HOST: Joi.string().required(),
                REDIS_PORT: Joi.number().default(6379),
                // External & Logic
                WEBHOOK_URL: Joi.string().uri().required(),
                PUSH_DELAY_MS: Joi.number().default(86400000),
            }),
            validationOptions: {
                allowUnknown: true,
                abortEarly: true,
            },
        }),
        // Async конфігурацію для Redis
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