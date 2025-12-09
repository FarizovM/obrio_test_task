import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

@Controller()
export class NotificationController {
    private readonly logger = new Logger(NotificationController.name);

    constructor(
        @InjectQueue('push-queue') private pushQueue: Queue,
        private readonly configService: ConfigService
    ) { }

    @EventPattern('user_created')
    async handleUserCreated(@Payload() data: any, @Ctx() context: RmqContext) {
        this.logger.log(`Received event from RabbitMQ for user: ${data.name}`);

        const delay = this.configService.get<number>('PUSH_DELAY_MS') || 86400000;

        await this.pushQueue.add('send-push', data, {
            delay: Number(delay),
            removeOnComplete: true,
            // === НАЛАШТУВАННЯ RETRY (Повторних спроб) ===
            attempts: 3, // Спробувати виконати задачу 3 рази у разі помилки
            backoff: {
                type: 'exponential', // Експоненціальна затримка (наприклад: 1с, 2с, 4с)
                delay: 5000, // Початкова затримка 5 секунд
            },
        });

        this.logger.log(`Scheduled push notification for user ${data.name} in ${delay}ms`);

    }
}