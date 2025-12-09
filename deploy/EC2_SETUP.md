# Инструкция по настройке EC2 для Week Planner

## 1. Подготовка EC2 инстанса

### 1.1. Создание инстанса
1. В AWS Console перейдите в EC2
2. Нажмите "Launch Instance"
3. Выберите Amazon Linux 2023 или Ubuntu 22.04 LTS
4. Тип инстанса: t2.micro (подходит для free tier)
5. Создайте или выберите существующую key pair для SSH
6. Настройте Security Group:
   - SSH (22) - ваш IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
   - Custom TCP (5001) - localhost только (для API, если на том же сервере)

### 1.2. Elastic IP (опционально, но рекомендуется)
1. В разделе EC2 → Elastic IPs → Allocate Elastic IP address
2. Привяжите к вашему инстансу
3. Это даст статический IP, который не изменится при перезапуске

### 1.3. Настройка DNS
В вашем DNS провайдере (Route 53 или другом):
- Создайте A-запись: `yourdomain.com` → IP вашего EC2
- Создайте A-запись: `api.yourdomain.com` → тот же IP

## 2. Подключение к серверу

```bash
ssh -i /path/to/your-key.pem ec2-user@<YOUR_EC2_IP>
# или для Ubuntu:
# ssh -i /path/to/your-key.pem ubuntu@<YOUR_EC2_IP>
```

## 3. Установка необходимого ПО

### 3.1. Обновление системы

**Для Amazon Linux:**
```bash
sudo yum update -y
```

**Для Ubuntu:**
```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2. Установка Nginx

**Для Amazon Linux:**
```bash
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Для Ubuntu:**
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

Проверьте: откройте в браузере `http://<YOUR_EC2_IP>` - должна появиться страница nginx.

### 3.3. Установка Docker (для API)

**Для Amazon Linux:**
```bash
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

**Для Ubuntu:**
```bash
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

После установки выйдите и войдите снова для применения прав группы.

## 4. Настройка директории для фронтенда

```bash
# Создайте директорию для статических файлов
sudo mkdir -p /var/www/week-planner

# Дайте права текущему пользователю
sudo chown $USER:$USER /var/www/week-planner

# Установите правильные разрешения
sudo chmod 755 /var/www/week-planner
```

## 5. Настройка Nginx

### 5.1. Конфигурация для фронтенда

```bash
# Скопируйте конфиг из репозитория
sudo nano /etc/nginx/conf.d/week-planner.conf
```

Вставьте содержимое из `deploy/nginx-frontend.conf`, замените `yourdomain.com` на ваш домен.

### 5.2. Конфигурация для API (если на том же сервере)

```bash
sudo nano /etc/nginx/conf.d/week-planner-api.conf
```

Вставьте содержимое из `deploy/nginx-api.conf`, замените `api.yourdomain.com`.

### 5.3. Проверка и перезагрузка

```bash
# Проверьте синтаксис конфигурации
sudo nginx -t

# Перезагрузите nginx
sudo systemctl reload nginx
```

## 6. Настройка GitHub Actions для деплоя

### 6.1. Создание SSH ключа для деплоя

На вашем локальном компьютере:

```bash
# Сгенерируйте новый SSH ключ
ssh-keygen -t ed25519 -C "github-deploy-week-planner" -f ~/.ssh/github_deploy_week_planner

# НЕ вводите passphrase (оставьте пустым)
```

### 6.2. Добавление публичного ключа на EC2

```bash
# Скопируйте публичный ключ
cat ~/.ssh/github_deploy_week_planner.pub

# Подключитесь к EC2 и добавьте ключ
ssh -i your-aws-key.pem ec2-user@<YOUR_EC2_IP>

# На сервере:
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Вставьте скопированный публичный ключ в новую строку

# Установите правильные права
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 6.3. Добавление секретов в GitHub

1. Перейдите в ваш репозиторий на GitHub
2. Settings → Secrets and variables → Actions → New repository secret

Создайте следующие секреты:

- **EC2_SSH_KEY**: содержимое приватного ключа
  ```bash
  cat ~/.ssh/github_deploy_week_planner
  # Скопируйте всё содержимое (включая BEGIN/END строки)
  ```

- **EC2_HOST**: IP адрес или домен вашего EC2
  ```
  12.34.56.78
  или
  yourdomain.com
  ```

- **EC2_USER**: имя пользователя на сервере
  ```
  ec2-user  (для Amazon Linux)
  или
  ubuntu    (для Ubuntu)
  ```

- **VITE_API_BASE_URL**: URL вашего API
  ```
  https://api.yourdomain.com
  или
  http://api.yourdomain.com  (до настройки HTTPS)
  ```

### 6.4. Тестирование деплоя

```bash
# Сделайте коммит и пуш в main
git add .
git commit -m "Setup deployment"
git push origin main

# Проверьте выполнение в GitHub Actions
# Repository → Actions → выберите последний workflow
```

## 7. Настройка HTTPS с Let's Encrypt

После того как DNS настроен и указывает на ваш сервер:

### 7.1. Установка Certbot

**Для Amazon Linux:**
```bash
sudo yum install certbot python3-certbot-nginx -y
```

**Для Ubuntu:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 7.2. Получение сертификата

```bash
# Для фронтенда
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Для API
sudo certbot --nginx -d api.yourdomain.com

# Следуйте инструкциям, введите email для уведомлений
```

Certbot автоматически:
- Обновит конфигурацию nginx
- Настроит редирект с HTTP на HTTPS
- Создаст задачу для автоматического обновления сертификата

### 7.3. Проверка авто-обновления

```bash
# Тест обновления (не выполняет реальное обновление)
sudo certbot renew --dry-run
```

## 8. Запуск API на сервере (Docker)

Если ваш API тоже будет на этом сервере:

```bash
# Клонируйте репозиторий API или загрузите docker-compose.yml
cd ~
# ... загрузите конфигурацию API

# Запустите контейнеры
docker-compose up -d

# Проверьте логи
docker-compose logs -f
```

## 9. Проверка работы

1. Откройте `https://yourdomain.com` - должен открыться фронтенд
2. Откройте `https://api.yourdomain.com/health` - API должно ответить
3. Проверьте работу приложения

## 10. Мониторинг и обслуживание

### Просмотр логов nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Перезапуск сервисов
```bash
# Nginx
sudo systemctl restart nginx

# Docker контейнеры
docker-compose restart
```

### Обновление системы
```bash
# Регулярно обновляйте систему
sudo yum update -y  # Amazon Linux
# или
sudo apt update && sudo apt upgrade -y  # Ubuntu
```

## Troubleshooting

### Деплой не работает
```bash
# На сервере проверьте права
ls -la /var/www/week-planner

# Проверьте логи nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### API недоступен
```bash
# Проверьте что контейнер запущен
docker ps

# Проверьте логи
docker-compose logs api

# Проверьте порт
netstat -tlnp | grep 5001
```

### HTTPS не работает
```bash
# Убедитесь что DNS правильно настроен
nslookup yourdomain.com

# Проверьте статус certbot
sudo certbot certificates

# Проверьте конфиг nginx
sudo nginx -t
```

