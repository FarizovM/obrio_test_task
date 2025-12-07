import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { NotificationController } from './controllers/notification.controller';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
    imports: [
        // Підключаємо Redis для черг задач
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379,
            },
        }),
        BullModule.registerQueue({
            name: 'push-queue',
        }),
        HttpModule, // Для виконання запитів
    ],
    controllers: [NotificationController],
    providers: [NotificationProcessor],
})
export class NotificationModule { }