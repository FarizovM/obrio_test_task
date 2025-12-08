import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NotificationModule } from './notification.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NotificationService');
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672'],
        queue: 'notification_queue',
        // Важливо для Production:
        noAck: false, // Вмикаємо ручне (або автоматичне NestJS) підтвердження.
        queueOptions: {
          durable: true, // 1. Черга має зберігатися на диску
          // 2. Налаштування DLQ
          arguments: {
            'x-dead-letter-exchange': '', // Використовуємо дефолтний exchange
            'x-dead-letter-routing-key': 'dead_letter_notification_queue', // Куди кидати "мертві" повідомлення
            // 'x-message-ttl': 5000 // Час життя повідомлення 
          },
        },
      },
    },
  );
  
  await app.listen();
  logger.log('Notification Microservice is listening');
}
bootstrap();