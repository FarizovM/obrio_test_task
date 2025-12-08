import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Завантажуємо змінні з .env файлу
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'users_db',
  // Вказуємо шляхи до сутностей та міграцій
  entities: ['apps/user-service/src/**/*.entity.ts'],
  migrations: ['apps/user-service/src/migrations/*.ts'],
});