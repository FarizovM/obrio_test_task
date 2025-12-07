import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 STARTING APP WITH APP_MODULE...');
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();