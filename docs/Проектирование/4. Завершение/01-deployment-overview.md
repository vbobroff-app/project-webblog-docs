# Процесс публикации приложения WebBlog на YandexCloud

## Общее описание

Документ описывает автоматизированный деплой Angular-приложения WebBlog на YandexCloud с использованием GitHub Actions.

### Текущее состояние проекта
- **Angular:** 10.2.1
- **Сборка:** `dist/web-blog` (см. `angular.json`)
- **API-платформа:** Appwrite (миграция с Firebase)
- **Текущий хостинг:** Firebase Hosting (нужно мигрировать на YandexCloud)
- **Тесты:** Karma + Jasmine
- **Линтинг:** TSLint

### Цели деплоя
- Автоматизация публикации
- Минимизация ручных ошибок
- Быстрый откат версий
- Соответствие импортозамещению (YandexCloud)

---

## Архитектура развертывания

```
GitHub → Actions → Build → S3 (Yandex Object Storage) → CDN → Пользователи
```

---

## Структура документации

1. **01-deployment-overview.md** (этот файл)
2. **02-deployment-infrastructure.md** — подготовка YandexCloud
3. **03-deployment-github-actions.md** — настройка GitHub Actions
4. **04-deployment-process.md** — процесс деплоя, откат, troubleshooting

---

## Быстрый старт
1) Подготовить инфраструктуру: см. `02-deployment-infrastructure.md`
2) Настроить GitHub Actions: см. `03-deployment-github-actions.md`
3) Выполнить первый деплой: см. `04-deployment-process.md`

---

## Ключевые параметры сборки
- Output path: `dist/web-blog`
- Production: AOT, оптимизация, outputHashing=all, Service Worker включен
- Base href: `/` (SPA)

## Environment файлы
- `src/environments/environment.ts` — dev
- `src/environments/environment.prod.ts` — prod (обновить URL перед прод-деплоем)

---

## Чек-лист миграции с Firebase на YandexCloud
- [ ] Создать инфраструктуру в YandexCloud (бакет, CDN, сервисный аккаунт)
- [ ] Настроить GitHub Actions workflow
- [ ] Обновить `environment.prod.ts` (apiUrl/cdnUrl)
- [ ] Протестировать деплой на тестовом бакете/домене
- [ ] Настроить DNS (при необходимости)
- [ ] Выполнить production деплой
- [ ] Отключить Firebase Hosting после успешной миграции

---

## Полезные ссылки
- YandexCloud Object Storage: https://cloud.yandex.ru/docs/storage/
- YandexCloud CDN: https://cloud.yandex.ru/docs/cdn/
- GitHub Actions: https://docs.github.com/en/actions
- Angular Deployment: https://angular.io/guide/deployment


