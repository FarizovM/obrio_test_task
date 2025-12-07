import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Processor('push-queue')
export class NotificationProcessor {
    // URL для тестування (webhook.site)
    private readonly webhookUrl = process.env.WEBHOOK_URL;

    constructor(private readonly httpService: HttpService) { }

    @Process('send-push')
    async handleSendPush(job: Job) {
        const userData = job.data;
        console.log(`Processing push for user: ${userData.name}...`);

        try {
            // Імітація пуш-сповіщення через POST запит
            await firstValueFrom(
                this.httpService.post(this.webhookUrl, {
                    message: `Hello ${userData.name}, welcome to our service!`,
                    userId: userData.id,
                    timestamp: new Date(),
                }),
            );
            console.log('Push notification sent successfully via Webhook!');
        } catch (error) {
            console.error('Failed to send push notification', error.message);
            // BullMQ автоматично спробує повторити, якщо ми кинемо помилку (можна налаштувати retry)
        }
    }
}