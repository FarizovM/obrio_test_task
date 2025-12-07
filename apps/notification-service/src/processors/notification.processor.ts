import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Processor('push-queue')
export class NotificationProcessor {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService // Інжектимо
    ) { }

    @Process('send-push')
    async handleSendPush(job: Job) {
        const userData = job.data;
        const webhookUrl = this.configService.get<string>('WEBHOOK_URL'); // Беремо тут

        console.log(`Processing push for user: ${userData.name}...`);

        if (!webhookUrl) {
            console.error('WEBHOOK_URL is not defined!');
            return;
        }

        try {
            await firstValueFrom(
                this.httpService.post(webhookUrl, {
                    message: `Hello ${userData.name}, welcome to our service!`,
                    userId: userData.id,
                    timestamp: new Date(),
                }),
            );
            console.log('Push notification sent successfully via Webhook!');
        } catch (error) {
            console.error('Failed to send push notification:', error.message);
            // BullMQ автоматично спробує повторити, якщо ми кинемо помилку (можна налаштувати retry)
        }
    }
}