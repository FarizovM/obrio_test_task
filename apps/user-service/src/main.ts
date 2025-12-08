import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  console.log('🚀 STARTING APP WITH APP_MODULE...');
  const app = await NestFactory.create(AppModule);
  // Вмикаємо Helmet для захисту заголовків
  app.use(helmet());
  // Вмикаємо глобальний пайп валідації
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Видаляє зайві поля, яких немає в DTO
    forbidNonWhitelisted: true, // Кидає помилку, якщо є зайві поля
  }));

  await app.listen(process.env.port ?? 3000);
}
bootstrap();