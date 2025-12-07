# OBRIO Test Task: Microservices Notification System

Система мікросервісів для реєстрації користувачів та відправки відкладених Push-сповіщень (через 24 години). Реалізована на базі **NestJS**, використовує **RabbitMQ** для асинхронної комунікації та **Redis (BullMQ)** для відкладених задач.

## 🛠 Технологічний стек

* **Framework:** NestJS (Monorepo)
* **Database:** PostgreSQL (TypeORM)
* **Message Broker:** RabbitMQ
* **Job Queue:** Redis + BullMQ
* **Containerization:** Docker & Docker Compose
* **Language:** TypeScript (Node.js v20+)

## 🏗 Архітектура

Система складається з двох незалежних мікросервісів:

1. **User Service (REST API)**
    * Приймає HTTP запит на створення користувача.
    * Зберігає користувача в PostgreSQL (генерує UUID).
    * Публікує подію `user_created` у чергу RabbitMQ.
2. **Notification Service (Worker)**
    * Слухає події з RabbitMQ.
    * Створює відкладену задачу (Delayed Job) у Redis.
    * Після спливання часу (за замовчуванням 24 години) виконує HTTP-запит на зовнішній Webhook (імітація Push-сповіщення).

---

## 📂 Структура проєкту (Monorepo)

```
.
├── apps
│   ├── user-service          # HTTP API, TypeORM, RabbitMQ Publisher
│   └── notification-service  # Microservice, RabbitMQ Consumer, BullMQ (Redis) Processor
├── docker-compose.yml        # Оркестрація інфраструктури
├── Dockerfile                # Multi-stage build для обох сервісів
└── .env                      # Конфігурація
```

## 🚀 Швидкий старт (Docker)

Для запуску проєкту потрібен лише встановлений **Docker** та **Docker Compose**.

### 1. Клонування репозиторію

```bash
git clone https://github.com/FarizovM/obrio_test_task.git
cd obrio_test_task
```

### 2. Налаштування змінних середовища

Створіть файл `.env` на основі прикладу `.env.example`

### 3. Запуск контейнерів

Збірка та запуск системи у фоновому режимі:

```bash
docker-compose up -d --build
```

Після запуску будуть доступні такі сервіси:

* User Service API: <http://localhost:3000/users>
* PostgreSQL: localhost:5432
* RabbitMQ Management: <http://localhost:15672> (login: user, pass: password)
* pgAdmin: <http://localhost:5050> (login: <admin@admin.com>, pass: admin)

## 🧪 API

Метод: `POST`

```bash
http://localhost:3000/users
```

BODY:

```json
{
    "name": "Test User" 
}
```

Очікувана відповідь `201 Created`:

```json
{
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Test User",
    "createdAt": "2023-10-27T10:00:00.000Z"
}
```
