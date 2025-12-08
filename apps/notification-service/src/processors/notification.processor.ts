import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Processor('push-queue')
export class NotificationProcessor {
    //Ініціалізуємо логер з контекстом класу
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) { }

    @Process('send-push')
    async handleSendPush(job: Job) {
        const userData = job.data;
        const webhookUrl = this.configService.get<string>('WEBHOOK_URL');

        this.logger.log(`Processing push for user: ${userData.name} (Attempt ${job.attemptsMade + 1})`);

        if (!webhookUrl) {
            this.logger.error('WEBHOOK_URL is not defined! Job failed.');
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
            this.logger.log(`Push notification sent successfully to ${userData.name}`);
        } catch (error) {
            // Логуємо помилку як error, щоб бачити стек
            this.logger.error(`Failed to send push notification to ${userData.name}. Error: ${error.message}`);
            //  ми кидаємо помилку далі, щоб BullMQ знав, що задача провалилася і запустив retry
            throw error;
        }
    }
}