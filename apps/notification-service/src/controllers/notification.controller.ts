import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

@Controller()
export class NotificationController {
    // Інжектимо ConfigService
    constructor(
        @InjectQueue('push-queue') private pushQueue: Queue,
        private readonly configService: ConfigService
    ) { }

    @EventPattern('user_created')
    async handleUserCreated(@Payload() data: any) {
        console.log('Received event from RabbitMQ:', data);

        // Беремо затримку з налаштувань або 24 години як дефолт
        const delay = this.configService.get<number>('PUSH_DELAY_MS') || 86400000;

        await this.pushQueue.add('send-push', data, {
            delay: Number(delay), // Redis вимагає число
            removeOnComplete: true,
        });

        console.log(`Scheduled push notification for user ${data.name} in ${delay}ms`);
    }
}