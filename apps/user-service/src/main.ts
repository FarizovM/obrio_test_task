import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 STARTING APP WITH APP_MODULE...');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Видаляє зайві поля, яких немає в DTO
    forbidNonWhitelisted: true, // Кидає помилку, якщо є зайві поля
  }));
  await app.listen(process.env.port ?? 3000);
}
bootstrap();