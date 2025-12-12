# Настройка GitHub Actions для деплоя WebBlog

## 1. Базовый workflow `.github/workflows/deploy.yml`
```yaml
name: Deploy to YandexCloud

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '12.x'          # Angular 10 требует Node 12+
  BUCKET_NAME: 'weblog-static'
  YC_REGION: 'ru-central1'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint || true   # TSLint

      - name: Build Angular app
        run: npm run build -- --configuration=production

      - name: Configure AWS CLI for YandexCloud
        run: |
          pip install awscli
          mkdir -p ~/.aws
          cat > ~/.aws/credentials << EOF
          [default]
          aws_access_key_id = ${{ secrets.YC_ACCESS_KEY_ID }}
          aws_secret_access_key = ${{ secrets.YC_SECRET_ACCESS_KEY }}
          EOF

      - name: Deploy static assets
        run: |
          aws s3 sync dist/web-blog/ s3://${{ env.BUCKET_NAME }}/ \
            --endpoint-url=https://storage.yandexcloud.net \
            --region=${{ env.YC_REGION }} \
            --delete \
            --exclude "*.html" \
            --cache-control "public, max-age=31536000, immutable"

      - name: Deploy HTML (no cache)
        run: |
          aws s3 sync dist/web-blog/ s3://${{ env.BUCKET_NAME }}/ \
            --endpoint-url=https://storage.yandexcloud.net \
            --region=${{ env.YC_REGION }} \
            --delete \
            --include "*.html" \
            --cache-control "no-cache, no-store, must-revalidate" \
            --content-type "text/html"
```

## 2. GitHub Secrets
| Secret                 | Описание                          | Где взять                                |
| ---------------------- | --------------------------------- | ---------------------------------------- |
| `YC_ACCESS_KEY_ID`     | Access Key ID сервисного аккаунта | YandexCloud → Сервисные аккаунты → Ключи |
| `YC_SECRET_ACCESS_KEY` | Secret Access Key                 | Там же (однократно)                      |
| `YC_CDN_RESOURCE_ID`   | (опционально) ID CDN ресурса      | Cloud CDN → ресурс                       |
| `SLACK_WEBHOOK_URL`    | (опционально) уведомления         | Slack webhook                            |

## 3. Вариант с YandexCloud CLI
```yaml
- name: Install YandexCloud CLI
  run: curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash

- name: Authenticate
  run: yc config set token ${{ secrets.YC_OAUTH_TOKEN }}

- name: Deploy
  run: yc storage cp --recursive dist/web-blog/ s3://weblog-static/
```

## 4. Улучшенный workflow с проверками
```yaml
      - name: Check build output
        run: |
          if [ ! -d "dist/web-blog" ]; then
            echo "❌ dist/web-blog not found"; exit 1;
          fi
          ls -la dist/web-blog | head -20

      - name: Verify S3 access
        run: |
          aws s3 ls s3://${{ env.BUCKET_NAME }}/ \
            --endpoint-url=https://storage.yandexcloud.net \
            --region=${{ env.YC_REGION }} || exit 1
```

## 5. Staging workflow (опционально)
`.github/workflows/deploy-staging.yml`
```yaml
on:
  push:
    branches: [develop]
env:
  BUCKET_NAME: 'weblog-static-staging'
```

## 6. Проверка первого запуска
```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add deployment workflow"
git push origin main
```
GitHub → Actions → проверить логи.

## 7. Troubleshooting
- Access Denied: проверить ключи и роль `storage.editor`
- Bucket not found: проверить `BUCKET_NAME` и регион
- Build fails: Node 12+, зависимости, логи сборки

## Чек-лист
- [ ] Файл `.github/workflows/deploy.yml` создан
- [ ] Secrets `YC_ACCESS_KEY_ID`, `YC_SECRET_ACCESS_KEY` добавлены
- [ ] Первый запуск workflow проверен
- [ ] (Опц.) настроен staging workflow

---

Следующий файл: `04-deployment-process.md`

