# Быстрый старт деплоя на AWS EC2

## Минимальные шаги для запуска

### 1. На EC2 сервере (первый раз)

```bash
# Подключитесь к серверу
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Установите nginx и создайте директорию
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
sudo mkdir -p /var/www/week-planner
sudo chown $USER:$USER /var/www/week-planner

# Настройте nginx
sudo nano /etc/nginx/conf.d/week-planner.conf
# Скопируйте конфиг из nginx-frontend.conf, замените домен

sudo nginx -t
sudo systemctl reload nginx
```

### 2. Настройка деплой-ключа

```bash
# На локальной машине
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""

# Добавьте публичный ключ на сервер
cat ~/.ssh/github_deploy.pub
# Скопируйте вывод

# На сервере
echo "ваш-публичный-ключ" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. GitHub Secrets

Добавьте в Settings → Secrets and variables → Actions:

- `EC2_SSH_KEY`: содержимое `~/.ssh/github_deploy` (приватный ключ)
- `EC2_HOST`: IP вашего сервера
- `EC2_USER`: `ec2-user` или `ubuntu`
- `VITE_API_BASE_URL`: `https://api.yourdomain.com`

### 4. Деплой

```bash
git push origin main
```

Готово! GitHub Actions автоматически:
- Запустит тесты
- Соберёт приложение
- Загрузит на сервер

### 5. HTTPS (после настройки DNS)

```bash
# На сервере
sudo yum install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

## Полезные команды

### Проверка деплоя
```bash
# Просмотр файлов на сервере
ssh ec2-user@YOUR_IP "ls -la /var/www/week-planner"

# Просмотр логов nginx
ssh ec2-user@YOUR_IP "sudo tail -f /var/log/nginx/error.log"
```

### Ручной деплой (если нужно)
```bash
npm run build
rsync -avz --delete dist/ ec2-user@YOUR_IP:/var/www/week-planner/
```

### Перезапуск nginx
```bash
ssh ec2-user@YOUR_IP "sudo systemctl reload nginx"
```

## Подробная документация

См. [EC2_SETUP.md](./EC2_SETUP.md) для полной инструкции.

