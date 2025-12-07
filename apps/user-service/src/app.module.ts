import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import { User } from './user.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        // Використовуємо forRootAsync замість forRoot
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('POSTGRES_HOST'),
                // Тут ConfigService сам розбереться з типами або поверне undefined, 
                // тому додаємо || 5432 для надійності
                port: configService.get<number>('POSTGRES_PORT') || 5432,
                username: configService.get<string>('POSTGRES_USER'),
                password: configService.get<string>('POSTGRES_PASSWORD'),
                database: configService.get<string>('POSTGRES_DB'),
                entities: [User],
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([User]),
        ClientsModule.registerAsync([
            {
                name: 'NOTIFICATION_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService): Promise<ClientProvider> => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [await configService.get<string>('RABBITMQ_URL') || 'amqp://user:password@localhost:5672'],
                        queue: await configService.get<string>('RABBITMQ_QUEUE') || 'notification_queue',
                        queueOptions: {
                            durable: false,
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