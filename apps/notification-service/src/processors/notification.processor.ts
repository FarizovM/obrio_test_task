import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Processor('push-queue')
export class NotificationProcessor {
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @InjectMetric('push_notifications_sent_total') public counter: Counter<string>,
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
            //відправляємо дані на вебхук
            await firstValueFrom(
                this.httpService.post(webhookUrl, {
                    message: `Hello ${userData.name}, welcome to our service!`,
                    userId: userData.id,
                    timestamp: new Date(),
                }),
            );
            this.logger.log(`Push notification sent successfully to ${userData.name}`);
            // Збільшуємо лічильник метрики
            this.counter.inc();
        } catch (error) {
            // Логуємо помилку як error, щоб бачити стек
            this.logger.error(`Failed to send push notification to ${userData.name}. Error: ${error.message}`);
            //  ми кидаємо помилку далі, щоб BullMQ знав, що задача провалилася і запустив retry
            throw error;
        }
    }
}