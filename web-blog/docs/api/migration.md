# Миграция Firebase → AppWrite

## Обзор

Документация по миграции данных блога с Firebase Realtime Database на AppWrite.

**Дата миграции:** 9 декабря 2024  
**Версия скрипта:** 1.0

---

## Конфигурация AppWrite

| Параметр | Значение |
|----------|----------|
| **Host** | `appwrite.infra-net.pro` |
| **Protocol** | HTTP (порт 80) |
| **Project ID** | `6937b038000f7bcebebd` |
| **Database ID** | `6937e2a1003e415aa8d4` |

### Коллекции

| Коллекция | ID | Описание |
|-----------|----|-----------| 
| `posts` | `6937e2e8002f4a8f10b4` | Посты блога |
| `hubs` | `6937e4ba003b05696c97` | Хабы (теги) |
| `info` | `69382555000b77835a7a` | Статистика просмотров |

---

## Структура данных

### Коллекция `posts`

| Атрибут | Тип | Размер | Required | Описание |
|---------|-----|--------|----------|----------|
| `author` | String | 255 | ❌ | Автор поста |
| `title` | String | 255 | ❌ | Заголовок |
| `description` | String | 1024 | ❌ | Краткое описание |
| `text` | String | 16777216 | ❌ | Полный текст (HTML) |
| `icon` | String | 16777216 | ❌ | Картинка в base64 |
| `count` | String | 32 | ❌ | Счётчик (legacy) |
| `watched` | String | 64 | ❌ | Дата просмотра |
| `hubs` | String[] | 255 | ❌ | Массив названий хабов |

### Коллекция `hubs`

| Атрибут | Тип | Размер | Required | Описание |
|---------|-----|--------|----------|----------|
| `name` | String | 255 | ❌ | Название хаба |
| `description` | String | 1024 | ❌ | Описание |
| `posts` | String[] | 255 | ❌ | Массив ID постов |

### Коллекция `info`

| Атрибут | Тип | Default | Required | Описание |
|---------|-----|---------|----------|----------|
| `view` | Integer | 0 | ❌ | Счётчик просмотров |
| `like` | Integer | 0 | ❌ | Счётчик лайков |
| `comment` | Integer | 0 | ❌ | Счётчик комментариев |
| `showed` | String | — | ❌ | Дата последнего просмотра |

> **Примечание:** `$id` документа info = `$id` соответствующего поста (связь 1:1)

---

## Permissions

Все коллекции имеют одинаковые права доступа:

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| **Any** | ❌ | ✅ | ❌ | ❌ |
| **Users** | ✅ | ✅ | ✅ | ✅ |

- **Any** — публичный доступ на чтение
- **Users** — полный доступ для авторизованных пользователей

---

## Скрипт миграции

### Расположение

```
scripts/migrate.js
```

### Запуск

```bash
# Установить API Key
$env:APPWRITE_API_KEY="your_api_key_here"

# Запустить миграцию
node scripts/migrate.js
```

### Требования

- Node.js (любая версия, использует встроенный `http` модуль)
- Файл экспорта Firebase: `web-blog-726ee-export.json` в корне проекта
- API Key AppWrite с правами `databases.read` и `databases.write`

### Что делает скрипт

1. **Читает** экспорт Firebase из `web-blog-726ee-export.json`
2. **Мигрирует посты** — создаёт документы в коллекции `posts`
3. **Мигрирует хабы** — создаёт документы в коллекции `hubs` с обновлёнными ID постов
4. **Мигрирует info** — создаёт документы статистики с ID равным ID поста
5. **Сохраняет маппинг** старых и новых ID в `scripts/id-mapping.json`

### Трансформация данных

#### Posts

```javascript
// Firebase формат
{
  hubs: { "Angular": true, "TypeScript": true }
}

// AppWrite формат
{
  hubs: ["Angular", "TypeScript"]
}
```

#### Hubs

```javascript
// Firebase формат
{
  posts: { "-MIIn0qgCl6p_uARJ0_0": true }
}

// AppWrite формат
{
  posts: ["693826fc419679ae2ec5"]  // Новые AppWrite ID
}
```

---

## Результаты миграции

| Сущность | Firebase | AppWrite | Статус |
|----------|----------|----------|--------|
| Posts | 29 | 29 | ✅ |
| Hubs | 18 | 18 | ✅ |
| Info | 32 | 27 | ✅* |

> *5 записей info пропущено — соответствующие посты были удалены

---

## Конфигурация приложения

### environment.ts

```typescript
const appWriteConfig: WebAppConfig = {
    appId: '6937b038000f7bcebebd',
    databaseURL: 'http://appwrite.infra-net.pro/v1',
    databaseId: '6937e2a1003e415aa8d4',
    collections: {
      posts: '6937e2e8002f4a8f10b4',
      hubs: '6937e4ba003b05696c97',
      info: '69382555000b77835a7a'
    }
}

export const environment: Environment = {
  // ...
  apiPlatform: 'appwrite',  // Переключение на AppWrite
  // ...
};
```

---

## InfoService (Strategy Pattern)

### Архитектура

```
InfoService
    └── InfoApiPlatform
            ├── FbInfoApi (Firebase)
            └── AwInfoApi (AppWrite)
```

### Файлы

```
src/app/admin/shared/api/info/
├── info.api.base.ts          # Интерфейс InfoApi + базовый класс
├── info.api.platform.ts      # Фабрика выбора платформы
├── firebase/
│   ├── fb.info.api.ts        # Firebase реализация
│   └── models.ts             # Firebase модели
└── appwrite/
    ├── aw.info.api.ts        # AppWrite реализация
    └── models.ts             # AppWrite модели
```

### API

```typescript
interface InfoApi {
  get(id: string): Observable<PostInfo>;           // Получить статистику
  put(info: PostInfo): Observable<PostInfo>;       // Создать/обновить
  incrementView(id: string): Observable<PostInfo>; // +1 просмотр
}
```

### Использование

```typescript
// В компоненте
this.infoService.incrementView(postId).subscribe();

// Переключение платформы в environment.ts
apiPlatform: 'appwrite'  // или 'firebase'
```

---

## Известные ограничения

### 1. Размер icon

Поле `icon` содержит base64 изображения до 4MB. Требуется увеличенный `client_max_body_size` в nginx.

### 2. Consumers не мигрированы

Таблица `consumers` (пользователи) не переносилась — содержит персональные данные, требует отдельного подхода с шифрованием.

---

## API Key

> ⚠️ **Безопасность:** API Key не должен храниться в коде!

### Создание API Key

1. AppWrite Console → Settings → API Keys
2. Create API Key
3. Scopes: `databases.read`, `databases.write`
4. Сохранить ключ в безопасном месте

### Использование

```bash
# PowerShell
$env:APPWRITE_API_KEY="standard_xxx..."
node scripts/migrate.js

# Bash
APPWRITE_API_KEY="standard_xxx..." node scripts/migrate.js
```

---

## Файлы

| Файл | Описание |
|------|----------|
| `scripts/migrate.js` | Скрипт миграции |
| `scripts/id-mapping.json` | Маппинг старых Firebase ID → новых AppWrite ID |
| `web-blog-726ee-export.json` | Экспорт данных из Firebase |
| `src/environments/environment.ts` | Конфигурация приложения |
| `src/app/admin/shared/api/info/` | InfoService API (Strategy Pattern) |

---

## TODO

- [x] ~~Реализовать Strategy Pattern для InfoService~~ ✅ Готово
- [ ] Добавить поддержку consumers (с шифрованием)
- [ ] Обновить environment.prod.ts
- [ ] Настроить CI/CD для деплоя
