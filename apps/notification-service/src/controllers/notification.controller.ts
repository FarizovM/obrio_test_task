import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller()
export class NotificationController {
    constructor(@InjectQueue('push-queue') private pushQueue: Queue) { }

    @EventPattern('user_created')
    async handleUserCreated(@Payload() data: any) {
        console.log('Received event from RabbitMQ:', data);

        // Додаємо задачу в чергу Redis з затримкою 24 години
        // 24 години = 24 * 60 * 60 * 1000 мс
        const delay = 24 * 60 * 60 * 1000;

        // Для тестування краще поставити 10000 (10 секунд), щоб не чекати добу
        // const delay = 10000; 

        await this.pushQueue.add('send-push', data, {
            delay: delay,
            removeOnComplete: true, // Видаляти задачу після успішного виконання
        });

        console.log(`Scheduled push notification for user ${data.name} in ${delay}ms`);
    }
}