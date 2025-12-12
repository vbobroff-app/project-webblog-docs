# Процесс деплоя и управление версиями WebBlog

## 1. Автоматический деплой (GitHub Actions)
1) `git push origin main`  
2) Actions: lint → build → upload to Object Storage → (опц.) invalidate CDN  
3) Проверка: статус workflow, сайт доступен по домену

Оценка времени: 6–10 минут (install 2–3, build 3–5, upload 1–2).

## 2. Ручной деплой (экстренно)
```bash
git clone https://github.com/your-org/web-blog.git
cd web-blog
npm ci
npm run build -- --configuration=production

# AWS CLI настроить на YC
aws configure
# ru-central1, endpoint: https://storage.yandexcloud.net

# Статика (кэшируется)
aws s3 sync dist/web-blog/ s3://weblog-static/ \
  --endpoint-url=https://storage.yandexcloud.net \
  --delete --exclude "*.html" \
  --cache-control "public, max-age=31536000, immutable"

# HTML (без кэша)
aws s3 sync dist/web-blog/ s3://weblog-static/ \
  --endpoint-url=https://storage.yandexcloud.net \
  --delete --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"
```

## 3. Мониторинг
- **GitHub Actions:** статус шагов, логи
- **Object Storage:** наличие файлов, размер
- **CDN:** трафик, cache hit/miss
- **Сайт:** нет ошибок в консоли, роутинг SPA работает

## 4. Откат версий
### Вариант A: через Git (рекомендуется)
```bash
git log --oneline           # найти рабочий коммит
git checkout -b rollback-<date> <hash>
git push origin rollback-<date>
# PR → merge → Actions задеплоит старую версию
```

### Вариант B: версионирование бакета
Включить версионирование в бакете → восстановить нужный `version-id` через `aws s3api`.

### Вариант C: ручная сборка нужного коммита
Checkout нужного коммита → `npm ci` → `npm run build` → `aws s3 sync ...`

## 5. Troubleshooting (частое)
- **Access Denied:** проверить ключи и роль `storage.editor`
- **Bucket not found:** проверить `BUCKET_NAME`, регион
- **CDN отдает старое:** инвалидировать кэш (`yc cdn cache invalidate --paths "/*"`), проверить заголовки кэша
- **404 на маршрутах:** в бакете error document = `index.html`; baseHref = `/`
- **Сайт недоступен:** проверить публичность бакета, DNS/CDN активен, файлы загружены

## 6. Полезные команды
```bash
# Проверить содержимое бакета
aws s3 ls s3://weblog-static/ --recursive \
  --endpoint-url=https://storage.yandexcloud.net

# Проверить заголовки файла
aws s3api head-object \
  --bucket weblog-static \
  --key index.html \
  --endpoint-url=https://storage.yandexcloud.net

# Локальная проверка сборки
npm run build -- --configuration=production
npx http-server dist/web-blog -p 8080
```

## 7. Чек-листы
### Перед деплоем
- [ ] Коммиты в main, сборка локально проходит
- [ ] Линтер без критичных ошибок
- [ ] Prod env обновлен (apiUrl/cdnUrl)

### После деплоем
- [ ] Actions зеленый
- [ ] Сайт открывается, статика грузится
- [ ] Роутинг SPA работает
- [ ] Нет ошибок в консоли
- [ ] API отвечает

## 8. Best Practices
- Деплоить часто, семантические коммиты
- Никогда не коммитить секреты; все ключи в Secrets
- Регулярно проверять логи и метрики CDN/Object Storage
