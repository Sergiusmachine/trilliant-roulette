# Этап сборки фронтенда
FROM node:20 AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Этап сервера с NGINX
FROM nginx:stable-alpine

# Копируем собранный фронтенд в папку, где NGINX будет его обслуживать
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфигурацию NGINX, если она есть
COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порт 80 для NGINX
EXPOSE 3000

# Запускаем NGINX
CMD ["nginx", "-g", "daemon off;"]