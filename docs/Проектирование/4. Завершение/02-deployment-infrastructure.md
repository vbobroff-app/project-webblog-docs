# Подготовка инфраструктуры YandexCloud для WebBlog

## 1. Создание Object Storage бакета
1) Консоль: https://console.cloud.yandex.ru → выбрать каталог  
2) Object Storage → «Создать бакет»  
```
Название: weblog-static
Тип доступа: Public
Регион: ru-central1
Класс хранения: Standard
```
3) CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```
4) Static website hosting: index.html / index.html (для SPA)

## 2. Настройка Cloud CDN
1) Создать ресурс CDN  
```
Источник: weblog-static.s3.yandexcloud.net
Домен: weblog.ru (или *.yandexcloud.net)
```
2) Кэширование (рекомендации):
- HTML: no-cache
- JS/CSS: 1 год (`public, max-age=31536000, immutable`)
- Изображения: 1 месяц
- Fonts: 1 год

## 3. Сервисный аккаунт для CI/CD
1) Создать сервисный аккаунт: `weblog-ci-cd-service-account`  
2) Роли: `storage.editor` (+ `cdn.editor` если нужна инвалидация кэша)  
3) Создать статический ключ доступа, сохранить `Access Key ID` и `Secret Access Key`

## 4. ID CDN ресурса (для инвалидации кэша)
Cloud CDN → выбрать ресурс → скопировать `resource-id` (опционально, для workflow)

## 5. Проверка доступа
```bash
aws s3 ls s3://weblog-static/ \
  --endpoint-url=https://storage.yandexcloud.net \
  --region=ru-central1
```
Публичный доступ: https://weblog-static.s3.yandexcloud.net

## 6. DNS (если свой домен)
Получить CNAME из CDN → у регистратора добавить CNAME на `cdn-xxxx.yandexcloud.net`.

## 7. Безопасность
- Минимальные роли сервисному аккаунту  
- Регулярная ротация ключей  
- Не хранить ключи в репо, только в GitHub Secrets  
- HTTPS везде, корректный CORS

## 8. Оценка затрат (пример)
| Ресурс         | Объем  | Стоимость (оценка) |
| -------------- | ------ | ------------------ |
| Object Storage | 10 GB  | ~50 руб/мес        |
| CDN трафик     | 100 GB | ~200 руб/мес       |
| **Итого**      |        | **~250 руб/мес**   |

Оптимизация: lifecycle policies, кэширование, мониторинг трафика.

## Чек-лист
- [ ] Бакет создан и публичен
- [ ] CORS настроен
- [ ] Static hosting включен (index.html)
- [ ] CDN создан, кэш настроен
- [ ] Сервисный аккаунт создан, роли выданы
- [ ] Ключи сохранены (Access/Secret)
- [ ] Доступ к бакету проверен
- [ ] DNS настроен (если нужен)
- [ ] CDN отвечает

---

Следующий файл: `03-deployment-github-actions.md`

