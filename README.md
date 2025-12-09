# Week Planner Frontend

Интерфейс для планирования задач по дням недели. Фронт написан на React + TypeScript + Vite, использует Tailwind CSS через CSS-модули, роутинг `react-router-dom`, и интегрируется с backend API (`api.{domain}`) для хранения задач и записей времени.

## Стек и структура
- React 18 + TypeScript, Vite 5.
- Axios для HTTP, Vitest + RTL для unit-тестов.
- Tailwind через `@apply` в CSS-модулях.
- Основные разделы:
  - `WeekPage` – сетка недели, подтягивает суммы часов через `/entries/summary`.
  - `DayPage` + `DayGroup` – редактирование записей дня, CRUD задач/entries.
  - `src/api/*` – слой общения с backend.

## Переменные окружения
Используется `VITE_API_BASE_URL` (по умолчанию `http://localhost:5001`). Переопредели в `.env.local` или `.env.production`:
```
VITE_API_BASE_URL=https://api.example.com
```

## Скрипты
| Команда | Описание |
| --- | --- |
| `npm run dev` | локальная разработка (Vite dev server) |
| `npm run build` | prod-сборка (`tsc -b` + `vite build`) |
| `npm run preview` | предпросмотр собранного бандла |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` | Prettier для `src/` |
| `npm run test` | Vitest (watch) |
| `npm run test:run` | Vitest в CI-режиме |

## API интеграция
Фронт ожидает backend со схемой из README API:
- `GET /entries?date=YYYY-MM-DD` – записи дня.
- `GET /entries/summary?from=&to=` – агрегаты для недели.
- `POST/PATCH/DELETE /entries/:id` – CRUD записи.
- `GET /tasks?search=` – поиск существующей задачи (по ссылке или названию).
- `POST /tasks`, `PATCH /tasks/:id` – создание/обновление справочной задачи.

В `DayGroup` логика такая:
1. Пользователь вводит ссылку → `GET /tasks?search=...` → при успехе поля заполняются, сохраняется `taskId`.
2. Если задача новая, `POST /tasks {title, link}`.
3. После получения `taskId` всегда создаём/обновляем `Entry` `{ taskId, date, hours, description }`.

## Тесты и CI
- Vitest с jsdom, `WeekPage` протестирован на успешный/ошибочный сценарий.
- В `vite.config.ts` включён блок `test` + отчёт покрытия (`lcov`).
- GitHub Actions (`.github/workflows/ci.yml`):
  1. `npm ci`
  2. `npm run lint`
  3. `npm run test:run`
  4. `npm run build`
  5. Артефакт с `dist/`

## Деплой
1. На CI собрать `dist`.
2. Скопировать содержимое `dist` на VPS (например, `/var/www/week-planner`).
3. Nginx-конфиг для фронта:
   ```
   server {
     listen 80;
     server_name example.com;
     root /var/www/week-planner;
     index index.html;
     location / {
       try_files $uri /index.html;
     }
   }
   ```
4. API живёт на `api.example.com` (отдельный конфиг). Настроить CORS или проксирование.
5. Установить HTTPS через certbot.

## Разработка
1. `npm ci` (или `npm install`).
2. `npm run dev` – фронт на `http://localhost:5173`, backend по `VITE_API_BASE_URL`.
3. Для e2e/интеграций можно поднять backend через docker-compose и выставить порт 5001.

## Деплой на AWS EC2

Проект настроен для автоматического деплоя на AWS EC2 через GitHub Actions.

### Документация по деплою

- **[Быстрый старт](./deploy/QUICK_START.md)** - минимальные шаги для запуска
- **[Полная инструкция](./deploy/EC2_SETUP.md)** - детальное руководство по настройке EC2
- **[Nginx конфиг для фронтенда](./deploy/nginx-frontend.conf)**
- **[Nginx конфиг для API](./deploy/nginx-api.conf)**

### Процесс деплоя

При пуше в `main` GitHub Actions автоматически:
1. Запускает линтер и тесты
2. Собирает production build с `VITE_API_BASE_URL`
3. Загружает файлы на EC2 через rsync

### Необходимые GitHub Secrets

- `EC2_SSH_KEY` - приватный SSH ключ для доступа к серверу
- `EC2_HOST` - IP адрес или домен EC2 инстанса
- `EC2_USER` - имя пользователя (`ec2-user` или `ubuntu`)
- `VITE_API_BASE_URL` - URL бэкенд API (например, `https://api.yourdomain.com`)

См. [deploy/EC2_SETUP.md](./deploy/EC2_SETUP.md) для подробных инструкций.

## TODO/идеи
- Добавить тесты для `DayGroup` и API-хуков.
- Настроить e2e (Playwright) для сценария создания записи.
- Настроить мониторинг и алерты для production.
