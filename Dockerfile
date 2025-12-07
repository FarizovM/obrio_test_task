# --- Stage 1: Builder ---
    FROM node:18-alpine AS builder

    WORKDIR /usr/src/app
    
    # Копіюємо файли пакетів для встановлення залежностей
    COPY package*.json ./
    
    # Встановлюємо всі залежності (включаючи devDependencies для білда)
    RUN npm ci
    
    # Копіюємо вихідний код
    COPY . .
    
    # Білдимо обидва сервіси
    # Важливо: імена user-service та notification-service мають співпадати з тими, що у nest-cli.json
    RUN npm run build user-service
    RUN npm run build notification-service
    
    # --- Stage 2: Production ---
    FROM node:18-alpine AS production
    
    WORKDIR /usr/src/app
    
    COPY package*.json ./
    
    # Встановлюємо ТІЛЬКИ prod залежності (для економії місця)
    RUN npm ci --only=production
    
    # Копіюємо скомільовані файли з етапу builder
    COPY --from=builder /usr/src/app/dist ./dist
    
    # Ми не вказуємо CMD тут, бо будемо перевизначати його в docker-compose
    # для кожного сервісу окремо