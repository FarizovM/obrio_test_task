import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import * as Joi from 'joi';
import { User } from './user.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            // === ВАЛІДАЦІЯ КОНФІГУРАЦІЇ ===
            validationSchema: Joi.object({
                PORT: Joi.number().default(3000),
                // Database
                POSTGRES_HOST: Joi.string().required(),
                POSTGRES_PORT: Joi.number().default(5432),
                POSTGRES_USER: Joi.string().required(),
                POSTGRES_PASSWORD: Joi.string().required(),
                POSTGRES_DB: Joi.string().required(),
                // RabbitMQ
                RABBITMQ_URL: Joi.string().uri().required(),
                RABBITMQ_QUEUE: Joi.string().default('notification_queue'),
            }),
            validationOptions: {
                allowUnknown: true, // Дозволяємо інші змінні (наприклад, для Redis), які тут не використовуються
                abortEarly: true,   // Зупинити при першій помилці
            },
        }),
        // Використовуємо forRootAsync замість forRoot для динамічного завантаження конфігурації
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('POSTGRES_HOST'),
                port: configService.get<number>('POSTGRES_PORT') || 5432,
                username: configService.get<string>('POSTGRES_USER'),
                password: configService.get<string>('POSTGRES_PASSWORD'),
                database: configService.get<string>('POSTGRES_DB'),
                entities: [User],
                synchronize: false, // false для вимкнення автоматичного синхронізації (Для production)
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([User]),
        ClientsModule.registerAsync([
            {
                name: 'NOTIFICATION_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://user:password@localhost:5672'],
                        queue: configService.get<string>('RABBITMQ_QUEUE') || 'notification_queue',
                        queueOptions: {
                            durable: true,
                            arguments: {
                                // Ті самі аргументи DLQ бажано вказати і тут, щоб RabbitMQ створив чергу правильно, 
                                // хто б перший не підключився (User або Notification сервіс).
                                'x-dead-letter-exchange': '', 
                                'x-dead-letter-routing-key': 'dead_letter_notification_queue',
                                // 'x-message-ttl': 5000 // Час життя повідомлення 
                            },
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class AppModule { }